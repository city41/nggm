export interface ExtractedTile {
    /**
     * Index of the tile data in CROM. Note tiles are read only on the Neo Geo,
     * so this value is always safe to use
     */
    tileIndex: number;

    /**
     * The tile's y coordinate once composed into an extracted background. This can
     * be altered based on how the sprite may need to get "unrotated"
     */
    composedY: number;

    /**
     * The palette, in Neo Geo format, that is used by this tile.
     * The palette has been extracted from the Neo Geo and is preserved
     */
    neoGeoPalette: number[];

    /**
     * Same logical values as found in neoGeoPalette, but in 32 bit rgb. Ideal for
     * working with HTML canvases, or for converting to CSS values
     */
    rgbPalette: Array<[number, number, number, number]>;

    /**
     * indicates whether this tile should flip vertically
     */
    verticalFlip: boolean;

    /**
     * indicates whether this tile should flip horizontally
     */
    horizontalFlip: boolean;

    autoAnimation: 0 | 2 | 3;
}

/**
 * A sprite that has been "extracted" from the running Neo Geo. It contains its own
 * copy of all the sprite data and thus is not susceptible to change as video ram changes
 */
export interface ExtractedSprite {
    /**
     * The group this sprite belongs to
     */
    group: ExtractedSpriteGroup;

    /**
     * offset into video RAM where this sprite came from.
     *
     * NOTE: since vram changes every frame, it is only safe to rely on this value
     * within one pauseId and while isPaused is true
     *
     * But can combine with pauseId to get a stable id
     */
    spriteMemoryIndex: number;

    /**
     * The tiles that make up this sprite
     */
    tiles: ExtractedTile[];

    /**
     * The x coordinate of the sprite as it was on the screen. This isn't very useful
     * for composing backgrounds
     */
    screenX: number;

    /**
     * The y coordinate of the sprite as it was on the screen. This isn't very useful
     * for composing backgrounds
     */
    screenY: number;

    /**
     * The sprite's x coordinate when composed into an extracted background
     */
    composedX: number;

    /**
     * The sprite's y coordinate when composed into an extracted background
     */
    composedY: number;
}

/**
 * A sprite group is a set of sprites that are all stickied together
 * The first sprite should not have sticky set, and the remaining ones should
 */
export interface ExtractedSpriteGroup {
    /**
     * the pauseId that was active when this sprite group was extracted. Combining this
     * with spriteMemoryIndex creates a stable id
     */
    pauseId: number;

    /**
     * The sprites that make up the group
     */
    sprites: ExtractedSprite[];

    /**
     * Whether the group is currently not being displayed in
     * the compose window. This is just cosmetic and to make composing easier, if a gif is built,
     * this group will be a part of it
     */
    hidden: boolean;
}

export interface Layer {
    /**
     * The sprite groups that make up this layer. Within a layer, sprite groups from the same pauseId
     * are moved together
     */
    groups: ExtractedSpriteGroup[];

    /**
     * Whether this entire layer is hidden
     */
    hidden: boolean;
}

export type Crop = [{ x: number; y: number }, { x: number; y: number }];

export interface AppState {
    /**
     * indicates emulation has started, it may have since been paused
     */
    hasStarted: boolean;

    /**
     * true if the emulator has paused, false if is either running
     * or has yet to start. It is only safe to access Neo Geo memory
     * during a pause. In general the UI should largely "shut down" when
     * this value is false
     */
    isPaused: boolean;

    /**
     * Indicates which pause session we are currently on.
     * If this value increments, the user has unpaused then repaused
     * the emulation. At that point, it is no longer safe to assume
     * Neo Geo memory has not changed
     */
    pauseId: number;

    /**
     * These are layers of sprite groups that have been "severed" from the Neo Geo and preserved.
     * They can be safely interacted with at any time
     */
    layers: Layer[];

    /**
     * the index of the layer that will receive new sprite groups that get dragged in. If no
     * layer is the focused layer, then the last layer gets the new sprite groups.
     *
     * set to -1 to make no layer focused
     */
    focusedLayerIndex: number;

    /**
     * A crop for the compose screen. When the gif is built, only
     * the tiles inside the crop boundaries are considered
     */
    crop?: Crop;
}
