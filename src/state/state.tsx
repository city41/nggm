import React, {
    createContext,
    useContext,
    useReducer,
    Dispatch,
    FunctionComponent
} from "react";

interface ExtractedTile {
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
    rgbPalette: number[][];

    /**
     * indicates whether this tile should flip vertically
     */
    verticalFlip: boolean;

    /**
     * indicates whether this tile should flip horizontally
     */
    horizontalFlip: boolean;
}

/**
 * A sprite that has been "extracted" from the running Neo Geo. It contains its own
 * copy of all the sprite data and thus is not susceptible to change as video ram changes
 */
interface ExtractedSprite {
    /**
     * offset into video RAM where this sprite came from.
     *
     * NOTE: since vram changes every frame, it is only safe to rely on this value
     * within one pauseId and while isPaused is true
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
}

interface State {
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
     * These are sprites that have been "severed" from the Neo Geo and preserved.
     * They can be safely interacted with at any time
     */
    extractedSprites: ExtractedSprite[];
}

export interface Action {
    type: "StartEmulation" | "TogglePause";
}

export const initialState: State = {
    hasStarted: false,
    isPaused: false,
    pauseId: -1,
    extractedSprites: []
};

function assertUnreachable(_: never): never {
    throw new Error("Non exhaustive switch statement");
}

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "StartEmulation":
            return {
                ...state,
                hasStarted: true
            };
        case "TogglePause":
            const nowPaused = !state.isPaused;
            return {
                ...state,
                isPaused: nowPaused,
                pauseId: nowPaused ? state.pauseId + 1 : state.pauseId
            };
    }

    return assertUnreachable(action.type);
}

export const TOGGLE_PAUSE: Action = {
    type: "TogglePause"
};

export const START_EMULATION: Action = {
    type: "StartEmulation"
};

const stateContext = createContext(initialState);
const dispatchContext = createContext((() => 0) as Dispatch<Action>);

export const Provider: FunctionComponent = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <dispatchContext.Provider value={dispatch}>
            <stateContext.Provider value={state}>
                {children}
            </stateContext.Provider>
        </dispatchContext.Provider>
    );
};

export function useAppState(): [State, Dispatch<Action>] {
    return [useContext(stateContext), useContext(dispatchContext)];
}
