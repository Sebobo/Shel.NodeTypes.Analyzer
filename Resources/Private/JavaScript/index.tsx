import * as React from 'react';
import * as ReactDOM from 'react-dom';
import GraphApp from './components/GraphApp';
import { GraphProvider } from './providers/GraphProvider';
import NeosNotification from './interfaces/NeosNotification';
import NeosI18n from './interfaces/NeosI18n';

declare global {
    interface Window {
        Typo3Neos: {
            I18n: NeosI18n;
            Notification: NeosNotification;
        };
    }
}

const loadPlugin = async (): Promise<void> => {
    while (!window.Typo3Neos || !window.Typo3Neos.I18n.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    const graphAppContainer: HTMLElement = document.getElementById('graphAppContainer');
    const graphSvgWrapper: HTMLElement = document.getElementById('graphSvgWrapper');

    if (!graphAppContainer) {
        return;
    }

    const { csrfToken, actions, selectableLayouts } = JSON.parse(graphAppContainer.dataset.app);
    const { I18n, Notification } = window.Typo3Neos;

    const translate = (id: string, label: string = '', args: any[] = []): string => {
        return I18n.translate(id, label, 'ONEANDONE.RedirectWorkspaceReferences', 'Modules', args);
    };

    ReactDOM.render(
        <GraphProvider
            graphContext={{
                csrfToken,
                translate,
                selectableLayouts,
                notificationHelper: Notification,
                graphSvgWrapper,
                actions,
            }}
        >
            <GraphApp />
        </GraphProvider>,
        graphAppContainer,
    );
};
window.addEventListener('load', loadPlugin, false);
