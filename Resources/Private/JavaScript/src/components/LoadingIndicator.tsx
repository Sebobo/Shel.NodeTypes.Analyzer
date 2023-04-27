import React from 'react';
import { createUseStyles } from 'react-jss';
import { useRecoilValue } from 'recoil';

import { loadingState } from '../state';

const useStyles = createUseStyles({
    '@keyframes cssloadWidth': {
        '0%, 100%': {
            transitionTimingFunction: 'cubic-bezier(1, 0, .65, .85)',
        },
        '0%': {
            width: 0,
        },
        '100%': {
            width: '100%',
        },
    },
    loadingIndicator: {
        left: 0,
        top: 0,
        height: '2px',
        position: 'fixed',
        width: '100vw',
        zIndex: 11000,
    },
    indicator: {
        height: '2px',
        position: 'relative',
        width: '100%',
    },
    bar: {
        height: '100%',
        position: 'relative',
        backgroundColor: 'var(--warning)',
        animation: '$cssloadWidth 2s cubic-bezier(.45, 0, 1, 1) infinite',
    },
});

const LoadingIndicator = () => {
    const classes = useStyles();
    const isLoading = useRecoilValue(loadingState);

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
};
export default React.memo(LoadingIndicator);
