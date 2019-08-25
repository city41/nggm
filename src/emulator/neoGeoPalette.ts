// each palette has 16 colors, each color is a 32 bit rgb value
// NOTE: this is due to using gngeo's pc palette instead of actual
// neo geo palettes, which only have 16bit colors (Thanks gngeo!)
const PALETTE_SIZE_IN_BYTES = 16 * 2;

/**
 * Convert from a neo geo palette color to a 32 rgb color
 * https://wiki.neogeodev.org/index.php?title=Colors
 */
function convert(col16: number) {
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

    return { r, g, b };
}

export function getRgbFromNeoGeoPalette(
    paletteIndex: number,
    colorIndex: number
): string {
    if (colorIndex === 0) {
        return "transparent";
    }

    const palAddr = window.Module._get_current_pal_addr();
    const palOffset = paletteIndex * PALETTE_SIZE_IN_BYTES;
    const colorOffset = colorIndex * 2;

    const color: number[] = [];

    for (let i = 0; i < 2; ++i) {
        color[i] = window.HEAPU8[palAddr + palOffset + colorOffset + i];
    }

    const combinedColor = color[0] | (color[1] << 8);

    const { r, g, b } = convert(combinedColor);

    return `rgb(${r}, ${g}, ${b})`;
}
