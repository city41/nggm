import { memoize } from "lodash";

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

export function renderTileToCanvas(
  canvas: HTMLCanvasElement,
  tileIndex: number,
  rgbPalette: Array<[number, number, number, number]>
) {
  console.log("renderTileToCanvas");
  const indexedTileData = getTileIndexedColorData(tileIndex);

  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext("2d")!;
  const imageData = context.getImageData(0, 0, 16, 16);

  for (let y = 0; y < 16; ++y) {
    for (let x = 0; x < 16; ++x) {
      const pixelPaletteIndex = indexedTileData[y * 16 + x];
      const pixel = rgbPalette[pixelPaletteIndex];

      for (let i = 0; i < pixel.length; ++i) {
        imageData.data[(y * 16 + x) * 4 + i] = pixel[i];
      }
    }
  }

  context.putImageData(imageData, 0, 0);
}
