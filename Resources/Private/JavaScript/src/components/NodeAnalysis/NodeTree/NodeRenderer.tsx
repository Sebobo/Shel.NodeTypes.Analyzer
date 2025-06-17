import React, { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { IconButton } from '@neos-project/react-ui-components';

import { nodesState, selectedNodeIdentifierState, workspaceFilterState } from '../../../state';
import { PropertyList, PropertyListItem } from '../../Presentationals';
import SelectedNodeBreadcrumb from './SelectedNodeBreadcrumb';
import { useGraph, useIntl } from '../../../core';

const useStyles = createUseStyles({
    Section: {
        '.neos &': {
            marginTop: '1rem',
        },
    },
    toolbar: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        '.neos &': {
            marginBottom: 'var(--spacing-Half)',
        },
    },
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
        border: '1px solid var(--grayLight)',
    },
});

const NodeRenderer: React.FC = () => {
    const classes = useStyles();
    const selectedNodeIdentifier = useRecoilValue(selectedNodeIdentifierState);
    const nodes = useRecoilValue(nodesState);
    const workspaceFilter = useRecoilValue(workspaceFilterState);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchNodes } = useGraph();
    const { translate } = useIntl();

    const selectedNode = nodes[selectedNodeIdentifier];

    const handleReloadClick = useCallback(() => {
        fetchNodes(selectedNodeIdentifier, workspaceFilter).then((nodes) => {
            console.info(`Reloaded ${Object.keys(nodes).length} child nodes for`, selectedNodeIdentifier, nodes);
            setIsLoading(false);
        });
    }, [selectedNodeIdentifier, workspaceFilter]);

    return selectedNode ? (
        <div>
            <div className={classes.toolbar}>
                <div className={classes.group}>
                    <SelectedNodeBreadcrumb />
                </div>

                <div className={classes.group}>
                    <IconButton
                        icon="sync"
                        size="small"
                        style="transparent"
                        hoverStyle="brand"
                        title={translate('action.reloadGraphData.title', 'Reload data')}
                        onClick={handleReloadClick}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={classes.Section}>
                <h3>Details</h3>
                <br />
                <PropertyList>
                    <PropertyListItem label="Label" value={selectedNode.label} />
                    <PropertyListItem label="Identifier" value={selectedNode.identifier} />
                    {selectedNode.removed && <PropertyListItem label="Removed" />}
                    {selectedNode.hidden && <PropertyListItem label="Hidden" />}
                </PropertyList>
            </div>
            {Object.keys(selectedNode.properties).length > 0 && (
                <div className={classes.Section}>
                    <h3>Properties:</h3>
                    <br />
                    <PropertyList>
                        {Object.keys(selectedNode.properties)
                            .sort()
                            .map((propName) => (
                                <PropertyListItem
                                    key={propName}
                                    label={propName}
                                    value={selectedNode.properties[propName]}
                                />
                            ))}
                    </PropertyList>
                </div>
            )}
        </div>
    ) : (
        <div>Please select a valid node</div>
    );
};

export default React.memo(NodeRenderer);
