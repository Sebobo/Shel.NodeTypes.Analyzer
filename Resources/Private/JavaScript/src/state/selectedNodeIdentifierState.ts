import { atom } from 'recoil';

export const selectedNodeIdentifierState = atom<string>({
    key: 'SelectedNodeIdentifier',
    default: '',
});
