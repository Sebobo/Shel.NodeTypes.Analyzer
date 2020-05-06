import { NodeTypeConfiguration } from '../interfaces';

function resolveFromName(nodeTypeName: string): string {
    return nodeTypeName.replace(':', '.');
}

function resolveFromNameAsArray(nodeTypeName: string): string[] {
    return resolveFromName(nodeTypeName).split('.');
}

function resolveFromType(nodeTypeConfiguration: NodeTypeConfiguration): string {
    return resolveFromName(nodeTypeConfiguration.name);
}

export default { resolveFromName, resolveFromNameAsArray, resolveFromType };
