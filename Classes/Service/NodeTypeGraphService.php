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
use Neos\Cache\Exception;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Cache\Frontend\VariableFrontend;
use Neos\ContentRepository\Core\ContentRepository;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\NodeType\NodeType;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeName;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Shel\NodeTypes\Analyzer\Domain\Dto\EnhancedNodeTypeConfiguration;

#[Flow\Scope("singleton")]
class NodeTypeGraphService
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

    public function __construct(
        protected ContentRepositoryRegistry $contentRepositoryRegistry,
        protected NodeTypeUsageService $nodeTypeUsageService,
        protected EntityManagerInterface $entityManager,
    ) {
    }


    /**
     * @return array<string, EnhancedNodeTypeConfiguration>
     */
    public function generateNodeTypesData(bool $useCache = true, bool $includeAbstractNodeTypes = true): array
    {
        $nodeTypesCacheKey = 'NodeTypes_' . $this->configurationCache->get(
                'ConfigurationVersion'
            ) . '_' . ($includeAbstractNodeTypes ? 'abstract' : 'non-abstract');
        if ($useCache) {
            $nodeTypes = $this->nodeTypesCache->get($nodeTypesCacheKey);
            if ($nodeTypes) {
                return $nodeTypes;
            }
        }
        // TODO 9.0 migration: Make this code aware of multiple Content Repositories.
        $contentRepository = $this->contentRepositoryRegistry->get(ContentRepositoryId::fromString('default'));
        $variationGraph = $contentRepository->getVariationGraph();
        $dimensionSpacePoints = $variationGraph->getDimensionSpacePoints();
        /** @var DimensionSpacePoint $firstDimensionSpacePoint */
        $firstDimensionSpacePoint = array_values($dimensionSpacePoints->points)[0] ?? null;
        $subgraph = $contentRepository->getContentSubgraph(
            WorkspaceName::fromString('live'),
            $firstDimensionSpacePoint,
        );

        $nodeTypes = $contentRepository->getNodeTypeManager()->getNodeTypes();

        $nodeTypes = array_reduce(
            $nodeTypes,
            function (array $carry, NodeType $nodeType) use ($nodeTypes, $subgraph, $contentRepository) {
                $usageCount = $this->nodeTypeUsageService->getNodeTypeUsageCount(
                    $contentRepository,
                    $subgraph,
                    $nodeType->name,
                );

                $instantiableNodeTypes = array_filter($nodeTypes, static function (NodeType $nodeType) {
                    return !$nodeType->isAbstract();
                });
                $allowedChildNodeTypes = $this->generateAllowedChildNodeTypes(
                    $nodeType,
                    $instantiableNodeTypes
                );

                $enhancedNodeTypeConfiguration = EnhancedNodeTypeConfiguration::fromNodeType($nodeType)
                    ->setUsage($usageCount)
                    ->setAllowedChildNodeTypes($allowedChildNodeTypes);

                $childNodes = $enhancedNodeTypeConfiguration->childNodes;
                $grandChildNodeConstraints = array_reduce(
                    array_keys($childNodes),
                    function (array $carry, string $childNodeName) use (
                        $childNodes,
                        $nodeType,
                        $instantiableNodeTypes,
                        $contentRepository
                    ) {
                        $allowedGrandChildNodeTypes = $childNodes[$childNodeName]['allowedChildNodeTypes'] ?? [];
                        if ($allowedGrandChildNodeTypes) {
                            $allowedGrandChildNodeTypeMap = $this->generateAllowedGrandChildNodeTypes(
                                $childNodeName,
                                $nodeType,
                                $instantiableNodeTypes,
                                $contentRepository,
                            );
                            $carry[$childNodeName] = $allowedGrandChildNodeTypeMap;
                        }
                        // TODO: Else case should mark child definition as broken for the ui
                        return $carry;
                    },
                    []
                );

                $carry[$nodeType->name->value] = $enhancedNodeTypeConfiguration->updateGrandChildNodeConstraints(
                    $grandChildNodeConstraints
                );
                return $carry;
            },
            []
        );

        $this->calculateUsageCountByInheritance($nodeTypes);
        ksort($nodeTypes);

        if (!$includeAbstractNodeTypes) {
            $nodeTypes = array_filter($nodeTypes, static function (EnhancedNodeTypeConfiguration $nodeType) {
                return !$nodeType->abstract;
            });
        }

        $this->nodeTypesCache->flush();
        try {
            $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypes);
        } catch (Exception) {
            // TODO: Log cache issue
        }

        return $nodeTypes;
    }

    /**
     * Returns the list of all allowed sub-nodetypes of the given node
     *
     * @param NodeType[] $nodeTypes
     * @return string[]
     */
    public function generateAllowedChildNodeTypes(NodeType $baseNodeType, array $nodeTypes): array
    {
        $childNodeTypes = array_reduce(
            $nodeTypes,
            static function (array $carry, NodeType $nodeType) use ($baseNodeType) {
                if ($baseNodeType->allowsChildNodeType($nodeType)) {
                    $carry[] = $nodeType->name->value;
                }
                return $carry;
            },
            []
        );
        sort($childNodeTypes);
        return $childNodeTypes;
    }

    /**
     * Returns the list of all allowed sub-nodetypes of the given nodes child
     *
     * @param NodeType[] $nodeTypes
     * @return array<string, bool>
     */
    public function generateAllowedGrandChildNodeTypes(
        string $childName,
        NodeType $baseNodeType,
        array $nodeTypes,
        ContentRepository $contentRepository,
    ): array {
        return array_reduce(
            $nodeTypes,
            static function (array $carry, NodeType $nodeType) use ($baseNodeType, $childName, $contentRepository) {
                try {
                    if ($contentRepository->getNodeTypeManager()->isNodeTypeAllowedAsChildToTetheredNode(
                        $baseNodeType->name,
                        NodeName::fromString($childName),
                        $nodeType->name
                    )) {
                        $carry[$nodeType->name->value] = true;
                    }
                } catch (\InvalidArgumentException) {
                    // Skip non autogenerated child nodes
                }
                return $carry;
            },
            []
        );
    }

    /**
     * Updates the list of nodetypes and their usage count by inheritance
     *
     * @param array<string, EnhancedNodeTypeConfiguration> $nodeTypes
     */
    protected function calculateUsageCountByInheritance(array &$nodeTypes): void
    {
        foreach ($nodeTypes as $nodeTypeName => $nodeTypeConfig) {
            if (!$nodeTypeConfig->isInUse()) {
                continue;
            }

            foreach ($nodeTypeConfig->declaredSuperTypes as $declaredSuperType) {
                $this->addUsageCountToSuperType(
                    [$nodeTypeName],
                    $nodeTypes,
                    $declaredSuperType,
                    $nodeTypeName,
                    $nodeTypeConfig->getUsageCount()
                );
            }
        }
    }

    /**
     * Recursively add the usage count to the super type
     *
     * @param string[] $inheritanceList
     * @param array<string, EnhancedNodeTypeConfiguration> $nodeTypes
     */
    protected function addUsageCountToSuperType(
        array $inheritanceList,
        array &$nodeTypes,
        string $superTypeName,
        string $nodeTypeName,
        int $count
    ): void {
        // Prevent endless loops by stopping if a type occurs two times
        if (in_array($superTypeName, $inheritanceList, true)) {
            return;
        }

        $inheritanceList[] = $superTypeName;
        $nodeTypes[$superTypeName]->setUsageCountByInheritance($nodeTypeName, $count);

        foreach ($nodeTypes[$superTypeName]->declaredSuperTypes as $declaredSuperType) {
            $this->addUsageCountToSuperType(
                $inheritanceList,
                $nodeTypes,
                $declaredSuperType,
                $nodeTypeName,
                $count
            );
        }
    }
}
