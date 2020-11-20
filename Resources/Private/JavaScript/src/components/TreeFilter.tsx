import * as React from 'react';
import { useRecoilState } from 'recoil';

import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';

import { FilterType } from '../constants';
import { AppTheme, createUseAppStyles, useIntl } from '../core';
import { filterTypeState } from '../atoms';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${theme.colors.contrastDark}`
    },
    headline: {
        '.neos &': {
            padding: `0 ${theme.spacing.half}`
        }
    }
}));

const TreeFilter = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [selectedFilter, setSelectedFilter] = useRecoilState(filterTypeState);

    const selectableFilters = [
        { label: 'None', value: FilterType.NONE },
        { label: 'Unused content', value: FilterType.UNUSED_CONTENT },
        { label: 'Unused documents', value: FilterType.UNUSED_DOCUMENTS }
    ];

    return (
        <div className={classes.group}>
            <Headline type="h2" className={classes.headline}>
                {translate('field.filter.label', 'Filter')}
            </Headline>
            <SelectBox
                options={selectableFilters}
                onValueChange={filter => setSelectedFilter(filter)}
                value={selectedFilter}
            />
        </div>
    );
};

export default React.memo(TreeFilter);
