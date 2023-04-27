import React from 'react';
import { createUseStyles } from 'react-jss';

import LoadingIndicator from '../LoadingIndicator';
import { Inspector } from '../Inspector';
import { NodeRenderer, NodeTree } from './NodeTree';
import { NodeTreeFilter } from './index';

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
