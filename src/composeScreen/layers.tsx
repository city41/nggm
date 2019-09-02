import React from "react";
import classnames from "classnames";
import {
    useAppState,
    deleteGroupAction,
    toggleVisiblityOfGroupAction,
    NEW_LAYER,
    deleteLayerAction,
    toggleVisiblityOfLayerAction,
    setFocusedLayerAction
} from "../state";
import { Layer as LayerData, ExtractedSpriteGroup } from "../state/types";

import styles from "./layers.module.css";

interface GroupProps {
    group: ExtractedSpriteGroup;
    onDelete: () => void;
    onToggleVisibility: () => void;
}

const Group: React.FunctionComponent<GroupProps> = ({
    group,
    onDelete,
    onToggleVisibility
}) => {
    return (
        <div className={styles.group}>
            {group.sprites[0].spriteMemoryIndex}{" "}
            <button onClick={() => onDelete()}>delete</button>
            <button onClick={() => onToggleVisibility()}>
                {group.hidden ? "show" : "hide"}
            </button>
        </div>
    );
};

interface LayerProps {
    layer: LayerData;
    onGroupDelete: (group: ExtractedSpriteGroup) => void;
    onGroupToggleVisibility: (group: ExtractedSpriteGroup) => void;
    onDelete: () => void;
    onToggleVisibility: () => void;
    onClick: () => void;
    focused?: boolean;
}

const Layer: React.FunctionComponent<LayerProps> = ({
    layer,
    onDelete,
    onToggleVisibility,
    onGroupDelete,
    onGroupToggleVisibility,
    onClick,
    focused
}) => {
    const groups = layer.groups.map((group, i) => (
        <Group
            key={i}
            group={group}
            onDelete={() => onGroupDelete(group)}
            onToggleVisibility={() => onGroupToggleVisibility(group)}
        />
    ));

    const classes = classnames(styles.layer, {
        [styles.focused]: focused
    });

    return (
        <div className={classes} onClick={() => onClick()}>
            <div>
                layer
                <button onClick={() => onDelete()}>delete</button>
                <button onClick={() => onToggleVisibility()}>
                    {layer.hidden ? "show" : "hide"}
                </button>
            </div>
            {groups}
        </div>
    );
};

interface LayersProps {
    className?: string;
}

export const Layers: React.FunctionComponent<LayersProps> = ({ className }) => {
    const [state, dispatch] = useAppState();

    const classes = classnames(styles.root, className);

    const layers = state.layers.map((layer, i) => (
        <Layer
            key={i}
            layer={layer}
            focused={i === state.focusedLayerIndex}
            onClick={() => dispatch(setFocusedLayerAction(layer))}
            onDelete={() => dispatch(deleteLayerAction(layer))}
            onToggleVisibility={() =>
                dispatch(toggleVisiblityOfLayerAction(layer))
            }
            onGroupDelete={group => dispatch(deleteGroupAction(group))}
            onGroupToggleVisibility={group =>
                dispatch(toggleVisiblityOfGroupAction(group))
            }
        />
    ));

    return (
        <div className={classes}>
            <button onClick={() => dispatch(NEW_LAYER)}>new layer</button>
            {layers}
        </div>
    );
};
