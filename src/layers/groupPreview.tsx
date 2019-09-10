import React from "react";
import { ExtractedSprite } from "../composeScreen/extractedSprite";
import { ExtractedSpriteGroup as ExtractedSpriteGroupData } from "../state/types";

interface GroupPreviewProps {
    group: ExtractedSpriteGroupData;
}

export const GroupPreview: React.FunctionComponent<GroupPreviewProps> = ({
    group
}) => {
    let maxTile = -Infinity;

    const sprites = group.sprites.slice(0, 100).map((sprite, i) => {
        const truncatedTiles = sprite.tiles.slice(0, 100);
        maxTile = Math.max(maxTile, truncatedTiles.length);

        const truncatedSprite = {
            ...sprite,
            tiles: truncatedTiles
        };

        return (
            <ExtractedSprite
                key={i}
                data={truncatedSprite}
                canDrag={false}
                setYToZero
                overrideX={i * 16}
            />
        );
    });

    const height = maxTile * 16;
    const width = sprites.length * 16;

    const scale = 32 / Math.max(width, height);

    const style = {
        width: 32,
        height: height * scale,
        position: "relative"
    } as const;

    return (
        <div style={style}>
            <div
                style={{
                    transform: `scale(${scale}) translate(-${32 * scale}px)`
                }}
            >
                {sprites}
            </div>
        </div>
    );
};
