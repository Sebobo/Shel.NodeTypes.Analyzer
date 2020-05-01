import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../constants';

interface NodeTypeTreeNodeProps {
    isActive?: boolean;
    name: string;
    type: string;
    level?: number;
    icon?: string;
    onClick: () => void;
}

export default function NodeTypeChildTreeNode({
    isActive = false,
    name,
    type,
    level = 1,
    onClick
}: NodeTypeTreeNodeProps) {
    // TODO: Render constraints
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive}
                isCollapsed={true}
                isFocused={isActive}
                isLoading={false}
                hasError={false}
                label={`${name} (${type})`}
                title={name}
                icon={'child'} // TODO: Read icon from actual type
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onClick={onClick}
                hasChildren={false}
            />
        </Tree.Node>
    );
}
