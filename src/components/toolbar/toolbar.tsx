import React from "react";
import styled from "styled-components";
import { useAppState } from "../../state";

import { Button as BaseButton } from "./button";

import gridSvg from "../../images/grid.svg";
import hammerSvg from "../../images/hammer.svg";
import playSvg from "../../images/play.svg";
import downSvg from "../../images/down.svg";
import cropSvg from "../../images/crop.svg";
import undoSvg from "../../images/undo.svg";
import redoSvg from "../../images/redo.svg";

interface ToolbarProps {
  className?: string;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 32px;
  grid-template-rows: repeat(5, 32px) 1fr 32px 32px;
`;

const Button = styled(BaseButton)`
  margin-bottom: 2px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Toolbar: React.FunctionComponent<ToolbarProps> = ({
  className
}) => {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useAppState();

  return (
    <Container className={className}>
      <Button
        title={`${state.showGrid ? "hide" : "show"} grid`}
        onClick={() => dispatch("ToggleGrid")}
        isToggled={state.showGrid}
      >
        <img src={gridSvg} alt="grid" />
      </Button>
      <Button
        title="crop"
        onClick={e => {
          e.stopPropagation();
          dispatch({ type: "SetCrop", crop: undefined });
          dispatch("ToggleCropping");
        }}
        isToggled={state.isCropping}
      >
        <img src={cropSvg} alt="crop" />
      </Button>
      <Button
        title="preview"
        onClick={() => dispatch("TogglePreview")}
        isToggled={state.isPreviewing}
      >
        <img src={playSvg} alt="preview" />
      </Button>
      <Button title="down" onClick={() => dispatch("PushAllDown")}>
        <img src={downSvg} alt="down" />
      </Button>
      <Button title="build gif" onClick={() => dispatch("BuildGif")}>
        <img src={hammerSvg} alt="build gif" />
      </Button>

      <div />

      <Button title="undo" disabled={!canUndo} onClick={() => undo()}>
        <img src={undoSvg} alt="undo" />
      </Button>
      <Button title="redo" disabled={!canRedo} onClick={() => redo()}>
        <img src={redoSvg} alt="redo" />
      </Button>
    </Container>
  );
};
