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
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\EelHelper\TranslationParameterToken;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Neos\Domain\Service\ContentDimensionPresetSourceInterface;
use Shel\NodeTypes\Analyzer\Domain\Dto\EnhancedNodeTypeConfiguration;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTreeLeaf;
use Shel\NodeTypes\Analyzer\Service\NodeTypeGraphService;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageProcessorInterface;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageService;

#[Flow\Scope('singleton')]
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

    #[Flow\Inject]
    protected NodeTypeGraphService $nodeTypeGraphService;

    #[Flow\Inject]
    protected NodeTypeUsageService $nodeTypeUsageService;

    #[Flow\Inject]
    protected Translator $translator;

    #[Flow\Inject]
    protected WorkspaceRepository $workspaceRepository;

    /**
     * @var NodeTypeUsageProcessorInterface
     */
    #[Flow\Inject]
    protected $nodeTypeUsageProcessor;

    #[Flow\InjectConfiguration('contentDimensions', 'Neos.ContentRepository')]
    protected array $dimensionConfiguration;

    /**
     * @var ContentDimensionPresetSourceInterface
     */
    #[Flow\Inject]
    protected $contentDimensionPresetSource;

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

    public function getNodesAction(string $path = '', string $dimensionValues = '{}', string $workspace = 'live'): void
    {
        $isRoot = $path === '/' || $path === '';

        try {
            $dimensionValuesSelection = json_decode($dimensionValues, true, 512, JSON_THROW_ON_ERROR);
            foreach ($dimensionValuesSelection as $dimensionName => $value) {
                $dimensionValuesSelection[$dimensionName] = is_array($value) ? $value : [$value];
            }
        } catch (\JsonException) {
            $dimensionValuesSelection = [];
        }

        $contentContext = $this->createContentContext($workspace, $dimensionValuesSelection);
        $nodeAtPath = $contentContext->getNode($isRoot ? '/' : $path);

        $nodes = [$nodeAtPath->getPath() => NodeTreeLeaf::fromNode($nodeAtPath)];
        foreach ($nodeAtPath->getChildNodes() as $childNode) {
            $nodes[$childNode->getPath()] = NodeTreeLeaf::fromNode($childNode);

            if ($isRoot) {
                // If we are at the root, we also want to include the site nodes
                foreach ($childNode->getChildNodes() as $grandChildNode) {
                    $nodes[$grandChildNode->getPath()] = NodeTreeLeaf::fromNode($grandChildNode);
                }
            }
        }

        // Only include workspaces and dimensions in the root request
        $workspaces = $isRoot ? array_map(static function (Workspace $workspace) {
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
        $contentDimensionsConfiguration = $isRoot ? $this->contentDimensionPresetSource->getAllPresets() : [];

        $this->view->assign('value', [
            'success' => true,
            'nodes' => $nodes,
            'workspaces' => $workspaces,
            'contentDimensionsConfiguration' => $contentDimensionsConfiguration,
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

    public function exportNodeTypesAction(bool $reduced = false): void
    {
        $nodeTypes = $this->nodeTypeGraphService->generateNodeTypesData(true, !$reduced);

        $nodeTypesDataForExport = array_map(function (EnhancedNodeTypeConfiguration $nodeType) use ($reduced) {
            $label = $nodeType->label;
            $label = $label ? $this->translateByShortHandString($label) : 'n/a';
            $properties = array_keys($nodeType->properties);
            $childNodes = array_keys($nodeType->childNodes);

            return [
                    'name' => $nodeType->name,
                    'label' => $label,
                ] + ($reduced ? [] : [
                    'abstract' => $nodeType->abstract ? 'true' : 'false',
                    'final' => $nodeType->final ? 'true' : 'false',
                    'properties' => implode(', ', $properties),
                    'childNodes' => implode(', ', $childNodes),
                ]
                ) + [
                    'usageCount' => $nodeType->getUsageCount()
                ] + ($reduced ? [] : [
                    'usageCountByInheritance' => array_sum($nodeType->getUsageCountByInheritance()),
                ]
                ) + ['warnings' => implode(', ', $nodeType->warnings)];
        }, $nodeTypes);

        usort($nodeTypesDataForExport, static function ($a, $b) {
            return strtolower($a['name']) <=> strtolower($b['name']);
        });

        $csvWriter = Writer::createFromFileObject(new \SplTempFileObject());
        $headers = array_merge(
            [
                'Name',
                'Label',
            ],
            ($reduced ? [] : [
                'Abstract',
                'Final',
                'Properties',
                'Child Nodes',
            ]),
            [
                'Usage Count'
            ],
            ($reduced ? [] : [
                'Usage Count By Inheritance',
            ]
            ),
            [
                'Warnings',
            ]
        );
        $csvWriter->insertOne($headers);

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
            'Page identifier',
            'Workspace',
            'Url',
            'Node identifier',
            'Hidden node',
            'Hidden page',
        ];

        if ($hasDimensions) {
            $headers[] = 'Dimensions';
        }

        $headers[] = 'Breadcrumb';

        $csvWriter = Writer::createFromFileObject(new \SplTempFileObject());
        $csvWriter->insertOne($headers);

        foreach ($usages as $usageItem) {
            $this->nodeTypeUsageProcessor->processForExport($usageItem, $this->controllerContext);
            $data = $usageItem->toCSVExportableArray();
            if (!$hasDimensions) {
                unset($data['dimensions']);
            }
            $csvWriter->insertOne($data);
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
