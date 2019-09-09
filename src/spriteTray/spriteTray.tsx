import React, { useState, useRef, useEffect } from "react";
import classnames from "classnames";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { SpriteEntry } from "./spriteEntry";
import { useAppState } from "../state";
import { getSpriteData, SpriteData } from "../state/spriteData";

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
    const [focusedEntryIndices, setFocusedEntryIndices] = useState<number[]>(
        []
    );
    const [shiftKeyStartEntryIndex, setShiftKeyStartEntryIndex] = useState<
        null | number
    >(null);

    const classes = classnames(styles.root, className, {
        [styles.locked]: !state.isPaused
    });

    let spriteDatas: SpriteData[];

    if (state.isPaused) {
        spriteDatas = new Array(TOTAL_SPRITE_COUNT)
            .fill(1, 0, TOTAL_SPRITE_COUNT)
            .map((_, i) => getSpriteData(i))
            .filter(d => d.tiles.length > 0);
    } else {
        spriteDatas = [];
    }

    const sprites = spriteDatas.map((spriteData, i) => (
        <SpriteEntry
            key={i}
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, dragRef, preview] = useDrag({
        // @ts-ignore TS insists this have type, spriteMemoryIndex, etc, but it's not actually used
        item: { type: "Sprite" },
        begin(monitor: any) {
            if (divRef) {
                const x =
                    monitor.getClientOffset().x -
                    divRef.getBoundingClientRect().left;

                const index = Math.floor(x / 8);

                if (focusedEntryIndices.indexOf(index) > -1) {
                    return {
                        type: "Sprites",
                        spriteMemoryIndices: focusedEntryIndices.map(
                            fei => spriteDatas[fei].spriteMemoryIndex
                        )
                    };
                } else {
                    return {
                        spriteMemoryIndex: spriteDatas[index].spriteMemoryIndex,
                        type: "Sprite"
                    };
                }
            }
        }
    });
    const [divRef, setDivRef] = useState<null | HTMLDivElement>(null);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

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
                    gridTemplateColumns: `repeat(${TOTAL_SPRITE_COUNT}, max-content)`
                }}
            >
                {sprites}
            </div>
        </div>
    );
};
