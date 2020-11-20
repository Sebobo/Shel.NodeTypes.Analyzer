import * as React from 'react';

import { useGraph } from '../../core';
import { NodeChildNodes, NodeGrandChildNodes, NodeProperties, NodeSuperTypes, NodeUsage } from './index';

const NodeTypeProfile = () => {
    const { selectedNodeTypeName } = useGraph();

    if (!selectedNodeTypeName) {
        return null;
    }

    return (
        <div>
            <NodeUsage />
            <NodeProperties />
            <NodeSuperTypes />
            <NodeChildNodes />
            <NodeGrandChildNodes />
        </div>
    );
};

export default React.memo(NodeTypeProfile);
