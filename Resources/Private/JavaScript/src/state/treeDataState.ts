import { selector } from 'recoil';
// TODO: Remove plow-js
import { $set } from 'plow-js';

import nodePathHelper from '../helpers/nodePathHelper';
import { nodeTypesState } from './nodeTypesState';
import { nodeTypeFilterState } from './nodeTypeFilterState';
import nodeTypeMatchesFilter from '../helpers/nodeTypeFilter';

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
            totalNodeTypeCount++;
            if (!nodeTypeMatchesFilter(nodeType, selectedFilter)) {
                return carry;
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
