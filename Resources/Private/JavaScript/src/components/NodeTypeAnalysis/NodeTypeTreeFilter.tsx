import React from 'react';
import { useRecoilState } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { FilterType } from '../../constants';
import { useIntl } from '../../core';
import { nodeTypeFilterState } from '../../state';

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

const NodeTypeTreeFilter: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [selectedFilter, setSelectedFilter] = useRecoilState(nodeTypeFilterState);

    const selectableFilters = [
        { label: 'All nodetypes', value: FilterType.NONE },
        { label: 'Usable nodetypes', value: FilterType.USABLE_NODETYPES },
        { label: 'Unused content', value: FilterType.UNUSED_CONTENT },
        { label: 'Unused documents', value: FilterType.UNUSED_DOCUMENTS },
    ];

    return (
        <div className={classes.group}>
            <Headline type="h2" className={classes.headline}>
                {translate('field.filter.label', 'Filter')}
            </Headline>
            <SelectBox
                options={selectableFilters}
                onValueChange={(filter) => setSelectedFilter(filter)}
                value={selectedFilter}
            />
        </div>
    );
};

export default React.memo(NodeTypeTreeFilter);
