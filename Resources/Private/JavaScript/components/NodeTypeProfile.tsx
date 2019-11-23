import * as React from 'react';
import NodeTypeConfiguration from '../interfaces/NodeTypeConfiguration';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    nodeTypeProfile: {
        '.neos &': {
            border: '1px solid gray',
            borderRadius: '.3rem',
            padding: '.5rem 1rem',
            margin: '2rem 0',
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
    const { properties } = nodeTypeConfiguration;
    return (
        <div className={classes.nodeTypeProfile}>
            Selected: <strong>{nodeTypeName}</strong>
            <ul>
                {properties &&
                    Object.keys(properties).map(propName => {
                        return (
                            <li key={propName}>
                                {propName} -> {properties[propName].type}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
