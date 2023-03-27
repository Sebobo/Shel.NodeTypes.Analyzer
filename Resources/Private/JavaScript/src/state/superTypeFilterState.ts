import { atom } from 'recoil';

export const superTypeFilterState = atom<NodeTypeName>({
    key: 'SuperTypeFilterState',
    default: '',
});
