import React from "react";
import { useDragLayer } from "react-dnd";
import {
    StickySpriteGroupDragPreview,
    AdhocSpriteGroupDragPreview
} from "./SpriteGroupDragPreview";

export const DragPreviewLayer: React.FunctionComponent = () => {
    const { isDragging, item, currentOffset } = useDragLayer(monitor => {
        if (monitor.isDragging()) {
            // debugger;
        }
        return {
            item: monitor.getItem(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getClientOffset(),
            isDragging: monitor.isDragging()
        };
    });

    if (
        !isDragging ||
        !currentOffset ||
        (item.type !== "Sprite" && item.type !== "Sprites")
    ) {
        return null;
    }

    const style = {
        position: "fixed",
        top: currentOffset.y + 1,
        left: currentOffset.x + 1,
        zIndex: 1000
    } as const;

    let spritesCmp;

    if (item.type === "Sprite") {
        spritesCmp = (
            <StickySpriteGroupDragPreview
                seedSpriteMemoryIndex={item.spriteMemoryIndex}
            />
        );
    } else {
        spritesCmp = (
            <AdhocSpriteGroupDragPreview
                spriteMemoryIndices={item.spriteMemoryIndices}
            />
        );
    }

    return <div style={style}>{spritesCmp}</div>;
};
