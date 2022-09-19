import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';

import { dndTypes } from '../../constants';
import { useGraph } from '../../core';
import { selectedNodeTreePath } from '../../atoms';

interface NodeTreeNodeProps {
    node: CRNode;
    level?: number;
    icon?: string;
}

const NodeTreeNode = ({ node, level = 1 }: NodeTreeNodeProps) => {
    const [collapsed, setCollapsed] = useState(node.path !== '/');
    const { nodes, nodeTypes, fetchNodes } = useGraph();
    const [selectedPath, setSelectedPath] = useRecoilState(selectedNodeTreePath);
    const [isLoading, setIsLoading] = useState(false);
    const [childNodesLoaded, setChildNodesLoaded] = useState(!node.hasChildNodes);

    const icon = (
        <Icon
            icon={nodeTypes[node.nodeType].configuration.ui.icon || 'question'}
            // color={configuration.options['Shel.NodeTypes.Analyzer']?.deprecated ? 'warn' : 'default'}
        />
    );

    useEffect(() => {
        if (collapsed || childNodesLoaded) return;
        const childNodesMissing = node.childNodePaths.some((path) => !nodes[path]);
        if (childNodesMissing) {
            console.debug('Fetching child nodes for', node.path);
            setIsLoading(true);
            fetchNodes(node.path).then((nodes) => {
                console.debug('Fetched child nodes for', node.path, nodes);
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
                label={node.label}
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
