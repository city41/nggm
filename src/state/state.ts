import { Reducer } from "react";
import { AppState } from "./types";
import { UndoableAction } from "./undoableState";

export type Action =
    | UndoableAction
    | { type: "StartEmulation" }
    | { type: "TogglePause" }
    | { type: "undo" }
    | { type: "redo" };

export type State = {
    past: AppState[];
    present: AppState;
    future: AppState[];

    /**
     * indicates emulation has started, it may have since been paused
     */
    hasStarted: boolean;

    /**
     * true if the emulator has paused, false if is either running
     * or has yet to start. It is only safe to access Neo Geo memory
     * during a pause. In general the UI should largely "shut down" when
     * this value is false
     */
    isPaused: boolean;

    /**
     * Indicates which pause session we are currently on.
     * If this value increments, the user has unpaused then repaused
     * the emulation. At that point, it is no longer safe to assume
     * Neo Geo memory has not changed
     */
    pauseId: number;
};

export function getReducer(
    initialAppState: AppState,
    reducer: (
        state: AppState,
        action: UndoableAction,
        pauseId: number
    ) => AppState
) {
    const initialState: State = {
        past: [],
        present: initialAppState,
        future: [],
        hasStarted: false,
        isPaused: false,
        pauseId: 0
    };

    function proxyReducer(state: State, action: Action): State {
        let newState;

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

            case "undo": {
                const pastCopy = [...state.past];
                const newPresent = pastCopy.pop();

                if (!newPresent) {
                    throw new Error("undo: nothing to undo!");
                }

                newState = {
                    ...state,
                    past: pastCopy,
                    present: newPresent,
                    future: [...state.future, state.present]
                };
                break;
            }
            case "redo": {
                const futureCopy = [...state.future];
                const newPresent = futureCopy.pop();

                if (!newPresent) {
                    throw new Error("redo: nothing to redo!");
                }

                newState = {
                    ...state,
                    past: [...state.past, state.present],
                    present: newPresent,
                    future: futureCopy
                };
                break;
            }
            default: {
                newState = {
                    ...state,
                    past: [...state.past, state.present],
                    present: reducer(
                        state.present,
                        action as UndoableAction,
                        state.pauseId
                    )
                };
                break;
            }
        }

        return newState;
    }

    return {
        initialState,
        reducer: proxyReducer
    };
}
