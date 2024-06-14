import { Icon } from '@neos-project/react-ui-components';
import React from 'react';
import { createUseStyles } from 'react-jss';

import { useGraph, useIntl } from '../../core';

const useStyles = createUseStyles({
    nodeTypeExportButton: {
        '.neos &': {
            marginTop: 'var(--spacing-Full)',
            display: 'flex',
            gap: 'var(--spacing-Full)',
        },
    },
    exportSwitchButton: {
        cursor: 'pointer',
        background: 'none',
        border: 0,
        color: 'white',
        display: 'flex',
        gap: 'var(--spacing-Half)',
        alignItems: 'center',
        userSelect: 'none',
    },
});

const NodeTypeExportButton: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { endpoints } = useGraph();
    const [exportReduced, setExportReduced] = React.useState(false);

    return (
        <div className={classes.nodeTypeExportButton}>
            <a href={exportReduced ? endpoints.exportNodeTypesReduced : endpoints.exportNodeTypes} download>
                <button type="button" className="neos-button">
                    {translate('action.exportNodeTypes', 'Export nodetypes')}
                </button>
            </a>
            <button
                type="button"
                className={classes.exportSwitchButton}
                onClick={() => setExportReduced((prev) => !prev)}
            >
                <Icon icon={exportReduced ? 'check-square' : 'square'} /> Reduced version
            </button>
        </div>
    );
};

export default React.memo(NodeTypeExportButton);
