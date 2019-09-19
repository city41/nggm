import React from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import { IconButton } from "../components/iconButton";
import { IoIosAdd } from "react-icons/io";
import { Layer } from "./layer";

import styles from "./layers.module.css";

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
