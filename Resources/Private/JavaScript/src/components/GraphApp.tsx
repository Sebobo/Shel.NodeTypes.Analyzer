import * as React from 'react';

import { Toolbar, Inspector, Graph, TreeFilter, InvalidNodeTypes, LoadingIndicator, SearchBox } from './index';
import { AppTheme, createUseAppStyles } from '../core';
import { NodeTypeTree } from './NodeTypeTree';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    app: {
        display: 'grid',
        height: 'inherit',
        gridGap: theme.spacing.full,
        gridTemplateAreas: `"left main right"`,
        gridTemplateColumns: `${theme.size.sidebarWidth} 1fr ${theme.size.sidebarWidth}`
    },
    left: {
        gridArea: 'left',
        maxHeight: 'inherit',
        overflow: 'auto'
    },
    main: {
        gridArea: 'main',
        display: 'flex',
        flexDirection: 'column'
    },
    right: {
        gridArea: 'right',
        maxHeight: 'inherit',
        overflow: 'auto'
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
