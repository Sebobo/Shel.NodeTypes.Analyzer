import * as React from 'react';
import { createContext, useContext } from 'react';
import { I18nRegistry } from '../interfaces';

interface ProviderProps extends I18nRegistry {
    children: React.ReactElement;
}

interface ProviderValues extends I18nRegistry {
    translate: (id: string, fallback: string, args?: any[], packageKey?: string, source?: string) => string;
}

export const IntlContext = createContext(null);
export const useIntl = (): ProviderValues => useContext(IntlContext);

export function IntlProvider({ children, translate }: ProviderProps) {
    return <IntlContext.Provider value={{ translate }}>{children}</IntlContext.Provider>;
}
