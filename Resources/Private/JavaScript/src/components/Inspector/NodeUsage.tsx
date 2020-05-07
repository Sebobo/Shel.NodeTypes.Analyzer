import * as React from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { useGraph, useIntl } from '../../core';
import { useState } from 'react';

export default function NodeSelection() {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { usageCount } = nodeTypes[selectedNodeTypeName];

    const [showDetails, setShowDetails] = useState(true);

    return (
        <ToggablePanel onPanelToggle={() => setShowDetails(!showDetails)} isOpen={showDetails} style="condensed">
            <ToggablePanel.Header>{translate('inspector.usage.label', 'Details')}</ToggablePanel.Header>
            <ToggablePanel.Contents>
                <p>
                    This nodetype is being used <strong>{usageCount}</strong> times
                </p>
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
