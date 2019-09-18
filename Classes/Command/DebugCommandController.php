<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Command;

use Fhaculty\Graph\Graph;
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
     * @param string|null $baseNodeType
     * @param string|null $format
     * @throws StopActionException
     */
    public function nodeTypeGraphCommand(?string $baseNodeType = null, ?string $format = null): void
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

            if ($format === 'graphviz') {
                $graphviz = new GraphViz();
                $data = $graphviz->createScript($graph);
                file_put_contents('nodetype-hierarchy.graphviz', $data);
            } else {
                $exporter = new GraphExporter();
                $data = $exporter->getOutput($graph);
                file_put_contents('nodetype-hierarchy.graphml', $data);
            }
        } else {
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
    }

    /**
     * @param NodeType $nodeType
     * @param Graph $graph
     */
    protected function addNodeToGraph(NodeType $nodeType, Graph &$graph): void
    {
        $superTypes = $nodeType->getDeclaredSuperTypes();

        if ($graph->hasVertex($nodeType->getName())) {
            $graphNode = $graph->getVertex($nodeType->getName());
        } else {
            $nameParts = explode(':', $nodeType->getName());
            $packageParts = explode('.', $nameParts[0]);
            $graphNode = $graph->createVertex($nodeType->getName());
            $graphNode->setAttribute('Package', $nameParts[0]);
            $graphNode->setAttribute('Vendor', $packageParts[0]);

            $hash = $nameParts[0];
            $groupId = intval(base_convert($hash, 16, 10));
            $graphNode->setGroup($groupId);
        }

        /** @var NodeType $superType */
        foreach ($superTypes as $superType) {
            $this->addNodeToGraph($superType, $graph);

            $superTypeNode = $graph->getVertex($superType->getName());
            if (!$graphNode->hasEdgeTo($superTypeNode)) {
                $graphNode->createEdgeTo($superTypeNode);
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
}
