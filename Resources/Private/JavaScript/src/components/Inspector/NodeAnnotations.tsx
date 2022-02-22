import * as React from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';
import { useState } from 'react';

const useStyles = createUseAppStyles((theme: AppTheme) => ({}));

const NodeAnnotations: React.FC = () => {
    const classes = useStyles();
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { configuration } = nodeTypes[selectedNodeTypeName];
    const [open, setOpen] = useState(true);

    const annotations = configuration.options ? configuration.options['Shel.ContentRepository.Debugger'] || {} : {};

    return (
        <ToggablePanel onPanelToggle={() => setOpen(!open)} isOpen={open} style="condensed">
            <ToggablePanel.Header>{translate('inspector.usage.label', 'Details')}</ToggablePanel.Header>
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
