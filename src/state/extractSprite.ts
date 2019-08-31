import { ExtractedSprite, ExtractedTile } from "./types";
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

export function extractSprite(
    spriteMemoryIndex: number,
    composedX: number
): ExtractedSprite {
    const spriteData = getSpriteData(spriteMemoryIndex, true);

    return {
        spriteMemoryIndex,
        tiles: spriteData.tiles.map(convertTileDataToExtractedTile),
        screenX: spriteData.x,
        screenY: spriteData.y,
        composedX,
        composedY: spriteData.y
    };
}
