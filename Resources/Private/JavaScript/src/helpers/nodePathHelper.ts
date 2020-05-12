import { NodeTypeConfiguration } from '../interfaces';

function resolveFromName(nodeTypeName: NodeTypeName): string {
    return nodeTypeName.replace(':', '.');
}

function resolveFromNameAsArray(nodeTypeName: NodeTypeName): string[] {
    return resolveFromName(nodeTypeName).split('.');
}

function resolveFromType(nodeTypeConfiguration: NodeTypeConfiguration): string {
    return resolveFromName(nodeTypeConfiguration.name);
}

function resolveNameWithoutVendor(nodeTypeName: NodeTypeName): string {
    return nodeTypeName.split(':').pop();
}

function resolveGroup(nodeTypeName: NodeTypeName): string {
    return nodeTypeName.split(':').shift();
}

export default { resolveFromName, resolveFromNameAsArray, resolveFromType, resolveNameWithoutVendor, resolveGroup };
