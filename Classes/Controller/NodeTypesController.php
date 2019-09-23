<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

use Graphp\GraphViz\GraphViz;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Flow\Annotations as Flow;
use Shel\ContentRepository\Debugger\Service\NodeTypeGraphService;

/**
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

    public function indexAction()
    {
        // TODO: Make baseNodeType selectable in the UI
        $baseNodeType = null;
        $nodeTypeGraph = $this->nodeTypeGraphService->buildGraph($baseNodeType);

        $graphViz = new GraphViz();
        $nodeTypeGraphImgSrc = $graphViz->createImageSrc($nodeTypeGraph);

        $this->view->assignMultiple([
            'nodeTypeGraphImgSrc' => $nodeTypeGraphImgSrc,
        ]);
    }
}
