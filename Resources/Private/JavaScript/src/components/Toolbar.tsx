import * as React from 'react';
import { useCallback } from 'react';

import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';

import { Action, AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';
import { chartType } from '../constants';
import { SelectedNodeBreadcrumb } from './NodeTypeTree';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    toolbar: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '.neos &': {
            marginBottom: theme.spacing.half,
        },
    },
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
        border: `1px solid ${theme.colors.contrastDark}`,
    },
    headline: {
        '.neos &': {
            padding: `0 ${theme.spacing.half}`,
        },
    },
}));

const Toolbar = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { selectedLayout, dispatch, fetchGraphData } = useGraph();

    const selectableLayouts = [
        { label: 'Hierarchy', value: chartType.SUNBURST },
        { label: 'Dependencies', value: chartType.DEPENDENCIES },
    ];

    const handleReloadClick = useCallback(() => {
        dispatch({ type: Action.Reset });
        fetchGraphData();
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
                <SelectedNodeBreadcrumb />
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
