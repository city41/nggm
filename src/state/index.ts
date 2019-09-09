import { useContext, Dispatch } from "react";
import { AppState } from "./types";
import { Action, State } from "./state";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): {
    state: AppState & Pick<State, "isPaused" | "hasStarted" | "pauseId">;
    dispatch: Dispatch<Action>;
    undo: Function;
    redo: Function;
    canUndo: boolean;
    canRedo: boolean;
} {
    const dispatch = useContext(dispatchContext);
    const rawState = useContext(stateContext);

    const state = {
        ...rawState.present,
        isPaused: rawState.isPaused,
        hasStarted: rawState.hasStarted,
        pauseId: rawState.pauseId
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
