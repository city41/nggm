import React, { useState } from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import {
    Layer as LayerData,
    ExtractedSpriteGroup,
    ExtractedSprite
} from "../state/types";
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
        <div className={styles.group}>
            {" "}
            {(group.sprites[0] && group.sprites[0].spriteMemoryIndex) ||
                "empty"}{" "}
            <button onClick={() => onDelete()}>delete</button>
            <button onClick={() => onToggleVisibility()}>
                {state.hiddenGroups[group.id] ? "show" : "hide"}
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
    onExtendViaMirror: () => void;
    onPushDown: () => void;
}

const Layer: React.FunctionComponent<LayerProps> = ({
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
        <div className={styles.layer}>
            <div>
                <div className={styles.label}>L</div>
                <IconButton
                    icon={IoIosClose}
                    title="Delete Layer"
                    onClick={() => onDelete()}
                />
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

    // reverse layers due to wanting the highest z-index layer to be at the top of
    // the list, which is opposite of how they are stored
    const layers = [...state.layers]
        .reverse()
        .map((layer, i) => (
            <Layer
                key={i}
                layer={layer}
                onDelete={() => dispatch({ type: "DeleteLayer", layer })}
                onToggleVisibility={() =>
                    dispatch({ type: "ToggleVisibilityOfLayer", layer })
                }
                onGroupDelete={group =>
                    dispatch({ type: "DeleteGroup", group })
                }
                onGroupToggleVisibility={group =>
                    dispatch({ type: "ToggleVisibilityOfGroup", group })
                }
                onExtendViaMirror={() =>
                    dispatch({ type: "ExtendLayerViaMirror", layer })
                }
                onPushDown={() => dispatch({ type: "PushDownLayer", layer })}
            />
        ));

    return (
        <div className={classes}>
            <IconButton
                className={styles.buttonIcon}
                icon={IoIosAdd}
                onClick={() => dispatch({ type: "NewLayer" })}
                title="New Layer"
            />
            {layers}
        </div>
    );
};
