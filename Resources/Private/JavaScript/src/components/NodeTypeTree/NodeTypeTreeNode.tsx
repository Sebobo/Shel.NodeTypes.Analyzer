import * as React from 'react';
import { useCallback, useState } from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';

import { dndTypes } from '../../constants';
import { NodeTypeConfiguration } from '../../interfaces';
import { NodeTypeChildTreeNode } from './index';
import { Action, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';

interface NodeTypeTreeNodeProps {
    nodeType: NodeTypeConfiguration;
    level?: number;
    icon?: string;
}

const NodeTypeTreeNode = ({ nodeType, level = 1 }: NodeTypeTreeNodeProps) => {
    const { name, configuration, usageCount, usageCountByInheritance } = nodeType;
    const [collapsed, setCollapsed] = useState(true);
    const { selectedNodeTypeName, dispatch } = useGraph();

    const hasError = false;
    const hasChildren = Object.keys(configuration.childNodes).length > 0;
    const nodePath = nodePathHelper.resolveFromType(nodeType);
    const usageCountSum = Object.values(usageCountByInheritance).reduce((carry, usage) => carry + usage, 0);

    const handleSelectNode = useCallback(() => {
        setCollapsed(false);
        dispatch({ type: Action.SelectNodeType, payload: name });
    }, [name, setCollapsed, dispatch]);

    const icon = (
        <Icon
            icon={configuration.ui.icon || 'question'}
            color={configuration.options['Shel.NodeTypes.Analyzer']?.deprecated ? 'warn' : 'default'}
        />
    );

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeTypeName === name}
                isCollapsed={collapsed}
                isFocused={selectedNodeTypeName === name}
                isLoading={false}
                hasError={hasError}
                label={`${nodePath.split('.').pop()} (${usageCount + usageCountSum})`}
                title={configuration.ui.label || name}
                customIconComponent={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleSelectNode}
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
