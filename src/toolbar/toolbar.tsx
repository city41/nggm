import React from "react";
import styled from "styled-components";
import { useAppState } from "../state";

interface ToolbarProps {
  className?: string;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 32px;
  grid-template-rows: repeat(6, 32px) 1fr 32px 32px;
`;

export const Toolbar: React.FunctionComponent<ToolbarProps> = ({
  className
}) => {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useAppState();

  return (
    <Container className={className}>
      <button
        title={`${state.showGrid ? "hide" : "show"} grid`}
        onClick={() => dispatch("ToggleGrid")}
      >
        G
      </button>
      <button title="crop" onClick={() => dispatch("StartCrop")}>
        C
      </button>
      <button title="clear crop" onClick={() => dispatch("ClearCrop")}>
        X
      </button>
      <button title="preview" onClick={() => dispatch("TogglePreview")}>
        P
      </button>
      <button title="build gif" onClick={() => dispatch("BuildGif")}>
        G
      </button>
      <button title="down" onClick={() => dispatch("PushAllDown")}>
        D
      </button>

      <div />

      <button title="undo" onClick={() => undo()}>
        U
      </button>
      <button title="redo" onClick={() => redo()}>
        R
      </button>
    </Container>
  );
};
