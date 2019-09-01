import React from "react";
import { useDrag } from "react-dnd";
import { ExtractedSprite as ExtractedSpriteData } from "../state/types";
import { ExtractedTile } from "./extractedTile";

import styles from "./extractedSprite.module.css";

interface ExtractedSpriteProps {
    data: ExtractedSpriteData;
}

export const ExtractedSprite: React.FunctionComponent<ExtractedSpriteProps> = ({
    data
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef] = useDrag({
        item: {
            spriteIndex: data.spriteMemoryIndex,
            pauseId: data.group.pauseId,
            type: "Sprite"
        }
    });

    const tiles = data.tiles.map((tileData, i) => (
        <ExtractedTile
            key={i}
            y={tileData.composedY - data.composedY}
            tileIndex={tileData.tileIndex}
            rgbPalette={tileData.rgbPalette}
            horizontalFlip={tileData.horizontalFlip}
            verticalFlip={tileData.verticalFlip}
        />
    ));

    const style = {
        top: data.composedY,
        left: data.composedX,
        gridTemplateRows: `repeat(${data.tiles.length}, 16px)`,
        zIndex: data.spriteMemoryIndex
    };

    return (
        <div ref={dragRef} className={styles.root} style={style}>
            {tiles}
        </div>
    );
};
