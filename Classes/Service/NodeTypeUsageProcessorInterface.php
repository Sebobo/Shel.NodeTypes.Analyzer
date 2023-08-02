<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Service;

use Neos\Flow\Mvc\Controller\ControllerContext;
use Shel\NodeTypes\Analyzer\Domain\Dto\NodeTypeUsage;

interface NodeTypeUsageProcessorInterface
{
    /**
     * Process the NodeTypeUsage for export to CSV
     */
    public function processForExport(NodeTypeUsage $nodeTypeUsage, ControllerContext $controllerContext): void;

    /**
     * Process the NodeTypeUsage for analysis in the backend module
     */
    public function processForAnalysis(NodeTypeUsage $nodeTypeUsage, ControllerContext $controllerContext): void;
}
