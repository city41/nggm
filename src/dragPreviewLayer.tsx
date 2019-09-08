import React, { useEffect, useRef } from "react";
import { useDragLayer } from "react-dnd";
import { SpriteGroupDragPreview } from "./SpriteGroupDragPreview";

import styles from "./dragPreviewLayer.module.css";

export const DragPreviewLayer: React.FunctionComponent = () => {
    const previewRef = useRef<null | HTMLDivElement>(null);

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

    useEffect(() => {
        if (previewRef && previewRef.current && currentOffset) {
            previewRef.current.style.position = "fixed";
            previewRef.current.style.top = "fixed";
            previewRef.current.style.top = currentOffset.y + 1 + "px";
            previewRef.current.style.left = currentOffset.x + 1 + "px";
            previewRef.current.style.zIndex = "1000";
        }
    });

    if (!isDragging || !currentOffset || itemType !== "Sprite") {
        return null;
    }

    return (
        <SpriteGroupDragPreview
            seedSpriteMemoryIndex={item.spriteMemoryIndex}
            innerRef={previewRef}
        />
    );
};
