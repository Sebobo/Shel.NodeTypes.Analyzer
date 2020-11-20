import { Constraint } from './index';

export default interface NodeTypeConfiguration {
    name: NodeTypeName;
    abstract: boolean;
    final: boolean;
    allowedChildNodeTypes: NodeTypeName[];
    usageCount: number;
    declaredProperties: string[];
    declaredSuperTypes: NodeTypeName[];
    configuration: {
        properties: {
            [index: string]: {
                [key: string]: any;
                type: string;
            };
        };
        ui: {
            label?: string;
            icon?: string;
        };
        superTypes: Constraint[];
        constraints: NodeTypeName[];
        childNodes: {
            [index: string]: {
                type: NodeTypeName;
                allowedChildNodeTypes?: NodeTypeName[];
                constraints?: {
                    nodeTypes?: Constraint[];
                };
            };
        };
    };
}
