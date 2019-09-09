import {
    ExtractedSpriteGroup,
    ExtractedTile,
    Layer,
    ExtractedSprite
} from "./types";
import { getId } from "./ids";
import { isEqual } from "lodash";

function isExtractedSpriteArray(arr: unknown): arr is ExtractedSprite[] {
    if (!Array.isArray(arr)) {
        return false;
    }

    if (arr.length === 0) {
        return true;
    }

    if ("composedX" in arr[0]) {
        return true;
    }

    return false;
}

export function getMaxY(entities: ExtractedTile[] | ExtractedSprite[]): number {
    let tiles: ExtractedTile[];

    if (isExtractedSpriteArray(entities)) {
        tiles = entities.reduce<ExtractedTile[]>(
            (b, s) => b.concat(s.tiles),
            []
        );
    } else {
        tiles = entities;
    }

    if (tiles.length === 0) {
        return 0;
    }

    return Math.max(...tiles.map(t => t.composedY));
}

export function getMinY(tiles: ExtractedTile[]): number {
    if (tiles.length === 0) {
        return 0;
    }

    return Math.min(...tiles.map(s => s.composedY));
}

export function getMaxX(sprites: ExtractedSprite[]): number {
    if (sprites.length === 0) {
        return 0;
    }

    return Math.max(...sprites.map(s => s.composedX));
}

export function getMinX(sprites: ExtractedSprite[]): number {
    if (sprites.length === 0) {
        return 0;
    }

    return Math.min(...sprites.map(s => s.composedX));
}

/**
 * Determines if two sprite groups have the same sprites.
 *
 * Note this is not a deterministic check, as video ram changes all the time.
 * This is only a safe check if both sprite groups have the same pauseId
 */
export function haveSameSprites(
    a: ExtractedSpriteGroup,
    b: ExtractedSpriteGroup
) {
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
export function positionSpriteGroupInRelationToExistingGroups(
    newGroup: ExtractedSpriteGroup,
    oldGroups: ExtractedSpriteGroup[]
): ExtractedSpriteGroup {
    const sameGroup = oldGroups.find(og => og.pauseId === newGroup.pauseId);

    // first sprite from this pauseId? Then there is nothing to position
    if (!sameGroup) {
        return newGroup;
    }

    const diffX = sameGroup.sprites[0].composedX - sameGroup.sprites[0].screenX;

    return {
        ...newGroup,
        sprites: moveSprites(newGroup.sprites, diffX, "screenX")
    };
}

function moveSprites(
    sprites: ExtractedSprite[],
    diffX: number,
    baseX: "composedX" | "screenX" = "composedX"
): ExtractedSprite[] {
    return sprites.map(sprite => {
        return {
            ...sprite,
            composedX: sprite[baseX] + diffX
        };
    });
}

export function moveGroups(
    groups: ExtractedSpriteGroup[],
    diffX: number,
    pauseId: number
): ExtractedSpriteGroup[] {
    return groups.map(group => {
        if (group.pauseId !== pauseId) {
            return group;
        }

        return {
            ...group,
            sprites: moveSprites(group.sprites, diffX)
        };
    });
}

/**
 * When the compose window ends up with sprites that are up in the negative region,
 * this method causes all sprites to move down such that no sprites have a
 * negative y coordinate
 */
export function pushDownOutOfNegative(layer: Layer): Layer {
    const tiles = getAllTilesFromLayers([layer]);
    const minY = getMinY(tiles);

    if (minY >= 0) {
        return layer;
    }

    return {
        ...layer,
        groups: moveGroupsY(layer.groups, minY * -1)
    };
}

export function getAllTilesFromLayers(layers: Layer[]): ExtractedTile[] {
    const sprites = getAllSpritesFromLayers(layers);

    return sprites.reduce<ExtractedTile[]>((tiles, sprite) => {
        return tiles.concat(sprite.tiles);
    }, []);
}

export function getAllSpritesFromLayers(layers: Layer[]): ExtractedSprite[] {
    return layers.reduce<ExtractedSprite[]>((sprites, layer) => {
        return sprites.concat(getAllSpritesFromGroups(layer.groups));
    }, []);
}

function getAllSpritesFromGroups(
    groups: ExtractedSpriteGroup[]
): ExtractedSprite[] {
    return groups.reduce<ExtractedSprite[]>((sprites, group) => {
        return sprites.concat(group.sprites);
    }, []);
}

function getAllTilesFromGroups(
    groups: ExtractedSpriteGroup[]
): ExtractedTile[] {
    return groups.reduce<ExtractedTile[]>((tiles, group) => {
        return tiles.concat(getAllTilesFromSprites(group.sprites));
    }, []);
}

function getAllTilesFromSprites(sprites: ExtractedSprite[]): ExtractedTile[] {
    return sprites.reduce<ExtractedTile[]>((tiles, sprite) => {
        return tiles.concat(sprite.tiles);
    }, []);
}

function moveGroupsY(
    groups: ExtractedSpriteGroup[],
    deltaY: number
): ExtractedSpriteGroup[] {
    return groups.map(group => {
        return {
            ...group,
            sprites: moveSpritesY(group.sprites, deltaY)
        };
    });
}

function moveSpritesY(
    sprites: ExtractedSprite[],
    deltaY: number
): ExtractedSprite[] {
    return sprites.map(sprite => {
        return {
            ...sprite,
            tiles: moveTiles(sprite.tiles, deltaY)
        };
    });
}

function moveTiles(tiles: ExtractedTile[], deltaY: number): ExtractedTile[] {
    return tiles.map(tile => {
        return {
            ...tile,
            composedY: tile.composedY + deltaY
        };
    });
}

/**
 * When sprites end up with negative x coordinates (most commonly after
 * extending a layer via mirroring), this method will push all sprites to the right
 * such that no sprite has a negative x coordinate
 */
export function pushInOutOfNegative(layers: Layer[]): Layer[] {
    const sprites = getAllSpritesFromLayers(layers);
    const minX = getMinX(sprites);

    if (minX >= 0) {
        return layers;
    }

    return layers.map(layer => {
        return {
            ...layer,
            groups: moveGroupsX(layer.groups, minX * -1)
        };
    });
}

function moveGroupsX(
    groups: ExtractedSpriteGroup[],
    deltaX: number
): ExtractedSpriteGroup[] {
    return groups.map(group => {
        return {
            ...group,
            sprites: moveSprites(group.sprites, deltaX)
        };
    });
}

/**
 * Given a set of sprites, creates a mirror copy of them that is on the right side.
 * The mirroring is always on the y axis
 */
function mirrorSpritesToRight(sprites: ExtractedSprite[]): ExtractedSprite[] {
    const maxX = getMaxX(sprites);

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
    const minX = getMinX(sprites);
    const maxX = getMaxX(sprites) + 16;
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
export function extendGroupsViaMirroring(
    groups: ExtractedSpriteGroup[],
    pauseId: number
): ExtractedSpriteGroup[] {
    const sprites = groups.reduce<ExtractedSprite[]>((ss, group) => {
        return ss.concat(group.sprites);
    }, []);

    const rightMirror = mirrorSpritesToRight(sprites);
    const leftMirror = mirrorSpritesToLeft(sprites);

    const newLeftGroup = {
        id: getId(),
        pauseId,
        sprites: leftMirror
    };

    const newRightGroup = {
        id: getId(),
        pauseId,
        sprites: rightMirror
    };

    return [newLeftGroup, newRightGroup];
}
