import * as React from 'react';
import { useState } from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../../constants';
import { NodeTypeConfiguration } from '../../interfaces';
import { NodeTypeChildTreeNode } from './index';
import { Action, useGraph } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';

interface NodeTypeTreeNodeProps {
    nodeType: NodeTypeConfiguration;
    level?: number;
    icon?: string;
}

const NodeTypeTreeNode = ({ nodeType, level = 1 }: NodeTypeTreeNodeProps) => {
    const { name, configuration, usageCount } = nodeType;
    const [collapsed, setCollapsed] = useState(true);
    const { selectedNodeTypeName, dispatch } = useGraph();

    const hasChildren = Object.keys(configuration.childNodes).length > 0;
    const nodePath = nodePathHelper.resolveFromType(nodeType);

    const handleSelectNode = () => {
        setCollapsed(false);
        dispatch({ type: Action.SelectNodeType, payload: name });
    };

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeTypeName === name}
                isCollapsed={collapsed}
                isFocused={selectedNodeTypeName === name}
                isLoading={false}
                hasError={false}
                label={`${nodePath.split('.').pop()} (${usageCount})`}
                title={configuration.ui.label || name}
                icon={configuration.ui.icon || 'question'}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={() => handleSelectNode()}
                hasChildren={hasChildren}
            />
            {!collapsed &&
                hasChildren &&
                Object.keys(configuration.childNodes).map(childNodeName => (
                    <NodeTypeChildTreeNode
                        key={childNodeName}
                        nodeTypeName={name}
                        name={childNodeName}
                        level={level + 1}
                        type={configuration.childNodes[childNodeName].type}
                        onClick={() => handleSelectNode()}
                    />
                ))}
        </Tree.Node>
    );
};
export default React.memo(NodeTypeTreeNode);
