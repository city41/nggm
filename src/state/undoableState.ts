import {
    AppState,
    Crop,
    Layer,
    ExtractedSpriteGroup,
    ExtractedSprite,
    ExtractedTile
} from "./types";
import {
    extendGroupsViaMirroring,
    haveSameSprites,
    moveGroups,
    positionSpriteGroupInRelationToExistingGroups,
    pushDownOutOfNegative,
    pushInOutOfNegative,
    getAllTilesFromLayers,
    getMinY,
    getMaxY
} from "./spriteUtil";
import {
    extractSpriteAndStickyCompanionsToGroup,
    extractSpritesIntoGroup
} from "./extractSpriteGroup";
import { without } from "lodash";

export type UndoableAction =
    | {
          type: "ExtractSprite";
          spriteMemoryIndex: number;
          composedX: number;
      }
    | {
          type: "ExtractSpritesToGroup";
          spriteMemoryIndices: number[];
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
    | { type: "ToggleOutlineExtractedTiles" }
    | {
          type: "RemoveSpriteFromExtractedGroup";
          group: ExtractedSpriteGroup;
          sprite: ExtractedSprite;
      }
    | { type: "RotateLayer"; layer: Layer }
    | { type: "PushDownLayer"; layer: Layer };

export const initialState: AppState = {
    layers: [],
    focusedLayerIndex: -1,
    crop: undefined,
    outlineExtractedTiles: false
};

function update<T>(obj: T, collection: T[], updates: Partial<T>) {
    return collection.map(o => {
        if (o === obj) {
            return {
                ...obj,
                ...updates
            };
        } else {
            return o;
        }
    });
}

function rotateTiles(
    tiles: ExtractedTile[],
    minY: number,
    maxY: number
): ExtractedTile[] {
    if (tiles.length === 0) {
        return tiles;
    }

    return tiles.map(tile => {
        // if the tile is beyond maxY, then it is not on a 16px boundary.
        // so when it wraps to the top, need to offset it from minY to maintain
        // its position
        const needsToWrap = tile.composedY >= maxY;
        const wrapOffset = tile.composedY - maxY;

        const newY = needsToWrap ? minY + wrapOffset : tile.composedY + 16;

        return {
            ...tile,
            composedY: newY
        };
    });
}

function rotateSprites(
    sprites: ExtractedSprite[],
    minY: number,
    maxY: number
): ExtractedSprite[] {
    return sprites.map(sprite => {
        return {
            ...sprite,
            tiles: rotateTiles(sprite.tiles, minY, maxY)
        };
    });
}

function rotateLayer(layer: Layer, allLayers: Layer[]): Layer {
    const tiles = getAllTilesFromLayers(allLayers);

    // when wrapping, we only want to wrap on a 16 pixel boundary.
    // To accomplish that, find min/max tiles that are on the boundary. Tiles that are off the boundary
    // (typically small sprites on top of a background sprite), let them hang over when wrapping
    const minY = tiles.reduce((minY, tile) => {
        if (tile.composedY < minY && tile.composedY % 16 === 0) {
            return tile.composedY;
        } else {
            return minY;
        }
    }, Infinity);

    if (minY === Infinity) {
        return layer;
    }

    const maxY = tiles.reduce((maxY, tile) => {
        if (tile.composedY > maxY && tile.composedY % 16 === 0) {
            return tile.composedY;
        } else {
            return maxY;
        }
    }, -Infinity);

    if (maxY === -Infinity) {
        return layer;
    }

    const groups = layer.groups.map(group => {
        return {
            ...group,
            sprites: rotateSprites(group.sprites, minY, maxY)
        };
    });

    return {
        ...layer,
        groups
    };
}

export function reducer(
    state: AppState,
    action: UndoableAction,
    pauseId: number
): AppState {
    switch (action.type) {
        case "ExtractSpritesToGroup":
        case "ExtractSprite": {
            let newSpriteGroup: ExtractedSpriteGroup;

            if ("spriteMemoryIndex" in action) {
                const { spriteMemoryIndex, composedX } = action;

                newSpriteGroup = extractSpriteAndStickyCompanionsToGroup(
                    spriteMemoryIndex,
                    composedX,
                    pauseId
                );
            } else {
                const { spriteMemoryIndices, composedX } = action;

                newSpriteGroup = extractSpritesIntoGroup(
                    spriteMemoryIndices,
                    composedX,
                    pauseId,
                    { isAdhoc: true }
                );
            }

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

            newSpriteGroup = positionSpriteGroupInRelationToExistingGroups(
                newSpriteGroup,
                oldSpriteGroups
            );

            let layers;

            if (state.layers.length === 0) {
                layers = [layer];
            } else {
                layers = update(layer, state.layers, {
                    groups: [...layer.groups, newSpriteGroup]
                });
            }

            return {
                ...state,
                layers,
                focusedLayerIndex:
                    layers.length === 1 ? 0 : state.focusedLayerIndex
            };
        }

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

            const diffX =
                newComposedX - currentSpriteGroup.sprites[0].composedX;
            const movedGroups = moveGroups(layer.groups, diffX, pauseId);

            return {
                ...state,
                layers: update(layer, state.layers, {
                    groups: movedGroups
                })
            };
        }

        case "HandleNegatives":
            return {
                ...state,
                layers: pushDownOutOfNegative(state.layers)
            };

        case "DeleteGroup": {
            const { group } = action;
            const layer = state.layers.find(
                layer => layer.groups.indexOf(group) > -1
            );

            if (!layer) {
                throw new Error(
                    "DeleteGroup: can't find the layer this group belongs to"
                );
            }

            const groups = without(layer.groups, group);
            const layers = update(layer, state.layers, { groups });

            return {
                ...state,
                layers
            };
        }
        case "ToggleVisibilityOfGroup": {
            const { group } = action;

            const layer = state.layers.find(
                layer => layer.groups.indexOf(group) > -1
            );

            if (!layer) {
                throw new Error(
                    "ToggleVisibilityOfGroup: failed to find the layer that owns this group"
                );
            }

            const newGroups = update(group, layer.groups, {
                hidden: !group.hidden
            });
            const layers = update(layer, state.layers, {
                groups: newGroups
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
                    hidden: false
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

            const layers = update(layer, state.layers, {
                hidden: !layer.hidden
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

            // don't bother to mirror an empty layer
            if (layer.groups.length === 0) {
                return state;
            }

            const mirroredGroups = extendGroupsViaMirroring(
                layer.groups,
                pauseId
            );

            const newLayer = {
                groups: mirroredGroups,
                hidden: false
            };

            const originalLayerIndex = state.layers.indexOf(layer);

            let layers;

            if (originalLayerIndex === 0) {
                layers = [newLayer, ...state.layers];
            } else {
                layers = [
                    ...state.layers.slice(0, originalLayerIndex - 1),
                    newLayer,
                    ...state.layers.slice(originalLayerIndex - 1)
                ];
            }

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

        case "RemoveSpriteFromExtractedGroup": {
            const { group, sprite } = action;

            const layer = state.layers.find(
                layer => layer.groups.indexOf(group) > -1
            );

            if (!layer) {
                throw new Error(
                    "RemoveSpriteFromExtractedGroup: cant find layer for group"
                );
            }

            const groups = update(group, layer.groups, {
                sprites: without(group.sprites, sprite)
            });

            const layers = update(layer, state.layers, { groups });

            return {
                ...state,
                layers
            };
        }

        case "RotateLayer": {
            const { layer } = action;

            const layers = update(
                layer,
                state.layers,
                rotateLayer(layer, state.layers)
            );

            return {
                ...state,
                layers
            };
        }

        case "PushDownLayer": {
            const { layer } = action;

            const [pushedLayer] = pushDownOutOfNegative([layer]);

            const layers = update(layer, state.layers, pushedLayer);

            return {
                ...state,
                layers
            };
        }
    }
}
