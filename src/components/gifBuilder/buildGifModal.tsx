import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Modal } from "../primitives/modal";
import { createGif } from "../../gif/createGif";
import { useAppState } from "../../state";

const StyledModal = styled(Modal)`
  width: auto;
  min-width: 600px;
  min-height: 400px;
  display: inline-block;
`;

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
  const { state } = useAppState();
  const containerRef = useRef<null | HTMLDivElement>(null);
  const [frameStatus, setFrameStatus] = useState<null | FrameStatus>(null);

  useEffect(() => {
    if (isOpen) {
      const delay = window.Module._get_neogeo_frame_counter_speed() * 16;

      createGif(
        state.layers,
        state.crop,
        delay,
        (canvas: HTMLCanvasElement, frame: number, totalFrames: number) => {
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
  }, [isOpen, state.crop, state.layers]);

  return (
    <StyledModal isOpen={isOpen} onRequestClose={onRequestClose}>
      {frameStatus && (
        <div>
          {frameStatus.frame} of {frameStatus.totalFrames}
        </div>
      )}
      <div ref={containerRef} />
    </StyledModal>
  );
};
