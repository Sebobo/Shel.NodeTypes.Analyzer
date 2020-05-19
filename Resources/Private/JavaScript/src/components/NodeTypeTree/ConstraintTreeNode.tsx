import * as React from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../../constants';
import { useGraph } from '../../core';

interface ConstraintTreeNodeProps {
    name: string;
    value?: boolean;
    level?: number;
    icon?: string;
}

export default function ConstraintTreeNode({ name, value = true, level = 1, icon = 'child' }: ConstraintTreeNodeProps) {
    const { nodeTypes } = useGraph();

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={false}
                isCollapsed={true}
                isFocused={false}
                isLoading={false}
                hasError={!value}
                label={name}
                title={name}
                icon={nodeTypes[name]?.configuration.ui.icon || icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                hasChildren={false}
            />
        </Tree.Node>
    );
}
