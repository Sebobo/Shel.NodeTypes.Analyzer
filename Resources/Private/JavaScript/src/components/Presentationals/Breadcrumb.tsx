import React from 'react';
import { createUseStyles } from 'react-jss';

import { Icon, IconButton, Button } from '@neos-project/react-ui-components';

const useStyles = createUseStyles({
    breadcrumb: {
        listStyleType: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: 'row',
        '& li': {
            '& button': {
                lineHeight: 1,
            },
        },
    },
    text: {
        '.neos &': {
            padding: '0 var(--spacing-Half)',
            '& svg': {
                verticalAlign: 'bottom',
                marginRight: 'var(--spacing-Quarter)',
            },
        },
    },
});

type BreadcrumbProps = {
    handleHomeClick: () => void;
    handleSegmentClick: (index: number) => void;
    parts: string[];
    currentIcon?: string;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ handleHomeClick, handleSegmentClick, parts, currentIcon }) => {
    const classes = useStyles();

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
            {parts.slice(1, -1).map((part, index) => (
                <React.Fragment key={index}>
                    <li>
                        <Icon icon="chevron-right" />
                    </li>
                    <li>
                        <Button
                            size="small"
                            style="transparent"
                            hoverStyle="brand"
                            onClick={() => handleSegmentClick(index + 1)}
                        >
                            {part}
                        </Button>
                    </li>
                </React.Fragment>
            ))}
            {parts.length > 1 && (
                <React.Fragment>
                    <li>
                        <Icon icon="chevron-right" />
                    </li>
                    <li className={classes.text}>
                        {currentIcon && <Icon icon={currentIcon} />}
                        {parts[parts.length - 1]}
                    </li>
                </React.Fragment>
            )}
        </ul>
    );
};

export default React.memo(Breadcrumb);
