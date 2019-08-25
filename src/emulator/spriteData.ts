// ALERT!
// vram addresses in the neo geo are word wide, not byte wide!
// TODO: can probably just use HEAPU16 and make this all much simpler
// ALERT!

// in SCB1,
// each sprite has 64, 16-bit, words
const SCB1_SPRITE_SIZE_BYTES = 64 * 2;

// it starts at word $8200, s *2 to get byte address
const SCB3_BYTE_OFFSET = 0x8200 * 2;

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

function getTileData(spriteIndex: number, spriteSize: number): TileData[] {
    console.log("spriteSize", spriteSize);
    const tileRamAddr = window.Module._get_tile_ram_addr();
    const spriteOffset = SCB1_SPRITE_SIZE_BYTES * spriteIndex;

    const spriteData: number[] = [];

    for (let i = 0; i < spriteSize * 4; ++i) {
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

function getYAndSpriteSize(
    spriteIndex: number
): { y: number; spriteSize: number } {
    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb3StartAddr = tileRamAddr + SCB3_BYTE_OFFSET;

    const spriteScb3Addr = scb3StartAddr + spriteIndex * 2;

    const scb3Word =
        window.HEAPU8[spriteScb3Addr] |
        (window.HEAPU8[spriteScb3Addr + 1] << 8);

    // according to the neo geo wiki, this should be 496 - y,
    // but I believe gngeo has already done the shift for us
    const y = (scb3Word >> 7) & 0x7f;
    const sticky = !!((scb3Word >> 6) & 1);

    let spriteSize;
    if (sticky) {
    } else {
        spriteSize = scb3Word & 0x3f;
    }

    return { y, spriteSize };
}

export function getSpriteData(spriteIndex: number): SpriteData {
    const { y, spriteSize } = getYAndSpriteSize(spriteIndex);

    return {
        tiles: getTileData(spriteIndex, spriteSize),
        x: 0,
        sticky: false,
        y
    };
}
