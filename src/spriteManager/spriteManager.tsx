import React, { useState } from "react";
import classnames from "classnames";
import { SpriteEntry } from "./spriteEntry";

import styles from "./spriteManager.module.css";

const TOTAL_SPRITE_COUNT = 448;

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
    const [tight, setTight] = useState(true);
    const [focusedIndex, setFocusedIndex] = useState<null | number>(null);
    const [honorTileSize, setHonorTileSize] = useState(true);

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
                    checked={tight}
                    onChange={() => setTight(!tight)}
                />
                tight
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
                            tight={tight}
                            onClick={() => setFocusedIndex(i)}
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
                            focused={focusedIndex === i}
                            honorTileSize={honorTileSize}
                        />
                    ))}
            </div>
            {focusedIndex !== null && (
                <div className={styles.focusedEntry}>sprite {focusedIndex}</div>
            )}
        </div>
    );
};
