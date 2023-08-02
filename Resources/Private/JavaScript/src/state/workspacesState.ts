import { atom } from 'recoil';

export const workspacesState = atom<Workspace[]>({
    key: 'WorkspacesState',
    default: [
        {
            label: 'Live',
            value: 'live',
        },
    ],
});
