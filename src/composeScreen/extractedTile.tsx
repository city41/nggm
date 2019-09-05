import React from "react";
import classnames from "classnames";
import { renderTileToCanvas } from "../state/renderTileToCanvas";

import styles from "./extractedTile.module.css";

interface ExtractedTileProps {
    y: number;
    tileIndex: number;
    rgbPalette: Array<[number, number, number, number]>;
    horizontalFlip?: boolean;
    verticalFlip?: boolean;
    outlined?: boolean;
}

export class ExtractedTile extends React.PureComponent<ExtractedTileProps> {
    render() {
        const {
            y: tileY,
            tileIndex,
            rgbPalette,
            horizontalFlip,
            verticalFlip,
            outlined
        } = this.props;

        function renderCanvas(canvas: HTMLCanvasElement) {
            renderTileToCanvas(canvas, tileIndex, rgbPalette);
        }

        const horizontalScale = horizontalFlip ? -1 : 1;
        const verticalScale = verticalFlip ? -1 : 1;

        const classes = classnames(styles.root, {
            [styles.outlined]: outlined
        });

        const inlineStyle = {
            transform: `scale(${horizontalScale},${verticalScale})`,
            top: tileY
        };

        return (
            <canvas
                className={classes}
                data-tileindex={tileIndex}
                ref={r => r && renderCanvas(r)}
                style={inlineStyle}
            />
        );
    }
}
