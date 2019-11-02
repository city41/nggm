import React from "react";

import styles from "./spriteDrop.module.css";

interface SpriteDropProps {
    spriteMemoryIndex: number;
}

export const SpriteDrop: React.FunctionComponent<SpriteDropProps> = ({
    spriteMemoryIndex
}) => {
    const style = {
        left: spriteMemoryIndex * 16
    };

    return <div className={styles.root} style={style} />;
};
