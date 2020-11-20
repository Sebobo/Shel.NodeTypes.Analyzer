import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import ChildNodeTree from './ChildNodeTree/ChildNodeTree';

const NodeGrandChildNodes = () => {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const {
        configuration: { childNodes }
    } = nodeTypes[selectedNodeTypeName];
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
