import React from 'react';

import LoadingIndicator from '../LoadingIndicator';
import { AppTheme, createUseAppStyles } from '../../core';
import { Inspector } from '../Inspector';
import { NodeRenderer, NodeTree } from './NodeTree';
import { NodeTreeFilter } from './index';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    tabContentInner: {
        display: 'grid',
        height: 'inherit',
        gridGap: theme.spacing.full,
        gridTemplateAreas: `"left main right"`,
        gridTemplateColumns: `${theme.size.sidebarWidth} 1fr ${theme.size.sidebarWidth}`,
    },
    left: {
        gridArea: 'left',
        maxHeight: 'inherit',
        overflow: 'auto',
    },
    main: {
        gridArea: 'main',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    right: {
        gridArea: 'right',
        maxHeight: 'inherit',
        overflow: 'auto',
    },
}));

const NodeAnalysisTab: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.tabContentInner}>
            <LoadingIndicator />
            <div className={classes.left}>
                <NodeTreeFilter />
                <NodeTree />
            </div>
            <div className={classes.main}>
                <NodeRenderer />
            </div>
            <div className={classes.right}>
                <Inspector />
            </div>
        </div>
    );
};

export default React.memo(NodeAnalysisTab);
