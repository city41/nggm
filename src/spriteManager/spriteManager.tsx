import React, { useState } from "react";
import classnames from "classnames";
import { SpriteEntry } from "./spriteEntry";
import { uniq } from "lodash";

import styles from "./spriteManager.module.css";

const TOTAL_SPRITE_COUNT = 381;

function arrayFrom(minValue: number, maxValue: number) {
    const count = maxValue - minValue + 1;

    return new Array(count).fill(0, 0, count).map((_, i) => i + minValue);
}

interface SpriteManagerProps {
    className?: string;
    onComposedSpritesChanged: (newComposedSprites: number[]) => void;
    composedSprites: number[];
}

export const SpriteManager: React.FunctionComponent<SpriteManagerProps> = ({
    className,
    onComposedSpritesChanged,
    composedSprites
}) => {
    const [dumpCount, setDumpCount] = useState(0);
    const [hideEmtpySprites, setHideEmptySprites] = useState(true);
    const [focusedIndices, setFocusedIndices] = useState<number[]>([]);
    const [honorTileSize, setHonorTileSize] = useState(true);
    const [shiftStartIndex, setShiftStartIndex] = useState<null | number>(null);

    const classes = classnames(styles.root, className);

    return (
        <div className={classes}>
            <div className={styles.controls}>
                <button
                    onClick={() => {
                        setDumpCount(dumpCount + 1);
                        onComposedSpritesChanged([]);
                    }}
                >
                    dump
                </button>
                <input
                    type="checkbox"
                    checked={hideEmtpySprites}
                    onChange={() => setHideEmptySprites(!hideEmtpySprites)}
                />
                hide empty sprites
                <input
                    type="checkbox"
                    checked={honorTileSize}
                    onChange={() => setHonorTileSize(!honorTileSize)}
                />
                honor tile size
                <button
                    onClick={() => {
                        onComposedSpritesChanged([]);
                    }}
                >
                    clear
                </button>
            </div>
            <div
                key={dumpCount}
                className={styles.spriteEntries}
                style={{
                    gridTemplateColumns: `repeat(${TOTAL_SPRITE_COUNT}, max-content)`
                }}
            >
                {new Array(TOTAL_SPRITE_COUNT)
                    .fill(1, 0, TOTAL_SPRITE_COUNT)
                    .map((_, i) => (
                        <SpriteEntry
                            spriteIndex={i}
                            render={dumpCount > 0}
                            hideIfEmpty={hideEmtpySprites}
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
                            onComposeChange={composed => {
                                if (composed) {
                                    onComposedSpritesChanged(
                                        composedSprites.concat(i)
                                    );
                                } else {
                                    onComposedSpritesChanged(
                                        composedSprites.filter(v => v !== i)
                                    );
                                }
                            }}
                            focused={focusedIndices.indexOf(i) > -1}
                            composed={composedSprites.indexOf(i) > -1}
                            honorTileSize={honorTileSize}
                        />
                    ))}
            </div>
            {focusedIndices.length > 0 && (
                <div className={styles.focusedEntry}>
                    {focusedIndices.length} focused sprites
                    <button
                        onClick={() => {
                            const composed = uniq(
                                composedSprites.concat(focusedIndices)
                            );
                            onComposedSpritesChanged(composed);
                        }}
                    >
                        compose
                    </button>
                </div>
            )}
        </div>
    );
};
