import * as React from 'react';
import { createContext, useContext } from 'react';

import { Notify } from '../interfaces';

interface ProviderProps {
    notificationApi: Notify;
    children: React.ReactElement;
}

export const NotifyContext = createContext(null);
export const useNotify = (): Notify => useContext(NotifyContext);

export function NotifyProvider({ children, notificationApi }: ProviderProps) {
    const error = (title: string, message = '') => notificationApi['error'](title, message);
    const warning = (title: string, message = '') => notificationApi['warning'](title, message);
    const ok = (title: string) => notificationApi['ok'](title);
    const info = (title: string) => notificationApi['info'](title);
    const notice = (title: string) => notificationApi['notice'](title);

    return <NotifyContext.Provider value={{ notice, error, ok, info, warning }}>{children}</NotifyContext.Provider>;
}
