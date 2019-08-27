import React from "react";
import classnames from "classnames";
import { Sprite } from "./sprite";
import { isSpriteEmpty } from "./spriteData";

import styles from "./spriteEntry.module.css";

interface SpriteEntryProps {
    className?: string;
    spriteIndex: number;
    render?: boolean;
    hideIfEmpty: boolean;
    tight?: boolean;
}

export const SpriteEntry: React.FunctionComponent<SpriteEntryProps> = ({
    className,
    spriteIndex,
    render,
    hideIfEmpty,
    tight
}) => {
    const classes = classnames(styles.root, className, {
        [styles.hide]: render && hideIfEmpty && isSpriteEmpty(spriteIndex),
        [styles.tight]: tight
    });

    return (
        <div className={classes}>
            <div className={styles.index}>{spriteIndex}</div>
            {render && (
                <Sprite
                    spriteIndex={spriteIndex}
                    positioned={false}
                    honorTileSize
                />
            )}
        </div>
    );
};
