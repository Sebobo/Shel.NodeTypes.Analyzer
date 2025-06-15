<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Neos\Domain\SubtreeTagging\NeosSubtreeTag;

#[Flow\Proxy(false)]
final readonly class NodeTreeLeaf implements \JsonSerializable
{

    public function __construct(
        private Node $node,
        private ?Node $parentNode = null,
        private ?string $label = null,
        private int $childNodeCount = 0,
        private int $index = 0,
    )
    {
    }

    /**
     * @return array{
     *     label: string|null,
     *     name: string|null,
     *     classification: string,
     *     index: int,
     *     identifier: string,
     *     parentNodeIdentifier: string|null,
     *     nodeType: string,
     *     properties: array<string, string>,
     *     hidden: bool,
     *     removed: bool,
     *     childNodeCount: int,
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label ?? $this->node->name?->value,
            'name' => $this->node->name?->value,
            'classification' => $this->node->classification->value,
            'index' => $this->index,
            'identifier' => $this->node->aggregateId->value,
            'nodeType' => $this->node->nodeTypeName->value,
            'parentNodeIdentifier' => $this->parentNode?->aggregateId->value,
            'properties' => $this->serializeProperties(),
            'hidden' => $this->node->tags->contain(NeosSubtreeTag::disabled()),
            'removed' => $this->node->tags->contain(NeosSubtreeTag::removed()),
            'childNodeCount' => $this->childNodeCount,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function serializeProperties(): array
    {
        $properties = [];
        foreach ($this->node->properties as $propertyName => $propertyValue) {
            if ($propertyValue instanceof AssetInterface) {
                $propertyValue = $propertyValue->getTitle();
            } elseif ($propertyValue instanceof \DateTimeInterface) {
                $propertyValue = $propertyValue->format('Y-m-d H:i:s');
            } elseif (is_array($propertyValue)) {
                try {
                    // Ensure that the array is JSON serializable
                    $propertyValue = json_encode($propertyValue, JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    // If encoding fails, we can log or handle the error as needed
                    $propertyValue = [];
                }
            }
            $properties[$propertyName] = (string)$propertyValue;
        }
        return $properties;
    }
}
