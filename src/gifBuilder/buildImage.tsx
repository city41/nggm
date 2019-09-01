import React, { useState } from "react";
import { useAppState } from "../state";
import { buildPng } from "../state/buildPng";

export const BuildImage: React.FunctionComponent = () => {
    const [dataUrl, setDataUrl] = useState<null | string>(null);
    const [state] = useAppState();

    return (
        <div>
            <button
                onClick={() => setDataUrl(buildPng(state.extractedSprites))}
            >
                build image
            </button>
            {dataUrl && <img src={dataUrl} />}
        </div>
    );
};
