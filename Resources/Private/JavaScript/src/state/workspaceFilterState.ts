import { atom } from 'recoil';

export const workspaceFilterState = atom<string>({
    key: 'WorkspaceFilterTypeState',
    default: 'live',
});
