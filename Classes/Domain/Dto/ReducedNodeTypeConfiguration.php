<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final class ReducedNodeTypeConfiguration implements \JsonSerializable
{

    /**
     * @param array<string, array{type: string}> $properties
     * @param array{label: string, icon: string} $ui
     * @param array<string, bool> $superTypes
     * @param array<string, bool> $constraints
     */
    private function __construct(
        public readonly array $properties,
        public readonly array $ui,
        public readonly array $superTypes,
        public array $childNodes,
        public readonly array $options,
    ) {
    }

    public static function fromNodeType(NodeType $nodeType): self
    {
        $fullConfiguration = $nodeType->getFullConfiguration();

        // Filter all property configs except type
        $properties = array_map(static function ($definition) {
            return [
                'type' => $definition['type'] ?? null,
            ];
        }, $fullConfiguration['properties'] ?? []);

        $childNodesConfiguration = [];
        $fullChildNodesConfiguration = $fullConfiguration['childNodes'] ?? [];
        foreach ($fullChildNodesConfiguration as $childNodeName => $childNodeConfiguration) {
            if (!$childNodeConfiguration) {
                continue;
            }
            $childNodesConfiguration[$childNodeName] = [
                'type' => $childNodeConfiguration['type'] ?? null,
                'constraints' => $childNodeConfiguration['constraints'] ?? [],
                'allowedChildNodeTypes' => [],
            ];
        }

        return new self(
            $properties,
            [
                'label' => $fullConfiguration['ui']['label'] ?? null,
                'icon' => $fullConfiguration['ui']['icon'] ?? null,
            ],
            $fullConfiguration['superTypes'] ?? [],
            $childNodesConfiguration,
            $fullConfiguration['options'] ?? [],
        );
    }

    public function updateGrandChildNodeConstraints(array $childNodesConstraints): self
    {
        foreach ($childNodesConstraints as $childNodeName => $childNodeConstraints) {
            $this->childNodes[$childNodeName]['constraints']['nodeTypes'] = $childNodeConstraints;
        }
        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            'properties' => $this->properties ?: new \stdClass(),
            'ui' => $this->ui,
            'superTypes' => $this->superTypes ?: new \stdClass(),
            'childNodes' => $this->childNodes ?: new \stdClass(),
            'options' => $this->options ?: new \stdClass(),
        ];
    }
}
