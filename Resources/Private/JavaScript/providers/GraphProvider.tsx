import * as React from 'react';
import { useContext, createContext, useState, Dispatch, SetStateAction } from 'react';
import Actions from '../interfaces/Actions';
import NeosNotification from '../interfaces/NeosNotification';

export interface GraphContextInterface {
    csrfToken: string;
    actions: Actions;
    graphSvgWrapper: HTMLElement;
    selectableLayouts: { [index: string]: string };
    translate: (id: string, label: string, args?: any[]) => string;
    notificationHelper: NeosNotification;
}

export const GraphContext = createContext<[GraphContextInterface, Dispatch<SetStateAction<GraphContextInterface>>]>([
    {} as GraphContextInterface,
    () => {},
]);
export const useGraph = () => useContext(GraphContext);

export const GraphProvider = ({ graphContext, children }: { graphContext: GraphContextInterface; children: any }) => {
    const [state, setState] = useState(graphContext);
    return <GraphContext.Provider value={[state, setState]}>{children}</GraphContext.Provider>;
};
