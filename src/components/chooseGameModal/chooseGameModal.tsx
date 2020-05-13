import React, { useState } from "react";
import styled from "styled-components";
import { Modal } from "../primitives/modal";
import { useAppState } from "../../state";
import { DemoData } from "../../state/state";
import { FileStep } from "./fileStep";
import { DemoChoices } from "./demoChoices";

const Title = styled.div`
  font-size: 24px;
`;

const Warning = styled.div`
  background-color: rgba(240, 0, 0, 0.2);
  color: red;
  font-weight: bold;
  padding: 8px;
`;

const Why = styled.div`
  margin-top: 8px;
  font-size: 0.8rem;

  & > a {
    color: blue;
    cursor: pointer;
  }

  & > div {
    margin-top: 8px;
  }
`;

const MustBeUS = styled.div`
  display: inline-block;
  margin-top: 8px;
  font-weight: bold;
  background-color: rgba(50, 200, 20, 0.2);
  padding: 4px;
`;

let gngeoLoaded = false;

function loadGngeo(): Promise<void> {
  if (gngeoLoaded) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const moduleTag = document.createElement("script");
    moduleTag.onload = function() {
      window.Module.runningListeners.push(() => {
        gngeoLoaded = true;
        resolve();
      });

      const gngeoTag = document.createElement("script");

      gngeoTag.src = "static/gngeo.js";
      document.head.appendChild(gngeoTag);
    };

    moduleTag.src = "static/module.js";
    document.head.appendChild(moduleTag);
  });
}

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
  try {
    await loadGngeo();

    const data: ArrayBuffer = await loadFile(file);

    window.Module.FS_createDataFile(
      "/virtualfs",
      file.name,
      new Uint8Array(data),
      true,
      true
    );
  } catch (e) {
    console.log("addFileToVirtualFS", e);
  }
}

export const ChooseGameModal: React.FunctionComponent = () => {
  const [showWhy, setShowWhy] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [romName, setRomName] = useState("");
  const [biosName, setBiosName] = useState("");
  const [romLoaded, setRomLoaded] = useState(false);
  const [biosLoaded, setBiosLoaded] = useState(false);
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

  async function launch() {
    const rom =
      process.env.NODE_ENV !== "production" ? romName || "samsho2" : romName;
    startRom(rom);
  }

  async function handleDemoChoice(demoType: "ss2" | "streetSlam") {
    const fetchedRawData = await fetch(`./static/${demoType}.json`);
    const data = await fetchedRawData.json();

    setIsOpen(false);
    dispatch({ type: "SetDemo", demoData: data as DemoData });
  }

  const biosDescription = (
    <div>
      <div>The BIOS file for the Neo Geo.</div>
      <div>The file must be named neogeo.zip</div>
      <MustBeUS>It must be a US bios.</MustBeUS>
    </div>
  );

  const romDescription = (
    <div>
      The game ROM, such as samsho2.zip
      <Why>
        <a onClick={() => setShowWhy(!showWhy)}>why does my ROM not work?</a>
        {showWhy && (
          <div>
            NGGM uses GnGeo as its emulator. GnGeo requires ROMs to be in a
            specific format, and many ROMs out there today do not match. I will
            fix this eventually.
          </div>
        )}
      </Why>
    </div>
  );

  return (
    <Modal isOpen={isOpen}>
      <Warning>NGGM is currently alpha quality at best, very raw!</Warning>
      <Title>To start, please provide these two files</Title>
      <FileStep
        stepNumber={1}
        title="Neo Geo BIOS"
        description={biosDescription}
        onFileChosen={loadBiosFile}
        loading={loadingBios}
        fileName={biosName}
      />
      <FileStep
        stepNumber={2}
        title="Game ROM"
        description={romDescription}
        onFileChosen={loadRomFile}
        loading={loadingRom}
        fileName={romName}
      />
      <button disabled={!romLoaded || !biosLoaded} onClick={() => launch()}>
        launch
      </button>
      <Title>Or ... choose a demo to taste how the app works</Title>
      <DemoChoices onChoice={handleDemoChoice} />
    </Modal>
  );
};
