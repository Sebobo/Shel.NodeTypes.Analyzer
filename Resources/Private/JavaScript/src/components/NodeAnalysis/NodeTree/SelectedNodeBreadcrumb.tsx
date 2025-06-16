import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { nodesState, selectedNodeIdentifierState } from '../../../state';
import Breadcrumb from '../../Presentationals/Breadcrumb';

const SelectedNodeBreadcrumb: React.FC = () => {
    const [selectedNodeIdentifier, setSelectedNodeIdentifier] = useRecoilState(selectedNodeIdentifierState);
    const nodes = useRecoilValue(nodesState);

    const selectedNode = nodes[selectedNodeIdentifier];

    const parts = useMemo(() => {
        let currentNode = selectedNode;
        const parts = [];
        do {
            parts.push({ label: currentNode.label, identifier: currentNode.identifier });
            currentNode = nodes[currentNode.parentNodeIdentifier];
        } while (currentNode);
        return parts.reverse();
    }, [selectedNodeIdentifier]);

    const handleHomeClick = useCallback(() => {
        setSelectedNodeIdentifier('');
    }, []);

    return (
        <Breadcrumb parts={parts} handleHomeClick={handleHomeClick} handleSegmentClick={setSelectedNodeIdentifier} />
    );
};

export default React.memo(SelectedNodeBreadcrumb);
