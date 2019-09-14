import React from "react";
import {
    extractSpriteAndStickyCompanionsToGroup,
    extractSpritesIntoGroup
} from "./state/extractSpriteGroup";
import { ExtractedSprite } from "./composeScreen/extractedSprite";

interface StickySpriteGroupDragPreviewProps {
    seedSpriteMemoryIndex: number;
}

export const StickySpriteGroupDragPreview: React.FunctionComponent<
    StickySpriteGroupDragPreviewProps
> = React.memo<StickySpriteGroupDragPreviewProps>(
    ({ seedSpriteMemoryIndex }) => {
        const spriteGroupData = extractSpriteAndStickyCompanionsToGroup(
            seedSpriteMemoryIndex,
            0,
            0
        );

        const sprites = spriteGroupData.sprites.map((sprite, i) => (
            <ExtractedSprite key={i} data={sprite} canDrag={false} setYToZero />
        ));

        return <div>{sprites}</div>;
    }
);

interface AdhocSpriteGroupDragPreviewProps {
    spriteMemoryIndices: number[];
}

export const AdhocSpriteGroupDragPreview: React.FunctionComponent<
    AdhocSpriteGroupDragPreviewProps
> = React.memo<AdhocSpriteGroupDragPreviewProps>(({ spriteMemoryIndices }) => {
    const spriteGroupData = extractSpritesIntoGroup(spriteMemoryIndices, 0, 0);

    const sprites = spriteGroupData.sprites.map((sprite, i) => (
        <ExtractedSprite key={i} data={sprite} canDrag={false} setYToZero />
    ));

    return <div>{sprites}</div>;
});
