import React, { useState } from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import { Layer as LayerData, ExtractedSpriteGroup } from "../state/types";
import { IconButton } from "../components/iconButton";
import {
    IoIosAdd,
    IoIosClose,
    IoIosEye,
    IoIosEyeOff,
    IoIosReorder,
    IoIosDownload,
    IoIosPhoneLandscape
} from "react-icons/io";
import { Sprite } from "./sprite";

import styles from "./group.module.css";

interface GroupProps {
    group: ExtractedSpriteGroup;
    onDelete: () => void;
    onToggleVisibility: () => void;
}

export const Group: React.FunctionComponent<GroupProps> = ({
    group,
    onDelete,
    onToggleVisibility
}) => {
    const { dispatch, state } = useAppState();
    const [showSprites, setShowSprites] = useState(false);

    let sprites = null;

    if (showSprites) {
        sprites = group.sprites.map((sprite, i) => (
            <Sprite
                key={i}
                sprite={sprite}
                onDelete={() =>
                    dispatch({
                        type: "RemoveSpriteFromExtractedGroup",
                        group,
                        sprite
                    })
                }
            />
        ));
    }

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <IconButton
                    icon={IoIosClose}
                    title="Delete Group"
                    onClick={() => onDelete()}
                />
                <div>
                    {(group.sprites[0] && group.sprites[0].spriteMemoryIndex) ||
                        "empty"}
                </div>
                <button onClick={() => onToggleVisibility()}>
                    {state.hiddenGroups[group.id] ? "show" : "hide"}
                </button>
                <button onClick={() => setShowSprites(!showSprites)}>
                    sprites
                </button>
            </div>
            <div>{sprites}</div>
        </div>
    );
};
