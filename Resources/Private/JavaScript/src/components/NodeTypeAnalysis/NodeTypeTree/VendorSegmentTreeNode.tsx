import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { Action, useGraph } from '../../../core';
import nodePathHelper from '../../../helpers/nodePathHelper';
import NodeTypeTreeNode from './NodeTypeTreeNode';
import { nodeTypesState } from '../../../state';

interface VendorSegmentTreeNodeProps {
    isActive?: boolean;
    path: string;
    segment: string;
    subNodes?: TreeDataPoint;
    level?: number;
    icon?: string;
}

const VendorSegmentTreeNode: React.FC<VendorSegmentTreeNodeProps> = ({
    path,
    segment,
    subNodes,
    level = 1,
    icon = 'folder',
}) => {
    const [collapsed, setCollapsed] = useState(true);
    const { selectedPath, selectedNodeTypeName, dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);

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
                Object.keys(subNodes)
                    .sort()
                    .map((segment, index) =>
                        subNodes[segment]['nodeType'] ? (
                            <NodeTypeTreeNode
                                key={index}
                                nodeType={nodeTypes[subNodes[segment]['nodeType']]}
                                level={level + 1}
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

export default React.memo(VendorSegmentTreeNode);
