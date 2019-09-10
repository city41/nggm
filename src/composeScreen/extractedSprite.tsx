import React, { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { ExtractedSprite as ExtractedSpriteData } from "../state/types";
import { ExtractedTile } from "./extractedTile";

import styles from "./extractedSprite.module.css";

interface ExtractedSpriteProps {
    data: ExtractedSpriteData;
    autoAnimate?: boolean;
    animationCounter?: number;
    canDrag: boolean;
    outlineTiles?: boolean;
    setYToZero?: boolean;
    overrideX?: number;
}

export const ExtractedSprite: React.FunctionComponent<ExtractedSpriteProps> = ({
    data,
    autoAnimate,
    animationCounter,
    canDrag,
    outlineTiles,
    setYToZero,
    overrideX
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef, preview] = useDrag({
        item: {
            spriteMemoryIndex: data.spriteMemoryIndex,
            pauseId: data.pauseId,
            type: "Sprite",
            isAdhoc: data.isAdhoc
        },
        canDrag() {
            return canDrag;
        }
    });

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

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
                outlined={outlineTiles}
            />
        );
    });

    const style = {
        top: setYToZero ? 0 : data.composedY,
        left: typeof overrideX === "number" ? overrideX : data.composedX,
        gridTemplateRows: `repeat(${data.tiles.length}, 16px)`,
        zIndex: data.spriteMemoryIndex
    };

    return (
        <div ref={dragRef} className={styles.root} style={style}>
            {tiles}
        </div>
    );
};
