<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Controller;

use League\Csv\Writer;
use Neos\Cache\Exception as CacheException;
use Neos\Flow\I18n\EelHelper\TranslationParameterToken;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Fusion\View\FusionView;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Flow\Annotations as Flow;
use Shel\NodeTypes\Analyzer\Service\NodeTypeGraphService;
use Shel\NodeTypes\Analyzer\Service\NodeTypeUsageService;

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
     * @Flow\Inject
     * @var Translator
     */
    protected $translator;

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

    public function exportNodeTypesAction(): void
    {
        $nodeTypes = $this->nodeTypeGraphService->generateNodeTypesData();

        $nodeTypesDataForExport = array_map(function ($nodeType) {
            $label = $nodeType['configuration']['ui']['label'] ?? null;
            $label = $label ? $this->translateByShortHandString($label) : 'n/a';

            return [
                'name' => $nodeType['name'],
                'label' => $label,
                'abstract' => $nodeType['abstract'] ? 'true' : 'false',
                'final' => $nodeType['final'] ? 'true' : 'false',
                'properties' => implode(', ', array_keys($nodeType['configuration']['properties'] ?? [])),
                'childNodes' => implode(', ', array_keys($nodeType['configuration']['childNodes'] ?? [])),
                'usageCount' => $nodeType['usageCount'],
                'usageCountByInheritance' => array_sum($nodeType['usageCountByInheritance']),
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
            'Usage Count By Inheritance'
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
