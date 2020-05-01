import * as React from 'react';
import { createTheming, createUseStyles } from 'react-jss';
import { config } from '@neos-project/build-essentials/src/styles/styleConstants';

const ThemeContext = React.createContext({} as AppTheme);
const theming = createTheming(ThemeContext);
const { ThemeProvider } = theming;

export interface AppTheme {
    spacing: {
        goldenUnit: string;
        full: string;
        half: string;
        quarter: string;
    };
    size: {
        sidebarWidth: string;
    };
    transition: {
        fast: string;
        default: string;
        slow: string;
    };
    fontSize: {
        base: string;
        small: string;
    };
    fonts: {
        headings: {
            family: string;
            style: string;
            cssWeight: string;
        };
        copy: {
            family: string;
            style: string;
            cssWeight: string;
        };
    };
    colors: {
        primaryViolet: string;
        primaryVioletHover: string;
        primaryBlue: string;
        primaryBlueHover: string;
        contrastDarkest: string;
        contrastDarker: string;
        contrastDark: string;
        contrastNeutral: string;
        contrastBright: string;
        contrastBrighter: string;
        contrastBrightest: string;
        success: string;
        successHover: string;
        warn: string;
        warnHover: string;
        error: string;
        errorHover: string;
        uncheckedCheckboxTick: string;
    };
}

export const createUseAppStyles = styles => createUseStyles<AppTheme>(styles, { theming } as object);

export function AppThemeProvider({ children }: { children: React.ReactElement }) {
    return <ThemeProvider theme={config}>{children}</ThemeProvider>;
}
