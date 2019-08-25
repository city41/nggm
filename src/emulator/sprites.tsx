import React, { useState } from "react";
import { Sprite } from "./sprite";

import "./sprites.css";

const SPRITE_CHUNK_SIZE = 70;

export const Sprites: React.FunctionComponent = () => {
    const [spriteOffset, setSpriteOffset] = useState(0);
    const [spriteCount, setSpriteCount] = useState(0);

    const sprites = new Array(spriteCount)
        .fill(1, 0, SPRITE_CHUNK_SIZE)
        .map((_, i) => {
            return <Sprite spriteIndex={i + spriteOffset} />;
        });

    return (
        <>
            <button
                onClick={() => {
                    setSpriteCount(100);
                    setSpriteOffset(spriteOffset + SPRITE_CHUNK_SIZE);
                }}
            >
                dump sprites
            </button>
            <div className="sprites">{sprites}</div>
        </>
    );
};
