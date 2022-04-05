import * as React from 'react';
import { useMemo } from 'react';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypeCount: {
        userSelect: 'none',
        borderTop: `1px solid ${theme.colors.contrastDark}`,
        '.neos &': {
            marginTop: theme.spacing.full,
            paddingTop: theme.spacing.full,
        },
    },
}));

const NodeTypeCounter = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { nodeTypes } = useGraph();

    const nodeTypeCount = useMemo(() => {
        return Object.keys(nodeTypes).length;
    }, [nodeTypes]);

    return (
        <div className={classes.nodeTypeCount}>
            {translate('nodeTypeCounter.label', '{count} nodetypes', { count: nodeTypeCount })}
        </div>
    );
};

export default React.memo(NodeTypeCounter);
