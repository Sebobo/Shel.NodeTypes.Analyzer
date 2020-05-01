import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { NodeTypeTreeNode, VendorSegmentTreeNode } from './index';
import { createUseAppStyles, useGraph } from '../core';

const useStyles = createUseAppStyles({
    tree: {}
});

export default function NodeTypeTree() {
    const classes = useStyles();
    const { treeData } = useGraph();

    return (
        <Tree className={classes.tree}>
            {Object.keys(treeData).map((key, index) =>
                treeData[key].name ? (
                    <NodeTypeTreeNode key={index} nodeType={treeData[key]} />
                ) : (
                    <VendorSegmentTreeNode key={index} segment={key} subNodes={treeData[key]} />
                )
            )}
        </Tree>
    );
}
