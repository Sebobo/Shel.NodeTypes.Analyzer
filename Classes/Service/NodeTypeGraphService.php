<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Service;

use Fhaculty\Graph\Graph;
use Fhaculty\Graph\Vertex;
use Graphp\GraphViz\GraphViz;
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
     * @var array
     */
    protected $nodeTypeGroups = [];

    /**
     * @var array
     */
    protected $graphColors = [
        'blue',
        'red',
        'green',
    ];

    /**
     * Create a graph structure from the nodetype inheritance starting from `baseNodeType`
     *
     * @param NodeType|null $baseNodeType
     * @return Graph
     */
    public function buildGraph(?NodeType $baseNodeType = null): Graph
    {
        $graph = new Graph();

        if ($baseNodeType) {
            $this->addNodeToGraph($baseNodeType, $graph);
        } else {
            $nodeTypes = $this->nodeTypeManager->getNodeTypes();

            /** @var NodeType $nodeType */
            foreach ($nodeTypes as $nodeType) {
                $this->addNodeToGraph($nodeType, $graph);
            }
        }

        // Define graphviz styling
        $graph->setAttribute('graphviz.graph.rankdir', 'LR');
        $graph->setAttribute('graphviz.graph.splines', 'line');

        return $graph;
    }

    /**
     * Adds a nodetype to the graph if it's not contained yet and continues with it's supertypes
     *
     * @param NodeType $nodeType
     * @param Graph $graph
     * @return Vertex
     */
    protected function addNodeToGraph(NodeType $nodeType, Graph &$graph): Vertex
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
            if (!array_key_exists($groupId, $this->nodeTypeGroups)) {
                $this->nodeTypeGroups[$groupId] = [
                    'name' => $packageName,
                    'color' => $this->graphColors[$groupId % count($this->graphColors)],
                ];
            }
            $group = $this->nodeTypeGroups[$groupId];

            $graphNode->setGroup($groupId);
            $graphNode->setAttribute('graphviz.color', $group['color']);
            $graphNode->setAttribute('Package', $packageName);
            $graphNode->setAttribute('Vendor', $vendor);

            if ($nodeType->isAbstract()) {
                $graphNode->setAttribute('graphviz.shape', 'hexagon');
            }
            // TODO: set alternate shape for final nodetypes
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
     * @return string
     */
    public function getGraphVizData(Graph $graph): string
    {
        $graphviz = new GraphViz();
        $data = $graphviz->createScript($graph);

        // Hack for replacing numerical group ids with their actual name as the library doesn't support those yet
        foreach ($this->nodeTypeGroups as $groupId => $groupProperties) {
            $data = str_replace($groupId, '"' . $groupProperties['name'] . '"', $data);
        }

        return $data;
    }
}
