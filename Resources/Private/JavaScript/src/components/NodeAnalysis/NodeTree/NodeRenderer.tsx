import React from 'react';
import { useRecoilValue } from 'recoil';

import { nodesState, selectedNodeTreePath } from '../../../state';
import { createUseAppStyles } from '../../../core';
import { PropertyList, PropertyListItem } from '../../Presentationals';
import SelectedNodeBreadcrumb from './SelectedNodeBreadcrumb';

const useStyles = createUseAppStyles({
    Section: {
        '.neos &': {
            marginTop: '1rem',
        },
    },
});

const NodeRenderer: React.FC = () => {
    const classes = useStyles();
    const selectedNodePath = useRecoilValue(selectedNodeTreePath);
    const nodes = useRecoilValue(nodesState);

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
