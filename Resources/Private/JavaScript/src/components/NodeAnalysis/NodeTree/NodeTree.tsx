import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Tree } from '@neos-project/react-ui-components';

import { Action, useGraph } from '../../../core';
import { appInitializationState, nodesState, selectedNodeIdentifierState } from '../../../state';
import NodeTreeNode from './NodeTreeNode';

const useStyles = createUseStyles({
    tree: {
        overflow: 'auto',
    },
});

const NodeTree = () => {
    const classes = useStyles();
    const { dispatch } = useGraph();
    const nodes = useRecoilValue(nodesState);
    const initialized = useRecoilValue(appInitializationState);
    const selectedNodePath = useRecoilValue(selectedNodeIdentifierState);

    const rootNode = Object.values(nodes).find((node) => node.classification === 'root');
    const selectedNode = nodes[selectedNodePath];

    useEffect(() => {
        dispatch({ type: Action.SelectNodeType, payload: selectedNode?.nodeType });
    }, [selectedNode?.nodeType]);

    return initialized && rootNode ? (
        <Tree className={classes.tree}>
            <NodeTreeNode node={rootNode} />
        </Tree>
    ) : null;
};
export default React.memo(NodeTree);
