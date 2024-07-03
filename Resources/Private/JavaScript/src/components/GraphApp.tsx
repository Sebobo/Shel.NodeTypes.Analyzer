import React from 'react';
import { createUseStyles } from 'react-jss';

import { Tabs } from '@neos-project/react-ui-components';

import NodeTypeAnalysisTab from './NodeTypeAnalysis/NodeTypeAnalysisTab';
import NodeAnalysisTab from './NodeAnalysis/NodeAnalysisTab';

const useStyles = createUseStyles({
    app: {
        height: '100%',
        '& svg.neos-svg-inline--fa': {
            width: '14px',
            height: '14px',
            alignSelf: 'center',
        },
        /* Scrollbar styles for appContainer, its siblings (needed for React portals) and also for contentcanvas' body */
        '& ::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
        },
        '& ::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
        },
        '& ::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--colors-ContrastBright)',
        },
        '& ::-webkit-scrollbar-corner': {
            backgroundColor: 'var(--colors-ContrastDark)',
        },
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
});

const GraphApp: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.app}>
            <Tabs theme={{ tabs__content: classes.tabContent, tabs__panel: classes.tabPanel }}>
                <Tabs.Panel icon="sitemap">
                    <NodeTypeAnalysisTab />
                </Tabs.Panel>
                <Tabs.Panel icon="tree">
                    <NodeAnalysisTab />
                </Tabs.Panel>
            </Tabs>
        </div>
    );
};
export default React.memo(GraphApp);
