import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { NodeTypeTreeNode, VendorSegmentTreeNode } from './index';
import { createUseAppStyles, useGraph } from '../../core';

const useStyles = createUseAppStyles({
    tree: {
        overflow: 'auto'
    }
});

export default function NodeTypeTree() {
    const classes = useStyles();
    const { treeData, nodeTypes } = useGraph();

    return (
        <Tree className={classes.tree}>
            {Object.keys(treeData)
                .sort()
                .map((segment, index) =>
                    treeData[segment].nodeType ? (
                        <NodeTypeTreeNode key={index} nodeType={nodeTypes[treeData[segment].nodeType]} />
                    ) : (
                        <VendorSegmentTreeNode
                            key={index}
                            path={segment}
                            segment={segment}
                            subNodes={treeData[segment]}
                        />
                    )
                )}
        </Tree>
    );
}
