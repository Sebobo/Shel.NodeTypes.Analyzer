import React from 'react';
import { createUseStyles } from 'react-jss';

import { useGraph } from '../../core';
import { NodeTypeProfile, NodePathProfile, CurrentSelection } from './index';

const useStyles = createUseStyles({
    inspector: {
        flex: '0 1 var(--size-SidebarWidth)',
    },
});

const Inspector: React.FC = () => {
    const classes = useStyles();
    const { selectedNodeTypeName, selectedPath } = useGraph();

    return (
        <div className={classes.inspector}>
            <CurrentSelection />
            {selectedNodeTypeName ? <NodeTypeProfile /> : <NodePathProfile nodePath={selectedPath} />}
        </div>
    );
};
export default React.memo(Inspector);
