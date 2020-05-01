import * as React from 'react';
import { useState } from 'react';
import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';
import ToggablePanel from '@neos-project/react-ui-components/lib-esm/ToggablePanel';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';
import { PropertyList, PropertyListItem } from './index';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypeProfile: {},
    nodeTypeConfigurationCard: {},
    currentSelection: {
        '.neos &': {
            marginBottom: theme.spacing.full
        }
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit
        }
    },
    childNodesList: {
        '.neos &': {
            paddingLeft: theme.spacing.half
        }
    }
}));

export default function NodeTypeProfile() {
    const classes = useStyles({});
    const { selectedNodeTypeName, nodeTypes } = useGraph();
    const { translate } = useIntl();
    const { name, configuration, allowedChildNodeTypes, usageCount } = nodeTypes[selectedNodeTypeName];
    const { properties, superTypes, childNodes } = configuration;

    const [showDetails, setShowDetails] = useState(true);
    const [showProperties, setShowProperties] = useState(false);
    const [showSupertypes, setShowSupertypes] = useState(false);
    const [showAllowedChildNodes, setShowAllowedChildNodes] = useState(false);
    const [showAllowedGrandChildNodes, setShowAllowedGrandChildNodes] = useState(false);

    return (
        <div className={classes.nodeTypeProfile}>
            <div className={classes.currentSelection}>
                <Headline type="h2" className={classes.headline}>
                    Selected NodeType
                </Headline>
                <SelectBox
                    options={[{ value: name, label: name, icon: configuration.ui?.icon || 'question' }]}
                    onValueChange={() => null}
                    value={name}
                />
            </div>

            {selectedNodeTypeName && (
                <>
                    <ToggablePanel
                        onPanelToggle={() => setShowDetails(!showDetails)}
                        isOpen={showDetails}
                        style="condensed"
                    >
                        <ToggablePanel.Header>Details</ToggablePanel.Header>
                        <ToggablePanel.Contents>
                            <p>
                                This nodetype is being used <strong>{usageCount}</strong> times
                            </p>
                        </ToggablePanel.Contents>
                    </ToggablePanel>

                    <ToggablePanel
                        onPanelToggle={() => setShowProperties(!showProperties)}
                        isOpen={showProperties}
                        style="condensed"
                    >
                        <ToggablePanel.Header>Properties</ToggablePanel.Header>
                        <ToggablePanel.Contents>
                            {properties ? (
                                showProperties && (
                                    <PropertyList>
                                        {Object.keys(properties).map(propName => (
                                            <PropertyListItem
                                                key={propName}
                                                label={propName}
                                                value={properties[propName].type}
                                            />
                                        ))}
                                    </PropertyList>
                                )
                            ) : (
                                <span>No properties defined</span>
                            )}
                        </ToggablePanel.Contents>
                    </ToggablePanel>

                    <ToggablePanel
                        onPanelToggle={() => setShowSupertypes(!showSupertypes)}
                        isOpen={showSupertypes}
                        style="condensed"
                    >
                        <ToggablePanel.Header>
                            Supertypes ({superTypes ? Object.keys(superTypes).length : 0})
                        </ToggablePanel.Header>
                        <ToggablePanel.Contents>
                            {superTypes ? (
                                showSupertypes && (
                                    <PropertyList>
                                        {Object.keys(superTypes).map(superTypeName => (
                                            <PropertyListItem
                                                key={superTypeName}
                                                label={superTypeName}
                                                value={translate(
                                                    nodeTypes[superTypeName].configuration.ui?.label,
                                                    superTypeName
                                                )}
                                            />
                                        ))}
                                    </PropertyList>
                                )
                            ) : (
                                <span>No supertypes defined</span>
                            )}
                        </ToggablePanel.Contents>
                    </ToggablePanel>

                    <ToggablePanel
                        onPanelToggle={() => setShowAllowedChildNodes(!showAllowedChildNodes)}
                        isOpen={showAllowedChildNodes}
                        style="condensed"
                    >
                        <ToggablePanel.Header>
                            Allowed child node types ({allowedChildNodeTypes?.length || 0})
                        </ToggablePanel.Header>
                        <ToggablePanel.Contents>
                            {allowedChildNodeTypes?.length > 0 ? (
                                showAllowedChildNodes && (
                                    <PropertyList>
                                        {allowedChildNodeTypes.map(nodeTypeName => (
                                            <PropertyListItem
                                                key={nodeTypeName}
                                                label={nodeTypeName}
                                                value={translate(
                                                    nodeTypes[nodeTypeName].configuration.ui?.label,
                                                    nodeTypeName
                                                )}
                                            />
                                        ))}
                                    </PropertyList>
                                )
                            ) : (
                                <span>No childnodes allowed</span>
                            )}
                        </ToggablePanel.Contents>
                    </ToggablePanel>

                    <ToggablePanel
                        onPanelToggle={() => setShowAllowedGrandChildNodes(!showAllowedGrandChildNodes)}
                        isOpen={showAllowedGrandChildNodes}
                        style="condensed"
                    >
                        <ToggablePanel.Header>
                            Allowed grandchild node types ({childNodes?.length || 0})
                        </ToggablePanel.Header>
                        <ToggablePanel.Contents>
                            {childNodes ? (
                                showAllowedGrandChildNodes && (
                                    <ul className={classes.childNodesList}>
                                        {Object.keys(childNodes).map(childNodeName => (
                                            <li key={childNodeName}>
                                                <em>{childNodeName}</em>
                                                <ul>
                                                    {childNodes[childNodeName].constraints?.nodeTypes &&
                                                        Object.keys(
                                                            childNodes[childNodeName].constraints.nodeTypes
                                                        ).map((nodeTypeName, index) => (
                                                            <li key={index}>
                                                                {nodeTypeName}:{' '}
                                                                {childNodes[childNodeName].constraints.nodeTypes[
                                                                    nodeTypeName
                                                                ]
                                                                    ? 'true'
                                                                    : 'false'}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <span>No childnodes allowed</span>
                            )}
                        </ToggablePanel.Contents>
                    </ToggablePanel>
                </>
            )}
        </div>
    );
}
