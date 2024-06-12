<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Controller;

/*
 * This file is part of the Shel.NodeTypes.Analyzer package.
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use League\Csv\Writer;
use Neos\Cache\Exception as CacheException;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\EelHelper\TranslationParameterToken;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Shel\NodeTypes\Analyzer\Domain\Dto\EnhancedNodeTypeConfiguration;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTreeLeaf;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;
use Shel\NodeTypes\Analyzer\Service\NodeTypeGraphService;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageProcessorInterface;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageService;

/**
 * @Flow\Scope("singleton")
 */
class NodeTypesController extends AbstractModuleController
{
    use CreateContentContextTrait;

    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @var array
     */
    protected $supportedMediaTypes = ['application/json', 'text/html'];

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'html' => FusionView::class,
        'json' => JsonView::class,
    ];

    /**
     * @Flow\Inject
     * @var NodeTypeGraphService
     */
    protected $nodeTypeGraphService;

    /**
     * @Flow\Inject
     * @var NodeTypeUsageService
     */
    protected $nodeTypeUsageService;

    /**
     * @Flow\Inject
     * @var Translator
     */
    protected $translator;

    /**
     * @Flow\Inject
     * @var WorkspaceRepository
     */
    protected $workspaceRepository;

    /**
     * @Flow\Inject
     * @var NodeTypeUsageProcessorInterface
     */
    protected $nodeTypeUsageProcessor;

    /**
     * @Flow\InjectConfiguration(path="contentDimensions", package="Neos.ContentRepository")
     * @var array
     */
    protected $dimensionConfiguration;

    /**
     * Renders the app to interact with the nodetype graph
     */
    public function indexAction(): void
    {
    }

    /**
     * Returns all nodetype definitions
     */
    public function getNodeTypeDefinitionsAction(): void
    {
        $nodeTypes = $this->nodeTypeGraphService->generateNodeTypesData();

        $this->view->assign('value', [
            'success' => true,
            'nodeTypes' => $nodeTypes,
        ]);
    }

    public function getNodesAction(string $path, array $dimensions = [], string $workspace = 'live'): void
    {
        $contentContext = $this->createContentContext($workspace, $dimensions);
        $nodeAtPath = $contentContext->getNode($path);

        // Only include workspaces in the root request
        $workspaces = $path === '/' ? array_map(static function (Workspace $workspace) {
            return [
                'label' => $workspace->getTitle(),
                'value' => $workspace->getName(),
            ];
        }, $this->getAccessibleWorkspaces()) : null;
        if ($workspaces) {
            usort($workspaces, static function ($a, $b) {
                return strtolower($a['label']) <=> strtolower($b['label']);
            });
        }

        $nodes = [$nodeAtPath->getPath() => NodeTreeLeaf::fromNode($nodeAtPath)];

        foreach ($nodeAtPath->getChildNodes() as $childNode) {
            $nodes[$childNode->getPath()] = NodeTreeLeaf::fromNode($childNode);
        }

        $this->view->assign('value', [
            'success' => true,
            'nodes' => $nodes,
            'workspaces' => $workspaces,
        ]);
    }

    /**
     * @return Workspace[]
     */
    protected function getAccessibleWorkspaces(): array
    {
        $workspaces = [];
        /** @var Workspace $workspace */
        foreach ($this->workspaceRepository->findByOwner(null) as $workspace) {
            if (!$workspace->isPersonalWorkspace()) {
                $workspaces[] = $workspace;
            }
        }
        return $workspaces;
    }

    /**
     * Returns a usage list for a specified nodetype
     * @throws CacheException
     */
    public function getNodeTypeUsageAction(?string $nodeTypeName): void
    {
        $usages = $this->nodeTypeUsageService->getNodeTypeUsages($this->controllerContext, $nodeTypeName);

        foreach ($usages as $usage) {
            $this->nodeTypeUsageProcessor->processForAnalysis($usage, $this->controllerContext);
        }

        $this->view->assign('value', [
            'success' => true,
            'usageLinks' => $usages,
        ]);
    }

    public function exportNodeTypesAction(): void
    {
        $nodeTypes = $this->nodeTypeGraphService->generateNodeTypesData();

        $nodeTypesDataForExport = array_map(function (EnhancedNodeTypeConfiguration $nodeType) {
            $label = $nodeType->getConfiguration()->ui['label'] ?? null;
            $label = $label ? $this->translateByShortHandString($label) : 'n/a';
            $properties = array_keys($nodeType->getConfiguration()->properties);
            $childNodes = array_keys($nodeType->getConfiguration()->childNodes);

            return [
                'name' => $nodeType->name,
                'label' => $label,
                'abstract' => $nodeType->abstract ? 'true' : 'false',
                'final' => $nodeType->final ? 'true' : 'false',
                'properties' => implode(', ', $properties),
                'childNodes' => implode(', ', $childNodes),
                'usageCount' => $nodeType->getUsageCount(),
                'usageCountByInheritance' => array_sum($nodeType->getUsageCountByInheritance()),
                'warnings' => implode(', ', $nodeType->warnings),
            ];
        }, $nodeTypes);

        usort($nodeTypesDataForExport, static function ($a, $b) {
            return strtolower($a['name']) <=> strtolower($b['name']);
        });

        $csvWriter = Writer::createFromFileObject(new \SplTempFileObject());
        $csvWriter->insertOne([
            'Name',
            'Label',
            'Abstract',
            'Final',
            'Properties',
            'Child Nodes',
            'Usage Count',
            'Usage Count By Inheritance',
            'Warnings',
        ]);

        foreach ($nodeTypesDataForExport as $nodeTypeData) {
            $csvWriter->insertOne($nodeTypeData);
        }

        $filename = 'neos-nodetypes-data-' . (new \DateTime())->format('Y-m-d-H-i-s') . '.csv';
        $content = $csvWriter->getContent();
        header('Pragma: no-cache');
        header('Content-type: application/text');
        header('Content-Length: ' . strlen($content));
        header('Content-Disposition: attachment; filename=' . $filename);
        header('Content-Transfer-Encoding: binary');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

        echo $content;

        exit;
    }

    public function exportNodeTypeUsageAction(?string $nodeTypeName): void
    {
        $usages = $this->nodeTypeUsageService->getNodeTypeUsages($this->controllerContext, $nodeTypeName);
        $hasDimensions = !empty($this->dimensionConfiguration);

        $headers = [
            'Title',
            'Page',
            'Workspace',
            'Url',
            'Node identifier',
            'Hidden node',
            'Hidden page',
        ];

        if ($hasDimensions) {
            $headers[] = 'Dimensions';
        }

        $csvWriter = Writer::createFromFileObject(new \SplTempFileObject());
        $csvWriter->insertOne($headers);

        foreach ($usages as $usageItem) {
            $this->nodeTypeUsageProcessor->processForExport($usageItem, $this->controllerContext);
            $csvWriter->insertOne($usageItem->toCSVExportableArray());
        }

        $filename = sprintf('nodetype-usage-%s-%s.csv', $nodeTypeName, (new \DateTime())->format('Y-m-d-H-i-s'));
        $content = $csvWriter->getContent();
        header('Pragma: no-cache');
        header('Content-type: application/text');
        header('Content-Length: ' . strlen($content));
        header('Content-Disposition: attachment; filename=' . $filename);
        header('Content-Transfer-Encoding: binary');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

        echo $content;

        exit;
    }

    protected function translateByShortHandString(string $shortHandString): string
    {
        $shortHandStringParts = explode(':', $shortHandString);
        if (count($shortHandStringParts) === 3) {
            [$package, $source, $id] = $shortHandStringParts;
            return (new TranslationParameterToken($id))
                ->package($package)
                ->source(str_replace('.', '/', $source))
                ->translate();
        }

        return $shortHandString;
    }
}
