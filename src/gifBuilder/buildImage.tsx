import React, { useState } from "react";
import { useAppState } from "../state";
import { createGif } from "../state/createGif_jsgif";

export const BuildImage: React.FunctionComponent = () => {
    const [dataUrl, setDataUrl] = useState<null | string>(null);
    const [state] = useAppState();
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");

    return (
        <div>
            width
            <input
                value={width}
                onChange={e => {
                    setWidth(e.target.value || "");
                }}
                type="text"
            />
            height
            <input
                value={height}
                onChange={e => setHeight(e.target.value || "")}
                type="text"
            />
            <button
                disabled={!width || !height}
                onClick={() => {
                    if (width && height) {
                        const dataUrl = createGif(
                            state.extractedSpriteGroups,
                            Number(width),
                            Number(height)
                        );
                        setDataUrl(dataUrl);
                    }
                }}
            >
                build gif
            </button>
            {dataUrl && <img src={dataUrl} />}
        </div>
    );
};
