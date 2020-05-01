import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../constants';
import { NodeTypeConfiguration } from '../interfaces';
import { NodeTypeChildTreeNode } from './index';
import { useState } from 'react';
import { useGraph } from '../core';

interface NodeTypeTreeNodeProps {
    nodeType: NodeTypeConfiguration;
    level?: number;
    icon?: string;
}

export default function NodeTypeTreeNode({ nodeType, level = 1 }: NodeTypeTreeNodeProps) {
    const { name, configuration, usageCount } = nodeType;
    const [collapsed, setCollapsed] = useState(true);
    const { selectedNodeTypeName, setSelectedNodeTypeName } = useGraph();

    const hasChildren = configuration.childNodes != null;

    const handleSelectNode = () => {
        setCollapsed(!collapsed);
        setSelectedNodeTypeName(name);
    };
    const handleSelectChildNode = () => setSelectedNodeTypeName(name);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeTypeName === name}
                isCollapsed={collapsed}
                isFocused={selectedNodeTypeName === name}
                isLoading={false}
                hasError={false}
                label={`${name} (${usageCount})`}
                title={configuration.ui?.label || name}
                icon={configuration.ui?.icon || 'question'}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onClick={() => handleSelectNode()}
                hasChildren={!!configuration.childNodes}
            />
            {!collapsed &&
                hasChildren &&
                Object.keys(configuration.childNodes).map(childNodeName => (
                    <NodeTypeChildTreeNode
                        key={childNodeName}
                        name={childNodeName}
                        level={level + 1}
                        type={configuration.childNodes[childNodeName].type}
                        onClick={() => handleSelectChildNode()}
                    />
                ))}
        </Tree.Node>
    );
}
