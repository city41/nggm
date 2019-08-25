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

    const tiles = spriteData.tiles.map((tileData, i) => (
        <Tile
            key={i}
            tileIndex={tileData.tileIndex}
            paletteIndex={tileData.paletteIndex}
            horizontalFlip={tileData.horizontalFlip}
        />
    ));

    return <div className="sprite">{tiles}</div>;
};
