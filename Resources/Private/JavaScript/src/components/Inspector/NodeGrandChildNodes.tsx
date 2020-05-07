import * as React from 'react';
import { useState } from 'react';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    childNodesList: {
        '.neos &': {
            paddingLeft: theme.spacing.half
        }
    }
}));

export default function NodeGrandChildNodes() {
    const classes = useStyles();
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const {
        configuration: { childNodes }
    } = nodeTypes[selectedNodeTypeName];
    const [showAllowedGrandChildNodes, setShowAllowedGrandChildNodes] = useState(false);

    return (
        <ToggablePanel
            onPanelToggle={() => setShowAllowedGrandChildNodes(!showAllowedGrandChildNodes)}
            isOpen={showAllowedGrandChildNodes}
            style="condensed"
        >
            <ToggablePanel.Header>
                {translate('inspector.grandChildNodes.label', 'Allowed grandchild node types')} (
                {childNodes?.length || 0})
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                {childNodes ? (
                    showAllowedGrandChildNodes && (
                        <ul className={classes.childNodesList}>
                            {Object.keys(childNodes).map(childNodeName => (
                                <li key={childNodeName}>
                                    <em>{childNodeName}</em>
                                    <ul>
                                        {childNodes[childNodeName].constraints?.nodeTypes &&
                                            Object.keys(childNodes[childNodeName].constraints.nodeTypes).map(
                                                (nodeTypeName, index) => (
                                                    <li key={index}>
                                                        {nodeTypeName}:{' '}
                                                        {childNodes[childNodeName].constraints.nodeTypes[nodeTypeName]
                                                            ? 'true'
                                                            : 'false'}
                                                    </li>
                                                )
                                            )}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <span>{translate('inspector.grandChildNodes.unavailable', 'No childnodes allowed')}</span>
                )}
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
