import * as React from 'react';

import { AppTheme, createUseAppStyles } from '../../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    propertyList: {
        '.neos &': {
            '& dt, & dd': {
                backgroundColor: theme.colors.contrastNeutral,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            '& dt': {
                fontWeight: 'bold',
                color: 'white',
                padding: `${theme.spacing.half} ${theme.spacing.half} 0`
            },
            '& dd': {
                backgroundColor: theme.colors.contrastNeutral,
                marginBottom: '1px',
                padding: theme.spacing.half,
                lineHeight: '1.3',
                color: theme.colors.contrastBright
            }
        }
    }
}));

interface PropertyListProps {
    children: React.ReactElement[];
}

interface PropertyListItemProps {
    label: string;
    value: string;
}

export function PropertyList({ children }: PropertyListProps) {
    const classes = useStyles();

    return <dl className={classes.propertyList}>{children}</dl>;
}

export function PropertyListItem({ label, value }: PropertyListItemProps) {
    return (
        <>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </>
    );
}
