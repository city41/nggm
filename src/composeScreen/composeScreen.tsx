import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import {
  getBackdropNeoGeoColor,
  neoGeoColorToCSS
} from "../palette/neoGeoPalette";
import { useAppState } from "../state";
import { BuildGifModal } from "../gifBuilder/buildGifModal";
import { Layer as LayerCmp } from "./layer";
import { CropRect } from "./cropRect";

interface ComposeScreenProps {
  className?: string;
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  align-self: center;
  overflow: auto;
  background-color: var(--dock-color);
`;

const CaptureLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const ComposeScreen: React.FunctionComponent<ComposeScreenProps> = ({
  className
}) => {
  const [animationCounter, setAnimationCounter] = useState({
    animation: 0,
    rafFrameCountdown: 0
  });
  const { state, dispatch } = useAppState();
  const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [upperLeftCrop, setUpperLeftCrop] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const [lowerRightCrop, setLowerRightCrop] = useState<null | {
    x: number;
    y: number;
  }>(null);

  useEffect(() => {
    if (state.isPreviewing) {
      // minus one because on my machine the animation can't quite keep up
      const frameCountdown =
        window.Module._get_neogeo_frame_counter_speed() - 1;
      requestAnimationFrame(() => {
        const diff = animationCounter.rafFrameCountdown === 0 ? 1 : 0;

        setAnimationCounter({
          animation: animationCounter.animation + diff,
          rafFrameCountdown:
            diff === 1 ? frameCountdown : animationCounter.rafFrameCountdown - 1
        });
      });
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, dropRef] = useDrop({
    accept: ["Sprite", "Sprites"],
    drop: (item: any, monitor: any) => {
      if (divRef) {
        const x =
          monitor.getClientOffset().x - divRef.getBoundingClientRect().left;

        const composedX = Math.floor(x / 16) * 16;

        if (item.type === "Sprite") {
          const spriteMemoryIndex = item.spriteMemoryIndex;
          const pauseId = item.pauseId;

          if (pauseId) {
            dispatch({
              type: "MoveSprite",
              spriteMemoryIndex,
              newComposedX: composedX,
              pauseId
            });
          } else {
            dispatch({
              type: "ExtractSprite",
              spriteMemoryIndex,
              composedX
            });
          }
        } else {
          dispatch({
            type: "ExtractSpritesToGroup",
            spriteMemoryIndices: item.spriteMemoryIndices,
            composedX
          });
        }
      }
    },
    canDrop() {
      return !isCropping;
    }
  });

  const layers = state.layers.map((layer, i) => {
    if (state.hiddenLayers[layer.id]) {
      return null;
    } else {
      return (
        <LayerCmp
          key={i}
          index={i}
          layer={layer}
          runPreview={state.isPreviewing}
          animationCounter={animationCounter.animation}
          canDrag={!isCropping}
          outlineTiles={state.showGrid}
        />
      );
    }
  });

  const backgroundColorStyle = state.isPaused
    ? {
        backgroundColor: neoGeoColorToCSS(getBackdropNeoGeoColor())
      }
    : {};

  return (
    <>
      <BuildGifModal
        isOpen={state.isBuildingGif}
        onRequestClose={() => dispatch("StopBuildGif")}
      />
      <Container
        className={className}
        style={backgroundColorStyle}
        ref={div => {
          setDivRef(div);
          dropRef(div);
        }}
      >
        {layers}
        {!!((isCropping && upperLeftCrop && lowerRightCrop) || state.crop) && (
          <CropRect
            width={divRef && divRef.scrollWidth}
            height={divRef && divRef.scrollHeight}
            crop={state.crop || [upperLeftCrop!, lowerRightCrop!]}
          />
        )}
        {isCropping && (
          <CaptureLayer
            style={
              divRef
                ? {
                    width: divRef.scrollWidth,
                    height: divRef.scrollHeight
                  }
                : {}
            }
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
              if (isCropping) {
                const rect = (e.target as HTMLDivElement).getBoundingClientRect() as DOMRect;

                const rawX = e.clientX - rect.x;
                const rawY = e.clientY - rect.y;

                const x = Math.floor(rawX / 16) * 16;
                const y = Math.floor(rawY / 16) * 16;

                setUpperLeftCrop({ x, y });
              }
            }}
            onMouseMove={e => {
              if (isCropping && upperLeftCrop) {
                const rect = (e.target as HTMLDivElement).getBoundingClientRect() as DOMRect;

                const rawX = e.clientX - rect.x;
                const rawY = e.clientY - rect.y;

                const x = Math.floor(rawX / 16) * 16;
                const y = Math.floor(rawY / 16) * 16;

                setLowerRightCrop({ x, y });
              }
            }}
            onMouseUp={e => {
              if (isCropping && upperLeftCrop && lowerRightCrop) {
                dispatch({
                  type: "SetCrop",
                  crop: [upperLeftCrop, lowerRightCrop]
                });
                setIsCropping(false);
              }
            }}
          />
        )}
      </Container>
    </>
  );
};
