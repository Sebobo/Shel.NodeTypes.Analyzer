<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Service;

use Doctrine\ORM\EntityManagerInterface;
use Neos\Cache\Exception as CacheException;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Cache\Frontend\VariableFrontend;
use Neos\ContentRepository\Domain\Model\NodeData;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Service\LinkingService;

/**
 * @Flow\Scope("singleton")
 */
class NodeTypeUsageService
{
    use CreateContentContextTrait;

    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @Flow\Inject
     * @var VariableFrontend
     */
    protected $nodeTypesCache;

    /**
     * @Flow\Inject
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject
     * @var LinkingService
     */
    protected $linkingService;

    /**
     * @Flow\Inject
     * @var StringFrontend
     */
    protected $configurationCache;

    /**
     * @param ControllerContext $controllerContext
     * @param string $nodeTypeName
     * @return array containing a link, document title and other information for each instance of the node type
     * @throws CacheException
     */
    public function getBackendUrlsForNodeType(ControllerContext $controllerContext, string $nodeTypeName): array
    {
        $nodeTypesCacheKey = 'NodeTypes_Usage_' . md5($nodeTypeName) . '_' . $this->configurationCache->get('ConfigurationVersion');
        $nodeTypeUsages = $this->nodeTypesCache->get($nodeTypesCacheKey);
        if ($nodeTypeUsages) {
            return $nodeTypeUsages;
        }

        try {
            $nodeType = $this->nodeTypeManager->getNodeType($nodeTypeName);
        } catch (NodeTypeNotFoundException $e) {
            return [];
        }

        $qb = $this->entityManager->createQueryBuilder();
        /** @var NodeData[] $nodeTypeUsages */
        $nodesByType = $qb->select('n')
            ->from(NodeData::class, 'n')
            ->andWhere('n.nodeType = :nodeType')
            ->setParameter('nodeType', $nodeType)
            ->getQuery()
            ->execute();

        $nodeTypeUsages = [];
        foreach ($nodesByType as $nodeData) {
            $contentContext = $this->createContextMatchingNodeData($nodeData);
            $node = $contentContext->getNodeByIdentifier($nodeData->getIdentifier());

            if (!$node) {
                continue;
            }

            $documentNode = $node;
            while ($documentNode->getParent() && !$documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $documentNode = $documentNode->getParent();
            }

            $url = 'n/a';
            $title = 'n/a';

            if ($documentNode && $documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $url = $this->getNodeUri($controllerContext, $documentNode);
                $title = $documentNode->getLabel();
            }

            $nodeTypeUsages[] = [
                'url' => $url,
                'documentTitle' => $title,
                'nodeIdentifier' => $node->getIdentifier(),
                'workspace' => $contentContext->getWorkspaceName(),
                'dimensions' => $node->getDimensions(),
            ];
        }

        $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypeUsages);
        return $nodeTypeUsages;
    }

    /**
     * @param ControllerContext $controllerContext
     * @param NodeInterface $node
     * @return string
     */
    protected function getNodeUri(ControllerContext $controllerContext, NodeInterface $node): string
    {
        try {
            return $this->linkingService->createNodeUri(
                $controllerContext,
                $node,
                $node,
                'html',
                true
            );
        } catch (\Exception $e) {
        }
        // TODO: Only create backend links
//        $request = $controllerContext->getRequest()->getMainRequest();
//
//        if (!$this->uriBuilder) {
//            $this->uriBuilder = clone $controllerContext->getUriBuilder();
//            $this->uriBuilder->setRequest($request);
//        }
//        try {
//            return $this->uriBuilder
//                ->reset()
//                ->setCreateAbsoluteUri(true)
//                ->setFormat('html')
//                ->uriFor('preview', ['node' => $node], 'Frontend\Node', 'Neos.Neos');
//        } catch (Exception $e) {
//        } catch (MissingActionNameException $e) {
//        }
        return '';
    }
}
