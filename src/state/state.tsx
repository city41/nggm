import React, {
    createContext,
    useContext,
    useReducer,
    Dispatch,
    FunctionComponent
} from "react";
import { AppState } from "./types";
import { extractSprites } from "./extractSprites";

export interface Action {
    type: "StartEmulation" | "TogglePause" | "ExtractSprite";
}

export interface ExtractSpriteAction {
    type: "ExtractSprite";
    spriteMemoryIndex: number;
    composedX: number;
}

export const initialState: AppState = {
    hasStarted: false,
    isPaused: false,
    pauseId: -1,
    extractedSprites: []
};

function assertUnreachable(_: never): never {
    throw new Error("Non exhaustive switch statement");
}

export function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "StartEmulation":
            return {
                ...state,
                hasStarted: true
            };
        case "TogglePause":
            const nowPaused = !state.isPaused;
            return {
                ...state,
                isPaused: nowPaused,
                pauseId: nowPaused ? state.pauseId + 1 : state.pauseId
            };
        case "ExtractSprite":
            const {
                spriteMemoryIndex,
                composedX
            } = action as ExtractSpriteAction;
            return {
                ...state,
                extractedSprites: [
                    ...state.extractedSprites,
                    ...extractSprites(spriteMemoryIndex, composedX)
                ]
            };
    }

    return assertUnreachable(action.type);
}

const stateContext = createContext(initialState);
const dispatchContext = createContext((() => 0) as Dispatch<Action>);

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

export function useAppState(): [AppState, Dispatch<Action>] {
    return [useContext(stateContext), useContext(dispatchContext)];
}

export const TOGGLE_PAUSE: Action = {
    type: "TogglePause"
};

export const START_EMULATION: Action = {
    type: "StartEmulation"
};

export function extractSpriteAction(
    spriteMemoryIndex: number,
    composedX: number
): ExtractSpriteAction {
    return {
        type: "ExtractSprite",
        spriteMemoryIndex,
        composedX
    };
}
