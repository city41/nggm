import { useContext, Dispatch } from "react";
import { AppState } from "./types";
import { TimelineAction } from "./timeline";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): {
    state: AppState;
    dispatch: Dispatch<TimelineAction>;
    undo: Function;
    redo: Function;
    canUndo: boolean;
    canRedo: boolean;
} {
    const dispatch = useContext(dispatchContext);
    const state = useContext(stateContext);

    return {
        state: state.present,
        dispatch,
        undo() {
            dispatch({ type: "undo" });
        },
        redo() {
            dispatch({ type: "redo" });
        },
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0
    };
}
