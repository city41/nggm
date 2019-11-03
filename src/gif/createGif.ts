import { Crop, Layer, ExtractedTile } from "../state/types";
// @ts-ignore
import { GIFEncoder } from "./jsgif/GIFEncoder";
import { layersToCanvas } from "../canvas/layersToCanvas";
import { getAllTilesFromLayers } from "../sprite/spriteUtil";

// loop set to zero means forever
const FOREVER = 0;

function determineNumberOfFramesToRender(
  layers: Layer[],
  crop: Crop | undefined
): number {
  // const tiles = getAllTilesFromLayers(layers);

  let validTiles;

  if (!crop) {
    validTiles = getAllTilesFromLayers(layers);
  } else {
    validTiles = layers.reduce<ExtractedTile[]>((ts, layer) => {
      const validLayerTiles = layer.groups.reduce<ExtractedTile[]>(
        (lts, group) => {
          const validSpriteTiles = group.sprites.reduce<ExtractedTile[]>(
            (sts, sprite) => {
              if (
                sprite.composedX < crop[0].x ||
                sprite.composedX > crop[1].x
              ) {
                return sts;
              }

              const validTilesForSprite = sprite.tiles.filter(tile => {
                return (
                  tile.composedY >= crop[0].y && tile.composedY < crop[1].y
                );
              });

              return sts.concat(validTilesForSprite);
            },
            []
          );

          return lts.concat(validSpriteTiles);
        },
        []
      );

      return ts.concat(validLayerTiles);
    }, []);
  }

  const maxAnimation = Math.max(...validTiles.map(t => t.autoAnimation));

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

  const totalFrames = determineNumberOfFramesToRender(layers, crop);
  console.log("totalFrames", totalFrames);

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
