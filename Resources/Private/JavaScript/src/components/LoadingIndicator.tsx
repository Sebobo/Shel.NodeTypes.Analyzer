import * as React from 'react';

import { AppTheme, createUseAppStyles, useGraph } from '../core';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    '@keyframes cssloadWidth': {
        '0%, 100%': {
            transitionTimingFunction: 'cubic-bezier(1, 0, .65, .85)'
        },
        '0%': {
            width: 0
        },
        '100%': {
            width: '100%'
        }
    },
    loadingIndicator: {
        left: 0,
        top: 0,
        height: '2px',
        position: 'fixed',
        width: '100vw',
        zIndex: 11000
    },
    indicator: {
        height: '2px',
        position: 'relative',
        width: '100%'
    },
    bar: {
        height: '100%',
        position: 'relative',
        backgroundColor: theme.colors.warn,
        animation: '$cssloadWidth 2s cubic-bezier(.45, 0, 1, 1) infinite'
    }
}));

export default function LoadingIndicator() {
    const classes = useStyles();
    const { isLoading } = useGraph();

    return (
        <>
            {isLoading && (
                <div className={classes.loadingIndicator}>
                    <div className={classes.indicator}>
                        <div className={classes.bar} />
                    </div>
                </div>
            )}
        </>
    );
}
