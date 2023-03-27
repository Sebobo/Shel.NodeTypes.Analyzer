import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useIntl } from '../../core';
import nodePathHelper from '../../helpers/nodePathHelper';
import { nodeTypesState } from '../../state';

interface NodePathProfileProps {
    nodePath: string;
}

const NodePathProfile: React.FC<NodePathProfileProps> = ({ nodePath }) => {
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();

    const nodeTypeCount = useMemo(() => {
        if (!nodePath) {
            return Object.keys(nodeTypes).length;
        }
        return Object.keys(nodeTypes).filter(
            (nodeTypeName) => nodePathHelper.resolveFromName(nodeTypeName).indexOf(nodePath + '.') === 0
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
