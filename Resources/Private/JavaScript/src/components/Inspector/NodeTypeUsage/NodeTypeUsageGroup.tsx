import React, { useState } from 'react';
import { Icon } from '@neos-project/react-ui-components';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    groupRow: {
        '& td': {
            backgroundColor: 'var(--grayLight) !important',
        }
    }
});

type NodeTypeUsageGroupProps = {
    nodeTypeUsageLinks: NodeTypeUsageLink[];
    showDimensions: boolean;
};

const NodeTypeUsageGroup: React.FC<NodeTypeUsageGroupProps> = ({ nodeTypeUsageLinks, showDimensions }) => {
    const classes = useStyles();
    const [uncollapsed, setUncollapsed] = useState(false);
    const groupLabel = nodeTypeUsageLinks[0].documentTitle;
    const groupIdentifier = nodeTypeUsageLinks[0].documentIdentifier;

    return (
        <>
            <tr className={classes.groupRow}>
                <td colSpan={showDimensions ? 4 : 3} style={{ cursor: 'pointer' }} onClick={() => setUncollapsed((prev) => !prev)}>
                    <Icon icon={uncollapsed ? 'caret-up' : 'caret-down'} />{' '}
                    <span>{nodeTypeUsageLinks.length} usages on page <strong>"{groupLabel}"</strong></span>
                </td>
                <td colSpan={3}>{groupIdentifier}</td>
            </tr>
            {uncollapsed && nodeTypeUsageLinks.map((link, index) => (
                <tr key={index}>
                    <td>{link.title}</td>
                    <td>
                        {link.url ? (
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.breadcrumb.join(' / ')}
                            </a>
                        ) : (
                            link.breadcrumb.join(' / ')
                        )}
                    </td>
                    <td>{link.workspace}</td>
                    {showDimensions && <td>
                        {Object.keys(link.dimensions).map(
                            (dimensionName) =>
                                dimensionName + ': ' + link.dimensions[dimensionName].join(', ')
                        )}
                    </td>}
                    <td>{link.nodeIdentifier}</td>
                    <td>{link.hidden ? 'Yes' : 'No'}</td>
                    <td>{link.onHiddenPage ? 'Yes' : 'No'}</td>
                </tr>
            ))}
        </>
    );
};

export default NodeTypeUsageGroup;
