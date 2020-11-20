import * as React from 'react';
import { createContext, ReactElement, useContext } from 'react';
import { I18nRegistry } from '../interfaces';

interface ProviderProps extends I18nRegistry {
    children: React.ReactElement;
}

interface ProviderValues extends I18nRegistry {
    translate: (
        id: string,
        fallback: string,
        params?: Record<string, string | number>,
        packageKey?: string,
        source?: string
    ) => string;
}

export const IntlContext = createContext(null);
export const useIntl = (): ProviderValues => useContext(IntlContext);

export const IntlProvider = ({ children, translate }: ProviderProps): ReactElement => (
    <IntlContext.Provider value={{ translate }}>{children}</IntlContext.Provider>
);
