import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useRecoilValue } from 'recoil';

import { ToggablePanel, Button } from '@neos-project/react-ui-components';

import { useGraph, useIntl } from '../../core';
import { nodeTypesState } from '../../state';
import NodeUsageModal from './NodeTypeUsage/NodeTypeUsageModal';

const useStyles = createUseStyles({
    usageCountByInheritance: {
        '.neos &': {
            marginTop: 'var(--spacing-Full)',
            '& table': {
                marginTop: 'var(--spacing-Half)',
                width: '100%',
                '& td': {
                    color: 'var(--textOnGray)',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--grayLight)',
                },
                '& td:last-child': {
                    textAlign: 'right',
                },
                '& tr:last-child td': {
                    border: 'none',
                },
                '& span': {
                    textOverflow: 'ellipsis',
                    whitespace: 'nowrap',
                    display: 'block',
                    lineHeight: 1.2,
                    width: '230px',
                    overflow: 'hidden',
                },
            },
        },
    },
    usageActions: {
        display: 'flex',
        gap: 'var(--spacing-Half)',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-Half)',
    },
});

const NodeSelection: React.FC = () => {
    const classes = useStyles();
    const { selectedNodeTypeName, endpoints } = useGraph();
    const nodeTypes = useRecoilValue(nodeTypesState);
    const { translate } = useIntl();
    const { usageCount, usageCountByInheritance, abstract, final } = nodeTypes[selectedNodeTypeName];
    const [showDetails, setShowDetails] = useState(true);
    const [showUsageLinks, setShowUsageLinks] = useState(false);

    const exportUsageLink = new URL(endpoints.exportNodeTypeUsage);
    exportUsageLink.searchParams.set('moduleArguments[nodeTypeName]', selectedNodeTypeName);

    return (
        <>
            <ToggablePanel onPanelToggle={() => setShowDetails(!showDetails)} isOpen={showDetails} style="condensed">
                <ToggablePanel.Header>{translate('inspector.usage.label', 'Details')}</ToggablePanel.Header>
                <ToggablePanel.Contents>
                    <div className={classes.details}>
                        {abstract && <p>{translate('inspector.usage.isAbstract', 'This is an abstract nodetype.')}</p>}
                        {final && <p>{translate('inspector.usage.isFinal', 'This is an final nodetype.')}</p>}
                        {usageCount > 0 && (
                            <>
                                <p>{translate('inspector.usage', `This nodetype is being used ${usageCount} times`)}</p>
                                <div className={classes.usageActions}>
                                    <Button onClick={() => setShowUsageLinks(true)} style="lighter" hoverStyle="brand">
                                        {translate('inspector.usage.show', 'Show usages')}
                                    </Button>
                                    <a href={exportUsageLink.toString()} download className="neos-button">
                                        {translate('inspector.usage.export', 'Export usages')}
                                    </a>
                                </div>
                            </>
                        )}
                        {usageCount == 0 && Object.keys(usageCountByInheritance).length == 0 && (
                            <p>{translate('inspector.usage.unused', 'Not directly used.')}</p>
                        )}
                    </div>
                    {Object.keys(usageCountByInheritance).length > 0 && (
                        <div className={classes.usageCountByInheritance}>
                            <p>
                                {translate(
                                    'inspector.usage.byInheritance',
                                    'This nodetype is being used by the following types via inheritance:'
                                )}
                            </p>
                            <table>
                                <tbody>
                                    {Object.keys(usageCountByInheritance)
                                        .sort()
                                        .map((subTypeName) => (
                                            <tr key={subTypeName}>
                                                <td>
                                                    <span title={subTypeName}>{subTypeName}</span>
                                                </td>
                                                <td>{usageCountByInheritance[subTypeName]}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ToggablePanel.Contents>
            </ToggablePanel>

            {showUsageLinks && <NodeUsageModal onClose={() => setShowUsageLinks(false)} />}
        </>
    );
};

export default React.memo(NodeSelection);
