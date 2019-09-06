import { AppState } from "./types";
import { Action } from "./state";
import { useContext, Dispatch } from "react";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): { state: AppState; dispatch: Dispatch<Action> } {
    return {
        state: useContext(stateContext),
        dispatch: useContext(dispatchContext)
    };
}
