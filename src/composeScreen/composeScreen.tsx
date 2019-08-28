import React from "react";
import { Sprite } from "../spriteManager/sprite";

import styles from "./composeScreen.module.css";

interface ComposeScreenProps {
    className?: string;
    composedSprites: number[];
}

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
    className,
    composedSprites
}) => {
    const sprites = composedSprites.map(spriteIndex => (
        <Sprite spriteIndex={spriteIndex} positioned honorTileSize={false} />
    ));
    return <div className={styles.root}>{sprites}</div>;
};
