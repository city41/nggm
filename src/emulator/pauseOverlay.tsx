import React from "react";
import classnames from "classnames";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Pause from "@material-ui/icons/Pause";

import styles from "./pauseOverlay.module.css";

interface PauseOverlayProps {
    className?: string;
    onTogglePause: () => void;
    isPaused: boolean;
}

export const PauseOverlay: React.FunctionComponent<PauseOverlayProps> = ({
    className,
    onTogglePause,
    isPaused
}) => {
    const Icon = isPaused ? PlayArrow : Pause;

    const classes = classnames(styles.root, className);

    return (
        <div
            className={classes}
            onClick={() => onTogglePause()}
            title={`click to ${isPaused ? "play" : "pause"}`}
        >
            <Icon />
        </div>
    );
};
