import React from "react";
import Modal from "react-modal";
import ReactDOM from "react-dom";
import { App } from "./app";

import "./index.css";

Modal.setAppElement("#root");

ReactDOM.render(<App />, document.getElementById("root"));

if (process.env.ENABLE_DEMO_DUMP) {
  // @ts-ignore
  window.dumpDemo = function() {
    // @ts-ignore
    const palettes = Object.keys(window.neededPalettes).reduce((b, k) => {
      const palAddr = window.Module._get_current_pal_addr();
      const palOffset = Number(k) * 32;
      const palIndexInHeap = (palAddr + palOffset) / 2;

      // @ts-ignore
      b[k] = window.Module.HEAPU16.slice(palIndexInHeap, palIndexInHeap + 16);
      return b;
    }, {});

    // @ts-ignore
    const tileMemory = Object.keys(window.neededTiles).reduce((b, k) => {
      // @ts-ignore
      b[k] = window.HEAPU8.slice(
        window.Module._get_rom_ctile_addr() + Number(k) * 2 * 16 * 4,
        window.Module._get_rom_ctile_addr() + (Number(k) + 1) * 2 * 16 * 4
      );
      return b;
    }, {});

    const spriteMemoryStart = window.Module._get_tile_ram_addr();
    const spriteMemoryEnd = spriteMemoryStart + 0x85ff * 2;

    const spriteMemory = window.HEAPU8.slice(
      spriteMemoryStart,
      spriteMemoryEnd
    );

    const dump = {
      palettes,
      tileMemory,
      spriteMemory
    };

    const asJson = JSON.stringify(dump, (_, v) => {
      if (v.join) {
        return "[" + v.join(",") + "]";
      } else {
        return v;
      }
    });

    console.log(asJson);
  };
}
