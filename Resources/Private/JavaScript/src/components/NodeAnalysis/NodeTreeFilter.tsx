import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import {
    appInitializationState,
    contentDimensionsConfigurationState,
    contentDimensionsFilterState,
    nodesState,
    selectedNodeTreePath,
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
    const resetNodeTreePath = useResetRecoilState(selectedNodeTreePath);
    const [selectedWorkspace, setSelectedWorkspace] = useRecoilState(workspaceFilterState);
    const workspaces = useRecoilValue(workspacesState);
    const contentDimensionsConfiguration = useRecoilValue(contentDimensionsConfigurationState);
    const [selectedContentDimensions, setSelectedContentDimensions] = useRecoilState(contentDimensionsFilterState);
    const setInitialized = useSetRecoilState(appInitializationState);

    const onChangeWorkspace = useCallback(async (workspaceName: string) => {
        setInitialized(false);
        resetNodeTreePath();
        resetNodes();
        setSelectedWorkspace(workspaceName);
        await fetchNodes().then(() => setInitialized(true));
    }, []);

    const onChangeContentDimensions = useCallback(async (dimension: string, value: string) => {
        setInitialized(false);
        setSelectedContentDimensions((prev) => ({
            ...prev,
            [dimension]: value,
        }));
        resetNodeTreePath();
        resetNodes();
        await fetchNodes().then(() => setInitialized(true));
    }, []);

    return (
        <>
            <div className={classes.group}>
                <Headline type="h2" className={classes.headline}>
                    {translate('field.filter.label', 'Workspace')}
                </Headline>
                <SelectBox options={workspaces} onValueChange={onChangeWorkspace} value={selectedWorkspace} />
            </div>
            {Object.keys(contentDimensionsConfiguration).length > 0 && (
                <div className={classes.group}>
                    {Object.keys(contentDimensionsConfiguration).map((dimension) => {
                        const options = Object.keys(contentDimensionsConfiguration[dimension].presets).map((preset) => {
                            return {
                                label: contentDimensionsConfiguration[dimension].presets[preset].label,
                                value: preset,
                            };
                        });
                        return (
                            <React.Fragment key={dimension}>
                                <Headline type="h2" className={classes.headline}>
                                    {contentDimensionsConfiguration[dimension].label || dimension}
                                </Headline>
                                <SelectBox
                                    options={options}
                                    onValueChange={(value: string) => onChangeContentDimensions(dimension, value)}
                                    value={
                                        selectedContentDimensions[dimension] ??
                                        contentDimensionsConfiguration[dimension].default
                                    }
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default React.memo(NodeTreeFilter);
