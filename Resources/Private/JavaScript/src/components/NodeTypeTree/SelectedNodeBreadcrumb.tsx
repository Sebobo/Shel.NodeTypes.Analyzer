import * as React from 'react';

import { Action, useGraph } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { Breadcrumb } from '../Presentationals';

const NodeTypeBreadcrumb = () => {
    const { nodeTypes, selectedNodeTypeName, selectedPath, dispatch } = useGraph();

    const selectedNodeType: NodeTypeConfiguration = selectedNodeTypeName ? nodeTypes[selectedNodeTypeName] : null;
    const selectedNodePath: string[] = nodePathHelper.resolveFromNameAsArray(selectedNodeTypeName);

    const currentPath: string = selectedPath || selectedNodePath.join('.') || '';

    const handleHomeClick = () => dispatch({ type: Action.Reset });

    const handleSegmentClick = (index: number) => {
        const newPath = currentPath
            .split('.')
            .slice(0, index + 1)
            .join('.');
        dispatch({ type: Action.SelectPath, payload: newPath });
    };

    return (
        <Breadcrumb
            parts={currentPath.split('.').filter((segment) => segment)}
            currentIcon={selectedNodeType?.configuration.ui.icon}
            handleHomeClick={handleHomeClick}
            handleSegmentClick={handleSegmentClick}
        />
    );
};

export default React.memo(NodeTypeBreadcrumb);
