import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import memoize from 'lodash.memoize';
import { setConfig } from 'react-hot-loader';
import { RecoilRoot } from 'recoil';
import Modal from 'react-modal';

import { DebuggerModule } from './components';
import { GraphProvider, IntlProvider, AppThemeProvider, NotifyProvider } from './core';

setConfig({
    showReactDomPatchNotification: false
});

// const withDragDropContext = DragDropContext(HTML5Backend);
// declare const module: any;
// const GraphAppWithDnd = withDragDropContext(hot(module)(GraphApp));

const loadPlugin = async (): Promise<void> => {
    while (!(window.Typo3Neos || window.NeosCMS)?.I18n?.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    const NeosApi = window.Typo3Neos || window.NeosCMS;
    const graphAppContainer: HTMLElement = document.getElementById('graphAppContainer');

    if (!graphAppContainer) {
        return;
    }

    Modal.setAppElement(graphAppContainer);

    const { endpoints, csrfToken } = JSON.parse(graphAppContainer.dataset.app);
    const { I18n, Notification } = NeosApi;

    const translate = memoize(
        (id, value = null, args = [], packageKey = 'Shel.ContentRepository.Debugger', source = 'Main') => {
            return I18n.translate(id, value, packageKey, source, args);
        }
    );

    ReactDOM.render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <AppThemeProvider>
                    <RecoilRoot>
                        <GraphProvider endpoints={endpoints} csrfToken={csrfToken}>
                            <DndProvider backend={HTML5Backend}>
                                <DebuggerModule />
                            </DndProvider>
                        </GraphProvider>
                    </RecoilRoot>
                </AppThemeProvider>
            </NotifyProvider>
        </IntlProvider>,
        graphAppContainer
    );
};
window.addEventListener('load', loadPlugin, false);
