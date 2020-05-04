import * as React from 'react';

import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';
import Button from '@neos-project/react-ui-components/lib-esm/Button';

import { AppTheme, createUseAppStyles, useGraph } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    breadcrumb: {
        listStyleType: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: 'row',
        '& li': {
            '& button': {
                lineHeight: 1
            }
        }
    },
    text: {
        '.neos &': {
            padding: `0 ${theme.spacing.half}`,
            '& svg': {
                verticalAlign: 'bottom',
                marginRight: theme.spacing.quarter
            }
        }
    }
}));

export default function Breadcrumb() {
    const classes = useStyles();
    const { nodeTypes, selectedNodeTypeName, selectedPath, setSelectedPath, setSelectedNodeTypeName } = useGraph();

    const selectedNodeType = selectedNodeTypeName ? nodeTypes[selectedNodeTypeName] : null;
    const selectedNodePath = selectedNodeTypeName.replace(':', '.').split('.');
    const selectedNodeTypeLastSegment = selectedNodePath?.pop() || '';

    const currentPath = selectedPath || selectedNodePath.join('.') || '';

    const handleHomeClick = () => {
        setSelectedPath('');
        setSelectedNodeTypeName('');
    };

    const handleSegmentClick = (index: number) => {
        const newPath = currentPath
            .split('.')
            .slice(0, index + 1)
            .join('.');
        setSelectedPath(newPath);
    };

    return (
        <ul className={classes.breadcrumb}>
            <li>
                <IconButton
                    icon="home"
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={() => handleHomeClick()}
                />
            </li>
            {currentPath
                .split('.')
                .filter(segment => segment)
                .map((segment, index) => (
                    <React.Fragment key={index}>
                        <li>
                            <Icon icon="chevron-right" />
                        </li>
                        <li>
                            <Button
                                size="small"
                                style="transparent"
                                hoverStyle="brand"
                                onClick={() => handleSegmentClick(index)}
                            >
                                {segment}
                            </Button>
                        </li>
                    </React.Fragment>
                ))}
            {selectedNodeType && (
                <React.Fragment>
                    <li>
                        <Icon icon="chevron-right" />
                    </li>
                    <li className={classes.text}>
                        <Icon icon={selectedNodeType.configuration.ui.icon} /> {selectedNodeTypeLastSegment}
                    </li>
                </React.Fragment>
            )}
        </ul>
    );
}
