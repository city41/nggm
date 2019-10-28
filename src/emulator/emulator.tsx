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
    cursor: pointer;
  }

  & .pauseOverlay:hover {
    opacity: 1;
  }
`;

const DemoDisclaimer = styled.div`
  height: 100%;
  padding: 8px;

  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  text-align: center;
  font-style: italic;
  color: var(--dock-foreground-color);
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
      {!state.isDemoing && (
        <>
          <canvas id="canvas" />
          <PauseOverlay
            className="pauseOverlay"
            onTogglePause={() => togglePause()}
            isPaused={state.isPaused}
          />
        </>
      )}
      {state.isDemoing && (
        <DemoDisclaimer>
          the game plays here in an emulator when not in demo mode
        </DemoDisclaimer>
      )}
    </Container>
  );
};
