import React from 'react';
import { createUseStyles } from 'react-jss';

import { Icon } from '@neos-project/react-ui-components';

const useStyles = createUseStyles({
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
        backgroundColor: 'var(--grayMedium)',
        fontWeight: 'bold',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        '.neos &': {
            padding: `var(--spacing-Half) var(--spacing-Half) 0`,
            '& svg': {
                color: 'var(--warning)',
            },
        },
    },
    description: {
        extend: 'propertyListItem',
        backgroundColor: 'var(--grayMedium)',
        lineHeight: '1.3',
        color: '#999',
        '.neos &': {
            marginBottom: '1px',
            padding: 'var(--spacing-Half)',
        },
    },
    highlighted: {
        backgroundColor: '#26224c',
    },
});

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
    const classes = useStyles();

    return (
        <>
            <dt className={[classes.term, highlighted ? classes.highlighted : ''].join(' ')} title={title}>
                {label} {icon && <Icon icon={icon} />}
            </dt>
            <dd className={[classes.description, highlighted ? classes.highlighted : ''].join(' ')}>{value}</dd>
        </>
    );
};
