import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import ChildNodeTree from './ChildNodeTree/ChildNodeTree';
import { nodeTypesState } from '../../state';

const NodeGrandChildNodes: React.FC = () => {
    const { selectedNodeTypeName } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();
    const { childNodes } = nodeTypes[selectedNodeTypeName];
    const [collapsed, setCollapsed] = useState(true);

    return (
        <ToggablePanel onPanelToggle={() => setCollapsed(!collapsed)} isOpen={!collapsed} style="condensed">
            <ToggablePanel.Header>
                {translate('inspector.grandChildNodes.label', 'Defined childnodes')} (
                {childNodes ? Object.keys(childNodes).length : 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {!collapsed && childNodes ? (
                    <ChildNodeTree />
                ) : (
                    <span>{translate('inspector.grandChildNodes.unavailable', 'No childnodes allowed')}</span>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
};

export default React.memo(NodeGrandChildNodes);
