// in SCB1,
// each sprite has 64, 16-bit, words
const SCB1_SPRITE_SIZE_BYTES = 64 * 2;
// const SCB3_OFFSET = 0x8200;

interface TileData {
    tileIndex: number;
    paletteIndex: number;
    horizontalFlip: boolean;
    verticalFlip: boolean;
}

interface SpriteData {
    tiles: TileData[];
    x: number;
    y: number;
    sticky: boolean;
}

function getTileData(spriteIndex: number): TileData[] {
    const tileRamAddr = window.Module._get_tile_ram_addr();
    const spriteOffset = SCB1_SPRITE_SIZE_BYTES * spriteIndex;

    const spriteData: number[] = [];

    for (let i = 0; i < SCB1_SPRITE_SIZE_BYTES; ++i) {
        spriteData[i] = window.HEAPU8[tileRamAddr + spriteOffset + i];
    }

    const tileData = [];

    for (let w = 0; w < spriteData.length; w += 4) {
        const firstWord = spriteData[w] | (spriteData[w + 1] << 8);
        const secondWord = spriteData[w + 2] | (spriteData[w + 3] << 8);

        // first word = least sig bits of tile index
        // second word, bits 4 through 7 = most sig bits of tile index
        const tileIndex = firstWord | (((secondWord >> 4) & 0xf) << 16);

        // top half of second word is the palette index
        const paletteIndex = (secondWord >> 8) & 0xff;

        const horizontalFlip = !!(secondWord & 1);

        tileData.push({
            tileIndex,
            paletteIndex,
            horizontalFlip,
            verticalFlip: false
        });
    }

    return tileData;
}

export function getSpriteData(spriteIndex: number): SpriteData {
    return {
        tiles: getTileData(spriteIndex),
        x: 0,
        y: 0,
        sticky: false
    };
}
