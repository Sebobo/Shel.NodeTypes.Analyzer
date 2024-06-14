import { selector } from 'recoil';
import { $set } from 'plow-js';

import { FilterType } from '../constants';
import nodePathHelper from '../helpers/nodePathHelper';
import { nodeTypesState } from './nodeTypesState';
import { nodeTypeFilterState } from './nodeTypeFilterState';

/**
 * Converts flat node types structure into tree
 */
export const treeDataState = selector<{
    treeData: TreeDataPoint;
    totalNodeTypeCount: number;
    filteredNodeTypeCount: number;
}>({
    key: 'TreeDataState',
    get: ({ get }) => {
        const nodeTypes = get(nodeTypesState);
        const selectedFilter = get(nodeTypeFilterState);

        let totalNodeTypeCount = 0;
        let filteredNodeTypeCount = 0;
        const treeData = Object.values(nodeTypes).reduce((carry: Record<string, { nodeType: string }>, nodeType) => {
            // TODO: Extract filter methods
            totalNodeTypeCount++;
            if (selectedFilter === FilterType.UNUSED_CONTENT || selectedFilter === FilterType.UNUSED_DOCUMENTS) {
                if (
                    nodeType.usageCount > 0 ||
                    nodeType.abstract ||
                    (nodeType.superTypes &&
                        Object.keys(nodeType.superTypes).indexOf(
                            `Neos.Neos:${selectedFilter === FilterType.UNUSED_CONTENT ? 'Content' : 'Document'}`
                        ) == -1)
                ) {
                    return carry;
                }
            }
            if (selectedFilter === FilterType.USABLE_NODETYPES) {
                if (nodeType.abstract) {
                    return carry;
                }
            }
            filteredNodeTypeCount++;
            return $set(nodePathHelper.resolveFromType(nodeType), { nodeType: nodeType.name }, carry);
        }, {});

        return {
            treeData,
            totalNodeTypeCount,
            filteredNodeTypeCount,
        };
    },
});
