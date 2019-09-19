import { useContext, Dispatch } from "react";
import { AppState } from "./types";
import { Action, NonUndoableState } from "./state";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): {
    state: AppState & NonUndoableState;
    dispatch: Dispatch<Action>;
    undo: Function;
    redo: Function;
    canUndo: boolean;
    canRedo: boolean;
} {
    const dispatch = useContext(dispatchContext);
    const rawState = useContext(stateContext);

    const { past, present, future, ...nonUndoableState } = rawState;

    const state = {
        ...rawState.present,
        ...nonUndoableState
    };

    return {
        state,
        dispatch,
        undo() {
            dispatch({ type: "undo" });
        },
        redo() {
            dispatch({ type: "redo" });
        },
        canUndo: rawState.past.length > 0,
        canRedo: rawState.future.length > 0
    };
}
