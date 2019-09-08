import React from "react";
import * as Space from "react-spaces";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Provider as AppStateProvider } from "./state/provider";
import { Emulator } from "./emulator";
import { SpriteTray } from "./spriteTray";
import { ComposeScreen } from "./composeScreen";
import { DragPreviewLayer } from "./dragPreviewLayer";

export const App: React.FunctionComponent = () => {
    return (
        <AppStateProvider>
            <DndProvider backend={HTML5Backend}>
                <DragPreviewLayer />
                <Space.ViewPort>
                    <Space.TopResizable size="50%">
                        <Space.LeftResizable size="30%">
                            <Emulator />
                        </Space.LeftResizable>
                        <Space.Fill>
                            <ComposeScreen />
                        </Space.Fill>
                    </Space.TopResizable>
                    <Space.Fill scrollable>
                        <SpriteTray />
                    </Space.Fill>
                </Space.ViewPort>
            </DndProvider>
        </AppStateProvider>
    );
};
