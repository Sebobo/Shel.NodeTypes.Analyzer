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
    private string $url;
    private string $documentTitle;
    private NodeInterface $node;
    private bool $hidden;

    public function __construct(
        NodeInterface $node,
        string $documentTitle,
        string $url
    ) {
        $this->node = $node;
        $this->documentTitle = $documentTitle;
        $this->url = $url;
        $this->hidden = !$node->isVisible();
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
            'workspace' => $this->node->getWorkspace()->getName(),
            'url' => $this->url,
            'nodeIdentifier' => $this->node->getIdentifier(),
            'hidden' => $this->hidden,
            'dimensions' => $this->node->getDimensions(),
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
