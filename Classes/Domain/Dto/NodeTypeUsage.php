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

    public function __construct(
        NodeInterface $node,
        string $documentTitle,
        string $url
    ) {
        $this->node = $node;
        $this->documentTitle = $documentTitle;
        $this->url = $url;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getDocumentTitle(): string
    {
        return $this->documentTitle;
    }

    public function getNode(): NodeInterface
    {
        return $this->node;
    }

    public function getWorkspaceName(): string
    {
        return $this->node->getWorkspace()->getName();
    }

    public function toArray(): array
    {
        return [
            'documentTitle' => $this->documentTitle,
            'workspace' => $this->node->getWorkspace()->getName(),
            'url' => $this->url,
            'dimensions' => $this->node->getDimensions(),
            'nodeIdentifier' => $this->node->getIdentifier(),
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
