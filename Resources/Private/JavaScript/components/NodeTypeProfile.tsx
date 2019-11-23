import * as React from 'react';
import NodeTypeConfiguration from '../interfaces/NodeTypeConfiguration';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    nodeTypeProfile: {
        '.neos &': {
            marginTop: '2rem',
        },
    },
    profileHeader: {
        '.neos &': {
            fontSize: '110%',
            lineHeight: '1.5',
        },
    },
    nodeTypeConfigurationCard: {
        '.neos &': {
            border: '1px solid gray',
            borderRadius: '.3rem',
            padding: '.5rem 1rem',
            margin: '1rem 0',
            lineHeight: '1.5',
            '& ul': {
                paddingLeft: '1.2rem',
            },
            '& li': {
                listStyleType: 'disc',
            },
        },
    },
});

export default function NodeTypeProfile({
    nodeTypeName,
    nodeTypeConfiguration,
}: {
    nodeTypeName: string;
    nodeTypeConfiguration: NodeTypeConfiguration;
}) {
    const classes = useStyles({});
    const { properties, superTypes } = nodeTypeConfiguration;
    return (
        <div className={classes.nodeTypeProfile}>
            <h3 className={classes.profileHeader}>
                Selected: <em>{nodeTypeName}</em>
            </h3>
            <div className={classes.nodeTypeConfigurationCard}>
                Properties:
                <ul>
                    {properties &&
                        Object.keys(properties).map(propName => {
                            return (
                                <li key={propName}>
                                    {propName}: {properties[propName].type}
                                </li>
                            );
                        })}
                </ul>
            </div>
            <div className={classes.nodeTypeConfigurationCard}>
                Supertypes:
                <ul>
                    {superTypes &&
                        Object.keys(superTypes).map(superTypeName => {
                            return <li key={superTypeName}>{superTypeName}</li>;
                        })}
                </ul>
            </div>
        </div>
    );
}
