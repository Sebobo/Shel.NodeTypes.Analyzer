import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ToggablePanel, Icon } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import { nodeTypesState } from '../../state';

const NodeAnnotations: React.FC = () => {
    const { selectedNodeTypeName } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();
    const { warnings, options } = nodeTypes[selectedNodeTypeName];
    const [open, setOpen] = useState(true);

    const annotations = options ? options['Shel.NodeTypes.Analyzer'] || {} : {};

    if (!Object.keys(annotations).length && !warnings.length) {
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
                {warnings.map((warning, index) => (
                    <p key={index}>
                        <Icon color="warn" icon="exclamation-triangle" /> {warning}
                    </p>
                ))}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
};

export default React.memo(NodeAnnotations);
