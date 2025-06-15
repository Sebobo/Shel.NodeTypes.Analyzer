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
    #[\Neos\Flow\Annotations\Inject]
    protected \Neos\Neos\Domain\NodeLabel\NodeLabelGeneratorInterface $nodeLabelGenerator;

    /**
     * @param string[] $breadcrumb
     */
    public function __construct(
        private \Neos\ContentRepository\Core\Projection\ContentGraph\Node $node,
        public readonly ?\Neos\ContentRepository\Core\Projection\ContentGraph\Node $documentNode,
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

    public function getNode(): \Neos\ContentRepository\Core\Projection\ContentGraph\Node
    {
        return $this->node;
    }

    public function getWorkspaceName(): string
    {
        // TODO 9.0 migration: !! Node::getWorkspace() does not make sense anymore concept-wise. In Neos < 9, it pointed to the workspace where the node was *at home at*. Now, the closest we have here is the node identity.

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
        // TODO 9.0 migration: !! Node::getWorkspace() does not make sense anymore concept-wise. In Neos < 9, it pointed to the workspace where the node was *at home at*. Now, the closest we have here is the node identity.

        // TODO 9.0 migration: !! Node::getWorkspace() does not make sense anymore concept-wise. In Neos < 9, it pointed to the workspace where the node was *at home at*. Now, the closest we have here is the node identity.

        // TODO 9.0 migration: !! Node::getWorkspace() does not make sense anymore concept-wise. In Neos < 9, it pointed to the workspace where the node was *at home at*. Now, the closest we have here is the node identity.

        return [
            'title' => $this->nodeLabelGenerator->getLabel($this->node),
            'documentTitle' => $this->documentTitle,
            'documentIdentifier' => $this->documentNode?->getIdentifier(),
            'workspace' => $this->node->getWorkspace()->getName(),
            'url' => $this->url,
            'nodeIdentifier' => $this->node->aggregateId->value,
            'hidden' => $this->hidden,
            'onHiddenPage' => $this->onHiddenPage,
            'dimensions' => $this->node->originDimensionSpacePoint->toLegacyDimensionArray(),
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
