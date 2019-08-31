import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Sprite } from "../spriteManager/sprite";
import { getBackdropColor, neoGeoColorToCSS } from "../palette/neoGeoPalette";
import { uniqBy } from "lodash";

import styles from "./composeScreen.module.css";

interface SpriteData {
    spriteIndex: number;
    positionIndex: number;
}

interface ComposeScreenProps {
    className?: string;
    composedSprites: number[];
    emulatorRunning: boolean;
}

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    composedSprites,
    emulatorRunning
}) => {
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);
    const [spriteData, setSpriteData] = useState<SpriteData[]>([]);

    const [_, dropRef] = useDrop({
        accept: "Sprite",
        drop: (item: any, monitor: any) => {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const positionIndex = Math.floor(x / 16);
                const spriteIndex = item.spriteIndex;
                const newSpriteDataEntry = {
                    spriteIndex,
                    positionIndex
                };

                const newSpriteData = uniqBy(
                    [newSpriteDataEntry].concat(spriteData),
                    "spriteIndex"
                );

                setSpriteData(newSpriteData);
            }
        }
    });

    const spriteCmps = spriteData.map(sd => (
        <Sprite
            key={sd.spriteIndex}
            spriteIndex={sd.spriteIndex}
            overrideX={sd.positionIndex * 16}
            positioned
            honorTileSize={false}
        />
    ));

    const backgroundColor = emulatorRunning
        ? neoGeoColorToCSS(getBackdropColor())
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
            {spriteCmps}
        </div>
    );
};
