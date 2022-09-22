import { useRecoilValue } from 'recoil';
import * as React from 'react';

import { selectedNodeTreePath } from '../../atoms';
import { AppTheme, createUseAppStyles, useGraph } from '../../core';
import { SelectedNodeBreadcrumb } from './index';
import { PropertyList, PropertyListItem } from '../Presentationals';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    Section: {
        '.neos &': {
            marginTop: '1rem',
        },
    },
}));

const NodeRenderer: React.FC = () => {
    const classes = useStyles();
    const selectedNodePath = useRecoilValue(selectedNodeTreePath);
    const { nodes } = useGraph();

    const selectedNode = nodes[selectedNodePath];

    return selectedNode ? (
        <div>
            <SelectedNodeBreadcrumb />
            <div className={classes.Section}>
                <h3>Details</h3>
                <br />
                <PropertyList>
                    <PropertyListItem label="Label" value={selectedNode.label} />
                    <PropertyListItem label="Path" value={selectedNode.path} />
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
