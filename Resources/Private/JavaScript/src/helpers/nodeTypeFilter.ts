import { FilterType } from '../constants';

function nodeTypeMatchesFilter(nodeType: NodeTypeConfiguration, filter: FilterType) {
    if (filter === FilterType.UNUSED_CONTENT || filter === FilterType.UNUSED_DOCUMENTS) {
        if (
            nodeType.usageCount > 0 ||
            nodeType.abstract ||
            (nodeType.superTypes &&
                Object.keys(nodeType.superTypes).indexOf(
                    `Neos.Neos:${filter === FilterType.UNUSED_CONTENT ? 'Content' : 'Document'}`
                ) == -1)
        ) {
            return false;
        }
    }
    if (filter === FilterType.USABLE_NODETYPES) {
        if (nodeType.abstract) {
            return false;
        }
    }
    return true;
}

export default nodeTypeMatchesFilter;
