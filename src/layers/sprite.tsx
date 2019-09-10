import React, { useState } from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import { Layer as LayerData, ExtractedSprite } from "../state/types";
import { IconButton } from "../components/iconButton";
import Delete from "@material-ui/icons/Delete";
import {
    IoIosAdd,
    IoIosEye,
    IoIosEyeOff,
    IoIosReorder,
    IoIosDownload,
    IoIosPhoneLandscape
} from "react-icons/io";

import styles from "./sprite.module.css";

interface SpriteProps {
    sprite: ExtractedSprite;
    onDelete: () => void;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
    sprite,
    onDelete
}) => {
    return (
        <div className={styles.root}>
            {" "}
            {sprite.spriteMemoryIndex}{" "}
            <IconButton
                icon={Delete}
                title="Delete Layer"
                onClick={() => onDelete()}
            />
        </div>
    );
};
