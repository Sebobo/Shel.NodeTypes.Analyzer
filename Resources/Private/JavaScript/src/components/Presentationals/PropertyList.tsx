import React from 'react';

import { Icon } from '@neos-project/react-ui-components';

import { AppTheme, createUseAppStyles } from '../../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    propertyList: {
        overflow: 'auto',
    },
    propertyListItem: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    term: {
        extend: 'propertyListItem',
        backgroundColor: (props) => (props?.highlighted ? theme.colors.primaryViolet : theme.colors.contrastNeutral),
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        '.neos &': {
            padding: `${theme.spacing.half} ${theme.spacing.half} 0`,
            '& svg': {
                color: theme.colors.warn,
            },
        },
    },
    description: {
        extend: 'propertyListItem',
        backgroundColor: (props) => (props?.highlighted ? theme.colors.primaryViolet : theme.colors.contrastNeutral),
        lineHeight: '1.3',
        color: theme.colors.contrastBright,
        '.neos &': {
            marginBottom: '1px',
            padding: theme.spacing.half,
        },
    },
}));

interface PropertyListProps {
    children: React.ReactElement[];
}

export const PropertyList: React.FC<PropertyListProps> = ({ children }) => {
    const classes = useStyles();

    return <dl className={classes.propertyList}>{children}</dl>;
};

interface PropertyListItemProps {
    label: string;
    value?: string;
    highlighted?: boolean;
    icon?: string;
    title?: string;
}

export const PropertyListItem: React.FC<PropertyListItemProps> = ({
    label,
    value = null,
    icon = null,
    title = null,
    highlighted = false,
}) => {
    const classes = useStyles({ highlighted });

    return (
        <>
            <dt className={classes.term} title={title}>
                {label} {icon && <Icon icon={icon} />}
            </dt>
            <dd className={classes.description}>{value}</dd>
        </>
    );
};
