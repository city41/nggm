import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useDrop } from "react-dnd";
import { ExtractedSprite as ExtractedSpriteCmp } from "./extractedSprite";
import {
    getBackdropNeoGeoColor,
    neoGeoColorToCSS
} from "../palette/neoGeoPalette";
import { useAppState, extractSpriteAction } from "../state";
import { ExtractedSprite } from "../state/types";

import styles from "./composeScreen.module.css";

interface ComposeScreenProps {
    className?: string;
}

const RAF_COUNTDOWN = 10;

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    className
}) => {
    const [animationCounter, setAnimationCounter] = useState({
        animation: 0,
        rafFrameCountdown: RAF_COUNTDOWN
    });
    const [runPreview, setRunPreview] = useState(false);
    const [state, dispatch] = useAppState();
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

    useEffect(() => {
        if (runPreview) {
            requestAnimationFrame(() => {
                const diff = animationCounter.rafFrameCountdown === 0 ? 1 : 0;

                setAnimationCounter({
                    animation: animationCounter.animation + diff,
                    rafFrameCountdown:
                        diff === 1
                            ? RAF_COUNTDOWN
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
        return b.concat(esg.sprites);
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
        <div>
            <button onClick={() => setRunPreview(!runPreview)}>
                {runPreview ? "stop" : "preview"}
            </button>
            <div>
                {animationCounter.animation} (
                {animationCounter.rafFrameCountdown})
            </div>
            <div
                className={finalClassName}
                ref={div => {
                    setDivRef(div);
                    dropRef(div);
                }}
                style={style}
            >
                {sprites}
            </div>
        </div>
    );
};
