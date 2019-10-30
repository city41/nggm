import React, { useState, useRef, useEffect } from "react";
import classnames from "classnames";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { SpriteEntry } from "./spriteEntry";
import { useAppState } from "../state";
import { getSpriteData } from "../state/spriteData";

import styles from "./spriteTray.module.css";

const TOTAL_SPRITE_COUNT = 381;

function arrayFrom(minValue: number, maxValue: number) {
  const count = maxValue - minValue + 1;

  return new Array(count).fill(0, 0, count).map((_, i) => i + minValue);
}

interface SpriteTrayProps {
  className?: string;
}

export const SpriteTray: React.FunctionComponent<SpriteTrayProps> = ({
  className
}) => {
  const { state } = useAppState();
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
          firstFillerRef.current.getBoundingClientRect().width;

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
      return state.isPaused;
    }
  });

  const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  if (!state.isPaused) {
    const classes = classnames(styles.root, styles.message, className);
    return (
      <div className={classes}>pause the game to load the current sprites</div>
    );
  }

  const spriteDatas = new Array(TOTAL_SPRITE_COUNT)
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

  const classes = classnames(styles.root, className, {
    [styles.locked]: !state.isPaused
  });

  return (
    <div
      className={classes}
      ref={div => {
        setDivRef(div);
        dragRef(div);
      }}
    >
      <div
        key={state.pauseId}
        className={styles.spriteEntries}
        style={{
          gridTemplateColumns: `1fr repeat(${spriteDatas.length}, max-content) 1fr`
        }}
      >
        <div
          className={styles.filler}
          ref={firstFillerRef}
          style={{ gridColumn: 1 }}
        />
        {sprites}
        <div
          className={styles.filler}
          style={{ gridColumn: spriteDatas.length + 2 }}
        />
      </div>
    </div>
  );
};
