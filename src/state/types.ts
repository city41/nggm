export type RgbPalette = Array<[number, number, number, number]>;

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
  rgbPalette: RgbPalette;

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
   * the pauseId this sprite was extracted in
   */
  pauseId: number;
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

  /**
   * Indicates the extracted sprite was brought in via an adhoc
   * sprite group instead of using sticky sprites
   *
   * This is used when dragging to move the sprite in the compose window, it
   * will only set this sprite as the drag preview
   */
  isAdhoc?: boolean;
}

/**
 * A sprite group is a set of sprites that are all stickied together
 * The first sprite should not have sticky set, and the remaining ones should
 */
export interface ExtractedSpriteGroup {
  /**
   * a unique id across all groups
   */
  id: number;

  /**
   * the pauseId that was active when this sprite group was extracted. Combining this
   * with spriteMemoryIndex creates a stable id
   */
  pauseId: number;

  /**
   * The sprites that make up the group
   */
  sprites: ExtractedSprite[];
}

export interface Layer {
  /**
   * A unique id across all layers
   */
  id: number;

  /**
   * The sprite groups that make up this layer. Within a layer, sprite groups from the same pauseId
   * are moved together
   */
  groups: ExtractedSpriteGroup[];
}

export type Crop = [{ x: number; y: number }, { x: number; y: number }];

export interface AppState {
  /**
   * These are layers of sprite groups that have been "severed" from the Neo Geo and preserved.
   * They can be safely interacted with at any time
   */
  layers: Layer[];
}
