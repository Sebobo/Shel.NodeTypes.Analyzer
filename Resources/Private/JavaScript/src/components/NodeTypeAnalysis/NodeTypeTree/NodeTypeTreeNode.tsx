import React from 'react';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { Tree, Icon } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { Action, useGraph } from '../../../core';
import nodePathHelper from '../../../helpers/nodePathHelper';
import NodeTypeChildTreeNode from './NodeTypeChildTreeNode';
import VendorSegmentTreeNode from './VendorSegmentTreeNode';
import { nodeTypesState } from '../../../state';

interface NodeTypeTreeNodeProps {
    nodeType: NodeTypeConfiguration;
    level?: number;
    icon?: string;
    path: string;
    subNodes?: TreeDataPoint;
}

const NodeTypeTreeNode: React.FC<NodeTypeTreeNodeProps> = ({ nodeType, level = 1, subNodes, path }) => {
    const { name, label, childNodes, icon, options, usageCount, usageCountByInheritance, warnings } = nodeType;
    const [collapsed, setCollapsed] = useState(true);
    const { selectedNodeTypeName, dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);

    const hasError = false;
    const hasChildren =
        Object.keys(childNodes).length > 0 ||
        (subNodes !== undefined && Object.keys(subNodes).filter((segment) => segment !== 'nodeType').length > 0);
    const nodePath = nodePathHelper.resolveFromType(nodeType);
    const usageCountSum = Object.values(usageCountByInheritance).reduce((carry, usage) => carry + usage, 0);

    const handleSelectNode = useCallback(() => {
        setCollapsed(false);
        dispatch({ type: Action.SelectNodeType, payload: name });
    }, [name, setCollapsed, dispatch]);

    const iconComponent = (
        <Icon
            icon={icon || 'question'}
            color={warnings.length > 0 || options['Shel.NodeTypes.Analyzer']?.deprecated ? 'warn' : 'default'}
        />
    );

    const tooltip = label || name + (warnings.length > 0 ? ` (${warnings.length} warnings)` : '');

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeTypeName === name}
                isCollapsed={collapsed}
                isFocused={selectedNodeTypeName === name}
                isLoading={false}
                hasError={hasError}
                label={`${nodePath.split('.').pop()} (${usageCount + usageCountSum})`}
                title={tooltip}
                customIconComponent={iconComponent}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleSelectNode}
                hasChildren={hasChildren}
            />
            {!collapsed &&
                hasChildren &&
                Object.keys(childNodes).map((childNodeName) => (
                    <NodeTypeChildTreeNode
                        key={childNodeName}
                        nodeTypeName={name}
                        name={childNodeName}
                        level={level + 1}
                        type={childNodes[childNodeName].type}
                        onClick={() => handleSelectNode()}
                    />
                ))}
            {!collapsed &&
                Object.keys(subNodes)
                    .filter((segment) => segment !== 'nodeType')
                    .sort()
                    .map((segment, index) =>
                        subNodes[segment]['nodeType'] ? (
                            <NodeTypeTreeNode
                                key={index}
                                level={level + 1}
                                nodeType={nodeTypes[subNodes[segment]['nodeType']]}
                                path={path + '.' + segment}
                                subNodes={subNodes[segment]}
                            />
                        ) : (
                            <VendorSegmentTreeNode
                                key={index}
                                level={level + 1}
                                path={path + '.' + segment}
                                segment={segment}
                                subNodes={subNodes[segment]}
                            />
                        )
                    )}
        </Tree.Node>
    );
};
export default React.memo(NodeTypeTreeNode);
