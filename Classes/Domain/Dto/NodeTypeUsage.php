<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\SubtreeTagging\NeosSubtreeTag;

/**
 * @api
 */
#[Flow\Proxy(false)]
final readonly class NodeTypeUsage implements \JsonSerializable
{
    /**
     * @param string[] $breadcrumb
     * @param array<string, array<int, string>> $dimensions
     */
    private function __construct(
        public string $nodeIdentifier,
        public string $label,
        public string $documentNodeIdentifier,
        public string $documentLabel,
        public string $url,
        public string $workspaceName,
        public array $breadcrumb,
        public array $dimensions,
        public bool $hidden,
        public bool $onHiddenPage,
    ) {
    }

    /**
     * @param string[] $breadcrumb
     */
    public static function fromNode(
        Node $node,
        string $label,
        Node $documentNode,
        string $documentLabel,
        string $url,
        WorkspaceName $workspaceName,
        array $breadcrumb = []
    ): self {
        return new self(
            $node->aggregateId->value,
            $label,
            $documentNode->aggregateId->value,
            $documentLabel,
            $url,
            $workspaceName->value,
            $breadcrumb,
            $node->originDimensionSpacePoint->toLegacyDimensionArray(),
            $node->tags->contain(NeosSubtreeTag::disabled()),
            $documentNode->tags->contain(NeosSubtreeTag::disabled())
        );
    }

    /**
     * @return array{
     *      title: string,
     *      documentTitle: string,
     *      documentIdentifier: string,
     *      workspace: string,
     *      url: string,
     *      nodeIdentifier: string,
     *      hidden: string,
     *      onHiddenPage: string,
     *      dimensions: string,
     *      breadcrumb: string,
     * }
     */
    public function toCSVExportableArray(): array
    {
        $usageData = $this->jsonSerialize();
        $usageData['dimensions'] = json_encode($usageData['dimensions']) ?: '';
        $usageData['hidden'] = $usageData['hidden'] ? 'true' : 'false';
        $usageData['onHiddenPage'] = $usageData['onHiddenPage'] ? 'true' : 'false';
        $usageData['breadcrumb'] = implode(' > ', $usageData['breadcrumb']);
        return $usageData;
    }

    /**
     * @return array{
     *     title: string,
     *     documentTitle: string,
     *     documentIdentifier: string,
     *     workspace: string,
     *     url: string,
     *     nodeIdentifier: string,
     *     hidden: bool,
     *     onHiddenPage: bool,
     *     dimensions: array<string, array<int, string>>,
     *     breadcrumb: string[],
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'title' => $this->label,
            'documentTitle' => $this->documentLabel,
            'documentIdentifier' => $this->documentNodeIdentifier,
            'workspace' => $this->workspaceName,
            'url' => $this->url,
            'nodeIdentifier' => $this->nodeIdentifier,
            'hidden' => $this->hidden,
            'onHiddenPage' => $this->onHiddenPage,
            'dimensions' => $this->dimensions,
            'breadcrumb' => $this->breadcrumb,
        ];
    }
}
