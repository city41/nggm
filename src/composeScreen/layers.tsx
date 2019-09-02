import React from "react";
import classnames from "classnames";
import {
    useAppState,
    deleteGroupAction,
    toggleVisiblityOfGroupAction
} from "../state";
import { Layer as LayerData, ExtractedSpriteGroup } from "../state/types";

import styles from "./layers.module.css";

interface GroupProps {
    className?: string;
    group: ExtractedSpriteGroup;
    onDelete: () => void;
    onToggleVisibility: () => void;
}

const Group: React.FunctionComponent<GroupProps> = ({
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

interface LayerProps {
    layer: LayerData;
    onGroupDelete: (group: ExtractedSpriteGroup) => void;
    onGroupToggleVisibility: (group: ExtractedSpriteGroup) => void;
}

const Layer: React.FunctionComponent<LayerProps> = ({
    layer,
    onGroupDelete,
    onGroupToggleVisibility
}) => {
    const groups = layer.groups.map((group, i) => (
        <Group
            key={i}
            group={group}
            onDelete={() => onGroupDelete(group)}
            onToggleVisibility={() => onGroupToggleVisibility(group)}
        />
    ));
    return (
        <div>
            <div>layer</div>
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
            onGroupDelete={group => dispatch(deleteGroupAction(group))}
            onGroupToggleVisibility={group =>
                dispatch(toggleVisiblityOfGroupAction(group))
            }
        />
    ));

    return <div className={classes}>{layers}</div>;
};
