import * as React from 'react';

import { Toolbar, Inspector, Graph, TreeFilter, InvalidNodeTypes, LoadingIndicator, SearchBox } from './index';
import { AppTheme, createUseAppStyles } from '../core';
import { NodeTypeTree } from './NodeTypeTree';

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
            <LoadingIndicator />
            <div className={classes.left}>
                <TreeFilter />
                <SearchBox />
                <NodeTypeTree />
                <InvalidNodeTypes />
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
