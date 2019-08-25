import React, { useState } from "react";
import { Tiles } from "./tiles";
import { Sprites } from "./sprites";

interface EmulatorProps {
    className?: string;
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
    const data: ArrayBuffer = await loadFile(file);

    window.Module.FS_createDataFile(
        "/virtualfs",
        file.name,
        new Uint8Array(data),
        true,
        true
    );
}

export const Emulator: React.FunctionComponent<EmulatorProps> = () => {
    const [biosLoaded, setBiosLoaded] = useState(false);
    const [romLoaded, setRomLoaded] = useState(false);
    const [gameName, setGameName] = useState("");
    const [isPaused, setIsPaused] = useState(false);

    function togglePause() {
        if (isPaused) {
            window.Module.resumeMainLoop();
        } else {
            window.Module.pauseMainLoop();
        }

        setIsPaused(!isPaused);
    }

    async function loadBiosFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target && e.target.files && e.target.files[0];

        if (!file) {
            return;
        }

        await addFileToVirtualFS(file);
        setBiosLoaded(true);
    }

    async function loadROMFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target && e.target.files && e.target.files[0];

        if (!file) {
            return;
        }

        await addFileToVirtualFS(file);
        setRomLoaded(true);
        setGameName(file.name.replace(".zip", ""));
    }

    function startGame() {
        const argv = window.stackAlloc(3 * 4);

        window.HEAP32[argv >> 2] = window.allocateUTF8OnStack("gngeo");
        window.HEAP32[(argv >> 2) + 1] = window.allocateUTF8OnStack(gameName);
        window.HEAP32[(argv >> 2) + 2] = 0;

        window.Module._run_rom(2, argv);
    }

    return (
        <>
            <canvas id="canvas" />
            <div>
                BIOS
                <input
                    disabled={biosLoaded}
                    type="file"
                    onChange={loadBiosFile}
                />
            </div>
            <div>
                ROM
                <input
                    disabled={romLoaded}
                    type="file"
                    onChange={loadROMFile}
                />
            </div>
            <button disabled={!biosLoaded || !romLoaded} onClick={startGame}>
                start emulation
            </button>
            <button disabled={!biosLoaded || !romLoaded} onClick={togglePause}>
                {isPaused ? "resume" : "pause"}
            </button>
            <Tiles />
            <Sprites />
        </>
    );
};
