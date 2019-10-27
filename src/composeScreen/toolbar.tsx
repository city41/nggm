import React from "react";
import styled from "styled-components";

interface ToolbarProps {
  className?: string;
  onToggleGrid: () => void;
  onCrop: () => void;
  onClearCrop: () => void;
  onPreview: () => void;
  onBuildGif: () => void;
  onDown: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 32px;
  grid-template-rows: repeat(6, 32px) 1fr 32px 32px;
`;

export const Toolbar: React.FunctionComponent<ToolbarProps> = ({
  className,
  onToggleGrid,
  onCrop,
  onClearCrop,
  onPreview,
  onBuildGif,
  onDown,
  onUndo,
  onRedo
}) => {
  return (
    <Container className={className}>
      <button title="show grid" onClick={() => onToggleGrid()}>
        G
      </button>
      <button title="crop" onClick={() => onCrop()}>
        C
      </button>
      <button title="clear crop" onClick={() => onClearCrop()}>
        X
      </button>
      <button title="preview" onClick={() => onPreview()}>
        P
      </button>
      <button title="build gif" onClick={() => onBuildGif()}>
        G
      </button>
      <button title="down" onClick={() => onDown()}>
        D
      </button>

      <div />

      <button title="undo" onClick={() => onUndo()}>
        U
      </button>
      <button title="redo" onClick={() => onRedo()}>
        R
      </button>
    </Container>
  );
};
