import * as React from 'react';

import { useGraph } from '../../core';
import { NodeChildNodes, NodeGrandChildNodes, NodeProperties, NodeSelection, NodeSuperTypes, NodeUsage } from './index';

const NodeTypeProfile = () => {
    const { selectedNodeTypeName } = useGraph();

    return (
        <div>
            <NodeSelection />
            {selectedNodeTypeName && (
                <>
                    <NodeUsage />
                    <NodeProperties />
                    <NodeSuperTypes />
                    <NodeChildNodes />
                    <NodeGrandChildNodes />
                </>
            )}
        </div>
    );
};

export default React.memo(NodeTypeProfile);
