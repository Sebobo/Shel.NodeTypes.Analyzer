import * as React from 'react';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypeExportButton: {
        '.neos &': {
            marginTop: theme.spacing.full,
        },
    },
}));

const NodeTypeExportButton: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { endpoints } = useGraph();

    return (
        <div className={classes.nodeTypeExportButton}>
            <a href={endpoints.exportNodeTypes} download>
                <button type="button">{translate('action.exportNodeTypes', 'Export nodetypes')}</button>
            </a>
        </div>
    );
};

export default React.memo(NodeTypeExportButton);
