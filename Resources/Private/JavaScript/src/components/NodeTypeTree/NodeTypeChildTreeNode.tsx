import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../../constants';
import { ConstraintTreeNode } from './index';
import { useGraph } from '../../core';

interface NodeTypeChildTreeNodeProps {
    isActive?: boolean;
    nodeTypeName: NodeTypeName;
    name: string;
    type: string;
    level?: number;
    icon?: string;
    onClick: () => void;
    showConstraints?: boolean;
}

const NodeTypeChildTreeNode = ({
    isActive = false,
    nodeTypeName,
    name,
    type,
    level = 1,
    onClick,
    showConstraints = false,
}: NodeTypeChildTreeNodeProps) => {
    const { nodeTypes } = useGraph();
    const constraints = nodeTypes[nodeTypeName].configuration.childNodes[name].allowedChildNodeTypes ?? [];

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
                hasChildren={showConstraints && constraints.length > 0}
            />
            {showConstraints &&
                constraints
                    .sort()
                    .map((constraint, index) => <ConstraintTreeNode key={index} name={constraint} level={level + 1} />)}
        </Tree.Node>
    );
};
export default React.memo(NodeTypeChildTreeNode);
