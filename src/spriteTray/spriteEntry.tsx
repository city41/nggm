import React from "react";
import classnames from "classnames";
import { Sprite } from "./sprite";
import { isSpriteEmpty } from "../state/spriteData";

import styles from "./spriteEntry.module.css";

interface SpriteEntryProps {
    className?: string;
    spriteIndex: number;
    render?: boolean;
    hideIfEmpty: boolean;
    focused?: boolean;
    honorTileSize: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SpriteEntry: React.FunctionComponent<SpriteEntryProps> = ({
    className,
    spriteIndex,
    render,
    hideIfEmpty,
    focused,
    honorTileSize,
    onClick
}) => {
    const classes = classnames(styles.root, className, {
        [styles.hide]: render && hideIfEmpty && isSpriteEmpty(spriteIndex),
        [styles.focused]: focused
    });

    return (
        <div className={classes} onClick={onClick}>
            <div className={styles.index}>{spriteIndex}</div>
            <div className={styles.spriteContainer}>
                {render && (
                    <Sprite
                        className={styles.sprite}
                        spriteIndex={spriteIndex}
                        positioned={false}
                        honorTileSize={honorTileSize}
                    />
                )}
            </div>
        </div>
    );
};
