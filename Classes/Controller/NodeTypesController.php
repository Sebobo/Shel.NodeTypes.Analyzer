<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
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
            $carry[$nodeTypeName] = [
                'name' => $nodeTypeName,
                'configuration' => $nodeType->getFullConfiguration(),
                'declaredSuperTypes' => array_map(static function (NodeType $superType) {
                    return $superType->getName();
                }, $nodeType->getDeclaredSuperTypes()),
                'usageCount' => array_key_exists($nodeTypeName, $nodeTypeUsage) ? $nodeTypeUsage[$nodeTypeName] : 0,
            ];

            $instantiableNodeTypes = array_filter($nodeTypes, static function (NodeType $nodeType) {
                return !$nodeType->isAbstract();
            });
            $carry[$nodeTypeName]['allowedChildNodeTypes'] = $this->nodeTypeGraphService->generateAllowedChildNodeTypes($nodeType,
                $instantiableNodeTypes);

            if (array_key_exists('childNodes', $carry[$nodeTypeName]['configuration'])) {
                foreach (array_keys($carry[$nodeTypeName]['configuration']['childNodes']) as $childNodeName) {
                    $carry[$nodeTypeName]['configuration']['childNodes'][$childNodeName]['allowedChildNodeTypes'] = $this->nodeTypeGraphService->generateAllowedGrandChildNodeTypes($childNodeName,
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
