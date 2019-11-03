import { memoize } from "lodash";
import { RgbPalette } from "../state/types";

// 16 rows, each row has 2 ints (32 bits each)
const TILE_SIZE_INTS = 2 * 16;
const TILE_SIZE_BYTES = TILE_SIZE_INTS * 4;

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

export const getTileIndexedColorData = memoize(function getTileIndexedColorData(
  tileIndex: number
): number[] {
  const cromAddr = window.Module._get_rom_ctile_addr();
  const tileOffset = TILE_SIZE_BYTES * tileIndex;

  const tileData: number[] = [];

  for (let i = 0; i < TILE_SIZE_BYTES; ++i) {
    tileData[i] = window.HEAPU8[cromAddr + tileOffset + i];
    // console.log("tileData[i]", tileIndex, tileData[i]);
  }

  const tileIndexData: number[] = [];

  for (let y = 0; y < 16; ++y) {
    for (let x = 0; x < 8; ++x) {
      const pixelPair = tileData[y * 8 + map[x]];

      const leftPixelColorIndex = (pixelPair >> 4) & 0xf;
      const rightPixelColorIndex = pixelPair & 0xf;

      tileIndexData.push(leftPixelColorIndex, rightPixelColorIndex);
    }
  }

  return tileIndexData;
});

function hashPalette(palette: RgbPalette): number {
  return palette.reduce<number>((hash, color) => {
    return color.reduce<number>((innerHash, channel) => {
      return innerHash * 19 + channel;
    }, hash);
  }, 17);
}

const tileCanvasCache: Record<string, HTMLCanvasElement> = {};

export function renderTileToCanvas(
  destCanvas: HTMLCanvasElement,
  tileIndex: number,
  rgbPalette: RgbPalette
) {
  if (process.env.ENABLE_DEMO_DUMP) {
    // @ts-ignore
    window.neededTiles = window.neededTiles || {};
    // @ts-ignore
    window.neededTiles[tileIndex] = true;
  }

  destCanvas.width = 16;
  destCanvas.height = 16;

  const destContext = destCanvas.getContext("2d")!;
  const key = `${tileIndex}-${hashPalette(rgbPalette)}`;

  if (tileCanvasCache[key]) {
    destContext.drawImage(tileCanvasCache[key], 0, 0);
    return destCanvas;
  }

  const cacheCanvas = document.createElement("canvas");
  cacheCanvas.width = 16;
  cacheCanvas.height = 16;
  const cacheContext = cacheCanvas.getContext("2d")!;

  const indexedTileData = getTileIndexedColorData(tileIndex);

  const imageData = cacheContext.getImageData(0, 0, 16, 16);

  for (let y = 0; y < 16; ++y) {
    for (let x = 0; x < 16; ++x) {
      const pixelPaletteIndex = indexedTileData[y * 16 + x];
      const pixel = rgbPalette[pixelPaletteIndex];

      for (let i = 0; i < pixel.length; ++i) {
        imageData.data[(y * 16 + x) * 4 + i] = pixel[i];
      }
    }
  }

  cacheContext.putImageData(imageData, 0, 0);

  tileCanvasCache[key] = cacheCanvas;
  renderTileToCanvas(destCanvas, tileIndex, rgbPalette);
}
