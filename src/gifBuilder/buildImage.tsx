import React, { useState } from "react";
import { useAppState } from "../state";
import { createGif } from "../state/createGif_jsgif";

export const BuildImage: React.FunctionComponent = () => {
    const [dataUrl, setDataUrl] = useState<null | string>(null);
    const [state] = useAppState();

    return (
        <div>
            <button
                onClick={() => {
                    const dataUrl = createGif(state.extractedSpriteGroups);
                    setDataUrl(dataUrl);
                }}
            >
                build gif
            </button>
            {dataUrl && <img src={dataUrl} />}
        </div>
    );
};
