import { useReducer } from 'react';
import { chartType } from '../constants';

interface AppState {
    selectedNodeTypeName: string;
    selectedPath: string;
    selectedLayout: chartType;
}

const initialState: AppState = {
    selectedNodeTypeName: '',
    selectedPath: '',
    selectedLayout: chartType.SUNBURST
};

export enum Action {
    SelectNodeType,
    SelectPath,
    SelectLayout
}

type SelectNodeTypeAction = {
    type: Action.SelectNodeType;
    payload: string;
};

type SelectPathAction = {
    type: Action.SelectPath;
    payload: string;
};

type SelectLayoutAction = {
    type: Action.SelectLayout;
    payload: chartType;
};

type AppAction = SelectNodeTypeAction | SelectPathAction | SelectLayoutAction;

function reducer(state: AppState, action: AppAction) {
    switch (action.type) {
        case Action.SelectNodeType:
            return { ...state, selectedNodeTypeName: action.payload, selectedLayout: chartType.DEPENDENCIES };
        case Action.SelectPath:
            return { ...state, selectedNodeTypeName: '', selectedPath: action.payload };
        case Action.SelectLayout:
            return { ...state, selectedLayout: action.payload };
        default:
            return state;
    }
}

export default function useAppState() {
    return useReducer(reducer, initialState);
}
