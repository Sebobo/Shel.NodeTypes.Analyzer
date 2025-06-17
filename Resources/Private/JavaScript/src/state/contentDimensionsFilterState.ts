import { atom } from 'recoil';

export const contentDimensionsFilterState = atom<DimensionValues>({
    key: 'ContentDimensionsFilterState',
    default: {},
});
