import React, {
    createContext,
    useContext,
    useReducer,
    Dispatch,
    FunctionComponent
} from "react";
import {
    AppState,
    Crop,
    Layer,
    ExtractedSpriteGroup,
    ExtractedSprite,
    ExtractedTile
} from "./types";
import { extractSpriteGroup } from "./extractSpriteGroup";
import { isEqual } from "lodash";

export interface Action {
    type:
        | "StartEmulation"
        | "TogglePause"
        | "ExtractSprite"
        | "HandleNegatives"
        | "DeleteGroup"
        | "ToggleVisibilityOfGroup"
        | "NewLayer"
        | "DeleteLayer"
        | "ToggleVisibilityOfLayer"
        | "SetFocusedLayer"
        | "SetCrop"
        | "ClearCrop"
        | "ExtendLayerViaMirror";
}

export interface ExtractSpriteAction extends Action {
    type: "ExtractSprite";
    spriteMemoryIndex: number;
    composedX: number;
    pauseId?: number;
}

export interface DeleteGroupAction extends Action {
    type: "DeleteGroup";
    group: ExtractedSpriteGroup;
}

export interface ToggleVisibilityOfGroupAction extends Action {
    type: "ToggleVisibilityOfGroup";
    group: ExtractedSpriteGroup;
}

export interface DeleteLayerAction extends Action {
    type: "DeleteLayer";
    layer: Layer;
}

export interface ToggleVisibilityOfLayerAction extends Action {
    type: "ToggleVisibilityOfLayer";
    layer: Layer;
}

export interface SetFocusedLayerAction extends Action {
    type: "SetFocusedLayer";
    layer: Layer;
}

export interface SetCropAction extends Action {
    type: "SetCrop";
    crop: Crop;
}

export interface ExtendLayerViaMirrorAction extends Action {
    type: "ExtendLayerViaMirror";
    layer: Layer;
}

export const initialState: AppState = {
    hasStarted: false,
    isPaused: false,
    pauseId: 0,
    layers: [],
    focusedLayerIndex: -1,
    crop: undefined
};

function assertUnreachable(_: never): never {
    throw new Error("Non exhaustive switch statement");
}

function haveSameSprites(a: ExtractedSpriteGroup, b: ExtractedSpriteGroup) {
    const aIndices = a.sprites.map(es => es.spriteMemoryIndex).sort();
    const bIndices = b.sprites.map(es => es.spriteMemoryIndex).sort();

    return isEqual(aIndices, bIndices);
}

/**
 * Given a newly formed sprite group, if there are other sprite groups already from the same pauseId,
 * then position this new group relative to them. This makes it so the user doesn't have to try and manually
 * line up groups.
 *
 * example: Samurai Shodown title screen. User drags in background, then drags in "Samurai" sprite, the "Samurai"
 * sprite will position itself properly on top of the background
 */
function positionSpriteGroupInRelationToExistingGroups(
    newGroup: ExtractedSpriteGroup,
    oldGroups: ExtractedSpriteGroup[]
) {
    const sameGroup = oldGroups.find(og => og.pauseId === newGroup.pauseId);

    // first sprite from this pauseId? Then there is nothing to position
    if (!sameGroup) {
        return;
    }

    const screenToComposeDiffX =
        sameGroup.sprites[0].composedX - sameGroup.sprites[0].screenX;

    newGroup.sprites.forEach(
        s => (s.composedX = s.screenX + screenToComposeDiffX)
    );
}

function moveRelatedGroups(
    focusedGroup: ExtractedSpriteGroup,
    allGroups: ExtractedSpriteGroup[],
    newComposedX: number
) {
    const xDiff = newComposedX - focusedGroup.sprites[0].composedX;

    const sameGroup = allGroups.filter(
        sg => sg.pauseId === focusedGroup.pauseId
    );

    sameGroup.forEach(group => {
        group.sprites.forEach(s => {
            s.composedX += xDiff;
        });
    });
}

// TODO: make this create new groups and not mutate to support undo/redo in future
function pushDownOutOfNegative(
    groups: ExtractedSpriteGroup[]
): ExtractedSpriteGroup[] {
    const tiles = groups.reduce<ExtractedTile[]>((ts, sg) => {
        const tiles = sg.sprites.reduce<ExtractedTile[]>((sts, s) => {
            return sts.concat(s.tiles);
        }, []);

        return ts.concat(tiles);
    }, []);

    const mostNegative = Math.min(...tiles.map(t => t.composedY));

    if (mostNegative < 0) {
        const nudge = mostNegative * -1;

        tiles.forEach(t => (t.composedY += nudge));
    }

    return groups;
}

// TODO: make this create new groups and not mutate to support undo/redo in future
function pushInOutOfNegative(
    groups: ExtractedSpriteGroup[]
): ExtractedSpriteGroup[] {
    const sprites = groups.reduce<ExtractedSprite[]>((ss, sg) => {
        return ss.concat(sg.sprites);
    }, []);

    const mostNegative = Math.min(...sprites.map(s => s.composedX));

    if (mostNegative < 0) {
        const nudge = mostNegative * -1;

        sprites.forEach(s => (s.composedX += nudge));
    }

    return groups;
}

