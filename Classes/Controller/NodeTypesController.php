<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

/**
 * This file is part of the Shel.ContentRepository.Debugger package.
 *
 * (c) 2021 Sebastian Helzle
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Cache\Exception as CacheException;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Shel\ContentRepository\Debugger\Service\NodeTypeGraphService;
use Shel\ContentRepository\Debugger\Service\NodeTypeUsageService;

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
     * @var NodeTypeUsageService
     */
    protected $nodeTypeUsageService;

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
     * Returns a usage list for a specified nodetype
     * @param string|null $nodeTypeName
     * @throws CacheException
     */
    public function getNodeTypeUsageAction(?string $nodeTypeName): void
    {
        $usageLinks = $this->nodeTypeUsageService->getBackendUrlsForNodeType($this->controllerContext, $nodeTypeName);

        $this->view->assign('value', [
            'success' => true,
            'usageLinks' => $usageLinks,
        ]);
    }
}
