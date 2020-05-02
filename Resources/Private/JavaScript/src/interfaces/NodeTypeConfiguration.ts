export default interface NodeTypeConfiguration {
    name: string;
    allowedChildNodeTypes: string[];
    usageCount: number;
    declaredSuperTypes: {
        [index: string]: boolean;
    }[];
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
        superTypes: {
            [index: string]: boolean;
        }[];
        constraints: {};
        childNodes: {
            [index: string]: {
                type: string;
                constraints?: {
                    nodeTypes?: {
                        [key: string]: boolean;
                    }[];
                };
            };
        };
    };
}
