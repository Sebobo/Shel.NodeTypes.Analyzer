import { atom } from 'recoil';

export const loadingState = atom({
    key: 'LoadingState',
    default: true,
});
