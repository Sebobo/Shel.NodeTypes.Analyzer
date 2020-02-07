<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Service;

use Fhaculty\Graph\Graph;
use Fhaculty\Graph\Vertex;
use Graphp\GraphViz\GraphViz;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Scope("singleton")
 */
class NodeTypeGraphService
{
    const GRAPHVIZ_TYPE_IMAGE_HTML = 0;
    const GRAPHVIZ_TYPE_IMAGE_SRC = 1;
    const GRAPHVIZ_TYPE_IMAGE_DATA = 2;

    const GRAPHVIZ_LAYOUT_NEATO = 'neato';
    const GRAPHVIZ_LAYOUT_DOT = 'dot';
    const GRAPHVIZ_LAYOUT_FDP = 'fdp';

    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @var array
     */
    protected $graphColors = [
        'blue',
        'red',
        'green',
    ];

    /**
     * @Flow\InjectConfiguration("defaults")
     * @var array
     */
    protected $defaults;

    /**
     * Create a graph structure from the nodetype inheritance starting from `baseNodeType`
     *
     * @param NodeType|null $baseNodeType
     * @return array containing the Graph, NodeTypes array and NodeTypeGroups
     */
    public function buildGraph(?NodeType $baseNodeType = null): array
    {
        $graph = new Graph();
        $nodeTypeGroups = [];

        if ($baseNodeType) {
            $this->addNodeToGraph($baseNodeType, $graph, $nodeTypeGroups);
        } else {
            $nodeTypes = $this->nodeTypeManager->getNodeTypes();

            /** @var NodeType $nodeType */
            foreach ($nodeTypes as $nodeType) {
                $this->addNodeToGraph($nodeType, $graph, $nodeTypeGroups);
            }
        }

        return [$graph, $nodeTypeGroups];
    }

    /**
     * Adds a nodetype to the graph if it's not contained yet and continues with it's supertypes
     *
     * @param NodeType $nodeType
     * @param Graph $graph
     * @param array $nodeTypeGroups
     * @return Vertex
     */
    protected function addNodeToGraph(NodeType $nodeType, Graph &$graph, array &$nodeTypeGroups = []): Vertex
    {
        $superTypes = $nodeType->getDeclaredSuperTypes();

        if ($graph->hasVertex($nodeType->getName())) {
            return $graph->getVertex($nodeType->getName());
        } else {
            $nameParts = explode(':', $nodeType->getName());
            $packageName = $nameParts[0];
            $packageParts = explode('.', $packageName);
            $vendor = $packageParts[0];

            $graphNode = $graph->createVertex($nodeType->getName());

            // Create unique hash for the group which will be later replaced by the groups name
            $hash = md5($packageName);
            $groupId = crc32($hash);
            if (!array_key_exists($groupId, $nodeTypeGroups)) {
                $nodeTypeGroups[$groupId] = [
                    'name' => $packageName,
                    'color' => $this->graphColors[$groupId % count($this->graphColors)],
                ];
            }
            $group = $nodeTypeGroups[$groupId];

            $graphNode->setGroup($groupId);
            $graphNode->setAttribute('graphviz.color', $group['color']);
            $graphNode->setAttribute('Package', $packageName);
            $graphNode->setAttribute('Vendor', $vendor);

            if ($nodeType->isAbstract()) {
                $graphNode->setAttribute('graphviz.shape', 'hexagon');
            } elseif ($nodeType->isFinal()) {
                $graphNode->setAttribute('graphviz.shape', 'house');
            }
        }

        /** @var NodeType $superType */
        foreach ($superTypes as $superType) {
            $superTypeNode = $this->addNodeToGraph($superType, $graph);
            if (!$graphNode->hasEdgeTo($superTypeNode)) {
                $graphNode->createEdgeTo($superTypeNode);
            }
        }
        return $graphNode;
    }

    /**
     * @param Graph $graph
     * @param array $nodeTypeGroups
     * @return string
     */
    public function getGraphVizData(Graph $graph, array $nodeTypeGroups = []): string
    {
        $graphviz = new GraphViz();
        $data = $graphviz->createScript($graph);

        // Hack for replacing numerical group ids with their actual name as the library doesn't support those yet
        foreach ($nodeTypeGroups as $groupId => $groupProperties) {
            $data = str_replace($groupId, '"' . $groupProperties['name'] . '"', $data);
        }

        return $data;
    }

