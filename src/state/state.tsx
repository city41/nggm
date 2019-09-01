import React, {
    createContext,
    useContext,
    useReducer,
    Dispatch,
    FunctionComponent
} from "react";
import { AppState, ExtractedSpriteGroup } from "./types";
import { extractSpriteGroup } from "./extractSpriteGroup";
import { isEqual } from "lodash";

export interface Action {
    type: "StartEmulation" | "TogglePause" | "ExtractSprite";
}

export interface ExtractSpriteAction {
    type: "ExtractSprite";
    spriteMemoryIndex: number;
    composedX: number;
    pauseId?: number;
}

export const initialState: AppState = {
    hasStarted: false,
    isPaused: false,
    pauseId: -1,
    extractedSpriteGroups: []
};

function assertUnreachable(_: never): never {
    throw new Error("Non exhaustive switch statement");
}

function haveSameSprites(a: ExtractedSpriteGroup, b: ExtractedSpriteGroup) {
    const aIndices = a.sprites.map(es => es.spriteMemoryIndex).sort();
    const bIndices = b.sprites.map(es => es.spriteMemoryIndex).sort();

    return isEqual(aIndices, bIndices);
}

/**
 * Given a newly formed sprite group, if there are other sprite groups already from the same pauseId,
 * then position this new group relative to them. This makes it so the user doesn't have to try and manually
 * line up groups.
 *
 * example: Samurai Shodown title screen. User drags in background, then drags in "Samurai" sprite, the "Samurai"
 * sprite will position itself properly on top of the background
 */
function positionSpriteGroupInRelationToExistingGroups(
    newGroup: ExtractedSpriteGroup,
    oldGroups: ExtractedSpriteGroup[]
) {
    const sameGroup = oldGroups.find(og => og.pauseId === newGroup.pauseId);

    // first sprite from this pauseId? Then there is nothing to position
    if (!sameGroup) {
        return;
    }

    const screenToComposeDiffX =
        sameGroup.sprites[0].composedX - sameGroup.sprites[0].screenX;

    newGroup.sprites.forEach(
        s => (s.composedX = s.screenX + screenToComposeDiffX)
    );
}

export function reducer(state: AppState, action: Action): AppState {
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
        case "ExtractSprite":
            const {
                spriteMemoryIndex,
                composedX,
                pauseId
            } = action as ExtractSpriteAction;

            const newSpriteGroup = extractSpriteGroup(
                spriteMemoryIndex,
                composedX,
                // if the sprite came with its own pauseId, then they are existing sprites being moved,
                // otherwise they are new sprites being added
                typeof pauseId === "number" ? pauseId : state.pauseId
            );

            const oldSpriteGroups = state.extractedSpriteGroups.filter(
                esg =>
                    esg.pauseId !== newSpriteGroup.pauseId ||
                    !haveSameSprites(esg, newSpriteGroup)
            );

            positionSpriteGroupInRelationToExistingGroups(
                newSpriteGroup,
                oldSpriteGroups
            );

            return {
                ...state,
                extractedSpriteGroups: [...oldSpriteGroups, newSpriteGroup]
            };
    }

    return assertUnreachable(action.type);
}

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

export function useAppState(): [AppState, Dispatch<Action>] {
    return [useContext(stateContext), useContext(dispatchContext)];
}

export const TOGGLE_PAUSE: Action = {
    type: "TogglePause"
};

export const START_EMULATION: Action = {
    type: "StartEmulation"
};

export function extractSpriteAction(
    spriteMemoryIndex: number,
    composedX: number,
    pauseId: number
): ExtractSpriteAction {
    return {
        type: "ExtractSprite",
        spriteMemoryIndex,
        composedX,
        pauseId
    };
}
