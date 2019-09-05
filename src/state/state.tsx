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

type Action =
    | { type: "StartEmulation" }
    | { type: "TogglePause" }
    | {
          type: "ExtractSprite";
          spriteMemoryIndex: number;
          composedX: number;
          pauseId?: number;
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
    | { type: "ExtendLayerViaMirror"; layer: Layer };

export const initialState: AppState = {
    hasStarted: false,
    isPaused: false,
    pauseId: 0,
    layers: [],
    focusedLayerIndex: -1,
    crop: undefined
};

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

/**
 * When a sprite group has been moved to a new position in the compose window,
 * find all other sprite groups in the same pauseId and move them the same amount
 */
function moveRelatedGroups(
    focusedGroup: ExtractedSpriteGroup,
    allGroups: ExtractedSpriteGroup[],
    newComposedX: number
) {
    const xDiff = newComposedX - focusedGroup.sprites[0].composedX;

    const groupsFromSamePauseId = allGroups.filter(
        sg => sg.pauseId === focusedGroup.pauseId
    );

    groupsFromSamePauseId.forEach(group => {
        group.sprites.forEach(s => {
            s.composedX += xDiff;
        });
    });
}

/**
 * When the compose window ends up with sprites that are up in the negative region,
 * this method causes all sprites to move down such that no sprites have a
 * negative y coordinate
 *
 *TODO: make this create new groups and not mutate to support undo/redo in future
 */
function pushDownOutOfNegative(layers: Layer[]): Layer[] {
    const groups = layers.reduce<ExtractedSpriteGroup[]>((gs, l) => {
        return gs.concat(l.groups);
    }, []);

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

    return layers;
}

/**
 * When sprites end up with negative x coordinates (most commonly after
 * extending a layer via mirroring), this method will push all sprites to the right
 * such that no sprite has a negative x coordinate
 *
 * TODO: make this create new groups and not mutate to support undo/redo in future
 */
function pushInOutOfNegative(layers: Layer[]): Layer[] {
    const groups = layers.reduce<ExtractedSpriteGroup[]>((gs, l) => {
        return gs.concat(l.groups);
    }, []);

    const sprites = groups.reduce<ExtractedSprite[]>((ss, sg) => {
        return ss.concat(sg.sprites);
    }, []);

    const mostNegative = Math.min(...sprites.map(s => s.composedX));

    if (mostNegative < 0) {
        const nudge = mostNegative * -1;

        sprites.forEach(s => (s.composedX += nudge));
    }

    return layers;
}

/**
 * Given a set of sprites, creates a mirror copy of them that is on the right side.
 * The mirroring is always on the y axis
 */
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

/**
 * Given a set of sprites, creates a mirror copy of them that is on the left side.
 * The mirroring is always on the y axis
 */
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

/**
 * Given a set of groups, mirrors them on both sides. The mirrored sprites
 * get lumped into a right and left group
 */
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
            const { spriteMemoryIndex, composedX, pauseId } = action;

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
