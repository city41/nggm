import React from "react";
import { Tile } from "./tile";
import { getSpriteData } from "./spriteData";

import "./sprite.css";

interface SpriteProps {
    spriteIndex: number;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    spriteIndex
}) => {
    const spriteData = getSpriteData(spriteIndex);

    if (spriteData.tiles.length === 0) {
        return null;
    }

    const tiles = spriteData.tiles.map((tileData, i) => (
        <Tile
            key={i}
            tileIndex={tileData.tileIndex}
            paletteIndex={tileData.paletteIndex}
            horizontalFlip={tileData.horizontalFlip}
        />
    ));

    const style = {
        top: spriteData.y,
        left: spriteData.x,
        gridTemplateRows: `repeat(${spriteData.tiles.length}, 16px)`
    };

    return (
        <div className="sprite" style={style}>
            {tiles}
        </div>
    );
};
