import React, { useState } from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import {
    Layer as LayerData,
    ExtractedSpriteGroup,
    ExtractedSprite
} from "../state/types";

import styles from "./layers.module.css";

interface SpriteProps {
    sprite: ExtractedSprite;
    onDelete: () => void;
}

const Sprite: React.FunctionComponent<SpriteProps> = ({ sprite, onDelete }) => {
    return (
        <div className={styles.sprite}>
            {" "}
            {sprite.spriteMemoryIndex}{" "}
            <button onClick={() => onDelete()}>delete</button>
        </div>
    );
};

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
    const { dispatch } = useAppState();
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
        <div className={styles.group}>
            {" "}
            {group.sprites[0].spriteMemoryIndex}{" "}
            <button onClick={() => onDelete()}>delete</button>
            <button onClick={() => onToggleVisibility()}>
                {group.hidden ? "show" : "hide"}
            </button>
            <button onClick={() => setShowSprites(!showSprites)}>
                sprites
            </button>
            <div>{sprites}</div>
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
    onExtendViaMirror: () => void;
    focused?: boolean;
}

const Layer: React.FunctionComponent<LayerProps> = ({
    layer,
    onDelete,
    onToggleVisibility,
    onGroupDelete,
    onGroupToggleVisibility,
    onClick,
    onExtendViaMirror,
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
                <button onClick={() => onExtendViaMirror()}>
                    extend via mirror
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
    const { state, dispatch } = useAppState();

    const classes = classnames(styles.root, className);

    const layers = state.layers.map((layer, i) => (
        <Layer
            key={i}
            layer={layer}
            focused={i === state.focusedLayerIndex}
            onClick={() => dispatch({ type: "SetFocusedLayer", layer })}
            onDelete={() => dispatch({ type: "DeleteLayer", layer })}
            onToggleVisibility={() =>
                dispatch({ type: "ToggleVisibilityOfLayer", layer })
            }
            onGroupDelete={group => dispatch({ type: "DeleteGroup", group })}
            onGroupToggleVisibility={group =>
                dispatch({ type: "ToggleVisibilityOfGroup", group })
            }
            onExtendViaMirror={() =>
                dispatch({ type: "ExtendLayerViaMirror", layer })
            }
        />
    ));

    return (
        <div className={classes}>
            <button onClick={() => dispatch({ type: "NewLayer" })}>
                new layer
            </button>
            {layers}
        </div>
    );
};
