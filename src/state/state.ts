import { AppState, Layer, Crop, ExtractedSpriteGroup } from "./types";
import { UndoableAction } from "./undoableState";

export type DemoData = {
  palettes: Record<number, number[]>;
  spriteMemory: number[];
  tileMemory: Record<number, number[]>;
};

export type Action =
  | UndoableAction
  | { type: "StartEmulation" }
  | { type: "SetDemo"; demoData: DemoData }
  | { type: "TogglePause" }
  | { type: "SetFocusedLayer"; layer: Layer }
  | { type: "SetCrop"; crop: Crop | undefined }
  | { type: "ToggleGrid" }
  | { type: "ToggleCropping" }
  | { type: "ClearCrop" }
  | { type: "TogglePreview" }
  | { type: "ToggleVisibilityOfGroup"; group: ExtractedSpriteGroup }
  | { type: "ToggleVisibilityOfLayer"; layer: Layer }
  | { type: "BuildGif" }
  | { type: "StopBuildGif" }
  | { type: "undo" }
  | { type: "redo" };

export type ActionType = Action["type"];

export type State = {
  past: AppState[];
  present: AppState;
  future: AppState[];

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
   * Whether the user is currently cropping
   */
  isCropping: boolean;

  /**
   * A crop for the compose screen. When the gif is built, only
   * the tiles inside the crop boundaries are considered
   */
  crop?: Crop;

  /**
   * Whether the animation is currently being previewed or not
   */
  isPreviewing: boolean;

  /**
   * Whether the user is currently having their gif be built
   */
  isBuildingGif: boolean;

  /**
   * Whether to show an outline around extracted tiles. Helps show
   * the real bounds of a sprite group
   */
  showGrid: boolean;

  hiddenLayers: Record<number, boolean>;
  hiddenGroups: Record<number, boolean>;

  /**
   * Whether the app is in demo mode
   */
  isDemoing: boolean;
};

export type NonUndoableState = Omit<State, "past" | "present" | "future">;

const DEMO_PALETTE_ADDRESS = 1379916;

function copySpriteDataToHeap(data: number[]) {
  window.HEAPU8.set(data, window.Module._get_tile_ram_addr());
}

function copyTileDataToHeap(data: Record<string, number[]>) {
  Object.keys(data).forEach(key => {
    const keyData = data[key];

    window.HEAPU8.set(
      keyData,
      window.Module._get_rom_ctile_addr() + Number(key) * 16 * 4 * 2
    );
  });
}

function copyPaletteDataToHeap(data: Record<string, number[]>) {
  const PALETTE_SIZE_IN_BYTES = 32;

  Object.keys(data).forEach(key => {
    const keyData = data[key];

    const palAddr = DEMO_PALETTE_ADDRESS;
    const palOffset = Number(key) * PALETTE_SIZE_IN_BYTES;
    const palIndexInHeap = (palAddr + palOffset) / 2;

    window.Module.HEAPU16.set(keyData, palIndexInHeap);
  });
}

export function getReducer(
  initialAppState: AppState,
  reducer: (
    state: AppState,
    action: UndoableAction,
    nonUndoableState: NonUndoableState
  ) => AppState
) {
  const initialState: State = {
    past: [],
    present: initialAppState,
    future: [],
    hasStarted: false,
    isPaused: false,
    pauseId: 0,
    isCropping: false,
    crop: undefined,
    isPreviewing: false,
    isBuildingGif: false,
    showGrid: false,
    hiddenLayers: {},
    hiddenGroups: {},
    isDemoing: false
  };

  function proxyReducer(state: State, action: Action): State {
    let newState;

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

      case "ToggleGrid": {
        return {
          ...state,
          showGrid: !state.showGrid
        };
      }

      case "ToggleCropping": {
        return {
          ...state,
          isCropping: !state.isCropping
        };
      }

      case "SetCrop": {
        const { crop } = action;

        const newCrop =
          crop &&
          ([
            {
              x: Math.min(crop[0].x, crop[1].x),
              y: Math.min(crop[0].y, crop[1].y)
            },
            {
              x: Math.max(crop[0].x, crop[1].x),
              y: Math.max(crop[0].y, crop[1].y)
            }
          ] as Crop);

        return {
          ...state,
          crop: newCrop
        };
      }

      case "ClearCrop": {
        return {
          ...state,
          crop: undefined,
          isCropping: false
        };
      }

      case "TogglePreview": {
        return {
          ...state,
          isPreviewing: !state.isPreviewing
        };
      }

      case "BuildGif": {
        return {
          ...state,
          isBuildingGif: true
        };
      }

      case "StopBuildGif": {
        return {
          ...state,
          isBuildingGif: false
        };
      }

      case "ToggleVisibilityOfGroup": {
        const { group } = action;

        return {
          ...state,
          hiddenGroups: {
            ...state.hiddenGroups,
            [group.id]: !state.hiddenGroups[group.id]
          }
        };
      }

      case "ToggleVisibilityOfLayer": {
        const { layer } = action;

        return {
          ...state,
          hiddenLayers: {
            ...state.hiddenLayers,
            [layer.id]: !state.hiddenLayers[layer.id]
          }
        };
      }

      case "undo": {
        const pastCopy = [...state.past];
        const newPresent = pastCopy.pop();

        if (!newPresent) {
          throw new Error("undo: nothing to undo!");
        }

        newState = {
          ...state,
          past: pastCopy,
          present: newPresent,
          future: [...state.future, state.present]
        };
        break;
      }
      case "redo": {
        const futureCopy = [...state.future];
        const newPresent = futureCopy.pop();

        if (!newPresent) {
          throw new Error("redo: nothing to redo!");
        }

        newState = {
          ...state,
          past: [...state.past, state.present],
          present: newPresent,
          future: futureCopy
        };
        break;
      }

      case "SetDemo": {
        const { demoData } = action;

        copySpriteDataToHeap(demoData.spriteMemory);
        copyTileDataToHeap(demoData.tileMemory);
        copyPaletteDataToHeap(demoData.palettes);

        window.Module._get_current_pal_addr = () => DEMO_PALETTE_ADDRESS;

        return {
          ...state,
          isDemoing: true,
          hasStarted: true,
          isPaused: true,
          pauseId: 1
        };
      }

      default: {
        newState = {
          ...state,
          past: [...state.past, state.present],
          present: reducer(state.present, action as UndoableAction, state)
        };
        break;
      }
    }

    return newState;
  }

  return {
    initialState,
    reducer: proxyReducer
  };
}
