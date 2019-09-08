import { getTileIndexedColorData } from "./renderTileToCanvas";
import { memoize } from "lodash";

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

export interface TileData {
    y: number;
    tileIndex: number;
    paletteIndex: number;
    horizontalFlip: boolean;
    verticalFlip: boolean;
    autoAnimation: 0 | 2 | 3;
}

interface SpriteData {
    tiles: TileData[];
    x: number;
    y: number;
    sticky: boolean;
    spriteSize: number;
}

function getTileData(
    spriteMemoryIndex: number,
    spriteSize: number,
    tileYs: number[]
): TileData[] {
    const tileRamAddr = window.Module._get_tile_ram_addr();
    const spriteOffset = SCB1_SPRITE_SIZE_BYTES * spriteMemoryIndex;

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
        let tileIndex = firstWord | (((secondWord >> 4) & 0xf) << 16);

        let autoAnimation: 0 | 2 | 3 = 0;

        // automatic animation
        if (secondWord & 0x8) {
            autoAnimation = 3;
        } else if (secondWord & 0x4) {
            autoAnimation = 2;
        }

        // top half of second word is the palette index
        const paletteIndex = (secondWord >> 8) & 0xff;

        const horizontalFlip = !!(secondWord & 1);
        const verticalFlip = !!(secondWord & 2);

        tileData.push({
            y: tileYs[w / 4],
            tileIndex,
            paletteIndex,
            horizontalFlip,
            verticalFlip,
            autoAnimation
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

function getYSpriteSizeSticky(
    spriteMemoryIndex: number
): { y: number; tileYs: number[]; spriteSize: number; sticky: boolean } {
    if (spriteMemoryIndex < 0) {
        throw new Error("getYSpriteSizeSticky: sprite index under zero!");
    }

    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb3StartAddr = tileRamAddr + SCB3_BYTE_OFFSET;

    const spriteScb3Addr = scb3StartAddr + spriteMemoryIndex * 2;

    const scb3Word =
        window.HEAPU8[spriteScb3Addr] |
        (window.HEAPU8[spriteScb3Addr + 1] << 8);

    const sticky = !!((scb3Word >> 6) & 1);

    if (sticky) {
        return {
            ...getYSpriteSizeSticky(spriteMemoryIndex - 1),
            sticky
        };
    } else {
        const yScale = getScale(spriteMemoryIndex, { ignoreSticky: true })
            .yScale;
        const spriteSize = scb3Word & 0x3f;
        const rawY = scb3Word >> 7;

        const y = transformY(rawY, yScale, spriteSize);
        const tileYs = [];

        for (let t = 0; t < spriteSize; ++t) {
            tileYs.push((y + 16 * t) % 512);
        }

        return { y, tileYs, spriteSize, sticky };
    }
}

function getX(spriteMemoryIndex: number): number {
    if (spriteMemoryIndex < 0) {
        throw new Error("getX: sprite index under zero!");
    }

    const sticky = getYSpriteSizeSticky(spriteMemoryIndex).sticky;

    let x;

    if (sticky) {
        const xScale = getScale(spriteMemoryIndex).xScale;
        x = getX(spriteMemoryIndex - 1) + xScale;
    } else {
        const tileRamAddr = window.Module._get_tile_ram_addr();
        const scb4StartAddr = tileRamAddr + SCB4_BYTE_OFFSET;

        const spriteScb4Addr = scb4StartAddr + spriteMemoryIndex * 2;

        const scb4Word =
            window.HEAPU8[spriteScb4Addr] |
            (window.HEAPU8[spriteScb4Addr + 1] << 8);

        x = scb4Word >> 7;
    }

    if (x >= 0x1f0) {
        x -= 0x200;
    }

    return x;
}

function getScale(
    spriteMemoryIndex: number,
    options?: { ignoreSticky: boolean }
): { yScale: number; xScale: number } {
    if (spriteMemoryIndex < 0) {
        throw new Error("getScale: sprite index under zero!");
    }

    if (!options || !options.ignoreSticky) {
        const sticky = getYSpriteSizeSticky(spriteMemoryIndex).sticky;

        if (sticky) {
            return getScale(spriteMemoryIndex - 1);
        }
    }

    const tileRamAddr = window.Module._get_tile_ram_addr();
    const scb2StartAddr = tileRamAddr + SCB2_BYTE_OFFSET;
    const spriteScb2Addr = scb2StartAddr + spriteMemoryIndex * 2;

    const scb2Word =
        window.HEAPU8[spriteScb2Addr] |
        (window.HEAPU8[spriteScb2Addr + 1] << 8);

    const yScale = scb2Word & 0xff;
    const xScale = ((scb2Word >> 8) & 0xf) + 1;

    return { yScale, xScale };
}

function isTileEmpty(tile: TileData): boolean {
    const tileIndexData = getTileIndexedColorData(tile.tileIndex);

    return tileIndexData.every(i => i === 0);
}

export function getSpriteData(spriteMemoryIndex: number): SpriteData {
    const { sticky, y, tileYs, spriteSize } = getYSpriteSizeSticky(
        spriteMemoryIndex
    );

    const tiles = getTileData(spriteMemoryIndex, spriteSize, tileYs);

    return {
        tiles,
        x: getX(spriteMemoryIndex),
        sticky,
        y,
        spriteSize
    };
}

export function isSpriteEmpty(spriteMemoryIndex: number): boolean {
    return getYSpriteSizeSticky(spriteMemoryIndex).spriteSize === 0;
}
