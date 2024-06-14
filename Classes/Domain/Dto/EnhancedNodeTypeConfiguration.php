<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final class EnhancedNodeTypeConfiguration implements \JsonSerializable
{
    /**
     * @param string[] $declaredProperties
     * @param array<string, array{type: string}> $properties
     * @param string[] $declaredSuperTypes
     * @param array<string, int> $superTypes
     * @param array<string, array{type: string, constraints: array{nodeTypes: array<string, bool>}} $childNodes
     * @param string[] $warnings
     * @param string[] $allowedChildNodeTypes
     * @param array<string, int> $usageCountByInheritance
     */
    public function __construct(
        public readonly string $name,
        public readonly string $label,
        public readonly ?string $icon,
        public readonly bool $abstract,
        public readonly bool $final,
        public readonly array $declaredProperties,
        public readonly array $properties,
        public readonly array $declaredSuperTypes,
        public readonly array $superTypes,
        public array $childNodes,
        public readonly array $options,
        public readonly array $warnings = [],
        protected array $allowedChildNodeTypes = [],
        protected int $usageCount = 0,
        protected array $usageCountByInheritance = [],
    ) {
    }

    public static function fromNodeType(NodeType $nodeType): self
    {
        $fullConfiguration = $nodeType->getFullConfiguration();

        $declaredSuperTypes = array_values(
            array_map(
                static fn(NodeType $superType) => $superType->getName(),
                $nodeType->getDeclaredSuperTypes()
            )
        );
        $superTypes = $fullConfiguration['superTypes'] ?? [];

        $declaredProperties = array_keys($nodeType->getLocalConfiguration()['properties'] ?? []);

        // Filter all property configs except type
        $properties = array_map(static function ($definition) {
            return [
                'type' => $definition['type'] ?? null,
            ];
        }, $fullConfiguration['properties'] ?? []);

        $warnings = [];
        if (!$nodeType->getDeclaredSuperTypes() && !$nodeType->isAbstract() && $nodeType->getName() !== 'unstructured') {
            $warnings[] = 'No supertypes and not abstract - please define either!';
        }

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

        $options = $fullConfiguration['options'] ?? [];

        return new self(
            $nodeType->getName(),
            $nodeType->getLabel(),
            $nodeType->getConfiguration('ui.icon'),
            $nodeType->isAbstract(),
            $nodeType->isFinal(),
            $declaredProperties,
            $properties,
            $declaredSuperTypes,
            $superTypes,
            $childNodesConfiguration,
            $options,
            $warnings,
        );
    }

    public function setUsage(int $usageCount): self
    {
        $this->usageCount = $usageCount;
        return $this;
    }

    public function setUsageCountByInheritance(string $nodeTypeName, int $usageCount): self
    {
        $this->usageCountByInheritance[$nodeTypeName] = $usageCount;
        return $this;
    }

    /**
     * @return string[]
     */
    public function getUsageCountByInheritance(): array
    {
        return $this->usageCountByInheritance;
    }

    public function isInUse(): bool
    {
        return $this->usageCount > 0;
    }

    public function getUsageCount(): int
    {
        return $this->usageCount;
    }

    /**
     * @param string[] $allowedChildNodeTypes
     */
    public function setAllowedChildNodeTypes(array $allowedChildNodeTypes): self
    {
        $this->allowedChildNodeTypes = $allowedChildNodeTypes;
        return $this;
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
            'name' => $this->name,
            'label' => $this->label,
            'icon' => $this->icon,
            'abstract' => $this->abstract,
            'final' => $this->final,
            'allowedChildNodeTypes' => $this->allowedChildNodeTypes,
            'usageCount' => $this->usageCount,
            'usageCountByInheritance' => $this->usageCountByInheritance ?: new \stdClass(),
            'declaredProperties' => $this->declaredProperties,
            'properties' => $this->properties ?: new \stdClass(),
            'declaredSuperTypes' => $this->declaredSuperTypes,
            'superTypes' => $this->superTypes ?: new \stdClass(),
            'warnings' => $this->warnings,
            'childNodes' => $this->childNodes ?: new \stdClass(),
            'options' => $this->options ?: new \stdClass(),
        ];
    }
}
