import * as React from 'react';
import { useState } from 'react';

import Tree from '@neos-project/react-ui-components/lib-esm/Tree';

import { dndTypes } from '../../constants';
import { NodeTypeTreeNode } from './index';

interface VendorSegmentTreeNodeProps {
    isActive?: boolean;
    segment: string;
    subNodes?: object;
    level?: number;
    icon?: string;
}

export default function VendorSegmentTreeNode({
    segment,
    subNodes,
    level = 1,
    icon = 'folder'
}: VendorSegmentTreeNodeProps) {
    const [collapsed, setCollapsed] = useState(true);

    const hasChildren = subNodes && Object.keys(subNodes).length > 0;

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={false}
                isCollapsed={collapsed}
                isFocused={false}
                isLoading={false}
                hasError={false}
                label={segment}
                title={segment}
                icon={icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                onClick={() => setCollapsed(!collapsed)}
                hasChildren={hasChildren}
            />
            {!collapsed &&
                hasChildren &&
                Object.keys(subNodes).map((key, index) =>
                    subNodes[key].name ? (
                        <NodeTypeTreeNode key={index} level={level + 1} nodeType={subNodes[key]} />
                    ) : (
                        <VendorSegmentTreeNode key={index} level={level + 1} segment={key} subNodes={subNodes[key]} />
                    )
                )}
        </Tree.Node>
    );
}
