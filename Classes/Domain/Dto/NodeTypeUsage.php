<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;

/**
 * @api
 */
#[Flow\Proxy(false)]
final class NodeTypeUsage implements \JsonSerializable
{
    public bool $hidden;
    public readonly bool $onHiddenPage;
    private string $documentTitle;

    /**
     * @param string[] $breadcrumb
     */
    public function __construct(
        private NodeInterface $node,
        public readonly ?NodeInterface $documentNode,
        private string $url,
        public readonly array $breadcrumb = [],
    ) {
        $this->hidden = !$node->isVisible();
        $this->onHiddenPage = !$documentNode?->isVisible();
        $this->documentTitle = $documentNode?->getLabel() ?? 'Unresolvable';
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getDocumentTitle(): string
    {
        return $this->documentTitle;
    }

    public function setDocumentTitle(string $documentTitle): void
    {
        $this->documentTitle = $documentTitle;
    }

    public function getNode(): NodeInterface
    {
        return $this->node;
    }

    public function getWorkspaceName(): string
    {
        return $this->node->getWorkspace()->getName();
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    public function isHidden(): bool
    {
        return $this->hidden;
    }

    public function setHidden(bool $hidden): void
    {
        $this->hidden = $hidden;
    }

    public function toArray(): array
    {
        return [
            'title' => $this->node->getLabel(),
            'documentTitle' => $this->documentTitle,
            'documentIdentifier' => $this->documentNode?->getIdentifier(),
            'workspace' => $this->node->getWorkspace()->getName(),
            'url' => $this->url,
            'nodeIdentifier' => $this->node->getIdentifier(),
            'hidden' => $this->hidden,
            'onHiddenPage' => $this->onHiddenPage,
            'dimensions' => $this->node->getDimensions(),
            'breadcrumb' => $this->breadcrumb,
        ];
    }

    public function toCSVExportableArray(): array
    {
        $usageData = $this->toArray();
        $usageData['dimensions'] = json_encode($usageData['dimensions']);
        $usageData['hidden'] = $usageData['hidden'] ? 'true' : 'false';
        $usageData['onHiddenPage'] = $usageData['onHiddenPage'] ? 'true' : 'false';
        $usageData['breadcrumb'] = implode(' > ', $usageData['breadcrumb']);
        return $usageData;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
