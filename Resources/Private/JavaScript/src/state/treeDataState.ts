import { selector } from 'recoil';
import { $set } from 'plow-js';

import { FilterType } from '../constants';
import nodePathHelper from '../helpers/nodePathHelper';
import { nodeTypesState } from './nodeTypesState';
import { nodeTypeFilterState } from './nodeTypeFilterState';

/**
 * Converts flat node types structure into tree
 */
export const treeDataState = selector({
    key: 'TreeDataState',
    get: ({ get }) => {
        const nodeTypes = get(nodeTypesState);
        const selectedFilter = get(nodeTypeFilterState);

        if (Object.keys(nodeTypes).length === 0) return {};

        return Object.values(nodeTypes).reduce((carry: Record<string, { nodeType: string }>, nodeType) => {
            // TODO: Extract filter methods
            if (selectedFilter === FilterType.UNUSED_CONTENT || selectedFilter === FilterType.UNUSED_DOCUMENTS) {
                if (
                    nodeType.usageCount > 0 ||
                    nodeType.abstract ||
                    (nodeType.configuration.superTypes &&
                        Object.keys(nodeType.configuration.superTypes).indexOf(
                            `Neos.Neos:${selectedFilter === FilterType.UNUSED_CONTENT ? 'Content' : 'Document'}`
                        ) == -1)
                ) {
                    return carry;
                }
            }
            return $set(nodePathHelper.resolveFromType(nodeType), { nodeType: nodeType.name }, carry);
        }, {});
    },
});
