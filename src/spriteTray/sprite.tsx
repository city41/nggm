import React from "react";
import classnames from "classnames";
import { useDrag } from "react-dnd";
import { Tile } from "./tile";
import { getSpriteData } from "../state/spriteData";

import styles from "./sprite.module.css";

interface SpriteProps {
    className?: string;
    spriteMemoryIndex: number;
    positioned: boolean;
    overrideX?: number;
    honorTileSize: boolean;
}

interface PreviewProps {
    connect: any;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    className,
    spriteMemoryIndex,
    positioned,
    overrideX,
    honorTileSize
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef] = useDrag({
        item: { spriteMemoryIndex, type: "Sprite" }
    });

    const spriteData = getSpriteData(spriteMemoryIndex, honorTileSize, {
        removeEmptyTiles: true
    });

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
        left: typeof overrideX === "number" ? overrideX : spriteData.x,
        gridTemplateRows: `repeat(${spriteData.tiles.length}, 16px)`,
        zIndex: spriteMemoryIndex
    };

    const spriteClassName = classnames(styles.sprite, className, {
        [styles.positioned]: positioned
    });

    return (
        <div ref={dragRef} className={spriteClassName} style={style}>
            {tiles}
        </div>
    );
};
