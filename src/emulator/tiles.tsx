import React, { useState } from "react";
import { Tile } from "./tile";

export const Tiles: React.FunctionComponent = () => {
    const [tileOffset, setTileOffset] = useState(0);
    const [tileCount, setTileCount] = useState(0);

    const tiles = new Array(tileCount).fill(1, 0, 100).map((_, i) => {
        return <Tile tileIndex={i + tileOffset} />;
    });

    return (
        <>
            <button
                onClick={() => {
                    setTileCount(100);
                    setTileOffset(tileOffset + 100);
                }}
            >
                dump tiles
            </button>
            <div className="tiles">{tiles}</div>
        </>
    );
};
