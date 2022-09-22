import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { selectedNodeTreePath } from '../../atoms';
import { useGraph } from '../../core';
import Breadcrumb from '../Presentationals/Breadcrumb';

const SelectedNodeBreadcrumb: React.FC = () => {
    const [selectedNodePath, setSelectedNodePath] = useRecoilState(selectedNodeTreePath);
    const { nodes } = useGraph();

    const selectedNode = nodes[selectedNodePath];

    const parts = useMemo(() => {
        let currentNode = selectedNode;
        const parts = [];
        do {
            parts.push(currentNode.name);
            currentNode = nodes[currentNode.parentPath];
        } while (currentNode);
        return parts.reverse();
    }, [selectedNodePath]);

    const handleHomeClick = useCallback(() => {
        setSelectedNodePath('/');
    }, []);
    const handleSegmentClick = useCallback(
        (index: number) => {
            setSelectedNodePath(parts.slice(0, index + 1).join('/'));
        },
        [parts]
    );

    return <Breadcrumb parts={parts} handleHomeClick={handleHomeClick} handleSegmentClick={handleSegmentClick} />;
};

export default React.memo(SelectedNodeBreadcrumb);
