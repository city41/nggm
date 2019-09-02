import React from "react";
import classnames from "classnames";
import {
    useAppState,
    deleteGroupAction,
    toggleVisiblityOfGroupAction
} from "../state";
import { ExtractedSpriteGroup } from "../state/types";

import styles from "./layers.module.css";

interface LayerProps {
    className?: string;
    group: ExtractedSpriteGroup;
    onDelete: () => void;
    onToggleVisibility: () => void;
}

const Layer: React.FunctionComponent<LayerProps> = ({
    className,
    group,
    onDelete,
    onToggleVisibility
}) => {
    const classes = classnames(className);

    return (
        <div className={classes}>
            {group.sprites[0].spriteMemoryIndex}{" "}
            <button onClick={() => onDelete()}>delete</button>
            <button onClick={() => onToggleVisibility()}>
                {group.hidden ? "show" : "hide"}
            </button>
        </div>
    );
};

interface LayersProps {
    className?: string;
}

export const Layers: React.FunctionComponent<LayersProps> = ({ className }) => {
    const [state, dispatch] = useAppState();

    const classes = classnames(styles.root, className);

    const layers = state.extractedSpriteGroups.map(group => (
        <Layer
            group={group}
            onDelete={() => dispatch(deleteGroupAction(group))}
            onToggleVisibility={() =>
                dispatch(toggleVisiblityOfGroupAction(group))
            }
        />
    ));

    return <div className={classes}>{layers}</div>;
};
