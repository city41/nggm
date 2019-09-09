import React, {
    createContext,
    Dispatch,
    FunctionComponent,
    useReducer
} from "react";
import {
    initialState as undoableInitialState,
    reducer as undoableReducer
} from "./undoableState";
import { getReducer, Action } from "./state";

const { initialState, reducer } = getReducer(
    undoableInitialState,
    undoableReducer
);

export const stateContext = createContext(initialState);
export const dispatchContext = createContext((() => 0) as Dispatch<Action>);

export const Provider: FunctionComponent = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <dispatchContext.Provider value={dispatch}>
            <stateContext.Provider value={state}>
                {children}
            </stateContext.Provider>
        </dispatchContext.Provider>
    );
};
