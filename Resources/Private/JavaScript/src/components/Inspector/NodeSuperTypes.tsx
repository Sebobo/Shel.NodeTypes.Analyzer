import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from './index';
import nodePathHelper from '../../helpers/nodePathHelper';

const NodeSuperTypes = () => {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const {
        configuration: { superTypes },
        declaredSuperTypes
    } = nodeTypes[selectedNodeTypeName];
    const [collapsed, setCollapsed] = useState(true);

    const nonAbstractInheritanceWarning = translate(
        'inspector.supertypes.warning.nonAbstractInheritance',
        'You are inheriting from a non abstract nodetype. Try to use mixins instead.'
    );

    return (
        <ToggablePanel onPanelToggle={() => setCollapsed(!collapsed)} isOpen={!collapsed} style="condensed">
            <ToggablePanel.Header>
                {translate('inspector.supertypes.label', 'Supertypes')} (
                {superTypes ? Object.keys(superTypes).length : 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {superTypes ? (
                    !collapsed && (
                        <PropertyList>
                            {Object.keys(superTypes)
                                .filter(superTypeName => superTypes[superTypeName])
                                .sort()
                                .map(superTypeName => (
                                    <PropertyListItem
                                        key={superTypeName}
                                        highlighted={declaredSuperTypes.includes(superTypeName)}
                                        label={nodePathHelper.resolveNameWithoutVendor(superTypeName)}
                                        value={superTypeName}
                                        icon={!nodeTypes[superTypeName].abstract ? 'warning' : null}
                                        title={
                                            !nodeTypes[superTypeName].abstract ? nonAbstractInheritanceWarning : null
                                        }
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
};
export default React.memo(NodeSuperTypes);
