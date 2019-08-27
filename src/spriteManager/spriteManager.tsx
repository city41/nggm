import React, { useState } from "react";
import classnames from "classnames";
import { SpriteEntry } from "./spriteEntry";

import styles from "./spriteManager.module.css";

const TOTAL_SPRITE_COUNT = 448;

interface SpriteManagerProps {
    className?: string;
}

export const SpriteManager: React.FunctionComponent<SpriteManagerProps> = ({
    className
}) => {
    const [dumpCount, setDumpCount] = useState(0);
    const [hideEmtpySprites, setHideEmptySprites] = useState(true);
    const [tight, setTight] = useState(false);

    const classes = classnames(styles.root, className);

    return (
        <div className={classes}>
            <div className={styles.controls}>
                <button onClick={() => setDumpCount(dumpCount + 1)}>
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
                    onChange={e => setTight(!tight)}
                />
                tight
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
                        />
                    ))}
            </div>
            <div className={styles.focusedEntry}>focused entry</div>
        </div>
    );
};
