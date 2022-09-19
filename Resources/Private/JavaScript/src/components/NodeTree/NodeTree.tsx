import * as React from 'react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { NodeTreeNode } from './index';
import { Action, createUseAppStyles, useGraph } from '../../core';
import { selectedNodeTreePath } from '../../atoms';

const useStyles = createUseAppStyles({
    tree: {
        overflow: 'auto',
    },
});

const NodeTree = () => {
    const classes = useStyles();
    const { nodes, dispatch } = useGraph();
    const selectedNodePath = useRecoilValue(selectedNodeTreePath);

    const selectedNode = nodes[selectedNodePath];

    useEffect(() => {
        dispatch({ type: Action.SelectNodeType, payload: selectedNode.nodeType });
    }, [selectedNode?.nodeType]);

    return (
        <Tree className={classes.tree}>
            <NodeTreeNode node={nodes['/']} />
        </Tree>
    );
};
export default React.memo(NodeTree);
