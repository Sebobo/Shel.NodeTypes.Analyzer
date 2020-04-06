import * as React from 'react';
import { createContext, useContext } from 'react';

import { Notify } from '../interfaces';

interface ProviderProps extends Notify {
    children: React.ReactElement;
}

export const NotifyContext = createContext(null);
export const useNotify = (): Notify => useContext(NotifyContext);

export function NotifyProvider({ children, ...notify }: ProviderProps) {
    return <NotifyContext.Provider value={{ ...notify }}>{children}</NotifyContext.Provider>;
}
