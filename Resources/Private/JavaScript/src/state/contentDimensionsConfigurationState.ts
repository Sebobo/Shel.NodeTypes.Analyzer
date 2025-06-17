import { atom } from 'recoil';

export const contentDimensionsConfigurationState = atom<ContentDimensionsConfiguration>({
    key: 'ContentDimensionsConfigurationState',
    default: {},
});
