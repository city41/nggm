import React from "react";
import {
  Layer as LayerData,
  ExtractedSprite as ExtractedSpriteData
} from "../../state/types";
import { ExtractedSprite as ExtractedSpriteCmp } from "./extractedSprite";
import {
  getMaxX,
  getMaxY,
  getAllSpritesFromLayers
} from "../../sprite/spriteUtil";
import { useAppState } from "../../state";

import styles from "./layer.module.css";

interface LayerProps {
  layer: LayerData;
  index: number;
  runPreview: boolean;
  animationCounter: number;
  canDrag: boolean;
  outlineTiles: boolean;
}

export const Layer: React.FunctionComponent<LayerProps> = ({
  layer,
  index,
  runPreview,
  animationCounter,
  canDrag,
  outlineTiles
}) => {
  const { state } = useAppState();

  if (state.hiddenLayers[layer.id]) {
    return null;
  }

  const sprites = layer.groups.reduce<ExtractedSpriteData[]>((s, g) => {
    if (state.hiddenGroups[g.id]) {
      return s;
    } else {
      return s.concat(g.sprites);
    }
  }, []);

  const spriteCmps = sprites.map((extractedSprite, i) => (
    <ExtractedSpriteCmp
      key={i}
      data={extractedSprite}
      autoAnimate={runPreview}
      animationCounter={animationCounter}
      canDrag={canDrag}
      outlineTiles={outlineTiles}
    />
  ));

  const extractedSprites = getAllSpritesFromLayers([layer]);
  const maxX = getMaxX(extractedSprites);
  const width = Math.max(maxX + 48, 320);

  const maxY = getMaxY(extractedSprites);
  const height = Math.max(maxY + 48, 240);

  const style = {
    zIndex: index,
    width,
    height
  };

  return (
    <div className={styles.root} style={style}>
      {spriteCmps}
    </div>
  );
};
