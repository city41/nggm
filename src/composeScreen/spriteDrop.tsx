import React from "react";

import styles from "./spriteDrop.module.css";

interface SpriteDropProps {
    spriteIndex: number;
}

export const SpriteDrop: React.FunctionComponent<SpriteDropProps> = ({
    spriteIndex
}) => {
    const style = {
        left: spriteIndex * 16
    };

    return <div className={styles.root} style={style} />;
};
