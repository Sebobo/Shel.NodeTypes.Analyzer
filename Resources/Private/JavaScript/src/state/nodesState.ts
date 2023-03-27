import { atom } from 'recoil';

export const nodesState = atom<CRNodeList>({
    key: 'NodesState',
    default: {},
});
