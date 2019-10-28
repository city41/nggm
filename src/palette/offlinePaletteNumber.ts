// this is a blue/yellow palette generated at build time
// useful if you need a palette for testing and can't get a real palette
// from a running game

import zip from "lodash.zip";

type RgbaPalette = Array<[number, number, number, number]>;

const step7 = Math.floor(256 / 7);
const palette7: RgbaPalette = new Array(7).fill(1, 0, 15).map((_, i) => {
  const value = (i + 1) * step7;

  return [value * 0.6, value * 0.9, value, 255];
});

const step8 = 256 / 8;

const palette8: RgbaPalette = new Array(8).fill(1, 0, 15).map((_, i) => {
  const value = (i + 1) * step8;

  return [value, value * 0.9, value * 0.6, 255];
});

palette7.unshift([0, 0, 0, 0]);

const zipped = zip(palette7, palette8);

const palette: RgbaPalette = zipped.reduce<RgbaPalette>((b, pair) => {
  return b.concat((pair as unknown) as RgbaPalette);
}, []);

export { palette };
