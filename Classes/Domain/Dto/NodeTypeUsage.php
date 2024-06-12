<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;

/**
 * @Flow\Proxy(false)
 */
final class NodeTypeUsage implements \JsonSerializable
{
    private bool $hidden;
    private bool $onHiddenPage;

    public function __construct(
        private NodeInterface $node,
        private string $documentTitle,
        private string $url
    ) {
        $this->hidden = !$node->isVisible();

        $closestDocumentNode = $node;
        while ($closestDocumentNode && !$closestDocumentNode->getNodeType()->isOfType('Neos.Neos:Document')) {
            $closestDocumentNode = $closestDocumentNode->getParent();
        }
        $this->onHiddenPage = !$closestDocumentNode->isVisible();
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

    public function isHiddenOnPage(): bool
    {
        return $this->onHiddenPage;
    }

    public function setOnHiddenPage(bool $onHiddenPage): void
    {
        $this->onHiddenPage = $onHiddenPage;
    }

    public function toArray(): array
    {
        return [
            'title' => $this->node->getLabel(),
            'documentTitle' => $this->documentTitle,
            'workspace' => $this->node->getWorkspace()->getName(),
            'url' => $this->url,
            'nodeIdentifier' => $this->node->getIdentifier(),
            'hidden' => $this->hidden,
            'onHiddenPage' => $this->onHiddenPage,
            'dimensions' => $this->node->getDimensions(),
        ];
    }

    public function toCSVExportableArray(): array
    {
        $usageData = $this->toArray();
        $usageData['dimensions'] = json_encode($usageData['dimensions']);
        $usageData['hidden'] = $usageData['hidden'] ? 'true' : 'false';
        $usageData['onHiddenPage'] = $usageData['onHiddenPage'] ? 'true' : 'false';
        if (!$usageData['dimensions']) {
            unset ($usageData['dimensions']);
        }
        return $usageData;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
