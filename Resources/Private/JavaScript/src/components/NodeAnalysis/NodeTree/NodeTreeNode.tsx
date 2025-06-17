import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Tree, Icon } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { useGraph } from '../../../core';
import { nodesState, nodeTypesState, selectedNodeIdentifierState, workspaceFilterState } from '../../../state';

interface NodeTreeNodeProps {
    node: CRNode;
    level?: number;
    icon?: string;
}

const NodeTreeNode = ({ node, level = 1 }: NodeTreeNodeProps) => {
    const { fetchNodes } = useGraph();

    const nodes = useRecoilValue(nodesState);
    const nodeTypes = useRecoilValue(nodeTypesState);
    const [selectedNodeIdentifier, setSelectedNodeIdentifier] = useRecoilState(selectedNodeIdentifierState);
    const workspaceFilter = useRecoilValue(workspaceFilterState);

    const [collapsed, setCollapsed] = useState(node.classification !== 'root');
    const [isLoading, setIsLoading] = useState(false);
    const [childNodes, setChildNodes] = useState(
        Object.values(nodes)
            .filter((n) => n.parentNodeIdentifier === node.identifier)
            .map((n) => n.identifier)
    );
    const [childNodesLoaded, setChildNodesLoaded] = useState(node.childNodeCount === 0 || childNodes.length > 0);

    const nodeTypeConfiguration = nodeTypes[node.nodeType];

    const icon = (
        <Icon
            icon={nodeTypeConfiguration?.icon || 'question'}
            color={node.nodeType === 'Neos.Neos:FallbackNode' ? 'warn' : 'default'}
        />
    );

    useEffect(() => {
        if (isLoading || collapsed || childNodesLoaded) return;
        setIsLoading(true);
        fetchNodes(node.identifier, workspaceFilter).then((nodes) => {
            console.info(`Fetched ${Object.keys(nodes).length} child nodes for`, node.identifier, nodes);
            setChildNodes(Object.keys(nodes));
            setChildNodesLoaded(true);
            setIsLoading(false);
        });
    }, [collapsed, childNodesLoaded, isLoading]);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={selectedNodeIdentifier === node.identifier}
                isCollapsed={collapsed}
                isFocused={selectedNodeIdentifier === node.identifier}
                isLoading={isLoading}
                label={`${node.label} (${node.childNodeCount})`}
                title={node.label}
                customIconComponent={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={() => setSelectedNodeIdentifier(node.identifier)}
                hasChildren={node.childNodeCount > 0}
                hasError={false}
            />
            {!collapsed &&
                childNodes.length > 0 &&
                childNodes.map((childNodeIdentifier) => (
                    <NodeTreeNode key={childNodeIdentifier} node={nodes[childNodeIdentifier]} level={level + 1} />
                ))}
        </Tree.Node>
    );
};
export default React.memo(NodeTreeNode);
