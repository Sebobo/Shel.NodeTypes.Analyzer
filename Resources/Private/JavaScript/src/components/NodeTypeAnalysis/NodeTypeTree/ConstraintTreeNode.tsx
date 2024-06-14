import React from 'react';
import { useRecoilValue } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import { dndTypes } from '../../../constants';
import { nodeTypesState } from '../../../state';

interface ConstraintTreeNodeProps {
    name: string;
    value?: boolean;
    level?: number;
    icon?: string;
}

const ConstraintTreeNode: React.FC<ConstraintTreeNodeProps> = ({ name, value = true, level = 1, icon = 'child' }) => {
    const nodeTypes = useRecoilValue(nodeTypesState);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={false}
                isCollapsed={true}
                isFocused={false}
                isLoading={false}
                hasError={!value}
                label={name}
                title={name}
                icon={nodeTypes[name]?.icon || icon}
                nodeDndType={dndTypes.NODE_TYPE}
                level={level}
                hasChildren={false}
            />
        </Tree.Node>
    );
};

export default React.memo(ConstraintTreeNode);
