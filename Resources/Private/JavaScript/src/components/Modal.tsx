import * as React from 'react';
import Modal from 'react-modal';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';

import { AppTheme, createUseAppStyles, useIntl } from '../core';

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
    }
}));

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    label: string;
    children: React.ReactElement | React.ReactElement[];
    onAfterOpen?: () => void;
}

const GraphModal: React.FC<ModalProps> = ({ isOpen, onClose, label, children, onAfterOpen = null }) => {
    const classes = useStyles();
    const { translate } = useIntl();

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                onAfterOpen={onAfterOpen}
                contentLabel={label}
                className={classes.modal}
                overlayClassName={classes.overlay}
            >
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
                {children}
            </Modal>
        </div>
    );
};

export default React.memo(GraphModal);
