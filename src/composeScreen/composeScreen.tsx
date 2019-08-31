import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { ExtractedSprite } from "./extractedSprite";
import {
    getBackdropNeoGeoColor,
    neoGeoColorToCSS
} from "../palette/neoGeoPalette";
import { useAppState, extractSpriteAction } from "../state";

import styles from "./composeScreen.module.css";

interface ComposeScreenProps {
    className?: string;
}

export const ComposeScreen: React.FunctionComponent<
    ComposeScreenProps
> = ({}) => {
    const [state, dispatch] = useAppState();
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

    const [_, dropRef] = useDrop({
        accept: "Sprite",
        drop: (item: any, monitor: any) => {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const composedX = Math.floor(x / 16) * 16;
                const spriteIndex = item.spriteIndex;

                dispatch(extractSpriteAction(spriteIndex, composedX));
            }
        }
    });

    const sprites = state.extractedSprites.map(extractedSprite => (
        <ExtractedSprite
            key={extractedSprite.spriteMemoryIndex}
            data={extractedSprite}
        />
    ));

    const backgroundColor = state.isPaused
        ? neoGeoColorToCSS(getBackdropNeoGeoColor())
        : "transparent";

    return (
        <div
            ref={div => {
                setDivRef(div);
                dropRef(div);
            }}
            className={styles.root}
            style={{ backgroundColor }}
        >
            {sprites}
        </div>
    );
};
