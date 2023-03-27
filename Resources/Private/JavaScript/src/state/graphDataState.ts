import { selector } from 'recoil';

import { treeDataState } from './treeDataState';

/**
 * Recursive function to convert tree data to chart data
 */
const processTreeData = (data: Record<string, TreeDataPoint>, path = '') => {
    return Object.keys(data).map((segment) => {
        const currentData = data[segment];
        const segmentPath = path ? path + '.' + segment : segment;
        const node: DataSegment = { name: segment, path: segmentPath };
        if (currentData.nodeType) {
            node['value'] = 1;
            node['data'] = currentData;
        } else {
            node['children'] = processTreeData(currentData, segmentPath);
        }
        return node;
    });
};

/**
 * Converts tree based nodetypes structure into a form that can be used for graphical charts
 */
export const graphDataState = selector<DataSegment>({
    key: 'GraphDataState',
    get: ({ get }) => {
        const treeData = get(treeDataState);
        if (Object.keys(treeData).length === 0) return {} as DataSegment;
        return { name: 'nodetypes', path: '', children: processTreeData(treeData) };
    },
});
