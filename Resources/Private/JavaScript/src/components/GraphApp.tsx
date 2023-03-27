import React from 'react';

import { Tabs } from '@neos-project/react-ui-components';

import { createUseAppStyles } from '../core';
import NodeTypeAnalysisTab from './NodeTypeAnalysis/NodeTypeAnalysisTab';
import NodeAnalysisTab from './NodeAnalysis/NodeAnalysisTab';

const useStyles = createUseAppStyles({
    app: {
        height: '100%',
        '& svg.neos-svg-inline--fa': {
            width: '14px',
            height: '14px',
            alignSelf: 'center',
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
