import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { SelectBox } from '@neos-project/react-ui-components';

import { Action, useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { nodeTypesState, searchTermState } from '../../state';

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

function getOptionsForTerm(nodeTypes: NodeTypeConfigurations, searchTerm: string) {
    return Object.keys(nodeTypes)
        .filter((nodeTypeName) => nodeTypeName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0)
        .map((nodeTypeName) => {
            return {
                label: nodeTypeName,
                value: nodeTypeName,
                group: nodePathHelper.resolveGroup(nodeTypeName),
            };
        });
}

const SearchBox: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { dispatch } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const options = searchTerm ? getOptionsForTerm(nodeTypes, searchTerm) : [];

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
