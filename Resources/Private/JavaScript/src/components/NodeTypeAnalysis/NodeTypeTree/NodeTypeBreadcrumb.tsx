import React from 'react';
import { useRecoilValue } from 'recoil';

import { Action, useGraph } from '../../../core';
import nodePathHelper from '../../../helpers/nodePathHelper';
import { Breadcrumb } from '../../Presentationals';
import { nodeTypesState } from '../../../state';

const NodeTypeBreadcrumb: React.FC = () => {
    const { selectedNodeTypeName, selectedPath, dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);

    const selectedNodeType: NodeTypeConfiguration = selectedNodeTypeName ? nodeTypes[selectedNodeTypeName] : null;
    const selectedNodePath: string[] = nodePathHelper.resolveFromNameAsArray(selectedNodeTypeName);

    const currentPath: string = selectedPath || selectedNodePath.join('.') || '';

    const handleHomeClick = () => dispatch({ type: Action.Reset });

    const handleSegmentClick = (identifier: string) => {
        const newPath = currentPath
            .split('.')
            .slice(0, parseInt(identifier, 10) + 1)
            .join('.');
        dispatch({ type: Action.SelectPath, payload: newPath });
    };

    const parts = currentPath
        .split('.')
        .filter((segment) => segment)
        .map((segment, index) => ({
            label: segment,
            identifier: `${index}`,
        }));

    return (
        <Breadcrumb
            parts={parts}
            currentIcon={selectedNodeType?.icon}
            handleHomeClick={handleHomeClick}
            handleSegmentClick={handleSegmentClick}
        />
    );
};

export default React.memo(NodeTypeBreadcrumb);
