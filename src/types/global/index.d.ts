export {};

declare global {
    interface Window {
        Module: any & {
            pauseMainLoop: () => void;
            resumeMainLoop: () => void;
            _run_rom: (argc: number, argv: number) => void;
            _get_rom_ctile_addr: () => number;
            _get_tile_ram_addr: () => number;
            _get_current_pal_addr: () => number;
            _get_neogeo_frame_counter: () => number;
            _get_neogeo_frame_counter_speed: () => number;
        };
        HEAP32: Int32Array;
        HEAPU32: Int32Array;
        HEAPU8: Uint8Array;
        allocateUTF8OnStack: (utf8: string) => number;
        stackAlloc: (byteCount: number) => number;
    }
}
