<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Domain\Dto;

use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final class EnhancedNodeTypeConfiguration implements \JsonSerializable
{

    public function __construct(
        public readonly string $name,
        public readonly string $label,
        public readonly bool $abstract,
        public readonly bool $final,
        protected ReducedNodeTypeConfiguration $configuration,
        public readonly array $declaredProperties,
        public readonly array $declaredSuperTypes,
        public readonly array $warnings = [],
        protected array $allowedChildNodeTypes = [],
        protected int $usageCount = 0,
        protected array $usageCountByInheritance = [],
    ) {
    }

    public static function fromNodeType(NodeType $nodeType): self
    {
        $declaredSuperTypes = array_values(
            array_map(
                static fn(NodeType $superType) => $superType->getName(),
                $nodeType->getDeclaredSuperTypes()
            )
        );

        $declaredProperties = array_keys($nodeType->getLocalConfiguration()['properties'] ?? []);

        $configuration = ReducedNodeTypeConfiguration::fromNodeType($nodeType);

        $warnings = [];
        if (!$nodeType->getDeclaredSuperTypes() && !$nodeType->isAbstract()) {
            $warnings[] = 'No supertypes and not abstract - please define either!';
        }

        return new self(
            $nodeType->getName(),
            $nodeType->getLabel(),
            $nodeType->isAbstract(),
            $nodeType->isFinal(),
            $configuration,
            $declaredProperties,
            $declaredSuperTypes,
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

    public function isInUse(): bool
    {
        return $this->usageCount > 0;
    }

    public function getUsageCount(): int
    {
        return $this->usageCount;
    }

    public function setAllowedChildNodeTypes(array $allowedChildNodeTypes): self
    {
        $this->allowedChildNodeTypes = $allowedChildNodeTypes;
        return $this;
    }

    public function updateGrandChildNodeConstraints(array $childNodesConstraints): self
    {
        $this->configuration->updateGrandChildNodeConstraints($childNodesConstraints);
        return $this;
    }

    public function getConfiguration(): ReducedNodeTypeConfiguration
    {
        return $this->configuration;
    }

    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'abstract' => $this->abstract,
            'final' => $this->final,
            'allowedChildNodeTypes' => $this->allowedChildNodeTypes,
            'usageCount' => $this->usageCount,
            'usageCountByInheritance' => $this->usageCountByInheritance ?: new \stdClass(),
            'declaredProperties' => $this->declaredProperties,
            'declaredSuperTypes' => $this->declaredSuperTypes,
            'warnings' => $this->warnings,
            'configuration' => $this->configuration,
        ];
    }
}
