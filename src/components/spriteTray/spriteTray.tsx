import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { SpriteEntry } from "./spriteEntry";
import { useAppState } from "../../state";
import { getSpriteData } from "../../sprite/spriteData";

interface SpriteTrayProps {
  className?: string;
}

const TOTAL_SPRITE_COUNT = 381;

function arrayFrom(minValue: number, maxValue: number) {
  const count = maxValue - minValue + 1;

  return new Array(count).fill(0, 0, count).map((_, i) => i + minValue);
}

const Container = styled.div`
  --spriteEntryHeader: 32px;

  width: 100%;
  /* At most a sprite has 33 tiles, plus the sprite entry header is 32px */
  height: calc(33 * 8px + var(--spriteEntryHeader));
  background-color: var(--dock-color);
  border-right: 1px solid var(--dock-border-color);
  overflow-x: auto;
  position: relative;
`;

const DisabledMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  margin: auto;
  text-align: center;
  font-style: italic;
  color: var(--dock-foreground-color);
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SpriteEntries = styled.div`
  display: grid;
`;

const Filler = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  height: var(--spriteEntryHeader);
  width: 100%;
`;

const StopCropping = styled.a`
  cursor: pointer;
  color: var(--focal-color);
  font-weight: bold;
  font-style: normal;
`;

export const SpriteTray: React.FunctionComponent<SpriteTrayProps> = ({
  className
}) => {
  const { state, dispatch } = useAppState();
  const [focusedEntryIndices, setFocusedEntryIndices] = useState<number[]>([]);
  const [shiftKeyStartEntryIndex, setShiftKeyStartEntryIndex] = useState<
    null | number
  >(null);

  const firstFillerRef = useRef<HTMLDivElement | null>(null);

  const [, dragRef, preview] = useDrag({
    // @ts-ignore TS insists this have type, spriteMemoryIndex, etc, but it's not actually used
    item: { type: "Sprite" },
    begin(monitor: any) {
      if (divRef && firstFillerRef && firstFillerRef.current) {
        const x =
          monitor.getClientOffset().x -
          divRef.getBoundingClientRect().left -
          firstFillerRef.current.getBoundingClientRect().width +
          divRef.scrollLeft;

        const index = Math.floor(x / 8);

        if (focusedEntryIndices.indexOf(index) > -1) {
          return {
            type: "Sprites",
            spriteMemoryIndices: focusedEntryIndices.map(
              fei => spriteDatas[fei].spriteMemoryIndex
            )
          };
        } else if (index >= 0 && index < spriteDatas.length) {
          return {
            spriteMemoryIndex: spriteDatas[index].spriteMemoryIndex,
            type: "Sprite"
          };
        }
      }
    },
    canDrag() {
      return state.isPaused && !state.isCropping;
    }
  });

  const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const spriteDatas = !state.isPaused
    ? []
    : new Array(TOTAL_SPRITE_COUNT)
        .fill(1, 0, TOTAL_SPRITE_COUNT)
        .map((_, i) => getSpriteData(i))
        .filter(d => d.tiles.length > 0);

  const sprites = spriteDatas.map((spriteData, i) => (
    <SpriteEntry
      key={spriteData.spriteMemoryIndex + "-" + state.pauseId}
      spriteData={spriteData}
      onClick={e => {
        if (e.ctrlKey) {
          setFocusedEntryIndices(focusedEntryIndices.concat(i));
          setShiftKeyStartEntryIndex(null);
        } else if (e.shiftKey) {
          if (
            shiftKeyStartEntryIndex !== null ||
            focusedEntryIndices.length === 1
          ) {
            const minIndex = Math.min(
              shiftKeyStartEntryIndex || focusedEntryIndices[0],
              i
            );
            const maxIndex = Math.max(
              shiftKeyStartEntryIndex || focusedEntryIndices[0],
              i
            );
            setFocusedEntryIndices(arrayFrom(minIndex, maxIndex));
          } else {
            setFocusedEntryIndices([i]);
            setShiftKeyStartEntryIndex(i);
          }
        } else {
          setFocusedEntryIndices([i]);
          setShiftKeyStartEntryIndex(null);
        }
      }}
      focused={focusedEntryIndices.indexOf(i) > -1}
    />
  ));

  return (
    <Container
      className={className}
      ref={div => {
        setDivRef(div);
        dragRef(div);
      }}
    >
      {state.isCropping && (
        <DisabledMessage>
          <div>Can't drag sprites while in cropping mode</div>
          <div>
            (
            <StopCropping onClick={() => dispatch("ToggleCropping")}>
              stop cropping
            </StopCropping>
            )
          </div>
        </DisabledMessage>
      )}
      {!state.isPaused && (
        <DisabledMessage>
          Pause the game to load the current sprites
        </DisabledMessage>
      )}
      <SpriteEntries
        key={state.pauseId}
        style={{
          gridTemplateColumns: `1fr repeat(${spriteDatas.length}, max-content) 1fr`
        }}
      >
        <Filler ref={firstFillerRef} style={{ gridColumn: 1 }} />
        {sprites}
        <Filler style={{ gridColumn: spriteDatas.length + 2 }} />
      </SpriteEntries>
    </Container>
  );
};
