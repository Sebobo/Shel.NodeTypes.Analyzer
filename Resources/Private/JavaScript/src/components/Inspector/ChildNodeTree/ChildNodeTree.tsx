import * as React from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { createUseAppStyles, useGraph } from '../../../core';
import { NodeTypeChildTreeNode } from '../../NodeTypeTree';

const useStyles = createUseAppStyles({
    tree: {
        overflow: 'auto',
        maxHeight: '50vh'
    }
});

export default function ChildNodeTree() {
    const classes = useStyles();
    const { selectedNodeTypeName, nodeTypes } = useGraph();

    const currentNodeType = selectedNodeTypeName ? nodeTypes[selectedNodeTypeName] : null;

    return (
        <Tree className={classes.tree}>
            {Object.keys(currentNodeType.configuration.childNodes)
                .sort()
                .map(childNodeName => (
                    <NodeTypeChildTreeNode
                        key={childNodeName}
                        nodeTypeName={selectedNodeTypeName}
                        name={childNodeName}
                        type={currentNodeType.configuration.childNodes[childNodeName].type}
                        showConstraints={true}
                        onClick={null}
                    />
                ))}
        </Tree>
    );
}
