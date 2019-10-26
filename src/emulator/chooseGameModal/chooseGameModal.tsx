import React, { useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import { useAppState } from "../../state";
import { FileStep } from "./fileStep";

const StyledModal = styled(Modal)`
  max-width: 600px;
  padding: 16px;
  margin: 96px auto;
  background-color: white;

  display: grid;
  grid-template-rows: repeat(3, auto);
  row-gap: 16px;

  color: black;
`;

const Title = styled.div`
  font-size: 24px;
`;

function loadFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (reader.result) {
        resolve((reader.result as unknown) as T);
      } else {
        reject(`Failed to load: ${file.name}`);
      }
    });

    reader.readAsArrayBuffer(file);
  });
}

async function addFileToVirtualFS(file: File) {
  const data: ArrayBuffer = await loadFile(file);

  window.Module.FS_createDataFile(
    "/virtualfs",
    file.name,
    new Uint8Array(data),
    true,
    true
  );
}

export const ChooseGameModal: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [romName, setRomName] = useState("");
  const [biosName, setBiosName] = useState(
    process.env.NODE_ENV !== "production" ? "neogeo.zip" : ""
  );
  const [romLoaded, setRomLoaded] = useState(
    process.env.NODE_ENV !== "production"
  );
  const [biosLoaded, setBiosLoaded] = useState(
    process.env.NODE_ENV !== "production"
  );
  const [loadingBios, setLoadingBios] = useState(false);
  const [loadingRom, setLoadingRom] = useState(false);

  const { dispatch } = useAppState();

  function loadBiosFile(file: File) {
    if (file.name === "neogeo.zip") {
      setLoadingBios(true);
      setBiosName(file.name);

      addFileToVirtualFS(file).then(() => {
        setLoadingBios(false);
        setBiosLoaded(true);
      });
    }
  }

  function loadRomFile(file: File) {
    setLoadingRom(true);
    setRomName(file.name);

    addFileToVirtualFS(file).then(() => {
      setLoadingRom(false);
      setRomLoaded(true);
    });
  }

  function startRom(overrideRomName?: string) {
    const argv = window.stackAlloc(3 * 4);

    const romToLoad = (overrideRomName || romName).replace(".zip", "");

    window.HEAP32[argv >> 2] = window.allocateUTF8OnStack("gngeo");
    window.HEAP32[(argv >> 2) + 1] = window.allocateUTF8OnStack(romToLoad);
    window.HEAP32[(argv >> 2) + 2] = 0;

    setIsOpen(false);
    dispatch({ type: "StartEmulation" });

    try {
      window.Module._run_rom(2, argv);
    } catch (e) {
      console.log("_run_rom threw");
    }
  }

  function launch() {
    const rom =
      process.env.NODE_ENV !== "production" ? romName || "samsho2" : romName;
    startRom(rom);
  }

  return (
    <StyledModal isOpen={isOpen}>
      <Title>To start, please provide these two files</Title>
      <FileStep
        stepNumber={1}
        title="Neo Geo BIOS"
        description="The BIOS file for the Neo Geo, it must be named neogeo.zip"
        onFileChosen={loadBiosFile}
        loading={loadingBios}
        fileName={biosName}
      />
      <FileStep
        stepNumber={2}
        title="Game ROM"
        description="The game ROM, such as samsho2.zip"
        onFileChosen={loadRomFile}
        loading={loadingRom}
        fileName={romName}
      />
      <button disabled={!romLoaded || !biosLoaded} onClick={() => launch()}>
        launch
      </button>
    </StyledModal>
  );
};
