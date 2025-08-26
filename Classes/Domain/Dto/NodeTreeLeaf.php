<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetInterface;

/**
 * @Flow\Proxy(false)
 */
final class NodeTreeLeaf implements \JsonSerializable
{

    private NodeInterface $node;

    private function __construct(NodeInterface $node)
    {
        $this->node = $node;
    }

    public static function fromNode(NodeInterface $node): self
    {
        return new self($node);
    }

    public function jsonSerialize(): array
    {
        $nodeTypeName = $this->getNodeTypeName();
        $isUnstructured = $this->node->getNodeType()->isOfType('unstructured');
        $label = $isUnstructured ? $this->node->getName() : $this->node->getLabel();

        return [
            'label' => $label,
            'name' => $this->node->getName(),
            'index' => $this->node->getIndex(),
            'identifier' => $this->node->getIdentifier(),
            'nodeType' => $nodeTypeName,
            'path' => $this->node->getPath(),
            'parentPath' => $this->node->getParentPath(),
            'properties' => $this->serializeProperties($this->node),
            'hidden' => $this->node->isHidden(),
            'removed' => $this->node->isRemoved(),
            'hasChildNodes' => $this->node->hasChildNodes(),
            'childNodePaths' => array_map(static fn ($node) => $node->getPath(), $this->node->getChildNodes()),
        ];
    }

    private function serializeProperties(NodeInterface $node): array
    {
        $properties = [];
        foreach ($node->getProperties() as $propertyName => $propertyValue) {
            if ($propertyValue instanceof Asset) {
                try {
                    $propertyValue = '[' . $propertyValue::class . '] ' . $propertyValue->getLabel();
                } catch (\Exception) {
                    $propertyValue = '[' . $propertyValue::class . '] n/a';
                }
            } elseif ($propertyValue instanceof AssetInterface) {
                try {
                    $propertyValue = '[' . $propertyValue::class . '] ' . ($propertyValue->getResource()?->getFilename() ?? $propertyValue->getTitle() ?? 'n/a');
                } catch (\Exception) {
                    $propertyValue = '[' . $propertyValue::class . '] n/a';
                }
            } elseif ($propertyValue instanceof \DateTime) {
                $propertyValue = $propertyValue->format('Y-m-d H:i:s');
            } elseif (is_array($propertyValue)) {
                try {
                    $propertyValue = json_encode($propertyValue, JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    // If encoding fails, we can just skip it or handle it as needed
                    $propertyValue = '[Serialization error]';
                }
            } elseif (is_null($propertyValue)) {
                $propertyValue = 'null';
            }
            $properties[$propertyName] = (string)$propertyValue;
        }
        return $properties;
    }

    protected function getNodeTypeName(): string
    {
        return $this->node->getNodeType()->getName();
    }
}
