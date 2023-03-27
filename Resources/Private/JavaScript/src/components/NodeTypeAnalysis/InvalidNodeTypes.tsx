import React from 'react';
import { useRecoilValue } from 'recoil';

import { Headline } from '@neos-project/react-ui-components';

import { AppTheme, createUseAppStyles } from '../../core';
import { invalidNodeTypesState } from '../../state';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    invalidNodeTypesList: {
        '.neos &': {
            '& ul': {
                paddingLeft: theme.spacing.full,
            },
            '& li': {
                listStyleType: 'disc',
            },
        },
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit,
        },
    },
}));

const InvalidNodeTypes: React.FC = () => {
    const classes = useStyles();
    const invalidNodeTypes = useRecoilValue(invalidNodeTypesState);

    return Object.keys(invalidNodeTypes).length > 0 ? (
        <div className={classes.invalidNodeTypesList}>
            <Headline type="h2" className={classes.headline}>
                Invalid nodetypes
            </Headline>
            <ul>
                {Object.keys(invalidNodeTypes).map((nodeTypeName) => (
                    <li key={nodeTypeName}>{nodeTypeName}</li>
                ))}
            </ul>
        </div>
    ) : (
        <></>
    );
};

export default React.memo(InvalidNodeTypes);
