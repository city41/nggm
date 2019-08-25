// ALERT!
// vram addresses in the neo geo are word wide, not byte wide!
// TODO: can probably just use HEAPU16 and make this all much simpler
// ALERT!

// in SCB1,
// each sprite has 64, 16-bit, words
const SCB1_SPRITE_SIZE_BYTES = 64 * 2;

// it starts at word $8000, so *2 to get byte address
const SCB2_BYTE_OFFSET = 0x8000 * 2;

// it starts at word $8200, so *2 to get byte address
const SCB3_BYTE_OFFSET = 0x8200 * 2;

// it starts at word $8400, so *2 to get byte address
const SCB4_BYTE_OFFSET = 0x8400 * 2;

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

function getYSpriteSizeSticky(
    spriteIndex: number
): { y: number; spriteSize: number; sticky: boolean } {
    if (spriteIndex < 0) {
        throw new Error("getYSpriteSizeSticky: sprite index under zero!");
    }

    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb3StartAddr = tileRamAddr + SCB3_BYTE_OFFSET;

    const spriteScb3Addr = scb3StartAddr + spriteIndex * 2;

    const scb3Word =
        window.HEAPU8[spriteScb3Addr] |
        (window.HEAPU8[spriteScb3Addr + 1] << 8);

    const sticky = !!((scb3Word >> 6) & 1);

    if (sticky) {
        return {
            ...getYSpriteSizeSticky(spriteIndex - 1),
            sticky
        };
    } else {
        const yScale = getScale(spriteIndex, { ignoreSticky: true }).yScale;
        const spriteSize = scb3Word & 0x3f;

        let fullmode;

        if (spriteSize === 0x20) {
            fullmode = 1;
        } else if (spriteSize >= 0x21) {
            fullmode = 2;
        } else {
            fullmode = 0;
        }

        // getting the final screen y is very complicated and
        // honestly don't fully understand it. This code was copied
        // from gngeo, video.c#draw_screen()
        let y = 0x200 - (scb3Word >> 7);

        if (y > 0x110) {
            y -= 0x200;
        }

        if (fullmode === 2 || (fullmode === 1 && yScale === 0xff)) {
            while (y < 0) {
                y += (yScale + 1) << 1;
            }
        }

        return { y, spriteSize, sticky };
    }
}

function getX(spriteIndex: number): number {
    if (spriteIndex < 0) {
        throw new Error("getX: sprite index under zero!");
    }

    const sticky = getYSpriteSizeSticky(spriteIndex).sticky;

    if (sticky) {
        const xScale = getScale(spriteIndex).xScale;
        return getX(spriteIndex - 1) + xScale;
    }

    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb4StartAddr = tileRamAddr + SCB4_BYTE_OFFSET;

    const spriteScb4Addr = scb4StartAddr + spriteIndex * 2;

    const scb4Word =
        window.HEAPU8[spriteScb4Addr] |
        (window.HEAPU8[spriteScb4Addr + 1] << 8);

    let x = scb4Word >> 7;

    if (x >= 0x1f0) {
        x -= 0x200;
    }

    return x;
}

function getScale(
    spriteIndex: number,
    options?: { ignoreSticky: boolean }
): { yScale: number; xScale: number } {
    if (spriteIndex < 0) {
        throw new Error("getScale: sprite index under zero!");
    }

    if (!options || !options.ignoreSticky) {
        const sticky = getYSpriteSizeSticky(spriteIndex).sticky;

        if (sticky) {
            return getScale(spriteIndex - 1);
        }
    }

    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb2StartAddr = tileRamAddr + SCB2_BYTE_OFFSET;
    const spriteScb2Addr = scb2StartAddr + spriteIndex * 2;

    const scb2Word =
        window.HEAPU8[spriteScb2Addr] |
        (window.HEAPU8[spriteScb2Addr + 1] << 8);

    const yScale = scb2Word & 0xff;
    const xScale = ((scb2Word >> 8) & 0xf) + 1;

    return { yScale, xScale };
}

export function getSpriteData(spriteIndex: number): SpriteData {
    const { y, spriteSize } = getYSpriteSizeSticky(spriteIndex);

    return {
        tiles: getTileData(spriteIndex, spriteSize),
        x: getX(spriteIndex),
        sticky: false,
        y
    };
}
