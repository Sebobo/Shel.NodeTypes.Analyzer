import React, { useCallback } from 'react';
import { createUseStyles } from 'react-jss';

import { Headline, SelectBox, IconButton } from '@neos-project/react-ui-components';

import { Action, useGraph, useIntl } from '../../core';
import { chartType } from '../../constants';
import { NodeTypeBreadcrumb } from './NodeTypeTree';

const useStyles = createUseStyles({
    toolbar: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '.neos &': {
            marginBottom: 'var(--spacing-Half)',
        },
    },
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
        border: '1px solid var(--grayLight)',
    },
    headline: {
        '.neos &': {
            padding: '0 var(--spacing-Half)',
        },
    },
});

const Toolbar: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { selectedLayout, dispatch, fetchGraphData } = useGraph();

    const selectableLayouts = [
        { label: 'Hierarchy', value: chartType.SUNBURST },
        { label: 'Dependencies', value: chartType.DEPENDENCIES },
    ];

    const handleReloadClick = useCallback(() => {
        dispatch({ type: Action.Reset });
        void fetchGraphData();
    }, []);

    return (
        <div className={classes.toolbar}>
            <div className={classes.group}>
                <IconButton
                    icon="sync"
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    title={translate('action.reloadGraphData.title', 'Reload data')}
                    onClick={handleReloadClick}
                />
            </div>

            <div className={classes.group}>
                <NodeTypeBreadcrumb />
            </div>

            <div className={classes.group}>
                <Headline type="h2" className={classes.headline}>
                    {translate('field.layout.label', 'Layout')}
                </Headline>
                <SelectBox
                    options={selectableLayouts}
                    onValueChange={(layout) => dispatch({ type: Action.SelectLayout, payload: layout })}
                    value={selectedLayout}
                />
            </div>
        </div>
    );
};
export default React.memo(Toolbar);
