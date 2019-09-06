import {
    ExtractedSpriteGroup,
    ExtractedTile,
    Layer,
    ExtractedSprite
} from "./types";
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
    diffX: number
): ExtractedSpriteGroup[] {
    return groups.map(group => {
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
 *
 *TODO: make this create new groups and not mutate to support undo/redo in future
 */
export function pushDownOutOfNegative(layers: Layer[]): Layer[] {
    const groups = layers.reduce<ExtractedSpriteGroup[]>((gs, l) => {
        return gs.concat(l.groups);
    }, []);

    const tiles = groups.reduce<ExtractedTile[]>((ts, sg) => {
        const tiles = sg.sprites.reduce<ExtractedTile[]>((sts, s) => {
            return sts.concat(s.tiles);
        }, []);

        return ts.concat(tiles);
    }, []);

    const mostNegative = getMinY(tiles);

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
export function pushInOutOfNegative(layers: Layer[]): Layer[] {
    const groups = layers.reduce<ExtractedSpriteGroup[]>((gs, l) => {
        return gs.concat(l.groups);
    }, []);

    const sprites = groups.reduce<ExtractedSprite[]>((ss, sg) => {
        return ss.concat(sg.sprites);
    }, []);

    const mostNegative = getMinX(sprites);

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
