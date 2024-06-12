import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import { PropertyList, PropertyListItem } from '../Presentationals';
import nodePathHelper from '../../helpers/nodePathHelper';
import { nodeTypesState } from '../../state';

const NodeSuperTypes: React.FC = () => {
    const { selectedNodeTypeName } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();
    const {
        configuration: { superTypes },
        declaredSuperTypes
    } = nodeTypes[selectedNodeTypeName];
    const [collapsed, setCollapsed] = useState(true);

    const enabledSuperTypes = superTypes ? Object.keys(superTypes).filter((superTypeName) => superTypes[superTypeName]).sort() : [];

    const nonAbstractInheritanceWarning = translate(
        'inspector.supertypes.warning.nonAbstractInheritance',
        'You are inheriting from a non abstract nodetype. Try to use mixins instead.'
    );

    return (
        <ToggablePanel onPanelToggle={() => setCollapsed(!collapsed)} isOpen={!collapsed} style="condensed">
            <ToggablePanel.Header>
                {translate('inspector.supertypes.label', 'Supertypes')} (
                {enabledSuperTypes.length})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {enabledSuperTypes ? (
                    !collapsed && (
                        <PropertyList>
                            {enabledSuperTypes.map((superTypeName) => (
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
