import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from './index';

export default function NodeProperties() {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const {
        configuration: { properties },
        declaredProperties
    } = nodeTypes[selectedNodeTypeName];
    const [showProperties, setShowProperties] = useState(false);

    return (
        <ToggablePanel
            onPanelToggle={() => setShowProperties(!showProperties)}
            isOpen={showProperties}
            style="condensed"
        >
            <ToggablePanel.Header>
                {translate('inspector.properties.label', 'Properties')} (
                {properties ? Object.keys(properties).length : 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {properties ? (
                    showProperties && (
                        <PropertyList>
                            {Object.keys(properties)
                                .sort()
                                .map(propName => (
                                    <PropertyListItem
                                        key={propName}
                                        label={propName}
                                        highlighted={declaredProperties.includes(propName)}
                                        value={properties[propName].type}
                                    />
                                ))}
                        </PropertyList>
                    )
                ) : (
                    <span>{translate('inspector.properties.unavailable', 'No properties defined')}</span>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
