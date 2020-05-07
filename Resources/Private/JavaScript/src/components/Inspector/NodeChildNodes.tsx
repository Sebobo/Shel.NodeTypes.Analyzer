import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from './index';
import nodePathHelper from '../../helpers/nodePathHelper';

export default function NodeChildNodes() {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { allowedChildNodeTypes } = nodeTypes[selectedNodeTypeName];
    const [showAllowedChildNodes, setShowAllowedChildNodes] = useState(false);

    return (
        <ToggablePanel
            onPanelToggle={() => setShowAllowedChildNodes(!showAllowedChildNodes)}
            isOpen={showAllowedChildNodes}
            style="condensed"
        >
            <ToggablePanel.Header>
                {translate('inspector.childNodes.label', 'Allowed child node types')} (
                {allowedChildNodeTypes?.length || 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {allowedChildNodeTypes?.length > 0 ? (
                    showAllowedChildNodes && (
                        <PropertyList>
                            {allowedChildNodeTypes.map(nodeTypeName => (
                                <PropertyListItem
                                    key={nodeTypeName}
                                    label={nodePathHelper.resolveNameWithoutVendor(nodeTypeName)}
                                    value={nodeTypeName}
                                />
                            ))}
                        </PropertyList>
                    )
                ) : (
                    <span>{translate('inspector.childNodes.unavailable', 'No childnodes allowed')}</span>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
