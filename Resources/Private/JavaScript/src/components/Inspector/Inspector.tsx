import React from 'react';

import { AppTheme, createUseAppStyles, useGraph } from '../../core';
import { NodeTypeProfile, NodePathProfile, CurrentSelection } from './index';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    inspector: {
        flex: `0 1 ${theme.size.sidebarWidth}`,
    },
}));

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
