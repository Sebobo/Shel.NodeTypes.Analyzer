import React, { useState } from 'react';
import { Icon } from '@neos-project/react-ui-components';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    groupRow: {
        '& td': {
            backgroundColor: 'var(--grayLight) !important',
        },
    },
    groupLabel: {
        fontWeight: 'bold',
    },
});

type NodeTypeUsageGroupProps = {
    nodeTypeUsageLinks: NodeTypeUsageLink[];
    showDimensions: boolean;
};

const NodeTypeUsageGroup: React.FC<NodeTypeUsageGroupProps> = ({ nodeTypeUsageLinks, showDimensions }) => {
    const classes = useStyles();
    const [collapsed, setCollapsed] = useState(true);
    const groupLabel = nodeTypeUsageLinks[0].documentTitle;
    const groupIdentifier = nodeTypeUsageLinks[0].documentIdentifier;
    const groupDocumentIsHidden = nodeTypeUsageLinks.every((link) => link.onHiddenPage);

    return (
        <>
            <tr className={classes.groupRow}>
                <td
                    colSpan={showDimensions ? 4 : 3}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCollapsed((prev) => !prev)}
                >
                    <Icon icon={collapsed ? 'caret-right' : 'caret-down'} />{' '}
                    <span>
                        {nodeTypeUsageLinks.length} usages on page{' '}
                        <strong className={classes.groupLabel}>{groupLabel}</strong>
                    </span>
                </td>
                <td colSpan={2}>{groupIdentifier}</td>
                <td>{groupDocumentIsHidden ? 'Yes' : 'No'}</td>
            </tr>
            {!collapsed &&
                nodeTypeUsageLinks.map((link, index) => (
                    <tr key={index}>
                        <td>
                            {link.url ? (
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    {link.title}
                                </a>
                            ) : (
                                link.title
                            )}
                        </td>
                        <td>{link.breadcrumb.join(' / ') || '-'}</td>
                        <td>{link.workspace}</td>
                        {showDimensions && (
                            <td>
                                {Object.keys(link.dimensions).map((dimensionName, index) => {
                                    let dimensionItem =
                                        dimensionName + ': ' + link.dimensions[dimensionName].join(', ');
                                    if (index < Object.keys(link.dimensions).length - 1) {
                                        dimensionItem += ' | ';
                                    }
                                    return dimensionItem;
                                })}
                            </td>
                        )}
                        <td>{link.nodeIdentifier}</td>
                        <td>{link.hidden ? 'Yes' : 'No'}</td>
                        <td>{link.onHiddenPage ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
        </>
    );
};

export default NodeTypeUsageGroup;
