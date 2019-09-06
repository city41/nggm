import { Reducer } from "react";
import { AppState } from "./types";
import { Action } from "./state";

export type TimelineAction = Action | { type: "undo" } | { type: "redo" };

export type TimelineState = {
    past: AppState[];
    present: AppState;
    future: AppState[];
};

export function getTimelineReducer(
    initialAppState: AppState,
    reducer: Reducer<AppState, Action>
) {
    const initialState: TimelineState = {
        past: [],
        present: initialAppState,
        future: []
    };

    function proxyReducer(
        state: TimelineState,
        action: TimelineAction
    ): TimelineState {
        let newState;

        switch (action.type) {
            case "undo": {
                const pastCopy = [...state.past];
                const newPresent = pastCopy.pop();

                if (!newPresent) {
                    throw new Error("undo: nothing to undo!");
                }

                newState = {
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
                    present: reducer(state.present, action as Action)
                };
                break;
            }
        }

        console.log("STATE", JSON.stringify(newState, null, 2));
        return newState;
    }

    return {
        initialState,
        reducer: proxyReducer
    };
}
