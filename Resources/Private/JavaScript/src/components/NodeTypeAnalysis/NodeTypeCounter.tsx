import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { AppTheme, createUseAppStyles, useIntl } from '../../core';
import { nodeTypesState } from '../../state';

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

const NodeTypeCounter: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const nodeTypes = useRecoilValue(nodeTypesState);

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
