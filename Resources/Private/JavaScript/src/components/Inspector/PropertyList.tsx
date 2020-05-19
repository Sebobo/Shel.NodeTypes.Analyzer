import * as React from 'react';

import { AppTheme, createUseAppStyles } from '../../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    propertyList: {
        maxHeight: '50vh',
        overflow: 'auto'
    },
    propertyListItem: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    term: {
        extend: 'propertyListItem',
        backgroundColor: props => (props?.highlighted ? theme.colors.primaryViolet : theme.colors.contrastNeutral),
        fontWeight: 'bold',
        color: 'white',
        '.neos &': {
            padding: `${theme.spacing.half} ${theme.spacing.half} 0`
        }
    },
    description: {
        extend: 'propertyListItem',
        backgroundColor: props => (props?.highlighted ? theme.colors.primaryViolet : theme.colors.contrastNeutral),
        lineHeight: '1.3',
        color: theme.colors.contrastBright,
        '.neos &': {
            marginBottom: '1px',
            padding: theme.spacing.half
        }
    }
}));

interface PropertyListProps {
    children: React.ReactElement[];
}

export function PropertyList({ children }: PropertyListProps) {
    const classes = useStyles();

    return <dl className={classes.propertyList}>{children}</dl>;
}

interface PropertyListItemProps {
    label: string;
    value: string;
    highlighted?: boolean;
}

export function PropertyListItem({ label, value, highlighted = false }: PropertyListItemProps) {
    const classes = useStyles({ highlighted });

    return (
        <>
            <dt className={classes.term}>{label}</dt>
            <dd className={classes.description}>{value}</dd>
        </>
    );
}
