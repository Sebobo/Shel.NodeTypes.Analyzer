<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Service;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ControllerContext;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;

/**
 * This class is meant to be replaced via the `Objects.yaml` by other packages to provide custom NodeTypeUsage processors
 *
 * @Flow\Scope("singleton")
 */
class NodeTypeUsageProcessor implements NodeTypeUsageProcessorInterface
{

    /**
     * @inheritDoc
     */
    public function processForExport(NodeTypeUsage $nodeTypeUsage, ControllerContext $controllerContext): void
    {
        // no-op
    }

    /**
     * @inheritDoc
     */
    public function processForAnalysis(NodeTypeUsage $nodeTypeUsage, ControllerContext $controllerContext): void
    {
        // no-op
    }
}
