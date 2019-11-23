<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
use Neos\Flow\Mvc\Exception\StopActionException;
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
     * @var FusionView
     */
    protected $view;

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
     * @return string|null
     * @throws StopActionException
     */
    public function renderGraphSvgAction(): ?string
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

        if ($this->request->getFormat() === 'json') {
            return json_encode([
                'success' => true,
                'svgData' => $svgData,
                'nodeTypeGroups' => $nodeTypeGroups,
            ]);
        } else {
            $this->redirect('index');
        }
    }

    /**
     * Returns all nodetype definitions
     *
     * @return string|null
     * @throws StopActionException
     */
    public function getNodeTypeDefinitionsAction(): ?string
    {
        $nodeTypes = $this->nodeTypeManager->getNodeTypes();

        $nodeTypes = array_reduce($nodeTypes, function (array $carry, NodeType $nodeType) {
            $carry[$nodeType->getName()] = $nodeType->getFullConfiguration();
            return $carry;
        }, []);

        if ($this->request->getFormat() === 'json') {
            return json_encode([
                'success' => true,
                'nodeTypes' => $nodeTypes,
            ]);
        } else {
            $this->redirect('index');
        }
    }
}
