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

use Neos\Cache\Exception as CacheException;
use Neos\ContentRepository\Core\ContentRepository;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\Feature\Security\Exception\AccessDenied;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\CountChildNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindChildNodesFilter;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Workspace\Workspace;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\EelHelper\TranslationParameterToken;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Neos\Domain\NodeLabel\NodeLabelGeneratorInterface;
use Neos\Neos\Domain\Service\NodeTypeNameFactory;
use Neos\Neos\Domain\Service\WorkspaceService;
use Neos\Neos\Domain\SubtreeTagging\NeosVisibilityConstraints;
use Shel\NodeTypes\Analyzer\Domain\Dto\EnhancedNodeTypeConfiguration;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTreeLeaf;
use Shel\NodeTypes\Analyzer\Service\NodeTypeGraphService;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageProcessorInterface;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageService;

#[Flow\Scope('singleton')]
class NodeTypesController extends AbstractModuleController
{
    /**
     * @var string
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @var string[]
     */
    protected $supportedMediaTypes = ['application/json', 'text/html'];

    /**
     * @var array<string, string>
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

    /**
     * @var NodeTypeUsageProcessorInterface
     */
    #[Flow\Inject]
    protected $nodeTypeUsageProcessor;

    public function __construct(
        protected ContentRepositoryRegistry $contentRepositoryRegistry,
        protected NodeLabelGeneratorInterface $nodeLabelGenerator,
        protected WorkspaceService $workspaceService,
    ) {
    }


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

    /**
     * TODO: Allow choosing a specific dimension space point
     */
    public function getNodesAction(
        string $parentNodeAggregateId,
        string $workspace = 'live'
    ): void {
        $contentRepository = $this->contentRepositoryRegistry->get(ContentRepositoryId::fromString('default'));
        $variationGraph = $contentRepository->getVariationGraph();
        $dimensionSpacePoints = $variationGraph->getDimensionSpacePoints();
        /** @var DimensionSpacePoint $firstDimensionSpacePoint */
        $firstDimensionSpacePoint = array_values($dimensionSpacePoints->points)[0] ?? null;

        $subgraph = $contentRepository->getContentGraph(WorkspaceName::fromString($workspace))->getSubgraph(
            $firstDimensionSpacePoint,
            NeosVisibilityConstraints::excludeRemoved()
        );
        // TODO: Support any type of CR, not just sites
        $rootNode = $subgraph->findRootNodeByType(NodeTypeNameFactory::forSites());

        if (!$rootNode) {
            $this->view->assign('value', [
                'success' => false,
                'message' => 'Root node not found',
            ]);
            return;
        }

        $nodeAtPath = $parentNodeAggregateId ?
            $subgraph->findNodeById(NodeAggregateId::fromString($parentNodeAggregateId)) :
            $rootNode;

        // Only include workspaces in the root request
        $workspaces = $nodeAtPath === $rootNode ? $this->getAccessibleWorkspaces($contentRepository) : [];

        $nodes = [];
        if ($nodeAtPath) {
            $childNodes = $subgraph->findChildNodes(
                $nodeAtPath->aggregateId,
                FindChildNodesFilter::create('Neos.Neos:Node')
            );

            $parentNode = $subgraph->findParentNode($nodeAtPath->aggregateId);

            $nodes[$nodeAtPath->aggregateId->value] = new NodeTreeLeaf(
                $nodeAtPath,
                $parentNode,
                $this->nodeLabelGenerator->getLabel($nodeAtPath),
                $childNodes->count(),
                0
            );

            $index = 0;
            foreach ($childNodes as $childNode) {
                $index++;
                $nodes[$childNode->aggregateId->value] = new NodeTreeLeaf(
                    $childNode,
                    $nodeAtPath,
                    $this->nodeLabelGenerator->getLabel($childNode),
                    $subgraph->countChildNodes(
                        $childNode->aggregateId,
                        CountChildNodesFilter::create('Neos.Neos:Node')
                    ),
                    $index,
                );
            }
        }

        $this->view->assign('value', [
            'success' => true,
            'nodes' => $nodes,
            'workspaces' => $workspaces,
            'dimensionSpacePoint' => $firstDimensionSpacePoint->toJson(),
            'dimensionSpacePoints' => $dimensionSpacePoints->toJson(),
        ]);
    }

