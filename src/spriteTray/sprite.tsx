import React from "react";
import classnames from "classnames";
import { useDrag } from "react-dnd";
import { Tile } from "./tile";
import { getSpriteData } from "../state/spriteData";

import styles from "./sprite.module.css";

interface SpriteProps {
    className?: string;
    spriteMemoryIndex: number;
}

interface PreviewProps {
    connect: any;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    className,
    spriteMemoryIndex
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef] = useDrag({
        item: { spriteMemoryIndex, type: "Sprite" }
    });

    const spriteData = getSpriteData(spriteMemoryIndex);

    if (spriteData.tiles.length === 0) {
        return null;
    }

    const tiles = spriteData.tiles.map((tileData, i) => (
        <Tile
            key={i}
            y={tileData.y}
            tileIndex={tileData.tileIndex}
            paletteIndex={tileData.paletteIndex}
            horizontalFlip={tileData.horizontalFlip}
            verticalFlip={tileData.verticalFlip}
        />
    ));

    const style = {
        gridTemplateRows: `repeat(${spriteData.tiles.length}, 8px)`,
        zIndex: spriteMemoryIndex
    };

    return (
        <div className={styles.sprite} ref={dragRef} style={style}>
            {tiles}
        </div>
    );
};
