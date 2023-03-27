import React from 'react';
import { createTheming, createUseStyles } from 'react-jss';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { config as neosConfig } from '@neos-project/build-essentials/src/styles/styleConstants';

// Import all fontawesome icons as the node-types config allow using all of them
library.add(fas, far, fab);
config.autoAddCss = false; // Dont insert the supporting CSS into the <head> of the HTML document

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createUseAppStyles = (styles) =>
    createUseStyles<any, any, AppTheme>(styles, { theming } as Record<string, unknown>);

export const AppThemeProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => (
    <ThemeProvider theme={neosConfig}>{children}</ThemeProvider>
);
