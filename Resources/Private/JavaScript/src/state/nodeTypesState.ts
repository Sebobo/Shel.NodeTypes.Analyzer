import { atom } from 'recoil';

export const nodeTypesState = atom<NodeTypeConfigurations>({
    key: 'NodeTypesState',
    default: {},
});
