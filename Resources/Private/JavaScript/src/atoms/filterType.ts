import { atom } from 'recoil';
import { FilterType } from '../constants';

const filterTypeState = atom({
    key: 'filterType',
    default: FilterType.NONE,
});

export default filterTypeState;
