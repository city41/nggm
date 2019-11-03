import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Provider as AppStateProvider } from "../state/provider";
import { DragPreviewLayer } from "../components/dragPreviewLayer";
import { Emulator } from "../components/emulator";
import { SpriteTray } from "../components/spriteTray";
import { ComposeScreen } from "../components/composeScreen";
import { Toolbar } from "../components/toolbar";
import { Layers } from "../components/layers";
import { ChooseGameModal } from "../components/chooseGameModal";

const AppRoot = styled.div`
  --gutter-width: 16px;

  width: 100vw;
  height: 100vh;

  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: max-content 1fr 320px;
  column-gap: var(--gutter-width);

  padding: var(--gutter-width);

  @media (max-width: 700px) {
    display: none;
  }
`;

const ComposeScreenTrayGrid = styled.div`
  display: grid;
  grid-template-rows: 1fr max-content;
  grid-template-columns: 1fr;
  row-gap: var(--gutter-width);

  & .composeScreen {
    grid-row: 1;
  }

  & .spriteTray {
    grid-row: 2;
  }
`;

const EmulatorLayersGrid = styled.div`
  display: grid;
  grid-template-rows: max-content 1fr;
  grid-template-columns: 1fr;
  row-gap: var(--gutter-width);

  .emulator {
    grid-column: 1;
    grid-row: 1;
  }

  .layers {
    grid-column: 1;
    grid-row: 2;
  }
`;

const SpaceNeededDisclaimer = styled.div`
  display: flex;
  margin: auto;
  text-align: center;
  font-style: italic;
  color: white;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  padding: 24px;

  font-style: normal;

  h1 {
    color: #666;
  }

  p:last-of-type {
    margin: 0;
  }

  @media (min-width: 701px) {
    display: none;
  }
`;

const App: React.FunctionComponent = () => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Neo Geo gif creator - NGBG</title>
        <link rel="canonical" href="https://city41.github.io/ngbg" />
      </Helmet>
      <AppStateProvider>
        <DndProvider backend={HTML5Backend}>
          <ChooseGameModal />
          <DragPreviewLayer />
          <SpaceNeededDisclaimer>
            <h1>too small :(</h1>
            <p>NGBG is a complex app and needs more space.</p>
            <p>Please increase the size of your browser if you can.</p>
          </SpaceNeededDisclaimer>
          <AppRoot>
            <Toolbar />
            <ComposeScreenTrayGrid>
              <ComposeScreen className="composeScreen" />
              <SpriteTray className="spriteTray" />
            </ComposeScreenTrayGrid>
            <EmulatorLayersGrid>
              <Emulator className="emulator" />
              <Layers className="layers" />
            </EmulatorLayersGrid>
          </AppRoot>
        </DndProvider>
      </AppStateProvider>
    </>
  );
};

export default App;
