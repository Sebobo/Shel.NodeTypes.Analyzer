import React from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Tree } from '@neos-project/react-ui-components';

import NodeTypeTreeNode from './NodeTypeTreeNode';
import VendorSegmentTreeNode from './VendorSegmentTreeNode';
import { nodeTypesState, treeDataState } from '../../../state';

const useStyles = createUseStyles({
    tree: {
        overflow: 'auto',
    },
});

const NodeTypeTree: React.FC = () => {
    const classes = useStyles();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const treeData = useRecoilValue(treeDataState);

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
};
export default React.memo(NodeTypeTree);
