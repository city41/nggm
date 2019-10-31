import React from "react";
import classnames from "classnames";
import { Tile } from "./tile";
import { SpriteData } from "../state/spriteData";

import styles from "./sprite.module.css";

interface SpriteProps {
  className?: string;
  spriteData: SpriteData;
}

export const Sprite: React.FunctionComponent<SpriteProps> = ({
  className,
  spriteData
}) => {
  if (spriteData.tiles.length === 0) {
    return null;
  }

  const tiles = spriteData.tiles.map(tileData => (
    <Tile
      key={tileData.tileIndex + "-" + tileData.y}
      tileIndex={tileData.tileIndex}
      paletteIndex={tileData.paletteIndex}
      horizontalFlip={tileData.horizontalFlip}
      verticalFlip={tileData.verticalFlip}
    />
  ));

  const style = {
    gridTemplateRows: `repeat(${spriteData.tiles.length}, 8px)`
  };

  const classes = classnames(styles.sprite, className);

  return (
    <div className={classes} style={style}>
      {tiles}
    </div>
  );
};
