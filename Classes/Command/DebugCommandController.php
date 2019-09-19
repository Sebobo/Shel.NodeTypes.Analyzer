<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Command;

use Fhaculty\Graph\Graph;
use Fhaculty\Graph\Vertex;
use Graphp\GraphML\Exporter as GraphExporter;
use Graphp\GraphViz\GraphViz;
use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Mvc\Exception\StopActionException;

/**
 * @Flow\Scope("singleton")
 */
class DebugCommandController extends CommandController
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
     * @param string|null $baseNodeType
     * @param string|null $format
     * @throws StopActionException
     */
    public function nodeTypeGraphCommand(?string $baseNodeType = null, ?string $format = null, ?string $filename = 'nodetype-hierarchy'): void
    {
        if ($baseNodeType !== null) {
            try {
                $baseNodeType = $this->nodeTypeManager->getNodeType($baseNodeType);
            } catch (NodeTypeNotFoundException $e) {
                $this->outputLine('<error>Node type "%s" does not exist</error>', [$baseNodeType]);
                $this->quit(1);
                return;
            }
        }

        if ($format === 'graphml' || $format === 'graphviz') {
            $graph = $this->buildGraph($baseNodeType);

            if ($format === 'graphviz') {
                $this->writeGraphVizFile($filename, $graph);
            } else {
                $this->writeGraphMLFile($filename, $graph);
            }
        } else {
            $this->outputGraph($baseNodeType);
        }
    }

    /**
     * Create a graph structure from the nodetype inheritance starting from `baseNodeType`
     *
     * @param NodeType|null $baseNodeType
     * @return Graph
     */
    protected function buildGraph(?NodeType $baseNodeType = null): Graph
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
     * Writes the graph structure to the stdout
     *
     * @param NodeType|null $baseNodeType
     */
    protected function outputGraph(?NodeType $baseNodeType = null): void
    {
        if ($baseNodeType) {
            $this->renderNodeType($baseNodeType);
        } else {
            $nodeTypes = $this->nodeTypeManager->getNodeTypes();

            /** @var NodeType $nodeType */
            foreach ($nodeTypes as $nodeType) {
                $this->renderNodeType($nodeType);
            }
        }
    }

    /**
     * @param NodeType $nodeType
     * @param int $depth
     */
    protected function renderNodeType(NodeType $nodeType, int $depth = 0): void
    {
        $superTypes = $nodeType->getDeclaredSuperTypes();
        $colorList = ['green', 'blue', 'red'];
        $currentColor = $colorList[$depth % count($colorList)];
        $this->outputFormatted('* <fg=%s;options=bold> %s </>', [$currentColor, $nodeType->getName()], $depth * 2);

        /** @var NodeType $superType */
        foreach ($superTypes as $superType) {
            $this->renderNodeType($superType, $depth + 2);
        }
    }

    /**
     * @param string $filename
     * @param Graph $graph
     */
    protected function writeGraphMLFile(string $filename, Graph $graph): void
    {
        $exporter = new GraphExporter();
        $data = $exporter->getOutput($graph);
        file_put_contents($filename . '.graphml', $data);
    }

    /**
     * @param string $filename
     * @param Graph $graph
     */
    protected function writeGraphVizFile(string $filename, Graph $graph): void
    {
        $graph->setAttribute('graphviz.graph.rankdir', 'LR');
        $graph->setAttribute('graphviz.graph.splines', 'line');

        $graphviz = new GraphViz();
        $data = $graphviz->createScript($graph);

        // Hack for replacing numerical group ids with their actual name as the library doesn't support those yet
        foreach ($this->nodeTypeGroups as $groupId => $groupProperties) {
            $data = str_replace($groupId, '"' . $groupProperties['name'] . '"', $data);
        }

        file_put_contents($filename . '.graphviz', $data);
    }
}
