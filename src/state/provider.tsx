import React, {
    createContext,
    Dispatch,
    FunctionComponent,
    useReducer
} from "react";
import {
    Action,
    initialState as appInitialState,
    reducer as appReducer
} from "./state";
import { getTimelineReducer, TimelineAction } from "./timeline";

const { initialState, reducer } = getTimelineReducer(
    appInitialState,
    appReducer
);

export const stateContext = createContext(initialState);
export const dispatchContext = createContext((() => 0) as Dispatch<
    TimelineAction
>);

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
