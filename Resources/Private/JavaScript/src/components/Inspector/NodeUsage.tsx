import * as React from 'react';
import { useState } from 'react';
import Modal from 'react-modal';

import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';
import Button from '@neos-project/react-ui-components/lib-esm/Button';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';
import { NodeTypeUsageLink } from '../../interfaces';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    usageTable: {
        '.neos &': {}
    },
    modal: {
        position: 'absolute',
        top: `calc(2 * ${theme.spacing.goldenUnit})`,
        left: theme.spacing.goldenUnit,
        right: theme.spacing.goldenUnit,
        bottom: theme.spacing.goldenUnit,
        color: 'white',
        outline: 'none',
        overflow: 'auto',
        backgroundColor: theme.colors.contrastDarker,
        '.neos &': {
            padding: theme.spacing.goldenUnit
        }
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, .85)',
        zIndex: 10300
    },
    closeButton: {
        top: theme.spacing.half,
        right: theme.spacing.half,
        '.neos &': {
            position: 'absolute'
        }
    },
    usageHeader: {
        '.neos &': {
            fontSize: '1rem',
            marginBottom: theme.spacing.goldenUnit
        }
    }
}));

export default function NodeSelection() {
    const classes = useStyles();
    const { selectedNodeTypeName, nodeTypes, getNodeTypeUsageLinks } = useGraph();
    const { translate } = useIntl();
    const { usageCount, abstract } = nodeTypes[selectedNodeTypeName];
    const [nodeTypeUsageLinks, setNodeTypeUsageLinks] = useState<NodeTypeUsageLink[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showUsageLinks, setShowUsageLinks] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    const afterOpenModal = () => {
        setIsLoading(true);
        getNodeTypeUsageLinks(selectedNodeTypeName)
            .then(usageLinks => usageLinks && setNodeTypeUsageLinks(usageLinks))
            .finally(() => setIsLoading(false));
    };

    return (
        <>
            <ToggablePanel onPanelToggle={() => setShowDetails(!showDetails)} isOpen={showDetails} style="condensed">
                <ToggablePanel.Header>{translate('inspector.usage.label', 'Details')}</ToggablePanel.Header>
                <ToggablePanel.Contents>
                    {abstract ? (
                        <p>{translate('inspector.usage.isAbstract', 'This is an abstract nodetype')}</p>
                    ) : usageCount > 0 ? (
                        <p>
                            {translate('inspector.usage.prefix', 'This nodetype is being used')}{' '}
                            <Button onClick={() => setShowUsageLinks(true)} style="lighter" hoverStyle="brand">
                                {usageCount} {translate('inspector.usage.button', 'times')}
                            </Button>
                        </p>
                    ) : (
                        <p>{translate('inspector.usage.unused', 'Not used')}</p>
                    )}
                </ToggablePanel.Contents>
            </ToggablePanel>

            <Modal
                isOpen={showUsageLinks}
                onAfterOpen={afterOpenModal}
                onRequestClose={() => setShowUsageLinks(false)}
                contentLabel={selectedNodeTypeName + ' Usage'}
                className={classes.modal}
                overlayClassName={classes.overlay}
            >
                <h2 className={classes.usageHeader}>
                    {translate('inspector.usage.modal.header', 'Usage for')} {selectedNodeTypeName}
                </h2>
                <IconButton
                    className={classes.closeButton}
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    icon="times-circle"
                    onClick={() => setShowUsageLinks(false)}
                    title={translate('inspector.usage.modal.close', 'Close')}
                >
                    {translate('inspector.usage.modal.close', 'Close')}
                </IconButton>

                {isLoading ? (
                    <p>{translate('inspector.usage.modal.loading', 'Loading usage links...')}</p>
                ) : (
                    <table className={'neos-table ' + classes.usageTable}>
                        <thead>
                            <tr>
                                <th>{translate('inspector.usage.modal.table.page', 'Page')}</th>
                                <th>{translate('inspector.usage.modal.table.workspace', 'Workspace')}</th>
                                <th>{translate('inspector.usage.modal.table.dimensions', 'Dimensions')}</th>
                                <th>{translate('inspector.usage.modal.table.identifier', 'Node Identifier')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodeTypeUsageLinks
                                .sort((a, b) => a.documentTitle.localeCompare(b.documentTitle))
                                .map((link, index) => (
                                    <tr key={index}>
                                        <td>
                                            {link.url ? (
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                    {link.documentTitle}
                                                </a>
                                            ) : (
                                                link.documentTitle
                                            )}
                                        </td>
                                        <td>{link.workspace}</td>
                                        <td>
                                            {Object.keys(link.dimensions).map(
                                                dimensionName =>
                                                    dimensionName + ': ' + link.dimensions[dimensionName].join(', ')
                                            )}
                                        </td>
                                        <td>{link.nodeIdentifier}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </Modal>
        </>
    );
}
