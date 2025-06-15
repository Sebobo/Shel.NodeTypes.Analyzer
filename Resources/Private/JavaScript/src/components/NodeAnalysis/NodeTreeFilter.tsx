import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import {
    appInitializationState,
    nodesState,
    selectedNodeIdentifierState,
    workspaceFilterState,
    workspacesState,
} from '../../state';

const useStyles = createUseStyles({
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--grayLight)',
    },
    headline: {
        '.neos &': {
            padding: '0 var(--spacing-Half)',
        },
    },
});

const NodeTreeFilter: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { fetchNodes } = useGraph();
    const resetNodes = useResetRecoilState(nodesState);
    const resetSelectedNodeIdentifier = useResetRecoilState(selectedNodeIdentifierState);
    const [selectedWorkspace, setSelectedWorkspace] = useRecoilState(workspaceFilterState);
    const workspaces = useRecoilValue(workspacesState);
    const setInitialized = useSetRecoilState(appInitializationState);

    const onChangeWorkspace = useCallback(async (workspaceName: string) => {
        setInitialized(false);
        resetSelectedNodeIdentifier();
        resetNodes();
        setSelectedWorkspace(workspaceName);
        await fetchNodes('', workspaceName).then(() => setInitialized(true));
    }, []);

    return (
        <div className={classes.group}>
            <Headline type="h2" className={classes.headline}>
                {translate('field.filter.label', 'Workspace')}
            </Headline>
            <SelectBox options={workspaces} onValueChange={onChangeWorkspace} value={selectedWorkspace} />
        </div>
    );
};

export default React.memo(NodeTreeFilter);
