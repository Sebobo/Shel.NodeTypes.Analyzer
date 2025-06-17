import { Dispatch, useReducer } from 'react';
import { chartType } from '../constants';

export interface AppState {
    selectedNodeTypeName: NodeTypeName;
    selectedPath: string;
    selectedLayout: chartType;
}

const initialState: AppState = {
    selectedNodeTypeName: '',
    selectedPath: '',
    selectedLayout: chartType.SUNBURST,
};

export enum Action {
    SelectNodeType,
    SelectPath,
    SelectLayout,
    Reset,
}

type SelectNodeTypeAction = {
    type: Action.SelectNodeType;
    payload: NodeTypeName;
};

type SelectPathAction = {
    type: Action.SelectPath;
    payload: string;
};

type SelectLayoutAction = {
    type: Action.SelectLayout;
    payload: chartType;
};

type ResetAction = {
    type: Action.Reset;
};

export type AppAction = SelectNodeTypeAction | SelectPathAction | SelectLayoutAction | ResetAction;

function reducer(state: AppState, action: AppAction) {
    switch (action.type) {
        case Action.SelectNodeType:
            return {
                ...state,
                selectedNodeTypeName: action.payload || '',
                selectedPath: '',
                selectedLayout: action.payload ? chartType.DEPENDENCIES : state.selectedLayout,
            };
        case Action.SelectPath:
            return { ...state, selectedNodeTypeName: '', selectedPath: action.payload };
        case Action.SelectLayout:
            return { ...state, selectedLayout: action.payload };
        case Action.Reset:
            return { ...state, selectedNodeTypeName: '', selectedPath: '' };
        default:
            return state;
    }
}

const useAppState = (): [AppState, Dispatch<any>] => useReducer(reducer, initialState);

export default useAppState;
