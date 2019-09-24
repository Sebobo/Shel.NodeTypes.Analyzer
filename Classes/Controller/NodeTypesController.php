<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

use Graphp\GraphViz\GraphViz;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\ContentRepository\Exception\NodeTypeNotFoundException;
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
     * @param string|null $baseNodeType
     * @param string $layout
     * @throws NodeTypeNotFoundException
     */
    public function indexAction(?string $baseNodeType = null, string $layout = 'neato'): void
    {
        if ($this->nodeTypeManager->hasNodeType($baseNodeType)) {
            $baseNodeType = $this->nodeTypeManager->getNodeType($baseNodeType);
        } else {
            $baseNodeType = null;
        }
        $selectableNodeTypes = $this->nodeTypeManager->getNodeTypes(true);
        $nodeTypeGraph = $this->nodeTypeGraphService->buildGraph($baseNodeType);

        // Define graphviz styling
        $nodeTypeGraph->setAttribute('graphviz.graph.rankdir', 'LR');
        $nodeTypeGraph->setAttribute('graphviz.graph.pack', 'true');
        $nodeTypeGraph->setAttribute('graphviz.graph.layout', $layout);
        $nodeTypeGraph->setAttribute('graphviz.graph.model', 'subset');
        $nodeTypeGraph->setAttribute('graphviz.graph.splines', 'true');
        $nodeTypeGraph->setAttribute('graphviz.graph.overlap', 'false');
        $nodeTypeGraph->setAttribute('graphviz.graph.fontname', 'Noto Sans');
//        $nodeTypeGraph->setAttribute('graphviz.graph.bgcolor', '#222222');

        $nodeTypeGraph->setAttribute('graphviz.node.width', '.25');
        $nodeTypeGraph->setAttribute('graphviz.node.height', '.375');
        $nodeTypeGraph->setAttribute('graphviz.node.fontsize', '11');
        $nodeTypeGraph->setAttribute('graphviz.node.fontname', 'Noto Sans');
        $nodeTypeGraph->setAttribute('graphviz.node.fillcolor', '#ffffff');
        $nodeTypeGraph->setAttribute('graphviz.node.style', 'filled');

        $nodeTypeGraph->setAttribute('graphviz.edge.color', '#888888');

        $nodeTypeGroups = $this->nodeTypeGraphService->getNodeTypeGroups();

        $graphViz = new GraphViz();
        $graphViz->setFormat('svg');
        $nodeTypeGraphImgSrc = $graphViz->createImageHtml($nodeTypeGraph);

        $this->view->assignMultiple([
            'selectableNodeTypes' => $selectableNodeTypes,
            'selectableLayouts' => [
                'neato' => 'Spring model',
                'dot' => 'Hierarchy',
                'fdp' => 'Force directed spring model',
            ],
            'baseNodeType' => $baseNodeType,
            'layout' => $layout,
            'nodeTypeGraphImgSrc' => $nodeTypeGraphImgSrc,
            'nodeTypeGroups' => $nodeTypeGroups,
            'csrfToken' => $this->securityContext->getCsrfProtectionToken(),
        ]);
    }
}
