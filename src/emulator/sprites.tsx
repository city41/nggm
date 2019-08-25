import React, { useState } from "react";
import { Sprite } from "./sprite";

import "./sprites.css";

const SPRITE_CHUNK_SIZE = 448;

export const Sprites: React.FunctionComponent = () => {
    const [dumpCount, setDumpCount] = useState(0);

    const sprites = new Array(dumpCount ? SPRITE_CHUNK_SIZE : 0)
        .fill(1, 0, SPRITE_CHUNK_SIZE)
        .map((_, i) => {
            return <Sprite key={i} spriteIndex={i} />;
        });

    return (
        <>
            <button
                onClick={() => {
                    setDumpCount(dumpCount + 1);
                }}
            >
                dump sprites
            </button>
            <div className="sprites">{sprites}</div>
        </>
    );
};
