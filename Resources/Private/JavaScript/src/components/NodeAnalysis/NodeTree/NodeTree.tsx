import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import { Action, createUseAppStyles, useGraph } from '../../../core';
import { appInitializationState, nodesState, selectedNodeTreePath } from '../../../state';
import NodeTreeNode from './NodeTreeNode';

const useStyles = createUseAppStyles({
    tree: {
        overflow: 'auto',
    },
});

const NodeTree = () => {
    const classes = useStyles();
    const { dispatch } = useGraph();
    const nodes = useRecoilValue(nodesState);
    const initialized = useRecoilValue(appInitializationState);
    const selectedNodePath = useRecoilValue(selectedNodeTreePath);

    const selectedNode = nodes[selectedNodePath];

    useEffect(() => {
        dispatch({ type: Action.SelectNodeType, payload: selectedNode.nodeType });
    }, [selectedNode?.nodeType]);

    return initialized ? (
        <Tree className={classes.tree}>
            <NodeTreeNode node={nodes['/']} />
        </Tree>
    ) : null;
};
export default React.memo(NodeTree);