    /**
     * @param Graph $graph
     * @param array $attributeOverrides
     * @param int $type
     * @param string $format
     * @return string
     */
    public function getGraphVizSvg(
        Graph $graph,
        array $attributeOverrides = [],
        int $type = self::GRAPHVIZ_TYPE_IMAGE_DATA,
        string $format = 'svg'
    ): string {
        $attributes = $this->defaults['graphviz'];
        foreach ($attributes as $group => $groupAttributes) {
            foreach ($groupAttributes as $attribute => $value) {
                $value = array_key_exists($group, $attributeOverrides) && array_key_exists($attribute,
                    $attributeOverrides[$group]) ? $attributeOverrides[$group][$attribute] : $value;
                $graph->setAttribute('graphviz.' . $group . '.' . $attribute, $value);
            }
        }

        $graphViz = new GraphViz();
        $graphViz->setFormat($format);

        if ($type === self::GRAPHVIZ_TYPE_IMAGE_HTML) {
            return $graphViz->createImageHtml($graph);
        } elseif ($type === self::GRAPHVIZ_TYPE_IMAGE_SRC) {
            return $graphViz->createImageSrc($graph);
        }
        return $graphViz->createImageData($graph);
    }

    /**
     * @param NodeType|null $baseNodeType
     * @param array $parentTypes
     * @param bool $buildGrandChildConstraints
     * @return array
     * @throws NodeTypeNotFoundException
     */
    public function buildConstraintGraph(?NodeType $baseNodeType, array $parentTypes = [], bool $buildGrandChildConstraints = true): array
    {
        $nodeTypes = $this->nodeTypeManager->getNodeTypes();
        $instantiableNodeTypes = array_filter($nodeTypes, function (NodeType $nodeType) {
            return !$nodeType->isAbstract();
        });

        $directConstraints = [];
        foreach ($this->generateAllowedChildNodeTypes($baseNodeType, $instantiableNodeTypes) as $nodeTypeName) {
            $nodeType = $this->nodeTypeManager->getNodeType($nodeTypeName);
            if (in_array($nodeTypeName, $parentTypes)) {
                $directConstraints[$nodeTypeName] = $nodeTypeName;
            } else {
                $childNodeParentTypes = $parentTypes;
                $childNodeParentTypes[]= $nodeTypeName;
                $directConstraints[$nodeTypeName] = $this->buildConstraintGraph($nodeType, $childNodeParentTypes, $buildGrandChildConstraints);
            }
        }

        $autoGeneratedChildNodeConstraints = [];
        foreach (array_keys($baseNodeType->getAutoCreatedChildNodes()) as $childNodeName) {
            $grandChildNodes = $this->generateAllowedGrandChildNodeTypes($childNodeName, $baseNodeType, $instantiableNodeTypes);
            $autoGeneratedChildNodeConstraints[$childNodeName] = [];
            foreach ($grandChildNodes as $grandChildNodeName) {
                $grandChildNodeType = $this->nodeTypeManager->getNodeType($grandChildNodeName);

                if (!$buildGrandChildConstraints || in_array($grandChildNodeName, $parentTypes)) {
                    $autoGeneratedChildNodeConstraints[$childNodeName][$grandChildNodeName] = $grandChildNodeName;
                } else {
                    $childNodeParentTypes = $parentTypes;
                    $childNodeParentTypes[]= $grandChildNodeName;
                    $autoGeneratedChildNodeConstraints[$childNodeName][$grandChildNodeName] = $this->buildConstraintGraph($grandChildNodeType, $childNodeParentTypes, false);
                }
            }
        }

        return [
            'directConstraints' => $directConstraints,
            'autoGeneratedChildNodeConstraints' => $autoGeneratedChildNodeConstraints,
        ];
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
        return array_reduce($nodeTypes, function (array $carry, NodeType $nodeType) use ($baseNodeType) {
            if ($baseNodeType->allowsChildNodeType($nodeType)) {
                $carry[] = $nodeType->getName();
            }
            return $carry;
        }, []);
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
        return array_reduce($nodeTypes, function (array $carry, NodeType $nodeType) use ($baseNodeType, $childName) {
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
}