function mirrorSpritesToRight(sprites: ExtractedSprite[]): ExtractedSprite[] {
    const maxX = Math.max(...sprites.map(t => t.composedX)) + 16;

    return sprites
        .map(sprite => {
            return {
                ...sprite,
                spriteMemoryIndex: sprite.spriteMemoryIndex,
                composedX: 2 * maxX - (sprite.composedX + 16),
                tiles: sprite.tiles.map(t => {
                    return {
                        ...t,
                        horizontalFlip: !t.horizontalFlip
                    };
                })
            };
        })
        .reverse();
}

function mirrorSpritesToLeft(sprites: ExtractedSprite[]): ExtractedSprite[] {
    const minX = Math.min(...sprites.map(t => t.composedX));
    const maxX = Math.max(...sprites.map(t => t.composedX)) + 16;
    const width = maxX - minX;

    return sprites
        .map(sprite => {
            return {
                ...sprite,
                spriteMemoryIndex: sprite.spriteMemoryIndex,
                composedX: minX - width + (maxX - (sprite.composedX + 16)),
                tiles: sprite.tiles.map(t => {
                    return {
                        ...t,
                        horizontalFlip: !t.horizontalFlip
                    };
                })
            };
        })
        .reverse();
}

function extendGroupsViaMirroring(
    groups: ExtractedSpriteGroup[],
    pauseId: number
): ExtractedSpriteGroup[] {
    const sprites = groups.reduce<ExtractedSprite[]>((ss, group) => {
        return ss.concat(group.sprites);
    }, []);

    const rightMirror = mirrorSpritesToRight(sprites);
    const leftMirror = mirrorSpritesToLeft(sprites);

    const newLeftGroup = {
        pauseId,
        hidden: false,
        sprites: leftMirror
    };

    const newRightGroup = {
        pauseId,
        hidden: false,
        sprites: rightMirror
    };

    newLeftGroup.sprites.forEach(s => (s.group = newLeftGroup));
    newRightGroup.sprites.forEach(s => (s.group = newRightGroup));

    return [newLeftGroup, newRightGroup];
}

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
        case "ExtractSprite":
            const {
                spriteMemoryIndex,
                composedX,
                pauseId
            } = action as ExtractSpriteAction;

            if (pauseId) {
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

                moveRelatedGroups(currentSpriteGroup, layer.groups, composedX);

                return {
                    ...state
                };
            } else {
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
            const layers = state.layers.map(layer => {
                return {
                    ...layer,
                    groups: pushDownOutOfNegative(layer.groups)
                };
            });

            return {
                ...state,
                layers
            };

        case "DeleteGroup": {
            const { group } = action as DeleteGroupAction;

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
            const { group } = action as ToggleVisibilityOfGroupAction;

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
            const { layer } = action as DeleteLayerAction;

            return {
                ...state,
                layers: state.layers.filter(l => l !== layer),
                focusedLayerIndex: -1
            };
        }

        case "ToggleVisibilityOfLayer": {
            const { layer } = action as DeleteLayerAction;

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
            const { layer } = action as SetFocusedLayerAction;

            return {
                ...state,
                focusedLayerIndex: state.layers.indexOf(layer)
            };
        }

        case "SetCrop": {
            const { crop } = action as SetCropAction;

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
            const { layer } = action as ExtendLayerViaMirrorAction;

            const mirroredGroups = extendGroupsViaMirroring(
                layer.groups,
                state.pauseId
            );

            pushInOutOfNegative(mirroredGroups);

            const layers = state.layers.concat({
                groups: mirroredGroups,
                hidden: false,
                extendedViaMirror: false
            });

            return {
                ...state,
                layers
            };
        }
    }

    return assertUnreachable(action.type);
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

export const TOGGLE_PAUSE: Action = {
    type: "TogglePause"
};

export const START_EMULATION: Action = {
    type: "StartEmulation"
};

export function extractSpriteAction(
    spriteMemoryIndex: number,
    composedX: number,
    pauseId: number
): ExtractSpriteAction {
    return {
        type: "ExtractSprite",
        spriteMemoryIndex,
        composedX,
        pauseId
    };
}

export const HANDLE_NEGATIVES: Action = {
    type: "HandleNegatives"
};

export function deleteGroupAction(
    group: ExtractedSpriteGroup
): DeleteGroupAction {
    return {
        type: "DeleteGroup",
        group
    };
}

export function toggleVisiblityOfGroupAction(
    group: ExtractedSpriteGroup
): ToggleVisibilityOfGroupAction {
    return {
        type: "ToggleVisibilityOfGroup",
        group
    };
}

export const NEW_LAYER: Action = {
    type: "NewLayer"
};

export function deleteLayerAction(layer: Layer): DeleteLayerAction {
    return {
        type: "DeleteLayer",
        layer
    };
}

export function toggleVisiblityOfLayerAction(
    layer: Layer
): ToggleVisibilityOfLayerAction {
    return {
        type: "ToggleVisibilityOfLayer",
        layer
    };
}

export function setFocusedLayerAction(layer: Layer): SetFocusedLayerAction {
    return {
        type: "SetFocusedLayer",
        layer
    };
}

export function setCropAction(crop: Crop): SetCropAction {
    return {
        type: "SetCrop",
        crop
    };
}

export const CLEAR_CROP: Action = {
    type: "ClearCrop"
};

export function extendLayerViaMirrorAction(
    layer: Layer
): ExtendLayerViaMirrorAction {
    return {
        type: "ExtendLayerViaMirror",
        layer
    };
}
