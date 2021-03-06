import React from "react";
import { renderTileToCanvas } from "../../canvas/renderTileToCanvas";
import {
  getNeoGeoPalette,
  convertNeoGeoPaletteToRGB
} from "../../palette/neoGeoPalette";

import styles from "./tile.module.css";

interface TileProps {
  tileIndex: number;
  paletteIndex: number;
  horizontalFlip?: boolean;
  verticalFlip?: boolean;
}

export const Tile: React.FunctionComponent<TileProps> = React.memo<TileProps>(
  ({ tileIndex, paletteIndex, horizontalFlip, verticalFlip }) => {
    function renderCanvas(canvas: HTMLCanvasElement) {
      const rgbPalette = convertNeoGeoPaletteToRGB(
        getNeoGeoPalette(paletteIndex)
      );
      renderTileToCanvas(canvas, tileIndex, rgbPalette);
    }

    const horizontalScale = horizontalFlip ? -1 : 1;
    const verticalScale = verticalFlip ? -1 : 1;

    const inlineStyle = {
      transform: `scale(${horizontalScale},${verticalScale})`
    };

    return (
      <canvas
        className={styles.canvas}
        ref={r => r && renderCanvas(r)}
        style={inlineStyle}
      />
    );
  }
);
