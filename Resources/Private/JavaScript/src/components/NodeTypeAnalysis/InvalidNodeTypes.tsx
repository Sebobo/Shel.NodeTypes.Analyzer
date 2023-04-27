import React from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { Headline } from '@neos-project/react-ui-components';

import { invalidNodeTypesState } from '../../state';

const useStyles = createUseStyles({
    invalidNodeTypesList: {
        '.neos &': {
            '& ul': {
                paddingLeft: 'var(--spacing-Full)',
            },
            '& li': {
                listStyleType: 'disc',
            },
        },
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: 'var(--spacing-GoldenUnit)',
        },
    },
});

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
