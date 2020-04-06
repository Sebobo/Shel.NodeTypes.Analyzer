interface NeosI18n {
    translate: (id: string, fallback: string, packageKey: string, source: string, args: any[]) => string;
    initialized: boolean;
}

interface NeosNotification {
    notice: (title: string) => void;
    ok: (title: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string) => void;
}

interface Window {
    Typo3Neos: {
        I18n: NeosI18n;
        Notification: NeosNotification;
    };
}
