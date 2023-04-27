import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Modal from 'react-modal';
import { RecoilRoot } from 'recoil';

import GraphApp from './components/GraphApp';
import { GraphProvider, IntlProvider, AppThemeProvider, NotifyProvider } from './core';

// const withDragDropContext = DragDropContext(HTML5Backend);
// declare const module: any;
// const GraphAppWithDnd = withDragDropContext(hot(module)(GraphApp));

function initializeApp() {
    console.info('[NodeTypes.Analyzer] Initializing');
    const graphAppContainer: HTMLElement = document.getElementById('graphAppContainer');

    if (!graphAppContainer) {
        console.error('[NodeTypes.Analyzer] No app container found');
        return;
    }

    Modal.setAppElement(graphAppContainer);

    const { endpoints } = JSON.parse(graphAppContainer.dataset.app);
    const { I18n, Notification } = window.NeosCMS;

    const translate = (
        id,
        value = null,
        args: Record<string, string | number> | any[] = {},
        packageKey = 'Shel.NodeTypes.Analyzer',
        source = 'Main'
    ) => {
        return I18n.translate(id, value, packageKey, source, args);
    };

    const root = ReactDOMClient.createRoot(graphAppContainer);
    root.render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <AppThemeProvider>
                    <RecoilRoot>
                        <GraphProvider endpoints={endpoints}>
                            <DndProvider backend={HTML5Backend}>
                                <GraphApp />
                            </DndProvider>
                        </GraphProvider>
                    </RecoilRoot>
                </AppThemeProvider>
            </NotifyProvider>
        </IntlProvider>
    );
    console.info('[NodeTypes.Analyzer] Initialized');
}

console.info('API', window.NeosCMS?.I18n);
if (window.NeosCMS?.I18n) {
    initializeApp();
} else {
    window.addEventListener('neoscms-i18n-initialized', initializeApp);
}
