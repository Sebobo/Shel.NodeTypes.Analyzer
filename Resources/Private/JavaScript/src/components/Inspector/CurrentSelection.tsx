import * as React from 'react';

import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';

import { Action, AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { useCallback } from 'react';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    currentSelection: {
        '.neos &': {
            marginBottom: theme.spacing.full,
        },
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit,
        },
    },
}));

const CurrentSelection = () => {
    const classes = useStyles();
    const { selectedNodeTypeName, selectedPath, nodeTypes, dispatch } = useGraph();
    const { translate } = useIntl();

    const selectedPathSegments = (
        selectedNodeTypeName ? nodePathHelper.resolveFromName(selectedNodeTypeName) : selectedPath
    ).split('.');
    const options = selectedPathSegments.map((pathSegment, index) => {
        return {
            value: selectedPathSegments.slice(0, index + 1).join('.'),
            label: pathSegment,
            icon: 'folder',
        };
    });

    const onSelect = useCallback((path) => {
        dispatch({ type: Action.SelectPath, payload: path });
    }, []);

    // If a nodetype is selected replace the last option with the selected nodetype
    if (selectedNodeTypeName) {
        options.pop();
        options.push({
            value: selectedNodeTypeName,
            label: nodePathHelper.resolveNameWithoutVendor(selectedNodeTypeName),
            icon: nodeTypes[selectedNodeTypeName].configuration.ui.icon || 'question',
        });
    }

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {translate('inspector.selection.label', 'Current selection')}
            </Headline>
            <SelectBox options={options} onValueChange={onSelect} value={selectedNodeTypeName || selectedPath} />
        </div>
    );
};
export default React.memo(CurrentSelection);
