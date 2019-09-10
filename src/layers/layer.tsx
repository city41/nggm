import React, { useState } from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import { Layer as LayerData, ExtractedSpriteGroup } from "../state/types";
import { IconButton } from "../components/iconButton";
import {
    IoIosAdd,
    IoIosArrowDropright,
    IoIosTrash,
    IoIosEye,
    IoIosEyeOff,
    IoIosReorder,
    IoIosDownload,
    IoIosPhoneLandscape
} from "react-icons/io";
import { Group } from "./group";

import styles from "./layer.module.css";

interface LayerProps {
    layer: LayerData;
    onGroupDelete: (group: ExtractedSpriteGroup) => void;
    onGroupToggleVisibility: (group: ExtractedSpriteGroup) => void;
    onDelete: () => void;
    onToggleVisibility: () => void;
    onExtendViaMirror: () => void;
    onPushDown: () => void;
}

export const Layer: React.FunctionComponent<LayerProps> = ({
    layer,
    onDelete,
    onToggleVisibility,
    onGroupDelete,
    onGroupToggleVisibility,
    onExtendViaMirror,
    onPushDown
}) => {
    const { dispatch, state } = useAppState();

    const groups = layer.groups.map((group, i) => (
        <Group
            key={i}
            group={group}
            onDelete={() => onGroupDelete(group)}
            onToggleVisibility={() => onGroupToggleVisibility(group)}
        />
    ));

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <IconButton icon={IoIosArrowDropright} title="Show groups" />
                <div>Layer</div>
                <IconButton
                    icon={state.hiddenLayers[layer.id] ? IoIosEyeOff : IoIosEye}
                    onClick={() => onToggleVisibility()}
                    title={`Layer is ${
                        state.hiddenLayers[layer.id] ? "hidden" : "visible"
                    }`}
                />
                <IconButton
                    icon={IoIosReorder}
                    onClick={() => dispatch({ type: "RotateLayer", layer })}
                    title="Rotate tiles"
                />
                <IconButton
                    icon={IoIosPhoneLandscape}
                    onClick={() => onExtendViaMirror()}
                    title="Mirror"
                />
                <IconButton
                    icon={IoIosDownload}
                    onClick={() => onPushDown()}
                    title="Push Down"
                />
                <IconButton
                    icon={IoIosTrash}
                    title="Delete Layer"
                    onClick={() => onDelete()}
                />
            </div>
            {groups}
        </div>
    );
};
