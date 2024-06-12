<?php

declare(strict_types=1);

namespace Shel\NodeTypes\Analyzer\Command;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Shel\NodeTypes\Analyzer\Service\NodeTypeGraphService;

class AnalyzerCommandController extends CommandController
{
    #[Flow\Inject]
    protected NodeTypeGraphService $nodeTypeGraphService;

    public const SCHEMA_NAME = 'file://schemas/shel/nodetypes/analyzers/enhanced-nodetype-configurations.json';
    public const SCHEMA_PATH = 'resource://Shel.NodeTypes.Analyzer/Private/Schema/EnhancedNodeTypeConfiguration.json';

    /** @noinspection PhpFullyQualifiedNameUsageInspection */
    public function validateNodeTypesCommand(): void
    {
        if (!class_exists("\\JsonSchema\\Validator")) {
            $this->outputLine('Please require "justinrainbow/json-schema" in your composer.json to use this command.');
            exit(1);
        }

        $this->outputLine('Generating nodetypes schema...');
        $schema = $this->nodeTypeGraphService->generateNodeTypesData(false);
        $jsonSchema = json_decode(json_encode($schema, JSON_THROW_ON_ERROR), false, 512, JSON_THROW_ON_ERROR);

        $schemaStorage = new \JsonSchema\SchemaStorage();
        $validator = new \JsonSchema\Validator(new \JsonSchema\Constraints\Factory($schemaStorage));
        $schemaStorage->addSchema(
            self::SCHEMA_NAME,
            json_decode(file_get_contents(self::SCHEMA_PATH), false, 512, JSON_THROW_ON_ERROR)
        );

        $this->outputLine('Validating nodetypes schema...');
        $validator->reset();
        $validator->validate($jsonSchema, $schemaStorage->getSchema(self::SCHEMA_NAME));
        $errors = $validator->getErrors();

        $validationErrors = array_map(static function (array $error) {
            return sprintf(
                'JSON property "%s" at position "%s" does not validate against schema: %s',
                $error['property'],
                $error['pointer'],
                $error['message']
            );
        }, $errors);

        if ($validationErrors) {
            $this->outputLine('Schema validation failed!');
            foreach ($validationErrors as $error) {
                $this->outputLine($error);
            }
            $this->outputLine(sprintf('Found %d errors', count($validationErrors)));
            exit(1);
        }

        $this->outputLine('Schema validation successful!');
    }
}
