// Neos types
interface NeosI18n {
    translate: (
        id: string,
        fallback: string,
        packageKey: string,
        source: string,
        args: Record<string, string | number> | any[] = {}
    ) => string;
    initialized: boolean;
}

interface NeosNotification {
    notice: (title: string) => void;
    ok: (title: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string) => void;
}

interface Window {
    NeosCMS: {
        I18n: NeosI18n;
        Notification: NeosNotification;
    };
}

// API types
type Actions = {
    getNodeTypeUsage: string;
    getNodeTypeDefinitions: string;
    exportNodeTypes: string;
    exportNodeTypesReduced: string;
    exportNodeTypeUsage: string;
    getNodes: string;
};

// Data types
type NodeTypeConfiguration = {
    name: NodeTypeName;
    label: string;
    icon?: string;
    abstract: boolean;
    final: boolean;
    allowedChildNodeTypes: NodeTypeName[];
    usageCount: number;
    usageCountByInheritance: Record<NodeTypeName, number>;
    declaredProperties: string[];
    properties: PropertyList;
    declaredSuperTypes: NodeTypeName[];
    superTypes: Inheritance[];
    childNodes: Record<string, ChildNodeConfiguration>;
    warnings: string[];
    options?: {
        'Shel.NodeTypes.Analyzer': {
            deprecated?: boolean;
            note?: string;
        };
    };
};
type NodeTypeConfigurations = Record<string, NodeTypeConfiguration>;
type NodeTypeName = string;
type NodeTypeGroup = {
    name: string;
    color: string;
};
type NodeTypeUsageLink = {
    title: string;
    documentTitle: string;
    documentIdentifier: string;
    url: string;
    nodeIdentifier: string;
    workspace: string;
    dimensions: {
        [dimensionName: string]: string[];
    };
    hidden: boolean;
    onHiddenPage: boolean;
    breadcrumb: string[];
};

type Workspace = {
    value: string;
    label: string;
};

type ContentDimensionPreset = {
    label: string;
    values: string[];
    uriSegment: string;
};

type ContentDimension = {
    label: string;
    icon?: string;
    default: string;
    defaultPreset: string;
    presets: Record<string, ContentDimensionPreset>;
};

type DimensionValues = Record<string, string>;

type ContentDimensionsConfiguration = Record<string, ContentDimension>;

type Inheritance = Record<string, boolean>;
type Constraint = Record<string, boolean>;
type PropertyConfiguration = {
    [key: string]: any;
    type: string;
};
type PropertyList = Record<string, PropertyConfiguration>;
type ChildNodeConfiguration = {
    type: NodeTypeName;
    allowedChildNodeTypes?: NodeTypeName[];
    constraints?: {
        nodeTypes?: Constraint[];
    };
};

// Chart related types
type TreeDataPoint = {
    nodeType?: string;
    [key: string]: any;
};
type DataSegment = {
    name: string;
    path: string;
    group?: string;
    children?: DataSegment[];
    value?: number;
};
type LinkType = 'inherits';
type Dependencies = {
    nodes: {
        children: DataSegment[];
    };
    links: {
        source: NodeTypeName;
        target: NodeTypeName;
        group: string;
        type: LinkType;
    }[];
};

// Node tree related types
type NodePath = string;
type CRNode = {
    label: string;
    name: string;
    index: integer;
    nodeType: NodeTypeName;
    identifier: string;
    hidden: boolean;
    removed: boolean;
    properties: Record<string, any>;
    path: NodePath;
    parentPath: NodePath;
    hasChildNodes: boolean;
    childNodePaths: NodePath[];
};

type CRNodeList = Record<NodePath, CRNode>;
