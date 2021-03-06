// each palette has 16 colors, each color is a 16 bit rgb value
const COLORS_PER_PALETTE = 16;
const PALETTE_SIZE_IN_BYTES = COLORS_PER_PALETTE * 2;

/**
 * Convert from a neo geo palette color to a 32 rgb color
 * https://wiki.neogeodev.org/index.php?title=Colors
 */
function convertNeoGeoColorToRGBColor(
  col16: number
): [number, number, number, number] {
  // the least significant bit is shared by each channel
  // if it is zero, the entire color is a tad darker, hence the name "dark bit"
  const darkBit = (col16 >> 15) & 1;

  const upperB = (col16 & 0xf) << 2;
  const lowerB = ((col16 >> 12) & 1) << 1;
  const b5 = upperB | lowerB | darkBit;

  const upperG = ((col16 >> 4) & 0xf) << 2;
  const lowerG = ((col16 >> 13) & 1) << 1;
  const g5 = upperG | lowerG | darkBit;

  const upperR = ((col16 >> 8) & 0xf) << 2;
  const lowerR = ((col16 >> 14) & 1) << 1;
  const r5 = upperR | lowerR | darkBit;

  // neo geo color channels are six bits (max value of 63), but need to map
  // them to a 8 bit color channel (max value of 255)
  const b = (b5 / 63) * 255;
  const g = (g5 / 63) * 255;
  const r = (r5 / 63) * 255;

  return [r, g, b, 255];
}

export function getNeoGeoPalette(paletteMemoryIndex: number): number[] {
  if (process.env.ENABLE_DEMO_DUMP) {
    // @ts-ignore
    window.neededPalettes = window.neededPalettes || {};
    // @ts-ignore
    window.neededPalettes[paletteMemoryIndex] = true;
  }

  const palAddr = window.Module._get_current_pal_addr();
  const palOffset = paletteMemoryIndex * PALETTE_SIZE_IN_BYTES;
  const palIndexInHeap = (palAddr + palOffset) / 2;

  return [
    ...window.Module.HEAPU16.slice(
      palIndexInHeap,
      palIndexInHeap + COLORS_PER_PALETTE
    )
  ];
}

export function convertNeoGeoPaletteToRGB(
  neoGeoPalette: number[]
): Array<[number, number, number, number]> {
  const mapped = neoGeoPalette.map(convertNeoGeoColorToRGBColor);

  // the first color is always transparent
  return [[0, 0, 0, 0], ...mapped.slice(1)];
}

export function getRgbFromNeoGeoPalette(
  paletteIndex: number,
  colorIndex: number
): number[] {
  if (colorIndex === 0) {
    return [0, 0, 0, 0];
  }

  const palAddr = window.Module._get_current_pal_addr();
  const palOffset = paletteIndex * PALETTE_SIZE_IN_BYTES;
  const colorOffset = colorIndex * 2;

  const color: number[] = [];

  for (let i = 0; i < 2; ++i) {
    color[i] = window.HEAPU8[palAddr + palOffset + colorOffset + i];
  }

  const combinedColor = color[0] | (color[1] << 8);

  return convertNeoGeoColorToRGBColor(combinedColor);
}

export function getBackdropNeoGeoColor(): number {
  let palAddr = window.Module._get_current_pal_addr();

  // get to the final color in all the palettes, ie the backdrop color
  // https://wiki.neogeodev.org/index.php?title=Palettes
  palAddr += 0x1ffe;

  // since we are going to use HEAPU16, divide the address by two
  palAddr /= 2;

  return window.Module.HEAPU16[palAddr];
}

export function neoGeoColorToCSS(neoGeoColor: number): string {
  const asArray = convertNeoGeoColorToRGBColor(neoGeoColor);

  return `rgb(${asArray[0]}, ${asArray[1]}, ${asArray[2]})`;
}
