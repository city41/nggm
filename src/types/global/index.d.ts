export {};

declare global {
    interface Window {
        Module: any;
        HEAP32: any;
        allocateUTF8OnStack: (utf8: string) => number;
        stackAlloc: (byteCount: number) => number;
    }
}
