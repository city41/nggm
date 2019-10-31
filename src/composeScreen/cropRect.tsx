import React from "react";
import classnames from "classnames";
import { Crop } from "../state/types";

import styles from "./cropRect.module.css";

interface CropRectProps {
  className?: string;
  crop: Crop;
  width?: number | null;
  height?: number | null;
}

export const CropRect: React.FunctionComponent<CropRectProps> = ({
  className,
  crop,
  width,
  height
}) => {
  const classes = classnames(styles.root, className);

  const upperLeft = {
    x: Math.min(crop[0].x, crop[1].x),
    y: Math.min(crop[0].y, crop[1].y)
  };

  const lowerRight = {
    x: Math.max(crop[0].x, crop[1].x),
    y: Math.max(crop[0].y, crop[1].y)
  };

  const topRowStyle = {
    height: upperLeft.y,
    gridColumn: "1 / -1",
    gridRow: "1"
  };

  const leftCellStyle = {
    width: upperLeft.x,
    height: lowerRight.y - upperLeft.y,
    gridColumn: "1",
    gridRow: "2"
  };

  const rightCellStyle = {
    gridColumn: "3",
    gridRow: "2"
  };

  const cropStyle = {
    width: lowerRight.x - upperLeft.x,
    height: lowerRight.y - upperLeft.y,
    gridColumn: "2",
    gridRow: "2"
  };

  const bottomRowStyle = {
    gridColumn: "1 / -1",
    gridRow: "3",
    flex: "1"
  };

  const containerStyle = {
    width: width || "100%",
    height: height || "100%"
  };

  return (
    <div className={classes} style={containerStyle}>
      <div className={styles.mask} style={topRowStyle} />
      <div className={styles.mask} style={leftCellStyle} />
      <div className={styles.crop} style={cropStyle} />
      <div className={styles.mask} style={rightCellStyle} />
      <div className={styles.mask} style={bottomRowStyle} />
    </div>
  );
};
