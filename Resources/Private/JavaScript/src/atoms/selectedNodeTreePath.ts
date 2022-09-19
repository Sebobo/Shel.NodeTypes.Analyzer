import { atom } from 'recoil';

const selectedNodeTreePath = atom<string>({
    key: 'nodeTreeSelection',
    default: '/',
});

export default selectedNodeTreePath;
