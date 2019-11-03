import React from "react";
import styled from "styled-components";
import { useAppState } from "../../state";
import { IconButton } from "../primitives/iconButton";
import { IoIosAdd } from "react-icons/io";
import { Layer } from "./layer";

const Container = styled.div`
  height: 100%;
  background-color: var(--dock-color);

  padding: 2px 4px;
  overflow-y: auto;

  font-size: 0.8rem;
`;

interface LayersProps {
  className?: string;
}

export const Layers: React.FunctionComponent<LayersProps> = ({ className }) => {
  const { state, dispatch } = useAppState();

  // reverse layers due to wanting the highest z-index layer to be at the top of
  // the list, which is opposite of how they are stored
  const layers = [...state.layers]
    .reverse()
    .map(layer => (
      <Layer
        key={layer.id}
        layer={layer}
        onDelete={() => dispatch({ type: "DeleteLayer", layer })}
        onToggleVisibility={() =>
          dispatch({ type: "ToggleVisibilityOfLayer", layer })
        }
        onGroupDelete={group => dispatch({ type: "DeleteGroup", group })}
        onGroupToggleVisibility={group =>
          dispatch({ type: "ToggleVisibilityOfGroup", group })
        }
        onExtendViaMirror={() =>
          dispatch({ type: "ExtendLayerViaMirror", layer })
        }
        onPushDown={() => dispatch({ type: "PushDownLayer", layer })}
      />
    ));

  return (
    <Container className={className}>
      <IconButton
        icon={IoIosAdd}
        onClick={() => dispatch("NewLayer")}
        title="New Layer"
      />
      {layers}
    </Container>
  );
};
