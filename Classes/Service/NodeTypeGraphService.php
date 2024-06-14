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
use Neos\ContentRepository\Domain\Model\NodeData;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Shel\NodeTypes\Analyzer\Domain\Dto\EnhancedNodeTypeConfiguration;

#[Flow\Scope("singleton")]
class NodeTypeGraphService
{

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

    /**
     * @var StringFrontend
     */
    #[Flow\Inject]
    protected $configurationCache;

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

        $nodeTypes = $this->nodeTypeManager->getNodeTypes();
        $nodeTypeUsage = $this->getNodeTypeUsageQuery();

        $nodeTypes = array_reduce(
            $nodeTypes,
            function (array $carry, NodeType $nodeType) use ($nodeTypes, $nodeTypeUsage) {
                $nodeTypeName = $nodeType->getName();
                $usageCount = (int)($nodeTypeUsage[$nodeTypeName] ?? 0);

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
                        $instantiableNodeTypes
                    ) {
                        $allowedGrandChildNodeTypes = $childNodes[$childNodeName];
                        if (is_array($allowedGrandChildNodeTypes)) {
                            $allowedGrandChildNodeTypes = $this->generateAllowedGrandChildNodeTypes(
                                $childNodeName,
                                $nodeType,
                                $instantiableNodeTypes
                            );
                            $carry[$childNodeName] = $allowedGrandChildNodeTypes;
                        }
                        // TODO: Else case should mark child definition as broken for the ui
                        return $carry;
                    },
                    []
                );

                $carry[$nodeTypeName] = $enhancedNodeTypeConfiguration->updateGrandChildNodeConstraints($grandChildNodeConstraints);
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
     * Return the usage count of each nodetype in the content repository
     *
     * @return array<string, int>
     */
    public function getNodeTypeUsageQuery(): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        $nodeTypeUsage = $qb->select('n.nodeType, COUNT(n.identifier) as count')
            ->from(NodeData::class, 'n')
            ->groupBy('n.nodeType')
            ->andWhere('n.removed = false')
            ->getQuery()
            ->getScalarResult();

        $nodeTypes = array_column($nodeTypeUsage, 'nodeType');
        $usageCount = array_column($nodeTypeUsage, 'count');

        return array_combine($nodeTypes, $usageCount);
    }

    /**
     * Returns the list of all allowed sub-nodetypes of the given node
     *
     * @return string[]
     */
    public function generateAllowedChildNodeTypes(NodeType $baseNodeType, array $nodeTypes): array
    {
        $childNodeTypes = array_reduce(
            $nodeTypes,
            static function (array $carry, NodeType $nodeType) use ($baseNodeType) {
                if ($baseNodeType->allowsChildNodeType($nodeType)) {
                    $carry[] = $nodeType->getName();
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
        array $nodeTypes
    ): array {
        return array_reduce(
            $nodeTypes,
            static function (array $carry, NodeType $nodeType) use ($baseNodeType, $childName) {
                try {
                    if ($baseNodeType->allowsGrandchildNodeType($childName, $nodeType)) {
                        $carry[$nodeType->getName()] = true;
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
