import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { SelectBox } from '@neos-project/react-ui-components';

import { Action, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { nodeTypeFilterState, nodeTypesState, searchTermState, hiddenNodeTypesState } from '../../state';
import { nodeTypeFilterState, nodeTypesState, searchTermState } from '../../state';
import nodeTypeMatchesFilter from '../../helpers/nodeTypeFilter';
import { FilterType } from '../../constants';

const useStyles = createUseStyles({
    searchBox: {
        borderTop: 0,
        display: 'flex',
        '& svg': {
            alignSelf: 'center',
        },
    },
    dropdown: {
        '.neos & input[type="search"]': {
            backgroundColor: 'var(--grayMedium)',
            border: 0,
            '&:focus': {
                border: 0,
            },
        },
    },
});

function getOptionsForTerm(nodeTypes: NodeTypeConfigurations, searchTerm: string, nodeTypeFilter: FilterType, hiddenNodeTypes: string[]) {
function getOptionsForTerm(nodeTypes: NodeTypeConfigurations, searchTerm: string, nodeTypeFilter: FilterType) {
    return Object.keys(nodeTypes)
        .filter((nodeTypeName) => {
            return (
                (!searchTerm || nodeTypeName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) &&
                nodeTypeMatchesFilter(nodeTypes[nodeTypeName], nodeTypeFilter) &&
                (searchTerm !== '' || !hiddenNodeTypes.includes(nodeTypeName))
                nodeTypeMatchesFilter(nodeTypes[nodeTypeName], nodeTypeFilter)
            );
        })
        .map((nodeTypeName) => {
            const groupName = nodePathHelper.resolveGroup(nodeTypeName);
            const nodeTypeLabel = nodeTypes[nodeTypeName].label;
            const shortNodeTypeName =
                nodeTypeName.replace(groupName + ':', '') + (nodeTypeLabel ? ' (' + nodeTypeLabel + ')' : '');
            return {
                label: shortNodeTypeName,
                value: nodeTypeName,
                group: groupName,
            };
        });
}

const SearchBox: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const selectedFilter = useRecoilValue(nodeTypeFilterState);
    const hiddenNodeTypes = useRecoilValue(hiddenNodeTypesState);
    const options = getOptionsForTerm(nodeTypes, searchTerm, selectedFilter, hiddenNodeTypes);
    const nodeTypes = useRecoilValue(nodeTypesState);
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const selectedFilter = useRecoilValue(nodeTypeFilterState);
    const options = getOptionsForTerm(nodeTypes, searchTerm, selectedFilter);

    const onValueChange = (nodeTypeName: NodeTypeName) => {
        setSearchTerm(nodeTypeName);
        dispatch({ type: Action.SelectNodeType, payload: nodeTypeName });
    };

    return (
        <div className={classes.searchBox}>
            <SelectBox
                className={classes.dropdown}
                searchTerm={searchTerm}
                displaySearchBox={true}
                options={options}
                value={searchTerm}
                onValueChange={(value) => onValueChange(value)}
                onSearchTermChange={(value) => setSearchTerm(value)}
                searchBoxLeftToTypeLabel={translate(
                    'searchBox.enterMoreLetters',
                    'Enter more characters to get results'
                )}
                showDropDownToggle={false}
                noMatchesFoundLabel={translate('searchBox.noMatchesFound', 'No matches found')}
                placeholder={translate('searchBox.placeholder', 'Search for a nodetype')}
            />
        </div>
    );
};
export default React.memo(SearchBox);
