<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Command;

use Fhaculty\Graph\Graph;
use Graphp\GraphML\Exporter as GraphExporter;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Mvc\Exception\StopActionException;
use Shel\ContentRepository\Debugger\Service\NodeTypeGraphService;

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
     * @Flow\Inject
     * @var NodeTypeGraphService
     */
    protected $nodeTypeGraphService;

    /**
     * @param string|null $baseNodeType
     * @param string|null $format
     * @param string $filename
     * @throws StopActionException
     */
    public function nodeTypeGraphCommand(?string $baseNodeType = null, ?string $format = null, string $filename = 'nodetype-hierarchy'): void
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
            $graph = $this->nodeTypeGraphService->buildGraph($baseNodeType);

            if ($format === 'graphviz') {
                $this->writeGraphVizFile($filename, $graph);
            } else {
                $this->writeGraphMLFile($filename, $graph);
            }
        } else {
            $this->outputGraph($baseNodeType);
        }
    }

    public function nodeTypeConstraintsCommand(?string $baseNodeType = null, string $filename = 'nodetype-constraints'): void
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

        $graph = $this->nodeTypeGraphService->buildConstraintGraph($baseNodeType, [], false);

        $data = $this->writeDataToMarkdown($baseNodeType->getName(), $graph);

        file_put_contents($filename . '.md', $data);
    }

    protected function writeDataToMarkdown(string $groupName, array $data, int $level = 0): string
    {
        $md = $this->getMarkdownLevelPrefix($level) . $groupName . PHP_EOL;

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                if (!empty($value)) {
                    $md .= $this->writeDataToMarkdown($key, $value, $level + 1);
                }
            } else {
                $md .= $this->getMarkdownLevelPrefix($level + 1) . $value . PHP_EOL;
            }
        }

        return $md;
    }

    protected function getMarkdownLevelPrefix(int $level): string
    {
        switch ($level) {
            case 0:
                return '# ';
                break;
            case 1:
                return '## ';
                break;
            case 2:
                return '### ';
                break;
            default:
                return str_repeat('  ', $level - 3) . '- ';
        }
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
        $data = $this->nodeTypeGraphService->getGraphVizData($graph);
        file_put_contents($filename . '.graphviz', $data);
    }
}
