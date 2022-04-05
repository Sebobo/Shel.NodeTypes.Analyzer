<?php
declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Service;

use Doctrine\ORM\EntityManagerInterface;
use Neos\Cache\Exception;
use Neos\Cache\Frontend\StringFrontend;
use Neos\Cache\Frontend\VariableFrontend;
use Neos\ContentRepository\Domain\Model\NodeData;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Scope("singleton")
 */
class NodeTypeGraphService
{

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
     * @var StringFrontend
     */
    protected $configurationCache;

    /**
     * @return array
     */
    public function generateNodeTypesData(): array
    {
        $nodeTypesCacheKey = 'NodeTypes_' . $this->configurationCache->get('ConfigurationVersion');
        $nodeTypes = $this->nodeTypesCache->get($nodeTypesCacheKey);
        if ($nodeTypes) {
            return $nodeTypes;
        }

        $nodeTypes = $this->nodeTypeManager->getNodeTypes();
        $nodeTypeUsage = $this->getNodeTypeUsageQuery();

        $defaultConfiguration = [
            'superTypes' => [],
            'properties' => [],
            'ui' => [],
            'abstract' => false,
            'final' => false,
            'constraints' => [],
            'childNodes' => [],
            'options' => []
        ];
        $defaultConfigurationKeys = array_keys($defaultConfiguration);

        $nodeTypes = array_reduce($nodeTypes,
            function (array $carry, NodeType $nodeType) use ($defaultConfiguration, $defaultConfigurationKeys, $nodeTypes, $nodeTypeUsage) {
                $nodeTypeName = $nodeType->getName();

                $declaredProperties = array_keys($nodeType->getLocalConfiguration()['properties'] ?? []);

                $declaredSuperTypes = array_reduce($nodeType->getDeclaredSuperTypes(),
                    static function (array $carry, NodeType $superType) {
                        $carry[] = $superType->getName();
                        return $carry;
                    }, []);

                $configuration = array_merge($defaultConfiguration, $nodeType->getFullConfiguration());
                // Filter all property configs except type
                $configuration['properties'] = array_map(static function ($definition) {
                    return [
                        'type' => $definition['type'] ?? null,
                    ];
                }, $configuration['properties']);

                $configuration['ui'] = array_filter($configuration['ui'], static function ($key) {
                    return $key === 'label' || $key === 'icon';
                }, ARRAY_FILTER_USE_KEY);

                $configuration = array_filter($configuration, static function ($key) use($defaultConfigurationKeys) {
                    return in_array($key, $defaultConfigurationKeys, true);
                }, ARRAY_FILTER_USE_KEY);

                $carry[$nodeTypeName] = [
                    'name' => $nodeTypeName,
                    'abstract' => $nodeType->isAbstract(),
                    'final' => $nodeType->isFinal(),
                    'configuration' => $configuration,
                    'declaredProperties' => $declaredProperties,
                    'declaredSuperTypes' => $declaredSuperTypes,
                    'usageCount' => array_key_exists($nodeTypeName,
                        $nodeTypeUsage) ? (int)$nodeTypeUsage[$nodeTypeName] : 0,
                    'usageCountByInheritance' => []
                ];

                $instantiableNodeTypes = array_filter($nodeTypes, static function (NodeType $nodeType) {
                    return !$nodeType->isAbstract();
                });
                $carry[$nodeTypeName]['allowedChildNodeTypes'] = $this->generateAllowedChildNodeTypes($nodeType,
                    $instantiableNodeTypes);

                if (array_key_exists('childNodes', $carry[$nodeTypeName]['configuration'])) {
                    foreach (array_keys($carry[$nodeTypeName]['configuration']['childNodes']) as $childNodeName) {
                        if (is_array($carry[$nodeTypeName]['configuration']['childNodes'][$childNodeName]) && array_key_exists('allowedChildNodeTypes', $carry[$nodeTypeName]['configuration']['childNodes'][$childNodeName])) {
                            $carry[$nodeTypeName]['configuration']['childNodes'][$childNodeName]['allowedChildNodeTypes'] = $this->generateAllowedGrandChildNodeTypes($childNodeName,
                                $nodeType, $instantiableNodeTypes);
                        }
                        // TODO: Else case should mark child definition as broken for the ui
                    }
                }

                return $carry;
            }, []);

        $this->calculateUsageCountByInheritance($nodeTypes);

        $this->nodeTypesCache->flush();
        try {
            $this->nodeTypesCache->set($nodeTypesCacheKey, $nodeTypes);
        } catch (Exception $e) {
            // TODO: Log cache issue
        }

        return $nodeTypes;
    }

    /**
     * Return the usage count of each nodetype in the content repository
     *
     * @return array
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
     * Returns the list of all allowed subnodetypes of the given node
     *
     * @param NodeType $baseNodeType
     * @param array $nodeTypes
     * @return array
     */
    public function generateAllowedChildNodeTypes(NodeType $baseNodeType, array $nodeTypes): array
    {
        $childNodeTypes = array_reduce($nodeTypes, static function (array $carry, NodeType $nodeType) use ($baseNodeType) {
            if ($baseNodeType->allowsChildNodeType($nodeType)) {
                $carry[] = $nodeType->getName();
            }
            return $carry;
        }, []);
        sort($childNodeTypes);
        return $childNodeTypes;
    }

    /**
     * Returns the list of all allowed subnodetypes of the given nodes child
     *
     * @param string $childName
     * @param NodeType $baseNodeType
     * @param array $nodeTypes
     * @return array
     */
    public function generateAllowedGrandChildNodeTypes(
        string $childName,
        NodeType $baseNodeType,
        array $nodeTypes
    ): array {
        return array_reduce($nodeTypes, static function (array $carry, NodeType $nodeType) use ($baseNodeType, $childName) {
            try {
                if ($baseNodeType->allowsGrandchildNodeType($childName, $nodeType)) {
                    $carry[] = $nodeType->getName();
                }
            } catch (\InvalidArgumentException $e) {
                // Skip non autogenerated child nodes
            }
            return $carry;
        }, []);
    }

    /**
     * @param array $nodeTypes
     */
    protected function calculateUsageCountByInheritance(array &$nodeTypes): void
    {
        foreach($nodeTypes as $nodeType => $nodeTypeConfig) {
            if ($nodeTypeConfig['usageCount'] === 0) {
                continue;
            }

            foreach ($nodeTypeConfig['declaredSuperTypes'] as $declaredSuperType) {
                $this->addUsageCountToSuperType([$nodeType], $nodeTypes, $declaredSuperType, $nodeType, $nodeTypeConfig['usageCount']);
            }
        }
    }

    /**
     * @param array $inheritanceList
     * @param array $nodeTypes
     * @param string $superType
     * @param string $nodeType
     * @param int $count
     */
    protected function addUsageCountToSuperType(array $inheritanceList, array &$nodeTypes, string $superType, string $nodeType, int $count): void
    {
        // Prevent endless loops by stoping if a type occurs two times
        if (in_array($superType, $inheritanceList, true)) {
            return;
        }

        $inheritanceList[] = $superType;
        $nodeTypes[$superType]['usageCountByInheritance'][$nodeType] = $count;

        foreach ($nodeTypes[$superType]['declaredSuperTypes'] as $declaredSuperType) {
            $this->addUsageCountToSuperType($inheritanceList, $nodeTypes, $declaredSuperType, $nodeType, $count);
        }
    }
}
