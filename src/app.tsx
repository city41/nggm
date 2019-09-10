import React from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Provider as AppStateProvider } from "./state/provider";
import { DragPreviewLayer } from "./dragPreviewLayer";
import { Emulator } from "./emulator";
import { SpriteTray } from "./spriteTray";
import { ComposeScreen } from "./composeScreen";
import { Layers } from "./layers";
import { hot } from "react-hot-loader";

import styles from "./app.module.css";

const _App: React.FunctionComponent = () => {
    return (
        <AppStateProvider>
            <DndProvider backend={HTML5Backend}>
                <DragPreviewLayer />
                <div className={styles.app}>
                    <div className={styles.composeScreenTrayGrid}>
                        <ComposeScreen className={styles.composeScreen} />
                        <SpriteTray className={styles.spriteTray} />
                    </div>
                    <div className={styles.emulatorLayersGrid}>
                        <Emulator className={styles.emulator} />
                        <Layers className={styles.layers} />
                    </div>
                </div>
            </DndProvider>
        </AppStateProvider>
    );
};

export const App = hot(module)(_App);
