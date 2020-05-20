export default interface NodeTypeUsageLink {
    documentTitle: string;
    url: string;
    nodeIdentifier: string;
    workspace: string;
    dimensions: {
        [dimensionName: string]: string[];
    };
}
