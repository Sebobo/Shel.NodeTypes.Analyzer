import * as React from 'react';
import { useMemo } from 'react';

import { useGraph, useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';

interface NodePathProfileProps {
    nodePath: string;
}

const NodePathProfile = ({ nodePath }: NodePathProfileProps) => {
    const { nodeTypes } = useGraph();
    const { translate } = useIntl();

    const nodeTypeCount = useMemo(() => {
        if (!nodePath) {
            return Object.keys(nodeTypes).length;
        }
        return Object.keys(nodeTypes).filter(
            nodeTypeName => nodePathHelper.resolveFromName(nodeTypeName).indexOf(nodePath + '.') === 0
        ).length;
    }, [nodeTypes, nodePath]);

    return (
        <div>
            <div>
                {nodeTypeCount} {translate('nodePathProfile.nodeTypeCount', 'Nodetypes in this namespace')}
            </div>
        </div>
    );
};

export default React.memo(NodePathProfile);
