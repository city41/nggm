import { Layer, ExtractedSpriteGroup } from "./types";
import { layersToCanvas } from "./layersToCanvas";
import { setLayerToZeroZero, setGroupToZeroZero } from "./spriteUtil";

type ToDataUrlResult = {
    url: string;
    width: number;
    height: number;
};

export function layerToDataUrl(layer: Layer): ToDataUrlResult {
    const layers = [setLayerToZeroZero(layer)];
    const canvas = layersToCanvas(layers);

    return {
        url: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height
    };
}

export function spriteGroupToDataUrl(
    group: ExtractedSpriteGroup
): ToDataUrlResult {
    const layers = [{ id: 0, groups: [setGroupToZeroZero(group)] }];
    const canvas = layersToCanvas(layers);

    return {
        url: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height
    };
}
