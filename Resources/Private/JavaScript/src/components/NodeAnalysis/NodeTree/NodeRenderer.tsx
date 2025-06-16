import React from 'react';
import { useRecoilValue } from 'recoil';
import { createUseStyles } from 'react-jss';

import { nodesState, selectedNodeIdentifierState } from '../../../state';
import { PropertyList, PropertyListItem } from '../../Presentationals';
import SelectedNodeBreadcrumb from './SelectedNodeBreadcrumb';

const useStyles = createUseStyles({
    Section: {
        '.neos &': {
            marginTop: '1rem',
        },
    },
});

const NodeRenderer: React.FC = () => {
    const classes = useStyles();
    const selectedNodeIdentifier = useRecoilValue(selectedNodeIdentifierState);
    const nodes = useRecoilValue(nodesState);

    const selectedNode = nodes[selectedNodeIdentifier];

    return selectedNode ? (
        <div>
            <SelectedNodeBreadcrumb />
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
