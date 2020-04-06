import * as React from 'react';
import NodeTypeConfiguration from '../interfaces/NodeTypeConfiguration';
import { createUseStyles } from 'react-jss';
import { useState } from 'react';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';

const useStyles = createUseStyles({
    nodeTypeProfile: {
        '.neos &': {
            marginTop: '2rem'
        }
    },
    profileHeader: {
        '.neos &': {
            fontSize: '110%',
            lineHeight: '1.5'
        }
    },
    nodeTypeConfigurationCard: {
        '.neos &': {
            border: '1px solid gray',
            borderRadius: '.3rem',
            margin: '1rem 0',
            lineHeight: '1.5',
            overflowX: 'auto',
            '& li': {
                padding: '.3rem .5rem',
                listStyleType: 'none',
                borderBottom: '1px solid #444'
            },
            '& span': {
                padding: '.5rem 1rem'
            }
        }
    },
    header: {
        '.neos &': {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '.5rem 1rem',
            background: 'gray'
        }
    }
});

export default function NodeTypeProfile({
    nodeTypeName,
    nodeTypeConfiguration
}: {
    nodeTypeName: string;
    nodeTypeConfiguration: NodeTypeConfiguration;
}) {
    const classes = useStyles({});
    const { properties, superTypes, allowedChildNodeTypes, childNodes } = nodeTypeConfiguration;

    const [showProperties, setShowProperties] = useState(true);
    const [showSupertypes, setShowSupertypes] = useState(false);
    const [showAllowedChildNodes, setShowAllowedChildNodes] = useState(false);
    const [showAllowedGrandChildNodes, setShowAllowedGrandChildNodes] = useState(false);

    return (
        <div className={classes.nodeTypeProfile}>
            <h3 className={classes.profileHeader}>
                Selected: <em>{nodeTypeName}</em>
            </h3>
            <section className={classes.nodeTypeConfigurationCard}>
                <header className={classes.header} onClick={() => setShowProperties(!showProperties)}>
                    Properties
                </header>
                {properties ? (
                    showProperties ? (
                        <ul>
                            {Object.keys(properties).map(propName => {
                                return (
                                    <li key={propName}>
                                        {propName}: <i>{properties[propName].type}</i>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        ''
                    )
                ) : (
                    <span>No properties defined</span>
                )}
            </section>
            <section className={classes.nodeTypeConfigurationCard}>
                <header className={classes.header} onClick={() => setShowSupertypes(!showSupertypes)}>
                    Supertypes
                </header>
                {superTypes ? (
                    showSupertypes ? (
                        <ul>
                            {Object.keys(superTypes).map(superTypeName => (
                                <li key={superTypeName}>{superTypeName}</li>
                            ))}
                        </ul>
                    ) : (
                        ''
                    )
                ) : (
                    <span>No supertypes defined</span>
                )}
            </section>
            <section className={classes.nodeTypeConfigurationCard}>
                <header className={classes.header} onClick={() => setShowAllowedChildNodes(!showAllowedChildNodes)}>
                    Allowed child node types ({allowedChildNodeTypes.length}){' '}
                    <Icon icon={showAllowedChildNodes ? 'caret-down' : 'caret-left'} />
                </header>
                {allowedChildNodeTypes.length ? (
                    showAllowedChildNodes ? (
                        <ul>
                            {allowedChildNodeTypes.map((nodeTypeName, index) => (
                                <li key={index}>{nodeTypeName}</li>
                            ))}
                        </ul>
                    ) : (
                        ''
                    )
                ) : (
                    <span>No childnodes allowed</span>
                )}
            </section>
            <section className={classes.nodeTypeConfigurationCard}>
                <header
                    className={classes.header}
                    onClick={() => setShowAllowedGrandChildNodes(!showAllowedGrandChildNodes)}
                >
                    Allowed grandchild node types
                </header>
                {childNodes ? (
                    showAllowedGrandChildNodes ? (
                        <ul>
                            {Object.keys(childNodes).map(childNodeName => (
                                <li key={childNodeName}>
                                    <em>{childNodeName}</em>
                                    <ul>
                                        {childNodes[childNodeName].allowedChildNodeTypes.map((nodeTypeName, index) => (
                                            <li key={index}>{nodeTypeName}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        ''
                    )
                ) : (
                    <span>No childnodes allowed</span>
                )}
            </section>
        </div>
    );
}
