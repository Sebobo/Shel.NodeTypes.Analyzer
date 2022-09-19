import * as React from 'react';
import { ReactElement } from 'react';

import Tabs from '@neos-project/react-ui-components/lib-esm/Tabs';

import {
    Toolbar,
    Inspector,
    Graph,
    TreeFilter,
    InvalidNodeTypes,
    LoadingIndicator,
    SearchBox,
    NodeTypeCounter,
    NodeTypeExportButton,
} from './index';
import { AppTheme, createUseAppStyles } from '../core';
import { NodeTypeTree } from './NodeTypeTree';
import { NodeRenderer, NodeTree } from './NodeTree';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    app: {
        height: '100%',
        '& svg.neos-svg-inline--fa': {
            width: '14px',
            height: '14px',
            alignSelf: 'center',
        },
    },
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
    tabPanel: {
        height: '100%',
        '& > div': {
            height: 'inherit',
        },
    },
    tabContent: {
        height: 'calc(100% - 42px)',
    },
}));

const GraphApp: React.FC = (): ReactElement => {
    const classes = useStyles();

    return (
        <div className={classes.app}>
            <Tabs theme={{ tabs__content: classes.tabContent, tabs__panel: classes.tabPanel }}>
                <Tabs.Panel icon="sitemap">
                    <div className={classes.tabContentInner}>
                        <LoadingIndicator />
                        <div className={classes.left}>
                            <TreeFilter />
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
                </Tabs.Panel>
                <Tabs.Panel icon="tree">
                    <div className={classes.tabContentInner}>
                        <LoadingIndicator />
                        <div className={classes.left}>
                            <NodeTree />
                        </div>
                        <div className={classes.main}>
                            <NodeRenderer />
                        </div>
                        <div className={classes.right}>
                            <Inspector />
                        </div>
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
};
export default React.memo(GraphApp);
