import * as React from 'react';

import { Toolbar, NodeTypeTree, Inspector, Graph, TreeFilter } from './index';
import { AppTheme, createUseAppStyles } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    app: {
        display: 'grid',
        gridGap: theme.spacing.full,
        gridTemplateAreas: `"left main right"`,
        gridTemplateColumns: `${theme.size.sidebarWidth} 1fr ${theme.size.sidebarWidth}`
    },
    left: {
        gridArea: 'left'
    },
    main: {
        gridArea: 'main'
    },
    right: {
        gridArea: 'right'
    }
}));

export default function GraphApp() {
    const classes = useStyles();

    return (
        <div className={classes.app}>
            <div className={classes.left}>
                <TreeFilter />
                <NodeTypeTree />
            </div>
            <div className={classes.main}>
                <Toolbar />
                <Graph />
            </div>
            <div className={classes.right}>
                <Inspector />
            </div>
        </div>
    );
}
