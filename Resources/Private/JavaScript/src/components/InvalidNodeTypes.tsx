import * as React from 'react';

import Headline from '@neos-project/react-ui-components/lib-esm/Headline';

import { AppTheme, createUseAppStyles, useGraph } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    invalidNodeTypesList: {
        '.neos &': {
            '& ul': {
                paddingLeft: theme.spacing.full
            },
            '& li': {
                listStyleType: 'disc'
            }
        }
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit
        }
    }
}));

const InvalidNodeTypes = () => {
    const classes = useStyles();
    const { invalidNodeTypes } = useGraph();

    return Object.keys(invalidNodeTypes).length > 0 ? (
        <div className={classes.invalidNodeTypesList}>
            <Headline type="h2" className={classes.headline}>
                Invalid nodetypes
            </Headline>
            <ul>
                {Object.keys(invalidNodeTypes).map(nodeTypeName => (
                    <li key={nodeTypeName}>{nodeTypeName}</li>
                ))}
            </ul>
        </div>
    ) : (
        <></>
    );
};

export default React.memo(InvalidNodeTypes);
