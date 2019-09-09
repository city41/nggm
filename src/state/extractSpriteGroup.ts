import { ExtractedSpriteGroup, ExtractedSprite, ExtractedTile } from "./types";
import { getSpriteData, TileData } from "./spriteData";
import {
    getNeoGeoPalette,
    convertNeoGeoPaletteToRGB
} from "../palette/neoGeoPalette";
import { getId } from "./ids";

function convertTileDataToExtractedTile(tileData: TileData): ExtractedTile {
    const { y, paletteIndex, ...rest } = tileData;
    const neoGeoPalette = getNeoGeoPalette(tileData.paletteIndex);
    const rgbPalette = convertNeoGeoPaletteToRGB(neoGeoPalette);

    return {
        ...rest,
        composedY: y,
        neoGeoPalette,
        rgbPalette
    };
}

export function getSpriteGroup(spriteMemoryIndex: number): number[] {
    let rootSpriteIndex = spriteMemoryIndex;

    let spriteData = getSpriteData(rootSpriteIndex);

    while (spriteData.sticky && rootSpriteIndex > 0) {
        rootSpriteIndex -= 1;
        spriteData = getSpriteData(rootSpriteIndex);
    }

    const spriteMemoryIndices = [];

    do {
        spriteMemoryIndices.push(rootSpriteIndex);
        rootSpriteIndex += 1;
        spriteData = getSpriteData(rootSpriteIndex);
    } while (spriteData.sticky);

    return spriteMemoryIndices;
}

export function extractSpriteAndStickyCompanionsToGroup(
    spriteMemoryIndex: number,
    composedX: number,
    pauseId: number,
    additionalProps: Partial<ExtractedSprite> = {}
): ExtractedSpriteGroup {
    const allSpriteMemoryIndices = getSpriteGroup(spriteMemoryIndex);

    return extractSpritesIntoGroup(
        allSpriteMemoryIndices,
        composedX,
        pauseId,
        additionalProps
    );
}

export function extractSpritesIntoGroup(
    spriteMemoryIndices: number[],
    composedX: number,
    pauseId: number,
    additionalProps: Partial<ExtractedSprite> = {}
): ExtractedSpriteGroup {
    const sprites: ExtractedSprite[] = spriteMemoryIndices.map((smi, i) => {
        const spriteData = getSpriteData(smi);
        return {
            ...additionalProps,
            pauseId,
            spriteMemoryIndex: smi,
            tiles: spriteData.tiles.map(convertTileDataToExtractedTile),
            screenX: spriteData.x,
            screenY: spriteData.y,
            composedX: composedX + i * 16,
            composedY: spriteData.y
        };
    }) as ExtractedSprite[];

    const group: ExtractedSpriteGroup = {
        id: getId(),
        pauseId,
        sprites
    };

    return group;
}
