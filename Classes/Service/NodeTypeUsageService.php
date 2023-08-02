<?php
declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Service;

/*
 * This file is part of the Shel.NodeTypes.Analyzer package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

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
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;

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
     * @return NodeTypeUsage[]
     * @throws CacheException
     */
    public function getNodeTypeUsages(ControllerContext $controllerContext, string $nodeTypeName): array
    {
        $nodeTypesCacheKey = 'NodeTypes_Usage_' . md5($nodeTypeName) . '_' . $this->configurationCache->get('ConfigurationVersion');
        /** @var NodeTypeUsage[] $nodeTypeUsages */
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
            ->andWhere('n.removed = false')
            ->setParameter('nodeType', $nodeType)
            ->getQuery()
            ->execute();

        $nodeTypeUsages = [];
        foreach ($nodesByType as $nodeData) {
            $contentContext = $this->createContextMatchingNodeData($nodeData);

            try {
                $node = $contentContext->getNodeByIdentifier($nodeData->getIdentifier());
            } catch (\Exception $e) {
                continue;
            }

            if (!$node) {
                continue;
            }

            $documentNode = $node;
            while ($documentNode->getParent() && !$documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $documentNode = $documentNode->getParent();
            }

            $url = '';
            $title = 'Unresolveable';

            if ($documentNode && $documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $url = $this->getNodeUri($controllerContext, $documentNode);
                $title = $documentNode->getLabel();
            }

            $nodeTypeUsages[] = new NodeTypeUsage($node, $title, $url);
        }

        usort($nodeTypeUsages, static function (NodeTypeUsage $a, NodeTypeUsage $b) {
            return $a->getWorkspaceName() < $b->getWorkspaceName() ? -1 : 1;
        });

        $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypeUsages);
        return $nodeTypeUsages;
    }

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
