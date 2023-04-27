import React from 'react';
import { createUseStyles } from 'react-jss';

import { useGraph, useIntl } from '../../core';

const useStyles = createUseStyles({
    nodeTypeExportButton: {
        '.neos &': {
            marginTop: 'var(--spacing-Full)',
        },
    },
});

const NodeTypeExportButton: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { endpoints } = useGraph();

    return (
        <div className={classes.nodeTypeExportButton}>
            <a href={endpoints.exportNodeTypes} download>
                <button type="button" className="neos-button">
                    {translate('action.exportNodeTypes', 'Export nodetypes')}
                </button>
            </a>
        </div>
    );
};

export default React.memo(NodeTypeExportButton);
