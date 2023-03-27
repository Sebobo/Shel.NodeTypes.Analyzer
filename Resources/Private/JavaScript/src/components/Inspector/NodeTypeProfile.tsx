import React from 'react';

import { useGraph } from '../../core';
import {
    NodeAnnotations,
    NodeChildNodes,
    NodeGrandChildNodes,
    NodeProperties,
    NodeSuperTypes,
    NodeSelection,
} from './index';

const NodeTypeProfile: React.FC = () => {
    const { selectedNodeTypeName } = useGraph();

    if (!selectedNodeTypeName) {
        return null;
    }

    return (
        <div>
            <NodeAnnotations />
            <NodeSelection />
            <NodeProperties />
            <NodeSuperTypes />
            <NodeChildNodes />
            <NodeGrandChildNodes />
        </div>
    );
};

export default React.memo(NodeTypeProfile);
