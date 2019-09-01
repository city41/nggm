import { ExtractedSpriteGroup } from "./types";
import omggif from "omggif";
import { spriteGroupToCanvas } from "./spriteGroupToCanvas";

const TOTAL_FRAMES = 8;

// loop set to zero means forever
const FOREVER = 0;

interface FrameData {
    pixels: any;
    palette: any;
}

function getFrameData(
    spriteGroups: ExtractedSpriteGroup[],
    animationCounter: number
): FrameData {
    const frameCanvas = spriteGroupToCanvas(spriteGroups, animationCounter);

    const context = frameCanvas.getContext("2d");

    const data = context!.getImageData(
        0,
        0,
        frameCanvas.width,
        frameCanvas.height
    ).data;
    const pixels = [];
    const palette = [];

    for (let d = 0, p = 0; d < data.length; d += 4, p += 1) {
        const r = Math.floor(data[d + 0] * 0.1) * 10;
        const g = Math.floor(data[d + 1] * 0.1) * 10;
        const b = Math.floor(data[d + 2] * 0.1) * 10;
        const color = (r << 16) | (g << 8) | (b << 0);

        const paletteIndex = palette.indexOf(color);

        if (paletteIndex === -1) {
            pixels[p] = palette.length;
            palette.push(color);
        } else {
            pixels[p] = paletteIndex;
        }
    }

    // force palette to be power of 2
    let powof2 = 1;
    while (powof2 < palette.length) {
        powof2 <<= 1;
    }

    palette.length = powof2;

    return {
        pixels,
        palette
    };
}

function createDataUrl(buffer: number[], size: number): string {
    const bufferSlice = buffer.slice(0, size);

    const dataString = bufferSlice.map(v => String.fromCharCode(v)).join("");

    const base64String = btoa(dataString);

    return `data:image/gif;base64,${base64String}`;
}

export function createGif(spriteGroups: ExtractedSpriteGroup[]): string {
    const firstFrameCanvas = spriteGroupToCanvas(spriteGroups);

    const buffer = new Array(
        firstFrameCanvas.width * firstFrameCanvas.height * TOTAL_FRAMES * 5
    );

    const gifWriter = new omggif.GifWriter(
        // @ts-ignore
        buffer,
        firstFrameCanvas.width,
        firstFrameCanvas.height,
        { loop: FOREVER }
    );

    for (let i = 0; i < TOTAL_FRAMES; ++i) {
        const frameData = getFrameData(spriteGroups, i);
        gifWriter.addFrame(
            0,
            0,
            firstFrameCanvas.width,
            firstFrameCanvas.height,
            frameData.pixels,
            { palette: frameData.palette, delay: 5 }
        );
    }

    return createDataUrl(buffer, gifWriter.end());
}
