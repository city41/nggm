import React from "react";
import classnames from "classnames";
import { useAppState } from "../state";
import { ChooseGameModal } from "./chooseGameModal";
import { PauseOverlay } from "./pauseOverlay";

import styles from "./emulator.module.css";

interface EmulatorProps {
    className?: string;
}

export const Emulator: React.FunctionComponent<EmulatorProps> = props => {
    const { state, dispatch } = useAppState();

    function togglePause() {
        if (state.isPaused) {
            window.Module.resumeMainLoop();
        } else {
            window.Module.pauseMainLoop();
        }

        dispatch({ type: "TogglePause" });
    }

    const classes = classnames(styles.root, props.className);

    return (
        <>
            <ChooseGameModal />
            <div className={classes}>
                <canvas id="canvas" />
                <PauseOverlay
                    className={styles.pauseOverlay}
                    onTogglePause={() => togglePause()}
                    isPaused={state.isPaused}
                />
            </div>
        </>
    );
};
