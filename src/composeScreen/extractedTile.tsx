import React from "react";
import { renderTileToCanvas } from "../state/renderTileToCanvas";

import styles from "./extractedTile.module.css";

interface ExtractedTileProps {
    y: number;
    tileIndex: number;
    rgbPalette: Array<[number, number, number, number]>;
    horizontalFlip?: boolean;
    verticalFlip?: boolean;
}

export class ExtractedTile extends React.PureComponent<ExtractedTileProps> {
    render() {
        const {
            y: tileY,
            tileIndex,
            rgbPalette,
            horizontalFlip,
            verticalFlip
        } = this.props;

        function renderCanvas(canvas: HTMLCanvasElement) {
            renderTileToCanvas(canvas, tileIndex, rgbPalette);
        }

        const horizontalScale = horizontalFlip ? -1 : 1;
        const verticalScale = verticalFlip ? -1 : 1;

        const inlineStyle = {
            transform: `scale(${horizontalScale},${verticalScale})`,
            top: tileY
        };

        return (
            <canvas
                className={styles.root}
                ref={r => r && renderCanvas(r)}
                style={inlineStyle}
            />
        );
    }
}
