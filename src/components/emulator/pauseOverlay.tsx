import React from "react";
import styled from "styled-components";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Pause from "@material-ui/icons/Pause";

interface PauseOverlayProps {
  className?: string;
  onTogglePause: () => void;
  isPaused: boolean;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);

  & svg {
    width: 30%;
    height: 30%;
  }
`;

export const PauseOverlay: React.FunctionComponent<PauseOverlayProps> = ({
  className,
  onTogglePause,
  isPaused
}) => {
  const Icon = isPaused ? PlayArrow : Pause;

  return (
    <Container
      className={className}
      onClick={() => onTogglePause()}
      title={`click to ${isPaused ? "play" : "pause"}`}
    >
      <Icon />
    </Container>
  );
};
