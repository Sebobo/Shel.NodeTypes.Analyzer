<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Core\NodeType\NodeType;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final class EnhancedNodeTypeConfiguration implements \JsonSerializable
{
    /**
     * @param string[] $declaredProperties
     * @param array<string, array{type: string}> $properties
     * @param string[] $declaredSuperTypes
     * @param array<string, int> $superTypes
     * @param array<string, array{type: string|null, constraints: array{nodeTypes: array<string, bool>}, allowedChildNodeTypes: string[]}> $childNodes
     * @param string[] $warnings
     * @param string[] $allowedChildNodeTypes
     * @param array<string, int> $usageCountByInheritance
     * @param array<string, mixed> $options
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
                static fn(NodeType $superType) => $superType->name->value,
                $nodeType->getDeclaredSuperTypes()
            )
        );
        $superTypes = $fullConfiguration['superTypes'] ?? [];

        /** @var array<string, mixed> $localProperties */
        $localProperties = $nodeType->getLocalConfiguration()['properties'] ?? [];
        $declaredProperties = array_keys($localProperties);

        // Filter all property configs except type
        $properties = array_map(static function ($definition) {
            return [
                'type' => $definition['type'] ?? null,
            ];
        }, $fullConfiguration['properties'] ?? []);

        $warnings = [];
        if ($nodeType->name->value !== 'unstructured' && !$nodeType->getDeclaredSuperTypes() && !$nodeType->isAbstract()) {
            $warnings[] = 'No supertypes and not abstract - please define either!';
        }
        if (!$nodeType->isAbstract() && str_contains($nodeType->name->value, 'Mixin')) {
            $warnings[] = 'Non-abstract node type name contains "Mixin" - please rename or define as abstract!';
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
            $nodeType->name->value,
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
     * @return array<string, int>
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

    /**
     * @param array<string, array<string, bool>> $childNodesConstraints
     */
    public function updateGrandChildNodeConstraints(array $childNodesConstraints): self
    {
        foreach ($childNodesConstraints as $childNodeName => $childNodeConstraints) {
            $this->childNodes[$childNodeName]['constraints']['nodeTypes'] = $childNodeConstraints;
        }
        return $this;
    }

    /**
     * @return array{
     *     name: string,
     *     label: string,
     *     icon: string|null,
     *     abstract: bool,
     *     final: bool,
     *     allowedChildNodeTypes: string[],
     *     usageCount: int,
     *     usageCountByInheritance: array<string, int>|\stdClass,
     *     declaredProperties: string[],
     *     properties: array<string, array{type: string}>|\stdClass,
     *     declaredSuperTypes: string[],
     *     superTypes: array<string, int>|\stdClass,
     *     warnings: string[],
     *     childNodes: array<string, array{type: string|null, constraints: array{nodeTypes: array<string, bool>}}>|\stdClass,
     *     options: array<string, mixed>|\stdClass,
     * }
     */
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
