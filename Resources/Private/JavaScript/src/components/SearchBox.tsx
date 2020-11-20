import * as React from 'react';
import { useRecoilState } from 'recoil';

import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';

import { Action, AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';
import { NodeTypeConfigurations } from '../interfaces';
import nodePathHelper from '../helpers/nodePathHelper';
import { searchTermState } from '../atoms';
import { ReactElement } from 'react';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    searchBox: {
        borderTop: 0,
        display: 'flex'
    },
    dropdown: {
        '.neos & input[type="search"]': {
            backgroundColor: theme.colors.contrastNeutral,
            border: 0,
            '&:focus': {
                border: 0
            }
        }
    }
}));

function getOptionsForTerm(nodeTypes: NodeTypeConfigurations, searchTerm: string) {
    return Object.keys(nodeTypes)
        .filter(nodeTypeName => nodeTypeName.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0)
        .map(nodeTypeName => {
            return {
                label: nodeTypeName,
                value: nodeTypeName,
                group: nodePathHelper.resolveGroup(nodeTypeName)
            };
        });
}

const SearchBox = (): ReactElement => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { nodeTypes, dispatch } = useGraph();
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
                onValueChange={value => onValueChange(value)}
                onSearchTermChange={value => setSearchTerm(value)}
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
