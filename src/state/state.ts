import { Reducer } from "react";
import { AppState, Layer, Crop } from "./types";
import { UndoableAction } from "./undoableState";
import { update } from "./update";

export type Action =
    | UndoableAction
    | { type: "StartEmulation" }
    | { type: "TogglePause" }
    | { type: "ToggleVisibilityOfLayer"; layer: Layer }
    | { type: "SetFocusedLayer"; layer: Layer }
    | { type: "SetCrop"; crop: Crop }
    | { type: "ToggleGrid" }
    | { type: "ClearCrop" }
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

    /**
     * the index of the layer that will receive new sprite groups that get dragged in. If no
     * layer is the focused layer, then the last layer gets the new sprite groups.
     *
     * set to -1 to make no layer focused
     */
    focusedLayerIndex: number;

    /**
     * A crop for the compose screen. When the gif is built, only
     * the tiles inside the crop boundaries are considered
     */
    crop?: Crop;

    /**
     * Whether to show an outline around extracted tiles. Helps show
     * the real bounds of a sprite group
     */
    outlineExtractedTiles: boolean;
};

export type NonUndoableState = Omit<State, "past" | "present" | "future">;

export function getReducer(
    initialAppState: AppState,
    reducer: (
        state: AppState,
        action: UndoableAction,
        nonUndoableState: NonUndoableState
    ) => AppState
) {
    const initialState: State = {
        past: [],
        present: initialAppState,
        future: [],
        hasStarted: false,
        isPaused: false,
        pauseId: 0,
        focusedLayerIndex: -1,
        crop: undefined,
        outlineExtractedTiles: false
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

            case "ToggleGrid": {
                return {
                    ...state,
                    outlineExtractedTiles: !state.outlineExtractedTiles
                };
            }

            case "SetCrop": {
                const { crop } = action;

                return {
                    ...state,
                    crop
                };
            }

            case "ClearCrop": {
                return {
                    ...state,
                    crop: undefined
                };
            }

            case "SetFocusedLayer": {
                const { layer } = action;

                return {
                    ...state,
                    focusedLayerIndex: state.present.layers.indexOf(layer)
                };
            }

            case "ToggleVisibilityOfLayer": {
                const { layer } = action;

                const layers = update(layer, state.present.layers, {
                    hidden: !layer.hidden
                });

                return {
                    ...state,
                    present: {
                        ...state.present,
                        layers
                    }
                };
            }

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
                        state
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
