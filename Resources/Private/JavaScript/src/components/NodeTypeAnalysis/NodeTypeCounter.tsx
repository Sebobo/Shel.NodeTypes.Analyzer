import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { useIntl } from '../../core';
import { nodeTypesState } from '../../state';

const useStyles = createUseStyles({
    nodeTypeCount: {
        userSelect: 'none',
        borderTop: '1px solid var(--grayLight)',
        '.neos &': {
            marginTop: 'var(--spacing-Full)',
            paddingTop: 'var(--spacing-Full)',
        },
    },
});

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
