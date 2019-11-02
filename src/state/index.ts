import { useContext, Dispatch } from "react";
import { AppState } from "./types";
import { Action, ActionType, NonUndoableState } from "./state";
import { stateContext, dispatchContext } from "./provider";

export function useAppState(): {
  state: AppState & NonUndoableState;
  dispatch: Dispatch<Action | ActionType>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} {
  const actualDispatch = useContext(dispatchContext);
  const rawState = useContext(stateContext);

  const { past, present, future, ...nonUndoableState } = rawState;

  const state = {
    ...rawState.present,
    ...nonUndoableState
  };

  return {
    state,
    dispatch(actionOrType: Action | ActionType) {
      if (typeof actionOrType === "string") {
        return actualDispatch({ type: actionOrType } as Action);
      } else {
        return actualDispatch(actionOrType);
      }
    },
    undo() {
      actualDispatch({ type: "undo" });
    },
    redo() {
      actualDispatch({ type: "redo" });
    },
    canUndo: rawState.past.length > 0,
    canRedo: rawState.future.length > 0
  };
}
