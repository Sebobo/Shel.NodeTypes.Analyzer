import { atom } from 'recoil';

export const invalidNodeTypesState = atom<NodeTypeConfigurations>({
    key: 'InvalidNodeTypesState',
    default: {},
});
