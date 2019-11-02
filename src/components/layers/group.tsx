import React, { useState } from "react";
import { useAppState } from "../../state";
import { ExtractedSpriteGroup } from "../../state/types";
import { IconButton } from "../components/iconButton";
import Delete from "@material-ui/icons/Delete";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { Sprite } from "./sprite";
import { GroupPreview } from "./groupPreview";

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
    sprites = group.sprites.map(sprite => (
      <Sprite
        key={sprite.spriteMemoryIndex + "-" + sprite.pauseId}
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
          icon={showSprites ? ExpandLess : ExpandMore}
          title="Show sprites"
          onClick={() => setShowSprites(!showSprites)}
        />
        <GroupPreview group={group} />
        <div>
          {(group.sprites[0] && group.sprites[0].spriteMemoryIndex) || "empty"}
        </div>
        <IconButton
          icon={state.hiddenGroups[group.id] ? IoIosEyeOff : IoIosEye}
          onClick={() => onToggleVisibility()}
          title={`Group is ${
            state.hiddenLayers[group.id] ? "hidden" : "visible"
          }`}
        />
        <IconButton
          icon={Delete}
          title="Delete Group"
          onClick={() => onDelete()}
        />
      </div>
      <div className={styles.spriteContainer}>{sprites}</div>
    </div>
  );
};
