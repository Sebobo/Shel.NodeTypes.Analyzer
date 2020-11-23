import * as React from 'react';
import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypeCount: {
        userSelect: 'none',
        borderTop: `1px solid ${theme.colors.contrastDark}`,
        '.neos &': {
            marginTop: theme.spacing.full,
            paddingTop: theme.spacing.full
        }
    }
}));

const NodeTypeCounter = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { nodeTypes } = useGraph();
    const nodeTypeCount = Object.keys(nodeTypes).length;

    return (
        <div className={classes.nodeTypeCount}>
            {nodeTypeCount} {translate('nodeTypeCounter.label', 'Nodetypes')}
        </div>
    );
};

export default React.memo(NodeTypeCounter);
