import { atom } from 'recoil';

const searchTermState = atom({
    key: 'searchTerm',
    default: '',
});

export default searchTermState;
