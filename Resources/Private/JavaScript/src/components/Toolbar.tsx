import * as React from 'react';

import Icon from '@neos-project/react-ui-components/lib-esm/Icon';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';
import Button from '@neos-project/react-ui-components/lib-esm/Button';
import Headline from '@neos-project/react-ui-components/lib-esm/Headline';
import SelectBox from '@neos-project/react-ui-components/lib-esm/SelectBox';

import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    toolbar: {
        width: '100%',
        display: 'flex',
        '.neos &': {
            marginBottom: theme.spacing.half
        }
    },
    group: {
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${theme.colors.contrastDark}`
    },
    headline: {
        '.neos &': {
            padding: `0 ${theme.spacing.half}`
        }
    },
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
    }
}));

export default function Toolbar() {
    const classes = useStyles();
    const { translate } = useIntl();
    const { selectedLayout, setSelectedLayout, selectedPath, setSelectedPath, setSelectedNodeTypeName } = useGraph();

    const selectableLayouts = [
        { label: 'Sunburst', value: 'sunburst' },
        { label: 'Dependencies', value: 'dependencies' }
    ];

    const handleSelectLayout = (layout: string) => {
        // TODO: Implement layout selection
        console.log(layout, 'select layout');
        setSelectedLayout(layout);
    };

    const handleHomeClick = () => {
        setSelectedPath('');
        setSelectedNodeTypeName('');
    };

    return (
        <div className={classes.toolbar}>
            <div className={classes.group}>
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
                    {selectedPath
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
                                        onClick={() =>
                                            setSelectedPath(
                                                selectedPath
                                                    .split('.')
                                                    .slice(0, index + 1)
                                                    .join('.')
                                            )
                                        }
                                    >
                                        {segment}
                                    </Button>
                                </li>
                            </React.Fragment>
                        ))}
                </ul>
            </div>

            <div className={classes.group}>
                <Headline type="h2" className={classes.headline}>
                    {translate('field.layout.label', 'Layout')}
                </Headline>
                <SelectBox
                    options={selectableLayouts}
                    onValueChange={layout => handleSelectLayout(layout)}
                    value={selectedLayout}
                />
            </div>
        </div>
    );
}
