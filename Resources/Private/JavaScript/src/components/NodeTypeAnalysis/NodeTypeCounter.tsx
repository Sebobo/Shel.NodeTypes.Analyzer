import React from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { useIntl } from '../../core';
import { treeDataState } from '../../state';

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
    const { totalNodeTypeCount, filteredNodeTypeCount } = useRecoilValue(treeDataState);

    return (
        <div className={classes.nodeTypeCount}>
            {translate('nodeTypeCounter.label', '{count} nodetypes', { count: totalNodeTypeCount })}
            {filteredNodeTypeCount < totalNodeTypeCount ? ' ' + translate('nodeTypeCounter.visibleLabel', '({count} nodetypes shown)', { count: filteredNodeTypeCount }) : ''}
        </div>
    );
};

export default React.memo(NodeTypeCounter);
