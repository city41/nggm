import React from "react";
import classnames from "classnames";
import { Sprite } from "./sprite";
import { SpriteData } from "../../state/spriteData";

import styles from "./spriteEntry.module.css";

interface SpriteEntryProps {
  className?: string;
  spriteData: SpriteData;
  focused?: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const SpriteEntry: React.FunctionComponent<SpriteEntryProps> = ({
  className,
  spriteData,
  focused,
  onClick
}) => {
  const classes = classnames(styles.root, className, {
    [styles.focused]: focused
  });

  return (
    <div className={classes} onClick={onClick}>
      <div className={styles.index}>{spriteData.spriteMemoryIndex}</div>
      <div className={styles.spriteContainer}>
        {<Sprite className={styles.sprite} spriteData={spriteData} />}
      </div>
    </div>
  );
};
