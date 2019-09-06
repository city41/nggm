import { AppState } from "./types";
import { Action } from "./state";
import { useContext, Dispatch } from "react";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): [AppState, Dispatch<Action>] {
    return [useContext(stateContext), useContext(dispatchContext)];
}
