import { Crop, Layer, ExtractedSpriteGroup } from "./types";
// @ts-ignore
import { GIFEncoder } from "./jsgif/GIFEncoder";
import { layersToCanvas } from "./layersToCanvas";
import { getAllTilesFromLayers } from "./spriteUtil";

// loop set to zero means forever
const FOREVER = 0;

function determineNumberOfFramesToRender(layers: Layer[]): number {
    const tiles = getAllTilesFromLayers(layers);

    const maxAnimation = Math.max(...tiles.map(t => t.autoAnimation));

    // 2 raised to maxAnimation
    return 2 ** maxAnimation;
}

export function createGif(
    layers: Layer[],
    crop: Crop | undefined,
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

    const totalFrames = determineNumberOfFramesToRender(layers);

    let remainingFrames = totalFrames;

    const finish = () => {
        encoder.finish();

        const binaryData = encoder.stream().getData();

        onFinish(`data:image/gif;base64,${btoa(binaryData)}`);
    };

    const addFrame = () => {
        const animationCounter = totalFrames - remainingFrames;

        const frameCanvas = layersToCanvas(layers, animationCounter, crop);
        encoder.addFrame(frameCanvas.getContext("2d")!);

        --remainingFrames;

        onFrame(frameCanvas, animationCounter, totalFrames);

        if (remainingFrames) {
            setTimeout(addFrame, 1);
        } else {
            setTimeout(finish, 1);
        }
    };

    addFrame();
}
