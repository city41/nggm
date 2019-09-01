import { ExtractedSpriteGroup } from "./types";
// @ts-ignore
import { GIFEncoder } from "./jsgif/GIFEncoder";
import { spriteGroupToCanvas } from "./spriteGroupToCanvas";

const TOTAL_FRAMES = 8;
// loop set to zero means forever
const FOREVER = 0;

export function createGif(
    spriteGroups: ExtractedSpriteGroup[],
    width: number,
    height: number,
    delay: number
): string {
    // @ts-ignore
    const encoder: any = new GIFEncoder();
    encoder.setRepeat(FOREVER);
    encoder.setDelay(delay);
    encoder.setQuality(1);

    encoder.start();

    for (let i = 0; i < TOTAL_FRAMES; ++i) {
        const frameCanvas = spriteGroupToCanvas(spriteGroups, i, width, height);
        encoder.addFrame(frameCanvas.getContext("2d")!);
    }

    encoder.finish();

    const binaryData = encoder.stream().getData();

    return `data:image/gif;base64,${btoa(binaryData)}`;
}
