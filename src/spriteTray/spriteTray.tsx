import React, { useState } from "react";
import classnames from "classnames";
import { SpriteEntry } from "./spriteEntry";
import { useAppState } from "../state";

import styles from "./spriteTray.module.css";

const TOTAL_SPRITE_COUNT = 381;

function arrayFrom(minValue: number, maxValue: number) {
    const count = maxValue - minValue + 1;

    return new Array(count).fill(0, 0, count).map((_, i) => i + minValue);
}

interface SpriteTrayProps {
    className?: string;
}

export const SpriteTray: React.FunctionComponent<SpriteTrayProps> = ({
    className
}) => {
    const [state] = useAppState();
    const [focusedIndices, setFocusedIndices] = useState<number[]>([]);
    const [shiftStartIndex, setShiftStartIndex] = useState<null | number>(null);

    const classes = classnames(styles.root, className, {
        [styles.locked]: !state.isPaused
    });

    return (
        <div className={classes}>
            <div
                key={state.pauseId}
                className={styles.spriteEntries}
                style={{
                    gridTemplateColumns: `repeat(${TOTAL_SPRITE_COUNT}, max-content)`
                }}
            >
                {new Array(TOTAL_SPRITE_COUNT)
                    .fill(1, 0, TOTAL_SPRITE_COUNT)
                    .map((_, i) => (
                        <SpriteEntry
                            key={i}
                            spriteIndex={i}
                            render={state.isPaused}
                            hideIfEmpty
                            onClick={e => {
                                if (e.ctrlKey) {
                                    setFocusedIndices(focusedIndices.concat(i));
                                    setShiftStartIndex(null);
                                } else if (e.shiftKey) {
                                    if (
                                        shiftStartIndex !== null ||
                                        focusedIndices.length === 1
                                    ) {
                                        const minIndex = Math.min(
                                            shiftStartIndex ||
                                                focusedIndices[0],
                                            i
                                        );
                                        const maxIndex = Math.max(
                                            shiftStartIndex ||
                                                focusedIndices[0],
                                            i
                                        );
                                        setFocusedIndices(
                                            arrayFrom(minIndex, maxIndex)
                                        );
                                    } else {
                                        setFocusedIndices([i]);
                                        setShiftStartIndex(i);
                                    }
                                } else {
                                    setFocusedIndices([i]);
                                    setShiftStartIndex(null);
                                }
                            }}
                            focused={focusedIndices.indexOf(i) > -1}
                            honorTileSize
                        />
                    ))}
            </div>
        </div>
    );
};
