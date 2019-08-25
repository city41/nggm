import React, { useState } from "react";
import { Sprite } from "./sprite";

import "./sprites.css";

const SPRITE_CHUNK_SIZE = 448;

export const Sprites: React.FunctionComponent = () => {
    const [spriteCount, setSpriteCount] = useState(0);

    const sprites = new Array(spriteCount)
        .fill(1, 0, SPRITE_CHUNK_SIZE)
        .map((_, i) => {
            return <Sprite key={i} spriteIndex={i} />;
        });

    return (
        <>
            <button
                onClick={() => {
                    setSpriteCount(SPRITE_CHUNK_SIZE);
                }}
            >
                dump sprites
            </button>
            <div className="sprites">{sprites}</div>
        </>
    );
};
