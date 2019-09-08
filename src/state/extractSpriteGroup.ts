import { ExtractedSpriteGroup, ExtractedSprite, ExtractedTile } from "./types";
import { getSpriteData, TileData } from "./spriteData";
import {
    getNeoGeoPalette,
    convertNeoGeoPaletteToRGB
} from "../palette/neoGeoPalette";

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

function getSpriteGroup(spriteMemoryIndex: number): number[] {
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

export function extractSpriteGroup(
    spriteMemoryIndex: number,
    composedX: number,
    pauseId: number
): ExtractedSpriteGroup {
    const allSpriteMemoryIndices = getSpriteGroup(spriteMemoryIndex);

    const sprites: ExtractedSprite[] = allSpriteMemoryIndices.map((smi, i) => {
        const spriteData = getSpriteData(smi);
        return {
            pauseId,
            spriteMemoryIndex: smi,
            tiles: spriteData.tiles.map(convertTileDataToExtractedTile),
            screenX: spriteData.x,
            screenY: spriteData.y,
            composedX: composedX + i * 16,
            composedY: spriteData.y
        };
    });

    const group: ExtractedSpriteGroup = {
        pauseId,
        sprites,
        hidden: false
    };

    return group;
}
