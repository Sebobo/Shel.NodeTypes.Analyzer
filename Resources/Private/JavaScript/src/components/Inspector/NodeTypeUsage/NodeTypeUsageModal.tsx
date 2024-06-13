import React, { useState } from 'react';
import Modal from 'react-modal';
import { createUseStyles } from 'react-jss';
import { IconButton } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../../core';
import NodeTypeUsageGroup from './NodeTypeUsageGroup';

const useStyles = createUseStyles({
    modal: {
        position: 'absolute',
        top: 'calc(2 * var(--spacing-GoldenUnit))',
        left: 'var(--spacing-GoldenUnit)',
        right: 'var(--spacing-GoldenUnit)',
        bottom: 'var(--spacing-GoldenUnit)',
        color: 'white',
        outline: 'none',
        overflow: 'auto',
        backgroundColor: 'var(--grayDark)',
        '.neos &': {
            padding: 'var(--spacing-GoldenUnit)'
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
    usageHeader: {
        '.neos &': {
            fontSize: '1rem',
            marginBottom: 'var(--spacing-GoldenUnit)'
        }
    },
    usageTable: {
        '.neos &': {
            '& a': {
                color: 'var(--blue)'
            },
            '&.neos-table th, & td': {
                lineHeight: '1.2em !important',
                padding: 'var(--spacing-Full) !important'
            }
        }
    },
    closeButton: {
        top: 'var(--spacing-Half)',
        right: 'var(--spacing-Half)',
        '.neos &': {
            position: 'absolute'
        }
    }
});

type NodeTypeUsageModalProps = {
    onClose: () => void;
}

const NodeTypeUsageModal: React.FC<NodeTypeUsageModalProps> = ({ onClose }) => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { selectedNodeTypeName, getNodeTypeUsageLinks } = useGraph();
    const [nodeTypeUsageLinks, setNodeTypeUsageLinks] = useState<NodeTypeUsageLink[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const afterOpenModal = () => {
        setIsLoading(true);
        getNodeTypeUsageLinks(selectedNodeTypeName)
            .then((usageLinks) => usageLinks && setNodeTypeUsageLinks(usageLinks))
            .finally(() => setIsLoading(false));
    };

    const groupedNodeTypeUsageLinks = nodeTypeUsageLinks.reduce((acc, link) => {
        const key = link.documentIdentifier ?? 'unresolvable';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(link);
        return acc;
    }, {});

    const showDimensions = nodeTypeUsageLinks.some((link) => Object.keys(link.dimensions).length > 0);

    return (
        <Modal
            isOpen={true}
            onAfterOpen={afterOpenModal}
            onRequestClose={onClose}
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
                onClick={onClose}
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
                        <th>{translate('inspector.usage.modal.table.title', 'Title')}</th>
                        <th>{translate('inspector.usage.modal.table.page', 'Breadcrumb')}</th>
                        <th>{translate('inspector.usage.modal.table.workspace', 'Workspace')}</th>
                        {showDimensions && <th>{translate('inspector.usage.modal.table.dimensions', 'Dimensions')}</th>}
                        <th>{translate('inspector.usage.modal.table.identifier', 'Node identifier')}</th>
                        <th>{translate('inspector.usage.modal.table.hidden', 'Hidden node')}</th>
                        <th>{translate('inspector.usage.modal.table.onHiddenPage', 'Hidden page')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(groupedNodeTypeUsageLinks).map((documentIdentifier, index) => (
                        <NodeTypeUsageGroup
                            key={index}
                            showDimensions={showDimensions}
                            nodeTypeUsageLinks={groupedNodeTypeUsageLinks[documentIdentifier]}
                        />
                    ))}
                    </tbody>
                </table>
            )}
        </Modal>
    );
};

export default NodeTypeUsageModal;
