import React, {
    createContext,
    useContext,
    useReducer,
    Dispatch,
    FunctionComponent
} from "react";
import { AppState, Crop, Layer, ExtractedSpriteGroup } from "./types";
import {
    extendGroupsViaMirroring,
    haveSameSprites,
    moveRelatedGroups,
    positionSpriteGroupInRelationToExistingGroups,
    pushDownOutOfNegative,
    pushInOutOfNegative
} from "./spriteUtil";
import { extractSpriteGroup } from "./extractSpriteGroup";

type Action =
    | { type: "StartEmulation" }
    | { type: "TogglePause" }
    | {
          type: "ExtractSprite";
          spriteMemoryIndex: number;
          composedX: number;
      }
    | {
          type: "MoveSprite";
          spriteMemoryIndex: number;
          newComposedX: number;
          pauseId: number;
      }
    | {
          type: "HandleNegatives";
      }
    | { type: "DeleteGroup"; group: ExtractedSpriteGroup }
    | { type: "ToggleVisibilityOfGroup"; group: ExtractedSpriteGroup }
    | { type: "NewLayer" }
    | { type: "DeleteLayer"; layer: Layer }
    | { type: "ToggleVisibilityOfLayer"; layer: Layer }
    | { type: "SetFocusedLayer"; layer: Layer }
    | { type: "SetCrop"; crop: Crop }
    | { type: "ClearCrop" }
    | { type: "ExtendLayerViaMirror"; layer: Layer }
    | { type: "ToggleOutlineExtractedTiles" };

export const initialState: AppState = {
    hasStarted: false,
    isPaused: false,
    pauseId: 0,
    layers: [],
    focusedLayerIndex: -1,
    crop: undefined,
    outlineExtractedTiles: true
};

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

        // TODO: make this handler not mutate, to support undo/redo in the future
        case "MoveSprite": {
            const { spriteMemoryIndex, newComposedX, pauseId } = action;

            const layer = state.layers[state.focusedLayerIndex];

            if (!layer) {
                return state;
            }

            const currentSpriteGroup = layer.groups.find(sg => {
                return (
                    sg.pauseId === pauseId &&
                    sg.sprites.some(
                        s => s.spriteMemoryIndex === spriteMemoryIndex
                    )
                );
            });

            if (!currentSpriteGroup) {
                return state;
            }

            moveRelatedGroups(currentSpriteGroup, layer.groups, newComposedX);

            return {
                ...state
            };
        }

        // TODO: make this handler not mutate, to support undo/redo in the future
        case "ExtractSprite": {
            const { spriteMemoryIndex, composedX } = action;

            const newSpriteGroup = extractSpriteGroup(
                spriteMemoryIndex,
                composedX,
                state.pauseId
            );

            const layer = state.layers[state.focusedLayerIndex] ||
                state.layers[state.layers.length - 1] || {
                    groups: [newSpriteGroup],
                    hidden: false
                };
            const oldSpriteGroups = layer.groups.filter(
                esg =>
                    esg.pauseId !== newSpriteGroup.pauseId ||
                    !haveSameSprites(esg, newSpriteGroup)
            );

            // TODO: have this method not mutate to support undo/redo in the future
            positionSpriteGroupInRelationToExistingGroups(
                newSpriteGroup,
                oldSpriteGroups
            );

            let layers;

            if (state.layers.length === 0) {
                layers = [layer];
            } else {
                layers = state.layers.map(l => {
                    if (l === layer) {
                        return {
                            ...layer,
                            groups: [...layer.groups, newSpriteGroup]
                        };
                    } else {
                        return l;
                    }
                });
            }

            return {
                ...state,
                layers,
                focusedLayerIndex:
                    layers.length === 1 ? 0 : state.focusedLayerIndex
            };
        }

        case "HandleNegatives":
            return {
                ...state,
                layers: pushDownOutOfNegative(state.layers)
            };

        case "DeleteGroup": {
            const { group } = action;

            const layers = state.layers.map(layer => {
                if (layer.groups.indexOf(group) > -1) {
                    const groups = layer.groups.filter(g => g !== group);
                    return {
                        ...layer,
                        groups
                    };
                } else {
                    return layer;
                }
            });

            return {
                ...state,
                layers
            };
        }
        case "ToggleVisibilityOfGroup": {
            const { group } = action;

            const layers = state.layers.map(layer => {
                if (layer.groups.indexOf(group) > -1) {
                    const groups = layer.groups.map(g => {
                        if (g === group) {
                            return {
                                ...g,
                                hidden: !g.hidden
                            };
                        } else {
                            return g;
                        }
                    });
                    return {
                        ...layer,
                        groups
                    };
                } else {
                    return layer;
                }
            });

            return {
                ...state,
                layers
            };
        }

        case "NewLayer": {
            return {
                ...state,
                layers: state.layers.concat({
                    groups: [],
                    hidden: false,
                    extendedViaMirror: false
                }),
                focusedLayerIndex: state.layers.length
            };
        }

        case "DeleteLayer": {
            const { layer } = action;

            return {
                ...state,
                layers: state.layers.filter(l => l !== layer),
                focusedLayerIndex: -1
            };
        }

        case "ToggleVisibilityOfLayer": {
            const { layer } = action;

            const layers = state.layers.map(l => {
                if (l === layer) {
                    return {
                        ...l,
                        hidden: !l.hidden
                    };
                } else {
                    return l;
                }
            });

            return {
                ...state,
                layers
            };
        }

        case "SetFocusedLayer": {
            const { layer } = action;

            return {
                ...state,
                focusedLayerIndex: state.layers.indexOf(layer)
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

        case "ExtendLayerViaMirror": {
            const { layer } = action;

            const mirroredGroups = extendGroupsViaMirroring(
                layer.groups,
                state.pauseId
            );

            let layers = state.layers.concat({
                groups: mirroredGroups,
                hidden: false,
                extendedViaMirror: false
            });

            layers = pushInOutOfNegative(layers);

            return {
                ...state,
                layers
            };
        }

        case "ToggleOutlineExtractedTiles": {
            return {
                ...state,
                outlineExtractedTiles: !state.outlineExtractedTiles
            };
        }
    }
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
