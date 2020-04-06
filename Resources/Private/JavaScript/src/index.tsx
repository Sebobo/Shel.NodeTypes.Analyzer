import * as React from 'react';
import * as ReactDOM from 'react-dom';

import GraphApp from './components/GraphApp';
import { GraphProvider, IntlProvider } from './core';
import { NotifyProvider } from './core';

const loadPlugin = async (): Promise<void> => {
    const NeosApi = window.Typo3Neos;

    while (!NeosApi || !NeosApi.I18n.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    const graphAppContainer: HTMLElement = document.getElementById('graphAppContainer');
    const graphSvgWrapper: HTMLElement = document.getElementById('graphSvgWrapper');

    if (!graphAppContainer) {
        return;
    }

    const { csrfToken, actions, selectableLayouts } = JSON.parse(graphAppContainer.dataset.app);
    const { I18n, Notification } = NeosApi;

    const translate = (
        id,
        value = null,
        args = [],
        packageKey = 'Shel.ContentRepository.Debugger',
        source = 'Main'
    ) => {
        return I18n.translate(id, value, packageKey, source, args);
    };

    ReactDOM.render(
        <IntlProvider translate={translate}>
            <NotifyProvider {...Notification}>
                <GraphProvider
                    csrfToken={csrfToken}
                    selectableLayouts={selectableLayouts}
                    graphSvgWrapper={graphSvgWrapper}
                    actions={actions}
                >
                    <GraphApp />
                </GraphProvider>
            </NotifyProvider>
        </IntlProvider>,
        graphAppContainer
    );
};
window.addEventListener('load', loadPlugin, false);
