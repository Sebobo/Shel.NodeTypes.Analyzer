import * as React from 'react';

import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    currentSelection: {
        '.neos &': {
            marginBottom: theme.spacing.full
        }
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit
        }
    }
}));

export default function NodeSelection() {
    const classes = useStyles();
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { configuration } = nodeTypes[selectedNodeTypeName];

    return (
        <div className={classes.currentSelection}>
            <Headline type="h2" className={classes.headline}>
                {translate('inspector.selection.label', 'Selected NodeType')}
            </Headline>
            <SelectBox
                options={[
                    {
                        value: selectedNodeTypeName,
                        label: nodePathHelper.resolveNameWithoutVendor(selectedNodeTypeName),
                        icon: configuration.ui?.icon || 'question'
                    }
                ]}
                onValueChange={() => null}
                value={selectedNodeTypeName}
            />
        </div>
    );
}
