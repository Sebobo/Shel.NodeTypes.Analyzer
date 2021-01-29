export default interface ContextData {
    user: {
        name: string;
        label: string;
    };
    currentSite: {
        name: string;
        nodeName: string;
        primaryDomain?: string;
    };
}
