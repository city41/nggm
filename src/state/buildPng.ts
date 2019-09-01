import { ExtractedSprite, ExtractedTile } from "./types";
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

// TODO: account for when sprites didn't compose right up to (0,0)
export function buildPng(sprites: ExtractedSprite[]): string {
    const { width, height } = getDimensions(sprites);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    const sortedSprites = [...sprites].sort(
        (a, b) => a.spriteMemoryIndex - b.spriteMemoryIndex
    );

    sortedSprites.forEach(sprite => {
        sprite.tiles.forEach(tile => {
            const tileCanvas = document.createElement("canvas");
            renderTileToCanvas(tileCanvas, tile.tileIndex, tile.rgbPalette);

            context!.drawImage(tileCanvas, sprite.composedX, tile.composedY);
        });
    });

    return canvas.toDataURL("png");
}
