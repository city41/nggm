import React from "react";
import classnames from "classnames";
import { Tile } from "./tile";
import { getSpriteData } from "./spriteData";

import styles from "./sprite.module.css";

interface SpriteProps {
    className?: string;
    spriteIndex: number;
    positioned: boolean;
    honorTileSize: boolean;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    className,
    spriteIndex,
    positioned,
    honorTileSize
}) => {
    const spriteData = getSpriteData(spriteIndex, honorTileSize);

    if (spriteData.tiles.length === 0) {
        return null;
    }

    const tiles = spriteData.tiles.map((tileData, i) => (
        <Tile
            key={i}
            positioned={positioned}
            y={tileData.y - spriteData.y}
            tileIndex={tileData.tileIndex}
            paletteIndex={tileData.paletteIndex}
            horizontalFlip={tileData.horizontalFlip}
            verticalFlip={tileData.verticalFlip}
        />
    ));

    const style = {
        top: spriteData.y,
        left: spriteData.x,
        gridTemplateRows: `repeat(${spriteData.tiles.length}, 16px)`
    };

    const spriteClassName = classnames(styles.sprite, className, {
        [styles.positioned]: positioned
    });

    return (
        <div className={spriteClassName} style={style}>
            {tiles}
        </div>
    );
};
