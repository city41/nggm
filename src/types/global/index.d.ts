export {};

declare global {
    interface Window {
        Module: any & {
            pauseMainLoop: () => void;
            resumeMainLoop: () => void;
        };
        HEAP32: any;
        allocateUTF8OnStack: (utf8: string) => number;
        stackAlloc: (byteCount: number) => number;
    }
}
