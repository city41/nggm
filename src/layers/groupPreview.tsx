import React from "react";
import { ExtractedSpriteGroup as ExtractedSpriteGroupData } from "../state/types";
import { spriteGroupToDataUrl } from "../state/toDataUrl";

interface GroupPreviewProps {
    group: ExtractedSpriteGroupData;
}

export const GroupPreview: React.FunctionComponent<
    GroupPreviewProps
> = React.memo<GroupPreviewProps>(({ group }) => {
    const { width: imgWidth, height: imgHeight, url } = spriteGroupToDataUrl(
        group
    );

    const scale = 24 / Math.max(imgWidth, imgHeight);

    return (
        <img
            width={imgWidth * scale}
            height={imgHeight * scale}
            src={url}
            alt="sprite group thumbnail"
        />
    );
});
