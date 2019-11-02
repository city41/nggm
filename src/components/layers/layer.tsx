import React, { useState } from "react";
import { useAppState } from "../../state";
import { Layer as LayerData, ExtractedSpriteGroup } from "../../state/types";
import { IconButton } from "../components/iconButton";
import Delete from "@material-ui/icons/Delete";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import VerticalAlignBottom from "@material-ui/icons/VerticalAlignBottom";
import {
  IoIosEye,
  IoIosEyeOff,
  IoIosReorder,
  IoIosPhoneLandscape
} from "react-icons/io";
import { Group } from "./group";
import { LayerPreview } from "./layerPreview";

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
  const [showGroups, setShowGroups] = useState(true);

  const groups = layer.groups.map(group => (
    <Group
      key={group.id}
      group={group}
      onDelete={() => onGroupDelete(group)}
      onToggleVisibility={() => onGroupToggleVisibility(group)}
    />
  ));

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <IconButton
          icon={showGroups ? ExpandLess : ExpandMore}
          title="Show groups"
          onClick={() => setShowGroups(!showGroups)}
        />
        <LayerPreview layer={layer} />
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
          icon={VerticalAlignBottom}
          onClick={() => onPushDown()}
          title="Push Down"
        />
        <IconButton
          icon={state.hiddenLayers[layer.id] ? IoIosEyeOff : IoIosEye}
          onClick={() => onToggleVisibility()}
          title={`Layer is ${
            state.hiddenLayers[layer.id] ? "hidden" : "visible"
          }`}
        />
        <IconButton
          icon={Delete}
          title="Delete Layer"
          onClick={() => onDelete()}
        />
      </div>
      {showGroups && groups}
    </div>
  );
};
