import React from 'react';
import { useRecoilState } from 'recoil';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { AppTheme, createUseAppStyles, useIntl } from '../../core';
import { workspaceFilterState } from '../../state';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${theme.colors.contrastDark}`,
    },
    headline: {
        '.neos &': {
            padding: `0 ${theme.spacing.half}`,
        },
    },
}));

const NodeTreeFilter: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [selectedFilter, setSelectedFilter] = useRecoilState(workspaceFilterState);

    // TODO: Retrieve workspace list
    const workspaceOptions = [{ label: 'Live', value: 'live' }];

    return (
        <div className={classes.group}>
            <Headline type="h2" className={classes.headline}>
                {translate('field.filter.label', 'Workspace')}
            </Headline>
            <SelectBox
                options={workspaceOptions}
                onValueChange={(filter) => setSelectedFilter(filter)}
                value={selectedFilter}
            />
        </div>
    );
};

export default React.memo(NodeTreeFilter);
