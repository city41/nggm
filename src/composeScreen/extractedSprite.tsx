import React from "react";
import { useDrag } from "react-dnd";
import { ExtractedSprite as ExtractedSpriteData } from "../state/types";
import { ExtractedTile } from "./extractedTile";

import styles from "./extractedSprite.module.css";

interface ExtractedSpriteProps {
    data: ExtractedSpriteData;
    autoAnimate?: boolean;
    animationCounter?: number;
    canDrag: boolean;
}

export const ExtractedSprite: React.FunctionComponent<ExtractedSpriteProps> = ({
    data,
    autoAnimate,
    animationCounter,
    canDrag
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef] = useDrag({
        item: {
            spriteMemoryIndex: data.spriteMemoryIndex,
            pauseId: data.group.pauseId,
            type: "Sprite"
        },
        canDrag() {
            return canDrag;
        }
    });

    const tiles = data.tiles.map((tileData, i) => {
        let tileIndex = tileData.tileIndex;

        if (autoAnimate && typeof animationCounter === "number") {
            if (tileData.autoAnimation === 3) {
                // 3 bit auto animation: the 4th bit is set, indicating this tile does 3bit auto animation
                // that means take its tileIndex, and replace its bottom three bits with those of the animation counter
                tileIndex =
                    (tileIndex & ~7) + ((tileIndex + animationCounter) & 7);
            }
            if (tileData.autoAnimation === 2) {
                // 2 bit auto animation: like above but replace its bottom two bits
                tileIndex =
                    (tileIndex & ~3) + ((tileIndex + animationCounter) & 3);
            }
        }

        return (
            <ExtractedTile
                key={i}
                y={tileData.composedY - data.composedY}
                tileIndex={tileIndex}
                rgbPalette={tileData.rgbPalette}
                horizontalFlip={tileData.horizontalFlip}
                verticalFlip={tileData.verticalFlip}
            />
        );
    });

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
