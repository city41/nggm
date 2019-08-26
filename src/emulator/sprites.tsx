import React, { useState } from "react";
import classnames from "classnames";
import { Sprite } from "./sprite";

import styles from "./sprites.module.css";

const SPRITE_CHUNK_SIZE = 448;

export const Sprites: React.FunctionComponent = () => {
    const [dumpCount, setDumpCount] = useState(0);
    const [positioned, setPositioned] = useState(true);
    const [honorTileSize, setHonorTileSize] = useState(true);

    const sprites = new Array(dumpCount ? SPRITE_CHUNK_SIZE : 0)
        .fill(1, 0, SPRITE_CHUNK_SIZE)
        .map((_, i) => {
            return (
                <Sprite
                    key={i}
                    spriteIndex={i}
                    positioned={positioned}
                    honorTileSize={honorTileSize}
                />
            );
        });

    const spritesClassName = classnames(styles.sprites, {
        [styles.positioned]: positioned
    });

    return (
        <>
            <input
                type="checkbox"
                checked={positioned}
                onChange={() => setPositioned(!positioned)}
            />
            positioned
            <input
                type="checkbox"
                checked={honorTileSize}
                onChange={() => setHonorTileSize(!honorTileSize)}
            />
            honor tile size
            <button
                onClick={() => {
                    setDumpCount(dumpCount + 1);
                }}
            >
                dump sprites
            </button>
            <div className={spritesClassName}>{sprites}</div>
        </>
    );
};
