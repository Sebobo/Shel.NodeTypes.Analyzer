import React from 'react';
import { createUseStyles } from 'react-jss';

import LoadingIndicator from '../LoadingIndicator';
import { NodeTypeTree } from './NodeTypeTree';
import {
    InvalidNodeTypes,
    NodeTypeCounter,
    NodeTypeExportButton,
    SearchBox,
    NodeTypeTreeFilter,
    Toolbar,
} from './index';
import Graph from './Graph';
import { Inspector } from '../Inspector';

const useStyles = createUseStyles({
    tabContentInner: {
        display: 'grid',
        height: 'inherit',
        gridGap: 'var(--spacing-Full)',
        gridTemplateAreas: `"left main right"`,
        gridTemplateColumns: 'var(--size-SidebarWidth) 1fr var(--size-SidebarWidth)',
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
});

const NodeTypeAnalysisTab: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.tabContentInner}>
            <LoadingIndicator />
            <div className={classes.left}>
                <NodeTypeTreeFilter />
                <SearchBox />
                <NodeTypeTree />
                <InvalidNodeTypes />
                <NodeTypeCounter />
                <NodeTypeExportButton />
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
};

export default React.memo(NodeTypeAnalysisTab);
