import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from './index';
import nodePathHelper from '../../helpers/nodePathHelper';

export default function NodeSuperTypes() {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const {
        configuration: { superTypes }
    } = nodeTypes[selectedNodeTypeName];
    const [showSupertypes, setShowSupertypes] = useState(false);

    return (
        <ToggablePanel
            onPanelToggle={() => setShowSupertypes(!showSupertypes)}
            isOpen={showSupertypes}
            style="condensed"
        >
            <ToggablePanel.Header>
                {translate('inspector.supertypes.label', 'Supertypes')} (
                {superTypes ? Object.keys(superTypes).length : 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {superTypes ? (
                    showSupertypes && (
                        <PropertyList>
                            {Object.keys(superTypes)
                                .filter(superTypeName => superTypes[superTypeName])
                                .map(superTypeName => (
                                    <PropertyListItem
                                        key={superTypeName}
                                        label={nodePathHelper.resolveNameWithoutVendor(superTypeName)}
                                        value={superTypeName}
                                    />
                                ))}
                        </PropertyList>
                    )
                ) : (
                    <span>{translate('inspector.supertypes.unavailable', 'No supertypes defined')}</span>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
