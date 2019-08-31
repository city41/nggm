import React from "react";
import classnames from "classnames";

import styles from "./extractedTile.module.css";

// 16 rows, each row has 2 ints (32 bits each)
const TILE_SIZE_INTS = 2 * 16;
const TILE_SIZE_BYTES = TILE_SIZE_INTS * 4;

interface ExtractedTileProps {
    y: number;
    tileIndex: number;
    rgbPalette: Array<[number, number, number, number]>;
    horizontalFlip?: boolean;
    verticalFlip?: boolean;
}

const map: Record<string, number> = {
    0: 3,
    1: 2,
    2: 1,
    3: 0,
    4: 7,
    5: 6,
    6: 5,
    7: 4
};

export class ExtractedTile extends React.PureComponent<ExtractedTileProps> {
    render() {
        const {
            y: tileY,
            tileIndex,
            rgbPalette,
            horizontalFlip,
            verticalFlip
        } = this.props;

        function renderCanvas(canvas: HTMLCanvasElement) {
            const cromAddr = window.Module._get_rom_ctile_addr();
            const tileOffset = TILE_SIZE_BYTES * tileIndex;

            const tileData: number[] = [];

            for (let i = 0; i < TILE_SIZE_BYTES; ++i) {
                tileData[i] = window.HEAPU8[cromAddr + tileOffset + i];
            }

            canvas.width = 16;
            canvas.height = 16;

            const context = canvas.getContext("2d")!;

            const imageData = context.getImageData(0, 0, 16, 16);

            for (let y = 0; y < 16; ++y) {
                for (let x = 0; x < 8; ++x) {
                    const pixelPair = tileData[y * 8 + map[x]];

                    const leftPixelColorIndex = (pixelPair >> 4) & 0xf;
                    const rightPixelColorIndex = pixelPair & 0xf;

                    const leftPixel = rgbPalette[leftPixelColorIndex];
                    const rightPixel = rgbPalette[rightPixelColorIndex];

                    for (let i = 0; i < leftPixel.length; ++i) {
                        imageData.data[(y * 16 + x * 2) * 4 + i] = leftPixel[i];
                        imageData.data[(y * 16 + x * 2 + 1) * 4 + i] =
                            rightPixel[i];
                    }
                }
            }

            context.putImageData(imageData, 0, 0);
        }

        const horizontalScale = horizontalFlip ? -1 : 1;
        const verticalScale = verticalFlip ? -1 : 1;

        const inlineStyle = {
            transform: `scale(${horizontalScale},${verticalScale})`,
            top: tileY
        };

        return (
            <canvas
                className={styles.root}
                ref={r => r && renderCanvas(r)}
                style={inlineStyle}
            />
        );
    }
}
