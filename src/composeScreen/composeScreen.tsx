import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useDrop } from "react-dnd";
import { ExtractedSprite as ExtractedSpriteCmp } from "./extractedSprite";
import {
    getBackdropNeoGeoColor,
    neoGeoColorToCSS
} from "../palette/neoGeoPalette";
import { useAppState, extractSpriteAction, HANDLE_NEGATIVES } from "../state";
import { ExtractedSprite } from "../state/types";
import { BuildGifModal } from "../gifBuilder/buildGifModal";
import { Layers } from "./layers";

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
    const [state, dispatch] = useAppState();
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

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
        accept: "Sprite",
        drop: (item: any, monitor: any) => {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const composedX = Math.floor(x / 16) * 16;
                const spriteIndex = item.spriteIndex;
                const pauseId = item.pauseId;

                dispatch(extractSpriteAction(spriteIndex, composedX, pauseId));
            }
        }
    });

    const extractedSprites = state.extractedSpriteGroups.reduce<
        ExtractedSprite[]
    >((b, esg) => {
        if (esg.hidden) {
            return b;
        } else {
            return b.concat(esg.sprites);
        }
    }, []);

    const sprites = extractedSprites.map(extractedSprite => (
        <ExtractedSpriteCmp
            key={extractedSprite.spriteMemoryIndex}
            data={extractedSprite}
            autoAnimate={runPreview}
            animationCounter={animationCounter.animation}
        />
    ));

    const backgroundColor = state.isPaused
        ? neoGeoColorToCSS(getBackdropNeoGeoColor())
        : "transparent";

    const maxX = Math.max(0, ...extractedSprites.map(es => es.composedX));

    const style = {
        backgroundColor,
        width: Math.max(maxX + 48, 320)
    };

    const finalClassName = classnames(styles.root, className);

    return (
        <>
            <BuildGifModal
                isOpen={showBuildGifModal}
                onRequestClose={() => setShowBuildGifModal(false)}
            />
            <div className={finalClassName}>
                <div className={styles.toolbar}>
                    <button onClick={() => setRunPreview(!runPreview)}>
                        {runPreview ? "stop" : "preview"}
                    </button>
                    <button onClick={() => setShowBuildGifModal(true)}>
                        build gif
                    </button>
                    <div>
                        {animationCounter.animation} (
                        {animationCounter.rafFrameCountdown})
                    </div>
                </div>
                <Layers className={styles.layers} />
                <div
                    className={styles.bg}
                    ref={div => {
                        setDivRef(div);
                        dropRef(div);
                    }}
                    style={style}
                >
                    {sprites}
                </div>
                <button
                    className={styles.handleNegatives}
                    onClick={() => dispatch(HANDLE_NEGATIVES)}
                >
                    handle negatives
                </button>
            </div>
        </>
    );
};
