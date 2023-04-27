import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { DndProvider, DndProviderProps } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Modal from 'react-modal';
import { RecoilRoot } from 'recoil';

// Import all fontawesome icons for the icon component and nodetypes can use any of them
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, fab, far);

import GraphApp from './components/GraphApp';
import { GraphProvider, IntlProvider, NotifyProvider } from './core';

// const withDragDropContext = DragDropContext(HTML5Backend);
// declare const module: any;
// const GraphAppWithDnd = withDragDropContext(hot(module)(GraphApp));

function initializeApp() {
    console.info('[NodeTypes.Analyzer] Initializing');
    const graphAppContainer: HTMLElement = document.getElementById('graphAppContainer');

    if (!graphAppContainer) {
        throw new Error('[NodeTypes.Analyzer] No app container found');
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

    const ModifiedDndProvider = DndProvider as React.FC<{ children: React.ReactElement } & DndProviderProps<any, any>>;

    const root = ReactDOMClient.createRoot(graphAppContainer);
    root.render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <RecoilRoot>
                    <GraphProvider endpoints={endpoints}>
                        <ModifiedDndProvider backend={HTML5Backend}>
                            <GraphApp />
                        </ModifiedDndProvider>
                    </GraphProvider>
                </RecoilRoot>
            </NotifyProvider>
        </IntlProvider>
    );
    console.info('[NodeTypes.Analyzer] Initialized');
}

if (window.NeosCMS?.I18n) {
    initializeApp();
} else {
    window.addEventListener('neoscms-i18n-initialized', initializeApp);
}
