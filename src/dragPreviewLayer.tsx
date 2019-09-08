import React from "react";
import { useDragLayer } from "react-dnd";
import { getSpriteData } from "./state/spriteData";
import { Sprite } from "./spriteTray/sprite";

import styles from "./dragPreviewLayer.module.css";

export const DragPreviewLayer: React.FunctionComponent = () => {
    const { itemType, isDragging, item, currentOffset } = useDragLayer(
        monitor => {
            if (monitor.isDragging()) {
                // debugger;
            }
            return {
                item: monitor.getItem(),
                itemType: monitor.getItemType(),
                initialOffset: monitor.getInitialSourceClientOffset(),
                currentOffset: monitor.getClientOffset(),
                isDragging: monitor.isDragging()
            };
        }
    );

    if (!isDragging || !currentOffset || itemType !== "Sprite") {
        return null;
    }

    const style = {
        position: "fixed",
        top: currentOffset.y + 1,
        left: currentOffset.x + 1,
        width: 100,
        height: 100,
        zIndex: 1000
    } as const;

    const spriteData = getSpriteData(item.spriteMemoryIndex);

    return (
        <div style={style}>
            <Sprite spriteData={spriteData} />
        </div>
    );
};
