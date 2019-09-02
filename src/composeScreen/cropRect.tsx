import React from "react";
import classnames from "classnames";
import { Crop } from "../state/types";

import styles from "./cropRect.module.css";

interface CropRectProps {
    className?: string;
    crop: Crop;
    totalWidth: number;
    totalHeight: number;
}

export const CropRect: React.FunctionComponent<CropRectProps> = ({
    className,
    crop,
    totalWidth,
    totalHeight
}) => {
    const classes = classnames(styles.root, className);

    const topRowStyle = {
        height: crop[0].y,
        gridColumn: "1 / -1",
        gridRow: "1"
    };

    const leftCellStyle = {
        width: crop[0].x,
        height: crop[1].y - crop[0].y,
        gridColumn: "1",
        gridRow: "2"
    };

    const rightCellStyle = {
        gridColumn: "3",
        gridRow: "2",
        width: totalWidth - crop[1].x
    };

    const cropStyle = {
        width: crop[1].x - crop[0].x,
        height: crop[1].y - crop[0].y,
        gridColumn: "2",
        gridRow: "2"
    };

    const bottomRowStyle = {
        gridColumn: "1 / -1",
        gridRow: "3",
        flex: "1",
        height: totalHeight - crop[1].y
    };

    return (
        <div className={classes}>
            <div className={styles.mask} style={topRowStyle} />
            <div className={styles.mask} style={leftCellStyle} />
            <div className={styles.crop} style={cropStyle} />
            <div className={styles.mask} style={rightCellStyle} />
            <div className={styles.mask} style={bottomRowStyle} />
        </div>
    );
};
