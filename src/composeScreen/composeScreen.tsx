import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useDrop } from "react-dnd";
import {
    getBackdropNeoGeoColor,
    neoGeoColorToCSS
} from "../palette/neoGeoPalette";
import { useAppState } from "../state";
import { BuildGifModal } from "../gifBuilder/buildGifModal";
import { Layer as LayerCmp } from "./layer";
import { CropRect } from "./cropRect";
import { getMaxX, getMaxY, getAllSpritesFromLayers } from "../state/spriteUtil";

import styles from "./composeScreen.module.css";

interface ComposeScreenProps {
    className?: string;
}

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    className
}) => {
    const [animationCounter, setAnimationCounter] = useState({
        animation: 0,
        rafFrameCountdown: 0
    });
    const [runPreview, setRunPreview] = useState(false);
    const [showBuildGifModal, setShowBuildGifModal] = useState(false);
    const { state, dispatch, undo, redo, canUndo, canRedo } = useAppState();
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [upperLeftCrop, setUpperLeftCrop] = useState<null | {
        x: number;
        y: number;
    }>(null);
    const [lowerRightCrop, setLowerRightCrop] = useState<null | {
        x: number;
        y: number;
    }>(null);

    useEffect(() => {
        if (runPreview) {
            // minus one because on my machine the animation can't quite keep up
            const frameCountdown =
                window.Module._get_neogeo_frame_counter_speed() - 1;
            requestAnimationFrame(() => {
                const diff = animationCounter.rafFrameCountdown === 0 ? 1 : 0;

                setAnimationCounter({
                    animation: animationCounter.animation + diff,
                    rafFrameCountdown:
                        diff === 1
                            ? frameCountdown
                            : animationCounter.rafFrameCountdown - 1
                });
            });
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dropRef] = useDrop({
        accept: ["Sprite", "Sprites"],
        drop: (item: any, monitor: any) => {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const composedX = Math.floor(x / 16) * 16;

                if (item.type === "Sprite") {
                    const spriteMemoryIndex = item.spriteMemoryIndex;
                    const pauseId = item.pauseId;

                    if (pauseId) {
                        dispatch({
                            type: "MoveSprite",
                            spriteMemoryIndex,
                            newComposedX: composedX,
                            pauseId
                        });
                    } else {
                        dispatch({
                            type: "ExtractSprite",
                            spriteMemoryIndex,
                            composedX
                        });
                    }
                } else {
                    dispatch({
                        type: "ExtractSpritesToGroup",
                        spriteMemoryIndices: item.spriteMemoryIndices,
                        composedX
                    });
                }
            }
        },
        canDrop() {
            return !isCropping;
        }
    });

    const layers = state.layers.map((layer, i) => {
        if (state.hiddenLayers[layer.id]) {
            return null;
        } else {
            return (
                <LayerCmp
                    key={i}
                    index={i}
                    layer={layer}
                    runPreview={runPreview}
                    animationCounter={animationCounter.animation}
                    canDrag={!isCropping}
                    outlineTiles={state.showGrid}
                />
            );
        }
    });

    const backgroundColor = state.isPaused
        ? neoGeoColorToCSS(getBackdropNeoGeoColor())
        : "transparent";

    const style = {
        backgroundColor
    };

    const extractedSprites = getAllSpritesFromLayers(state.layers);
    const maxX = getMaxX(extractedSprites);
    const totalWidth = Math.max(maxX + 48, 320);

    const maxY = getMaxY(extractedSprites);
    const totalHeight = Math.max(maxY + 48, 240);

    const finalClassName = classnames(styles.root, className);

    return (
        <>
            <BuildGifModal
                isOpen={showBuildGifModal}
                onRequestClose={() => setShowBuildGifModal(false)}
            />
            <div className={finalClassName}>
                <div className={styles.toolbar}>
                    <button onClick={() => dispatch({ type: "ToggleGrid" })}>
                        {state.showGrid ? "hide" : "show"} grid
                    </button>
                    <button
                        disabled={isCropping}
                        onClick={() => {
                            setIsCropping(true);
                            dispatch({ type: "ClearCrop" });
                            setUpperLeftCrop(null);
                            setLowerRightCrop(null);
                        }}
                    >
                        crop
                    </button>
                    <button
                        disabled={!state.crop}
                        onClick={() => {
                            dispatch({ type: "ClearCrop" });
                            setUpperLeftCrop(null);
                            setLowerRightCrop(null);
                        }}
                    >
                        clear crop
                    </button>
                    <button onClick={() => setRunPreview(!runPreview)}>
                        {runPreview ? "stop" : "preview"}
                    </button>
                    <button onClick={() => setShowBuildGifModal(true)}>
                        build gif
                    </button>
                    <button disabled={!canUndo} onClick={() => undo()}>
                        undo
                    </button>
                    <button disabled={!canRedo} onClick={() => redo()}>
                        redo
                    </button>
                    <button onClick={() => dispatch({ type: "PushAllDown" })}>
                        down
                    </button>
                </div>
                <div
                    className={styles.bg}
                    ref={div => {
                        setDivRef(div);
                        dropRef(div);
                    }}
                    style={style}
                >
                    {isCropping && (
                        <div
                            className={styles.captureLayer}
                            onMouseDown={(
                                e: React.MouseEvent<HTMLDivElement>
                            ) => {
                                if (isCropping) {
                                    const rect = (e.target as HTMLDivElement).getBoundingClientRect() as DOMRect;

                                    const rawX = e.clientX - rect.x;
                                    const rawY = e.clientY - rect.y;

                                    const x = Math.floor(rawX / 16) * 16;
                                    const y = Math.floor(rawY / 16) * 16;

                                    setUpperLeftCrop({ x, y });
                                }
                            }}
                            onMouseMove={e => {
                                if (isCropping && upperLeftCrop) {
                                    const rect = (e.target as HTMLDivElement).getBoundingClientRect() as DOMRect;

                                    const rawX = e.clientX - rect.x;
                                    const rawY = e.clientY - rect.y;

                                    const x = Math.floor(rawX / 16) * 16;
                                    const y = Math.floor(rawY / 16) * 16;

                                    setLowerRightCrop({ x, y });
                                }
                            }}
                            onMouseUp={e => {
                                if (
                                    isCropping &&
                                    upperLeftCrop &&
                                    lowerRightCrop
                                ) {
                                    dispatch({
                                        type: "SetCrop",
                                        crop: [upperLeftCrop, lowerRightCrop]
                                    });
                                    setIsCropping(false);
                                }
                            }}
                        />
                    )}
                    {layers}
                    {!!(
                        (isCropping && upperLeftCrop && lowerRightCrop) ||
                        state.crop
                    ) && (
                        <CropRect
                            className={styles.cropRect}
                            crop={
                                state.crop || [upperLeftCrop!, lowerRightCrop!]
                            }
                            totalWidth={totalWidth}
                            totalHeight={totalHeight}
                        />
                    )}
                </div>
            </div>
        </>
    );
};
