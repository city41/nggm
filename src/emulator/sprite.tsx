import React from "react";
import { Tile } from "./tile";

import "./sprite.css";

// in SCB1,
// each sprite has 64, 16-bit, words
const SCB1_SPRITE_SIZE_BYTES = 64 * 2;

interface SpriteProps {
    spriteIndex: number;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    spriteIndex
}) => {
    const tileRamAddr = window.Module._get_tile_ram_addr();
    const spriteOffset = SCB1_SPRITE_SIZE_BYTES * spriteIndex;

    const spriteData: number[] = [];

    for (let i = 0; i < SCB1_SPRITE_SIZE_BYTES; ++i) {
        spriteData[i] = window.HEAPU8[tileRamAddr + spriteOffset + i];
    }

    let tiles = [];

    // each word is two bytes, looking at two words at a time, so jump by 4 bytes
    for (let w = 0; w < spriteData.length; w += 4) {
        const firstWord = spriteData[w] | (spriteData[w + 1] << 8);
        const secondWord = spriteData[w + 2] | (spriteData[w + 3] << 8);

        // first word = least sig bits of tile index
        // second word, bits 4 through 7 = most sig bits of tile index
        const tileIndex = firstWord | (((secondWord >> 4) & 0xf) << 16);

        // top half of second word is the palette index
        const paletteIndex = (secondWord >> 8) & 0xff;

        tiles.push(
            <Tile key={w} tileIndex={tileIndex} paletteIndex={paletteIndex} />
        );
    }

    return <div className="sprite">{tiles}</div>;
};
