import React from "react";
import { palette } from "./palette";

import "./tile.css";

// 16 rows, each row has 2 ints (32 bits each)
const TILE_SIZE_INTS = 2 * 16;
const TILE_SIZE_BYTES = TILE_SIZE_INTS * 4;

interface TileProps {
    tileIndex: number;
}

export const Tile: React.FunctionComponent<TileProps> = ({ tileIndex }) => {
    const cromAddr = window.Module._get_rom_ctile_addr();
    const tileOffset = TILE_SIZE_BYTES * tileIndex;

    const tileData: number[] = [];

    for (let i = 0; i < TILE_SIZE_BYTES; ++i) {
        tileData[i] = window.HEAPU8[cromAddr + tileOffset + i];
    }

    let rows = [];
    let key = 0;

    for (let y = 0; y < 16; ++y) {
        const pixels = [];
        for (let x = 4; x < 8; ++x) {
            const p = tileData[y * 8 + x];
            pixels.push(
                <div
                    key={++key}
                    className="pixel"
                    style={{ backgroundColor: palette[p & 0xf] }}
                />,
                <div
                    key={++key}
                    className="pixel"
                    style={{ backgroundColor: palette[(p >> 4) & 0xf] }}
                />
            );
        }
        for (let x = 0; x < 4; ++x) {
            const p = tileData[y * 8 + x];
            pixels.push(
                <div
                    key={++key}
                    className="pixel"
                    style={{ backgroundColor: palette[p & 0xf] }}
                />,
                <div
                    key={++key}
                    className="pixel"
                    style={{ backgroundColor: palette[(p >> 4) & 0xf] }}
                />
            );
        }
        rows.push(<div className="row">{pixels}</div>);
    }

    return <div className="tile">{rows}</div>;
};
