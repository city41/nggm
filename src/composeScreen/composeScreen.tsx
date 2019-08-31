import React from "react";
import { Sprite } from "../spriteManager/sprite";
import { getBackdropColor, neoGeoColorToCSS } from "../palette/neoGeoPalette";

import styles from "./composeScreen.module.css";

interface ComposeScreenProps {
    className?: string;
    composedSprites: number[];
    emulatorRunning: boolean;
}

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    className,
    composedSprites,
    emulatorRunning
}) => {
    const sprites = composedSprites.map(spriteIndex => (
        <Sprite
            key={spriteIndex}
            spriteIndex={spriteIndex}
            positioned
            honorTileSize={false}
        />
    ));

    const backgroundColor = emulatorRunning
        ? neoGeoColorToCSS(getBackdropColor())
        : "transparent";

    console.log("backgroundColor", backgroundColor);

    return (
        <div className={styles.root} style={{ backgroundColor }}>
            {sprites}
        </div>
    );
};
