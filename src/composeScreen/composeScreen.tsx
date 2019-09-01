import React, { useState } from "react";
import classnames from "classnames";
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

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    className
}) => {
    const [state, dispatch] = useAppState();
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dropRef] = useDrop({
        accept: "Sprite",
        drop: (item: any, monitor: any) => {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const composedX = Math.floor(x / 16) * 16;
                const spriteIndex = item.spriteIndex;
                const pauseId = item.pauseId;

                dispatch(extractSpriteAction(spriteIndex, composedX, pauseId));
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

    const maxX = Math.max(0, ...state.extractedSprites.map(es => es.composedX));

    const style = {
        backgroundColor,
        width: Math.max(maxX + 48, 320)
    };

    const finalClassName = classnames(styles.root, className);

    return (
        <div
            className={finalClassName}
            ref={div => {
                setDivRef(div);
                dropRef(div);
            }}
            style={style}
        >
            {sprites}
        </div>
    );
};
