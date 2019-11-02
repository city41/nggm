import React from "react";
import { ExtractedSprite } from "../../state/types";
import { IconButton } from "../components/iconButton";
import Delete from "@material-ui/icons/Delete";

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
