import React, { useState, useEffect, useRef } from "react";
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

type Point = { x: number; y: number };

function cropHasArea(a: Point, b: Point): boolean {
  return a.x !== b.x && a.y !== b.y;
}

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
  cursor: crosshair;
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
  const [anchorPoint, setAnchorPoint] = useState<null | Point>(null);
  const [movingPoint, setMovingPoint] = useState<null | Point>(null);

  const isCroppingRef = useRef(false);

  const isCropping = state.isCropping;

  useEffect(() => {
    if (!isCroppingRef.current && state.isCropping) {
      setAnchorPoint(null);
      setMovingPoint(null);
    }

    isCroppingRef.current = state.isCropping;
  }, [state.isCropping]);

  useEffect(() => {
    if (state.isPreviewing) {
      const frameCountdown = window.Module._get_neogeo_frame_counter_speed();
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
        {!!((isCropping && anchorPoint && movingPoint) || state.crop) && (
          <CropRect
            width={divRef && divRef.scrollWidth}
            height={divRef && divRef.scrollHeight}
            crop={state.crop || [anchorPoint!, movingPoint!]}
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

                setAnchorPoint({ x, y });
              }
            }}
            onMouseMove={e => {
              if (isCropping && anchorPoint) {
                const rect = (e.target as HTMLDivElement).getBoundingClientRect() as DOMRect;

                const rawX = e.clientX - rect.x;
                const rawY = e.clientY - rect.y;

                const x = Math.floor(rawX / 16) * 16;
                const y = Math.floor(rawY / 16) * 16;

                setMovingPoint({ x, y });
              }
            }}
            onMouseUp={() => {
              if (
                isCropping &&
                anchorPoint &&
                movingPoint &&
                cropHasArea(anchorPoint, movingPoint)
              ) {
                dispatch({
                  type: "SetCrop",
                  crop: [anchorPoint, movingPoint]
                });
              } else {
                dispatch({ type: "SetCrop", crop: undefined });
                setAnchorPoint(null);
                setMovingPoint(null);
              }
            }}
          />
        )}
      </Container>
    </>
  );
};
