#!/bin/bash

cd gngeo/src;
emmake make;

cp gngeo gngeo.o;
emcc gngeo.o -o gngeo.html \
    -s USE_SDL=2 \
    -s USE_ZLIB=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s EXPORTED_FUNCTIONS='["_run_rom", "_get_tile_ram_addr", "_get_rom_ctile_addr", "_get_current_pal_addr", "_get_neogeo_frame_counter", "_get_neogeo_frame_counter_speed"]' \
    --preload-file virtualfs

mv gngeo.js gngeo.data gngeo.wasm ../../public/


