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
        gridRow: "2"
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
