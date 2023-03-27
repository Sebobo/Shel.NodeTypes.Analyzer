import { atom } from 'recoil';
import { FilterType } from '../constants';

export const nodeTypeFilterState = atom({
    key: 'NodeTypeFilterState',
    default: FilterType.NONE,
});
