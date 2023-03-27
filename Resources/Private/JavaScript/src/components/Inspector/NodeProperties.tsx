import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from '../Presentationals';
import { nodeTypesState } from '../../state';

const NodeProperties: React.FC = () => {
    const { selectedNodeTypeName } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();
    const {
        configuration: { properties },
        declaredProperties,
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
                                .map((propName) => (
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
};
export default React.memo(NodeProperties);
