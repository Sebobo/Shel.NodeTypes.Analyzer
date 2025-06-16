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
use Neos\ContentRepository\Core\ContentRepository;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\NodeType\NodeTypeNames;
use Neos\ContentRepository\Core\Projection\ContentGraph\ContentSubgraphInterface;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\CountDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindAncestorNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindClosestNodeFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\NodeType\NodeTypeCriteria;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Neos\Domain\NodeLabel\NodeLabelGeneratorInterface;
use Neos\Neos\Domain\Service\NodeTypeNameFactory;
use Neos\Neos\Service\LinkingService;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;

#[Flow\Scope('singleton')]
class NodeTypeUsageService
{
    /**
     * @var VariableFrontend
     */
    #[Flow\Inject]
    protected $nodeTypesCache;

    /**
     * @var StringFrontend
     */
    #[Flow\Inject]
    protected $configurationCache;

    protected ?UriBuilder $uriBuilder = null;

    public function __construct(
        protected ContentRepositoryRegistry $contentRepositoryRegistry,
        protected NodeLabelGeneratorInterface $nodeLabelGenerator,
        protected EntityManagerInterface $entityManager,
        protected LinkingService $linkingService,
    ) {
    }

    /**
     * @return NodeTypeUsage[]
     * @throws CacheException
     */
    public function getNodeTypeUsages(
        ControllerContext $controllerContext,
        ContentRepository $contentRepository,
        ContentSubgraphInterface $subgraph,
        NodeTypeName $nodeTypeName
    ): array {
        $nodeTypesCacheKey = sprintf(
            'NodeTypes_Usage_%s_%s',
            md5($nodeTypeName->value),
            $this->configurationCache->get('ConfigurationVersion')
        );

        /** @var NodeTypeUsage[] $nodeTypeUsages */
        $nodeTypeUsages = $this->nodeTypesCache->get($nodeTypesCacheKey);
        if ($nodeTypeUsages) {
            return $nodeTypeUsages;
        }

        $nodeType = $contentRepository->getNodeTypeManager()->getNodeType($nodeTypeName);
        if (!$nodeType) {
            return [];
        }

        $rootNode = $subgraph->findRootNodeByType(NodeTypeNameFactory::forSites());
        if (!$rootNode) {
            return [];
        }

        $nodes = $subgraph->findDescendantNodes(
    $rootNode->aggregateId,
            FindDescendantNodesFilter::create(
                NodeTypeCriteria::createWithAllowedNodeTypeNames(
                    NodeTypeNames::fromArray([$nodeTypeName])
                )
            )
        );

        $nodeTypeUsages = [];
        foreach ($nodes as $node) {
            $breadcrumb = [];
            $closestDocumentNode = $subgraph->findClosestNode(
                $node->aggregateId,
                FindClosestNodeFilter::create(
                    'Neos.Neos:Document',
                )
            );
            if (!$closestDocumentNode) {
                continue;
            }
            $ancestors = $subgraph->findAncestorNodes(
                $closestDocumentNode->aggregateId,
                FindAncestorNodesFilter::create(
                    'Neos.Neos:Document',
                )
            );
            foreach ($ancestors as $ancestorNode) {
                $breadcrumb[] = $this->nodeLabelGenerator->getLabel($ancestorNode);
            }

            $url = $this->getNodeUri($controllerContext, $closestDocumentNode);
            $nodeTypeUsages[] = NodeTypeUsage::fromNode(
                $node,
                $this->nodeLabelGenerator->getLabel($node),
                $closestDocumentNode,
                $this->nodeLabelGenerator->getLabel($closestDocumentNode),
                $url,
                $subgraph->getWorkspaceName(),
                array_reverse($breadcrumb)
            );
        }
        usort($nodeTypeUsages, static function (NodeTypeUsage $a, NodeTypeUsage $b) {
            return $a->documentLabel <=> $b->documentLabel;
        });
        $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypeUsages);
        return $nodeTypeUsages;
    }

    /**
     * @throws CacheException
     */
    public function getNodeTypeUsageCount(
        ContentRepository $contentRepository,
        ContentSubgraphInterface $subgraph,
        NodeTypeName $nodeTypeName
    ): int {
        $nodeTypesCacheKey = sprintf(
            'NodeTypes_Usage_Count_%s_%s',
            md5($nodeTypeName->value),
            $this->configurationCache->get('ConfigurationVersion')
        );

        /** @var int $nodeTypeUsages */
        $nodeTypeUsages = $this->nodeTypesCache->get($nodeTypesCacheKey);
        if ($nodeTypeUsages) {
            return $nodeTypeUsages;
        }

        $nodeType = $contentRepository->getNodeTypeManager()->getNodeType($nodeTypeName);
        if (!$nodeType) {
            return 0;
        }

        $rootNode = $subgraph->findRootNodeByType(NodeTypeNameFactory::forSites());
        if (!$rootNode) {
            return 0;
        }

        $nodeTypeUsages = $subgraph->countDescendantNodes(
    $rootNode->aggregateId,
            CountDescendantNodesFilter::create(
                NodeTypeCriteria::createWithAllowedNodeTypeNames(
                    NodeTypeNames::fromArray([$nodeTypeName])
                )
            )
        );
        $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypeUsages);
        return $nodeTypeUsages;
    }

    protected function getNodeUri(
        ControllerContext $controllerContext,
        Node $node
    ): string {
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
