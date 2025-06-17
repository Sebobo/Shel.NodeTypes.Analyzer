import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Icon, Tree } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { useGraph } from '../../../core';
import { nodesState, nodeTypesState, selectedNodeTreePath } from '../../../state';

interface NodeTreeNodeProps {
    node: CRNode;
    level?: number;
    icon?: string;
}

const NodeTreeNode = ({ node, level = 1 }: NodeTreeNodeProps) => {
    const [collapsed, setCollapsed] = useState(node.path !== '/' && node.path !== '/sites');
    const { fetchNodes } = useGraph();
    const nodes = useRecoilValue(nodesState);
    const nodeTypes = useRecoilValue(nodeTypesState);
    const [selectedPath, setSelectedPath] = useRecoilState(selectedNodeTreePath);
    const [isLoading, setIsLoading] = useState(false);
    const [childNodesLoaded, setChildNodesLoaded] = useState(!node.hasChildNodes);

    const nodeTypeConfiguration = nodeTypes[node.nodeType];

    const icon = (
        <Icon
            icon={nodeTypeConfiguration?.icon || 'question'}
            color={node.nodeType === 'Neos.Neos:FallbackNode' ? 'warn' : 'default'}
        />
    );

    useEffect(() => {
        if (collapsed || childNodesLoaded) return;
        const childNodesMissing = node.childNodePaths.some((path) => !nodes[path]);
        if (childNodesMissing) {
            setIsLoading(true);
            fetchNodes(node.path).then((nodes) => {
                console.info(`Fetched ${Object.keys(nodes).length} child nodes for`, node.path, nodes);
                setChildNodesLoaded(true);
                setIsLoading(false);
            });
        } else {
            setChildNodesLoaded(true);
        }
    }, [collapsed, childNodesLoaded, nodes]);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedPath === node.path}
                isCollapsed={collapsed}
                isFocused={selectedPath === node.path}
                isLoading={isLoading}
                label={`${node.label} (${node.childNodePaths.length})`}
                title={node.label}
                customIconComponent={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={() => setSelectedPath(node.path)}
                hasChildren={node.hasChildNodes}
                hasError={false}
            />
            {!collapsed &&
                node.hasChildNodes &&
                childNodesLoaded &&
                node.childNodePaths.map((childNodePath) => (
                    <NodeTreeNode key={childNodePath} node={nodes[childNodePath]} level={level + 1} />
                ))}
        </Tree.Node>
    );
};
export default React.memo(NodeTreeNode);
