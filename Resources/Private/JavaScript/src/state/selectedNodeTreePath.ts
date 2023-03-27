import { atom } from 'recoil';

export const selectedNodeTreePath = atom<string>({
    key: 'SelectedNodeTreePath',
    default: '/',
});
