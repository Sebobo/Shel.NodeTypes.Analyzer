<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Flow\Security\Context as SecurityContext;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Flow\Annotations as Flow;
use Shel\ContentRepository\Debugger\Service\NodeTypeGraphService;

/**
 * @Flow\Scope("singleton")
 */
class NodeTypesController extends AbstractModuleController
{

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
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;

    /**
     * @Flow\Inject
     * @var SecurityContext
     */
    protected $securityContext;

    /**
     * Renders the app to interact with the nodetype graph
     */
    public function indexAction(): void
    {
        $this->view->assignMultiple([
            'selectableLayouts' => [
                NodeTypeGraphService::GRAPHVIZ_LAYOUT_NEATO => 'Spring model',
                NodeTypeGraphService::GRAPHVIZ_LAYOUT_DOT => 'Hierarchy',
                NodeTypeGraphService::GRAPHVIZ_LAYOUT_FDP => 'Force directed spring model',
            ],
            'csrfToken' => $this->securityContext->getCsrfProtectionToken(),
        ]);
    }

    /**
     */
    public function renderGraphSvgAction(): void
    {
        [
            'baseNodeType' => $baseNodeType,
            'layout' => $layout,
        ] = $this->request->getArguments();

        if (!$layout) {
            $layout = NodeTypeGraphService::GRAPHVIZ_LAYOUT_NEATO;
        }

        if ($baseNodeType && $this->nodeTypeManager->hasNodeType($baseNodeType)) {
            try {
                $baseNodeType = $this->nodeTypeManager->getNodeType($baseNodeType);
            } catch (NodeTypeNotFoundException $e) {
                $baseNodeType = null;
            }
        } else {
            $baseNodeType = null;
        }

        [$graph, $nodeTypeGroups] = $this->nodeTypeGraphService->buildGraph($baseNodeType);

        $svgData = $this->nodeTypeGraphService->getGraphVizSvg($graph, [
            'graph' => [
                'layout' => $layout
            ]
        ]);

        foreach ($nodeTypeGroups as $groupId => $groupProperties) {
            $svgData = str_replace($groupId, $groupProperties['name'], $svgData);
        }
        $this->view->assign('value', [
            'success' => true,
            'svgData' => $svgData,
            'nodeTypeGroups' => $nodeTypeGroups,
        ]);
    }

    /**
     */
    public function renderConstraintsSvgAction(): void
    {
        [
            'baseNodeType' => $baseNodeType,
            'layout' => $layout,
        ] = $this->request->getArguments();

        if (!$layout) {
            $layout = NodeTypeGraphService::GRAPHVIZ_LAYOUT_NEATO;
        }

        $this->view->assign('value', [
            'success' => true,
//                'svgData' => $svgData,
//                'nodeTypeGroups' => $nodeTypeGroups,
        ]);
    }

    /**
     * Returns all nodetype definitions
     */
    public function getNodeTypeDefinitionsAction(): void
    {
        $nodeTypes = $this->nodeTypeManager->getNodeTypes();
        $nodeTypeUsage = $this->nodeTypeGraphService->getNodeTypeUsageQuery();

        $nodeTypes = array_reduce($nodeTypes, function (array $carry, NodeType $nodeType) use ($nodeTypes, $nodeTypeUsage) {
            $nodeTypeName = $nodeType->getName();
            $carry[$nodeTypeName] = $nodeType->getFullConfiguration();

            $instantiableNodeTypes = array_filter($nodeTypes, static function (NodeType $nodeType) {
                return !$nodeType->isAbstract();
            });
            $carry[$nodeTypeName]['allowedChildNodeTypes'] = $this->nodeTypeGraphService->generateAllowedChildNodeTypes($nodeType,
                $instantiableNodeTypes);

            $carry[$nodeTypeName]['usageCount'] = array_key_exists($nodeTypeName, $nodeTypeUsage) ? $nodeTypeUsage[$nodeTypeName] : 0;

            if (array_key_exists('childNodes', $carry[$nodeTypeName])) {
                foreach (array_keys($carry[$nodeTypeName]['childNodes']) as $childNodeName) {
                    $carry[$nodeTypeName]['childNodes'][$childNodeName]['allowedChildNodeTypes'] = $this->nodeTypeGraphService->generateAllowedGrandChildNodeTypes($childNodeName,
                        $nodeType, $instantiableNodeTypes);
                }
            }

            return $carry;
        }, []);

        $this->view->assign('value', [
            'success' => true,
            'nodeTypes' => $nodeTypes,
        ]);
    }
}
