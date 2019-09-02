import {
    Crop,
    ExtractedSpriteGroup,
    ExtractedSprite,
    ExtractedTile
} from "./types";
import { renderTileToCanvas } from "./renderTileToCanvas";

function getDimensions(
    sprites: ExtractedSprite[]
): { width: number; height: number } {
    const maxX = Math.max(...sprites.map(s => s.composedX)) + 16;

    const tiles = sprites.reduce<ExtractedTile[]>((building, sprite) => {
        return building.concat(sprite.tiles);
    }, []);

    const maxY = Math.max(...tiles.map(t => t.composedY)) + 16;

    return {
        width: maxX,
        height: maxY
    };
}

function flip(
    canvas: HTMLCanvasElement,
    tile: ExtractedTile
): HTMLCanvasElement {
    const xScale = tile.horizontalFlip ? -1 : 1;
    const yScale = tile.verticalFlip ? -1 : 1;
    const translateX = tile.horizontalFlip ? canvas.width : 0;
    const translateY = tile.verticalFlip ? canvas.height : 0;

    const newCanvas = document.createElement("canvas");
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    const context = newCanvas.getContext("2d");

    if (context) {
        context.save();
        context.translate(translateX, translateY);
        context.scale(xScale, yScale);

        context.drawImage(canvas, 0, 0);

        context.restore();
    }

    return newCanvas;
}

function cropCanvas(
    fullCanvas: HTMLCanvasElement,
    crop: Crop
): HTMLCanvasElement {
    const cropWidth = crop[1].x - crop[0].x;
    const cropHeight = crop[1].y - crop[0].y;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const croppedCanvasContext = croppedCanvas.getContext("2d")!;

    croppedCanvasContext.drawImage(
        fullCanvas,
        crop[0].x,
        crop[0].y,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    return croppedCanvas;
}

// TODO: account for when sprites didn't compose right up to (0,0)
export function spriteGroupToCanvas(
    spriteGroups: ExtractedSpriteGroup[],
    animationCounter = 0,
    crop?: Crop
): HTMLCanvasElement {
    const sprites = spriteGroups.reduce<ExtractedSprite[]>(
        (b, sg) => b.concat(sg.sprites),
        []
    );

    const dimensions = getDimensions(sprites);

    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const context = canvas.getContext("2d");

    const sortedSprites = [...sprites].sort(
        (a, b) => a.spriteMemoryIndex - b.spriteMemoryIndex
    );

    sortedSprites.forEach(sprite => {
        sprite.tiles.forEach(tile => {
            let tileCanvas = document.createElement("canvas");

            let tileIndex = tile.tileIndex;

            if (tile.autoAnimation === 3) {
                // 3 bit auto animation: the 4th bit is set, indicating this tile does 3bit auto animation
                // that means take its tileIndex, and replace its bottom three bits with those of the animation counter
                tileIndex =
                    (tileIndex & ~7) + ((tileIndex + animationCounter) & 7);
            }
            if (tile.autoAnimation === 2) {
                // 2 bit auto animation: like above but replace its bottom two bits
                tileIndex =
                    (tileIndex & ~3) + ((tileIndex + animationCounter) & 3);
            }

            renderTileToCanvas(tileCanvas, tileIndex, tile.rgbPalette);

            if (tile.horizontalFlip || tile.verticalFlip) {
                tileCanvas = flip(tileCanvas, tile);
            }

            context!.drawImage(tileCanvas, sprite.composedX, tile.composedY);
        });
    });

    if (crop) {
        return cropCanvas(canvas, crop);
    } else {
        return canvas;
    }
}
