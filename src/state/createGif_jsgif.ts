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
    delay: number,
    onFrame: (
        canvas: HTMLCanvasElement,
        frameNumber: number,
        totalFrames: number
    ) => void,
    onFinish: (dataUrl: string) => void
): void {
    // @ts-ignore
    const encoder: any = new GIFEncoder();
    encoder.setRepeat(FOREVER);
    encoder.setDelay(delay);
    encoder.setQuality(1);

    encoder.start();

    let remainingFrames = TOTAL_FRAMES;

    const finish = () => {
        encoder.finish();

        const binaryData = encoder.stream().getData();

        onFinish(`data:image/gif;base64,${btoa(binaryData)}`);
    };

    const addFrame = () => {
        const animationCounter = TOTAL_FRAMES - remainingFrames;

        const frameCanvas = spriteGroupToCanvas(
            spriteGroups,
            animationCounter,
            width,
            height
        );
        encoder.addFrame(frameCanvas.getContext("2d")!);

        --remainingFrames;

        onFrame(frameCanvas, animationCounter, TOTAL_FRAMES);

        if (remainingFrames) {
            setTimeout(addFrame, 1);
        } else {
            setTimeout(finish, 1);
        }
    };

    addFrame();
}