    /**
     * @return array<array{label: string, value: string}>
     */
    protected function getAccessibleWorkspaces(ContentRepository $contentRepository): array
    {
        try {
            $workspaces = $contentRepository->findWorkspaces()->map(
                (function (Workspace $workspace) use ($contentRepository) {
                    $workspaceMetadata = $this->workspaceService->getWorkspaceMetadata(
                        $contentRepository->id,
                        $workspace->workspaceName
                    );
                    return [
                        'label' => $workspaceMetadata->title->value,
                        'value' => $workspace->workspaceName->value,
                    ];
                })
            );
        } catch (\Exception) {
            return [];
        }
        usort($workspaces, static function ($a, $b) {
            return strtolower($a['label']) <=> strtolower($b['label']);
        });
        return $workspaces;
    }

    /**
     * Returns a usage list for a specified nodetype
     * @throws CacheException|AccessDenied
     * TODO: Allow choosing a specific dimension space point
     */
    public function getNodeTypeUsageAction(
        string $nodeTypeName,
        string $workspaceName = 'live',
        string $contentRepositoryId = 'default'
    ): void
    {
        $contentRepository = $this->contentRepositoryRegistry->get(
            ContentRepositoryId::fromString($contentRepositoryId)
        );
        $variationGraph = $contentRepository->getVariationGraph();
        $dimensionSpacePoints = $variationGraph->getDimensionSpacePoints();
        /** @var DimensionSpacePoint $firstDimensionSpacePoint */
        $firstDimensionSpacePoint = array_values($dimensionSpacePoints->points)[0] ?? null;

        $subgraph = $contentRepository->getContentGraph(WorkspaceName::fromString($workspaceName))->getSubgraph(
            $firstDimensionSpacePoint,
            NeosVisibilityConstraints::excludeRemoved()
        );

        $usages = $this->nodeTypeUsageService->getNodeTypeUsages(
            $this->controllerContext,
            $contentRepository,
            $subgraph,
            NodeTypeName::fromString($nodeTypeName),
        );

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
        /** @noinspection ClassConstantCanBeUsedInspection */
        if (!class_exists("\\League\\Csv\\Writer")) {
            throw new \RuntimeException(
                'The League CSV library is not installed. Please install it via composer: composer require league/csv',
                1749979967
            );
        }
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

        $csvWriter = \League\Csv\Writer::createFromFileObject(new \SplTempFileObject());
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

    /**
     * @throws AccessDenied
     * @throws CacheException
     * @throws \League\Csv\CannotInsertRecord
     * @throws \League\Csv\Exception
     * TODO: Allow choosing a specific dimension space point
     */
    public function exportNodeTypeUsageAction(
        string $nodeTypeName,
        string $workspaceName = 'live',
        string $contentRepositoryId = 'default'
    ): void
    {
        /** @noinspection ClassConstantCanBeUsedInspection */
        if (!class_exists("\\League\\Csv\\Writer")) {
            throw new \RuntimeException(
                'The League CSV library is not installed. Please install it via composer: composer require league/csv',
                1749979936
            );
        }
        $contentRepository = $this->contentRepositoryRegistry->get(
            ContentRepositoryId::fromString($contentRepositoryId)
        );
        $variationGraph = $contentRepository->getVariationGraph();
        $dimensionSpacePoints = $variationGraph->getDimensionSpacePoints();
        /** @var DimensionSpacePoint $firstDimensionSpacePoint */
        $firstDimensionSpacePoint = array_values($dimensionSpacePoints->points)[0] ?? null;

        $subgraph = $contentRepository->getContentGraph(WorkspaceName::fromString($workspaceName))->getSubgraph(
            $firstDimensionSpacePoint,
            NeosVisibilityConstraints::excludeRemoved()
        );

        $usages = $this->nodeTypeUsageService->getNodeTypeUsages(
            $this->controllerContext,
            $contentRepository,
            $subgraph,
            NodeTypeName::fromString($nodeTypeName),
        );
        $hasDimensions = $dimensionSpacePoints->count() > 1; // TODO: Verify if this is the right way to check for dimensions

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

        $csvWriter = \League\Csv\Writer::createFromFileObject(new \SplTempFileObject());
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
                ->translate() ?? $shortHandString;
        }

        return $shortHandString;
    }
}
