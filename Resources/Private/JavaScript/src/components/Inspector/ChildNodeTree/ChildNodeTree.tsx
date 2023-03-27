import React from 'react';
import { useRecoilValue } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import { createUseAppStyles, useGraph } from '../../../core';
import { NodeTypeChildTreeNode } from '../../NodeTypeAnalysis';
import { nodeTypesState } from '../../../state';

const useStyles = createUseAppStyles({
    tree: {
        overflow: 'auto',
    },
});

const ChildNodeTree: React.FC = () => {
    const classes = useStyles();
    const { selectedNodeTypeName } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);

    const currentNodeType = selectedNodeTypeName ? nodeTypes[selectedNodeTypeName] : null;

    return (
        <Tree className={classes.tree}>
            {Object.keys(currentNodeType.configuration.childNodes)
                .sort()
                .map((childNodeName) => (
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
};

export default React.memo(ChildNodeTree);
