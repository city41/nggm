import React from "react";
import {
    extractSpriteAndStickyCompanionsToGroup,
    extractSpritesIntoGroup
} from "./state/extractSpriteGroup";
import { ExtractedSprite } from "./composeScreen/extractedSprite";

export class StickySpriteGroupDragPreview extends React.PureComponent<{
    seedSpriteMemoryIndex: number;
}> {
    render() {
        const { seedSpriteMemoryIndex } = this.props;

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
}

export class AdhocSpriteGroupDragPreview extends React.PureComponent<{
    spriteMemoryIndices: number[];
}> {
    render() {
        const { spriteMemoryIndices } = this.props;

        const spriteGroupData = extractSpritesIntoGroup(
            spriteMemoryIndices,
            0,
            0
        );

        const sprites = spriteGroupData.sprites.map((sprite, i) => (
            <ExtractedSprite key={i} data={sprite} canDrag={false} setYToZero />
        ));

        return <div>{sprites}</div>;
    }
}
