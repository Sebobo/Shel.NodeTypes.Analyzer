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
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Service\LinkingService;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;

#[Flow\Scope('singleton')]
class NodeTypeUsageService
{
    use CreateContentContextTrait;

    #[Flow\Inject]
    protected NodeTypeManager $nodeTypeManager;

    /**
     * @var VariableFrontend
     */
    #[Flow\Inject]
    protected $nodeTypesCache;

    /**
     * @var EntityManagerInterface
     */
    #[Flow\Inject]
    protected $entityManager;

    #[Flow\Inject]
    protected LinkingService $linkingService;

    /**
     * @var StringFrontend
     */
    #[Flow\Inject]
    protected $configurationCache;

    protected ?UriBuilder $uriBuilder = null;

    /**
     * @return NodeTypeUsage[]
     * @throws CacheException
     */
    public function getNodeTypeUsages(ControllerContext $controllerContext, string $nodeTypeName): array
    {
        $nodeTypesCacheKey = sprintf(
            'NodeTypes_Usage_%s_%s',
            md5($nodeTypeName),
            $this->configurationCache->get('ConfigurationVersion')
        );

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
            } catch (\Exception) {
                continue;
            }

            if (!$node) {
                continue;
            }

            $breadcrumb = [];
            $documentNode = $node;
            while ($documentNode->getParent() && !$documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $documentNode = $documentNode->getParent();
                if ($documentNode) {
                    $breadcrumb[] = $documentNode->getLabel();
                }
            }

            $url = '';
            if ($documentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
                $url = $this->getNodeUri($controllerContext, $documentNode);
            }
            $nodeTypeUsages[] = new NodeTypeUsage($node, $documentNode, $url, $breadcrumb);
        }

        usort($nodeTypeUsages, static function (NodeTypeUsage $a, NodeTypeUsage $b) {
            return $a->getDocumentTitle() <=> $b->getDocumentTitle();
        });

        $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypeUsages);
        return $nodeTypeUsages;
    }

    protected function getNodeUri(ControllerContext $controllerContext, NodeInterface $node): string
    {
        $request = $controllerContext->getRequest()->getMainRequest();

        if (!$this->uriBuilder) {
            $this->uriBuilder = clone $controllerContext->getUriBuilder();
            $this->uriBuilder->setRequest($request);
        }
        try {
            return $this->uriBuilder
                ->reset()
                ->setCreateAbsoluteUri(true)
                ->setFormat('html')
                ->uriFor('preview', ['node' => $node], 'Frontend\Node', 'Neos.Neos');
        } catch (\Exception) {
        }
        return '';
    }
}
