import * as React from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';

import { useGraph, useIntl } from '../../core';
import { useState } from 'react';

const NodeAnnotations: React.FC = () => {
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { configuration } = nodeTypes[selectedNodeTypeName];
    const [open, setOpen] = useState(true);

    const annotations = configuration.options ? configuration.options['Shel.NodeTypes.Analyzer'] || {} : {};

    if (!Object.keys(annotations).length) {
        return null;
    }

    return (
        <ToggablePanel onPanelToggle={() => setOpen(!open)} isOpen={open} style="condensed">
            <ToggablePanel.Header>{translate('inspector.annotations.label', 'Annotations')}</ToggablePanel.Header>
            <ToggablePanel.Contents>
                {annotations.deprecated && (
                    <p>
                        <Icon color="warn" icon="exclamation-triangle" />{' '}
                        {translate('inspector.usage.deprecated', 'This nodetype is marked as deprecated.')}
                    </p>
                )}
                {annotations.note && (
                    <p>
                        <Icon color="primaryBlue" icon="info-circle" /> {annotations.note}
                    </p>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
};

export default React.memo(NodeAnnotations);
