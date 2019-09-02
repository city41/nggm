import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { createGif } from "../state/createGif_jsgif";
import { useAppState } from "../state";
import { ExtractedSpriteGroup } from "../state/types";

type FrameStatus = { frame: number; totalFrames: number };

function clear(div: HTMLDivElement) {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

interface BuildGifModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
}

export const BuildGifModal: React.FunctionComponent<BuildGifModalProps> = ({
    isOpen,
    onRequestClose
}) => {
    const [state] = useAppState();
    const containerRef = useRef<null | HTMLDivElement>(null);
    const [frameStatus, setFrameStatus] = useState<null | FrameStatus>(null);

    useEffect(() => {
        if (isOpen) {
            const delay = window.Module._get_neogeo_frame_counter_speed() * 16;

            const extractedSpriteGroups = state.layers.reduce<
                ExtractedSpriteGroup[]
            >((b, layer) => {
                return b.concat(layer.groups);
            }, []);

            createGif(
                extractedSpriteGroups,
                640,
                480,
                delay,
                (
                    canvas: HTMLCanvasElement,
                    frame: number,
                    totalFrames: number
                ) => {
                    setFrameStatus({ frame, totalFrames });

                    if (containerRef && containerRef.current) {
                        clear(containerRef.current);
                        containerRef.current.appendChild(canvas);
                    }
                },
                (dataUrl: string) => {
                    setFrameStatus(null);

                    if (containerRef && containerRef.current) {
                        clear(containerRef.current);
                        const img = new Image();
                        img.src = dataUrl;
                        containerRef.current.appendChild(img);
                    }
                }
            );
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            {frameStatus && (
                <div>
                    {frameStatus.frame} of {frameStatus.totalFrames}
                </div>
            )}
            <div ref={containerRef} />
        </Modal>
    );
};
