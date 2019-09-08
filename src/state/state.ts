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
    pushInOutOfNegative
} from "./spriteUtil";
import { extractSpriteGroup } from "./extractSpriteGroup";
import { without } from "lodash";

export type UndoableAction =
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
    | { type: "ToggleOutlineExtractedTiles" }
    | {
          type: "RemoveSpriteFromExtractedGroup";
          group: ExtractedSpriteGroup;
          sprite: ExtractedSprite;
      }
    | { type: "RotateGroupDown"; group: ExtractedSpriteGroup };

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

function rotateTilesUp(tiles: ExtractedTile[]): ExtractedTile[] {
    if (tiles.length === 0) {
        return tiles;
    }

    const firstTileY = tiles[0].composedY;

    let newTiles = [];

    for (let i = 0; i < tiles.length - 1; ++i) {
        newTiles.push({
            ...tiles[i],
            composedY: tiles[i + 1].composedY
        });
    }

    newTiles.push({
        ...tiles[tiles.length - 1],
        composedY: firstTileY
    });

    return newTiles;
}

function rotateSpritesUp(sprites: ExtractedSprite[]): ExtractedSprite[] {
    return sprites.map(sprite => {
        return {
            ...sprite,
            tiles: rotateTilesUp(sprite.tiles)
        };
    });
}

export function reducer(
    state: AppState,
    action: UndoableAction,
    pauseId: number
): AppState {
    switch (action.type) {
        case "ExtractSprite": {
            const { spriteMemoryIndex, composedX } = action;

            let newSpriteGroup = extractSpriteGroup(
                spriteMemoryIndex,
                composedX,
                pauseId
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

        case "RotateGroupDown": {
            const { group } = action;
            const layer = state.layers.find(
                layer => layer.groups.indexOf(group) > -1
            );

            if (!layer) {
                throw new Error(
                    "RotateGroupDown: failed to find layer for group"
                );
            }

            const sprites = rotateSpritesUp(group.sprites);

            const groups = update(group, layer.groups, { sprites });

            const layers = update(layer, state.layers, { groups });

            return {
                ...state,
                layers
            };
        }
    }
}
