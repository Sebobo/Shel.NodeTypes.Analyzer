export default interface NodeTypeConfiguration {
    label: string;
    properties: {
        [index: string]: {
            [key: string]: any;
            type: string;
        };
    };
    options: {};
    ui: {};
    superTypes: {};
    constraints: {};
    childNodes: {
        [index: string]: {
            [key: string]: any;
            type: string;
            constraints: {};
            allowedChildNodeTypes: string[];
        };
    };
    allowedChildNodeTypes: string[];
    usageCount: number;
}
