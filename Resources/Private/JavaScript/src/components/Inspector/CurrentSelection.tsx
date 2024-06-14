import React, { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { Action, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { nodeTypesState } from '../../state';

const useStyles = createUseStyles({
    currentSelection: {
        '.neos &': {
            marginBottom: 'var(--spacing-Full)',
        },
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: 'var(--spacing-GoldenUnit)',
        },
    },
});

const CurrentSelection: React.FC = () => {
    const classes = useStyles();
    const { selectedNodeTypeName, selectedPath, dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
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
            icon: nodeTypes[selectedNodeTypeName].icon || 'question',
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
