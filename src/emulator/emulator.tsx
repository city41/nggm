import React from "react";
import styled from "styled-components";
import { useAppState } from "../state";
import { PauseOverlay } from "./pauseOverlay";

interface EmulatorProps {
  className?: string;
}

const Container = styled.div`
  width: 320px;
  height: 224px;
  background-color: var(--dock-color);
  cursor: pointer !important;
  position: relative;

  & .pauseOverlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 0.25s;
  }

  & .pauseOverlay:hover {
    opacity: 1;
  }
`;

export const Emulator: React.FunctionComponent<EmulatorProps> = props => {
  const { state, dispatch } = useAppState();

  function togglePause() {
    if (state.isPaused) {
      window.Module.resumeMainLoop();
    } else {
      window.Module.pauseMainLoop();
    }

    dispatch("TogglePause");
  }

  return (
    <Container className={props.className}>
      <canvas id="canvas" />
      <PauseOverlay
        className="pauseOverlay"
        onTogglePause={() => togglePause()}
        isPaused={state.isPaused}
      />
    </Container>
  );
};
