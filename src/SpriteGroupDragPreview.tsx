import React from "react";
import { extractSpriteGroup } from "./state/extractSpriteGroup";
import { ExtractedSprite } from "./composeScreen/extractedSprite";

interface SpriteGroupDragPreviewProps {
    seedSpriteMemoryIndex: number;
    innerRef: any;
}

class SpriteGroupDragPreviewClass extends React.PureComponent<
    SpriteGroupDragPreviewProps
> {
    render() {
        const { seedSpriteMemoryIndex, innerRef } = this.props;

        const spriteGroupData = extractSpriteGroup(seedSpriteMemoryIndex, 0, 0);

        const sprites = spriteGroupData.sprites.map(sprite => (
            <ExtractedSprite data={sprite} canDrag={false} setYToZero />
        ));

        return <div ref={innerRef}>{sprites}</div>;
    }
}

export const SpriteGroupDragPreview = React.forwardRef<
    HTMLDivElement,
    SpriteGroupDragPreviewProps
>((props, ref) => <SpriteGroupDragPreviewClass innerRef={ref} {...props} />);
