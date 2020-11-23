import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../../constants';
import { NodeTypeTreeNode } from './index';
import { Action, useGraph } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { TreeDataPoint } from '../../interfaces';

interface VendorSegmentTreeNodeProps {
    isActive?: boolean;
    path: string;
    segment: string;
    subNodes?: TreeDataPoint;
    level?: number;
    icon?: string;
}

const VendorSegmentTreeNode = ({ path, segment, subNodes, level = 1, icon = 'folder' }: VendorSegmentTreeNodeProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const { selectedPath, selectedNodeTypeName, dispatch, nodeTypes } = useGraph();

    const hasChildren = subNodes && Object.keys(subNodes).length > 0;
    const isInActivePath =
        selectedPath === path ||
        selectedPath.indexOf(path + '.') === 0 ||
        nodePathHelper.resolveFromName(selectedNodeTypeName).indexOf(path + '.') === 0;

    useEffect(() => {
        if (isInActivePath) {
            setCollapsed(false);
        }
    }, [isInActivePath, setCollapsed]);

    const handleToggle = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    const handleSelect = useCallback(() => {
        setCollapsed(false);
        dispatch({ type: Action.SelectPath, payload: path });
    }, [dispatch, path]);

    const showChildNodes = hasChildren && !collapsed;

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isInActivePath}
                isCollapsed={collapsed}
                isFocused={selectedPath === path}
                isLoading={false}
                hasError={false}
                label={segment}
                title={segment}
                icon={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onToggle={handleToggle}
                onClick={handleSelect}
                hasChildren={hasChildren}
            />
            {showChildNodes &&
                Object.keys(subNodes).map((segment, index) =>
                    subNodes[segment]['nodeType'] ? (
                        <NodeTypeTreeNode
                            key={index}
                            level={level + 1}
                            nodeType={nodeTypes[subNodes[segment]['nodeType']]}
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

export default React.memo(VendorSegmentTreeNode);
