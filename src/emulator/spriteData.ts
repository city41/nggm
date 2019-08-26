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
    y: number;
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

function getTileData(
    spriteIndex: number,
    spriteSize: number,
    tileYs: number[]
): TileData[] {
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
        const verticalFlip = !!(secondWord & 2);

        tileData.push({
            y: tileYs[w / 4],
            tileIndex,
            paletteIndex,
            horizontalFlip,
            verticalFlip
        });
    }

    return tileData;
}

function transformY(rawY: number, yScale: number, spriteSize: number): number {
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
    let y = 0x200 - rawY;

    if (y > 0x110) {
        y -= 0x200;
    }

    if (fullmode === 2 || (fullmode === 1 && yScale === 0xff)) {
        while (y < 0) {
            y += (yScale + 1) << 1;
        }
    }

    return y;
}

const dataView = new DataView(new ArrayBuffer(2));

/**
 * special function to deal with the 9 bit x and y values for
 * a tile's position. This is needed to properly convert a negative
 * 9 bit value into the corresponding negative JS number
 */
function handleNeoGeo9Bit(neoGeoWord: number): number {
    let value = neoGeoWord >> 7;

    // check the very top, 16th bit, if it is set, we need to massage
    // x into a negative sixteen bit value
    // x is actually 9 bits, but we need to bump up to 16 since obviously
    // dataView.setInt9() does not exist :)
    if (neoGeoWord & 0x8000) {
        // javascript crappiness. x is of type number, which is 64 bits
        // we need to maintain the negative if x was negative in 9 bits
        // then when we run it through the dataView, we'll get the proper
        // negative value for x
        value |= 0xfe00;
    }

    // convert from unsigned to signed
    dataView.setUint16(0, value);
    return dataView.getInt16(0);
}

function getYSpriteSizeSticky(
    spriteIndex: number
): { y: number; tileYs: number[]; spriteSize: number; sticky: boolean } {
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
        const rawY = handleNeoGeo9Bit(scb3Word);

        const y = transformY(rawY, yScale, spriteSize);
        const tileYs = [];

        for (let t = 0; t < spriteSize; ++t) {
            tileYs.push((y + 16 * t) % 512);
        }

        return { y, tileYs, spriteSize, sticky };
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

    let x = handleNeoGeo9Bit(scb4Word);

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

export function getSpriteData(
    spriteIndex: number,
    honorTileSize: boolean
): SpriteData {
    const { y, tileYs, spriteSize } = getYSpriteSizeSticky(spriteIndex);

    return {
        tiles: getTileData(
            spriteIndex,
            honorTileSize ? spriteSize : 32,
            tileYs
        ),
        x: getX(spriteIndex),
        sticky: false,
        y
    };
}
