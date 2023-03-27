import { atom } from 'recoil';

export const nodeTypeGroupState = atom<NodeTypeGroup[]>({
    key: 'nodeTypeGroupState',
    default: [],
});
