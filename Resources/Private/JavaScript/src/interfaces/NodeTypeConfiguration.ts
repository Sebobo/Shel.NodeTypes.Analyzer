import { Constraint } from './index';

export default interface NodeTypeConfiguration {
    name: NodeTypeName;
    abstract: boolean;
    final: boolean;
    allowedChildNodeTypes: NodeTypeName[];
    usageCount: number;
    declaredSuperTypes: NodeTypeName[];
    configuration: {
        label: string;
        properties: {
            [index: string]: {
                [key: string]: any;
                type: string;
            };
        };
        options: {};
        ui: {
            label?: string;
            icon?: string;
        };
        superTypes: Constraint[];
        constraints: {};
        childNodes: {
            [index: string]: {
                type: NodeTypeName;
                allowedChildNodeTypes: NodeTypeName[];
                constraints?: {
                    nodeTypes?: Constraint[];
                };
            };
        };
    };
}
