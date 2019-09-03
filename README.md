# NGBG

A Neo Geo background extraction tool. With just a few clicks, you can extract the backgrounds of Neo Geo games into animated gifs. Usually the hardest part is playing the game long enough to get the background you are interested in loaded into memory :)

## Status

The tool now successfully extracts simple backgrounds. There is still much work to be done:
  
* tools to nudge sprites, they are often wrapped incorrectly in raw memory
* ability to support parallaxing backgrounds (now solved with layers feature)
* support manual sprite animation
* other tools to just make life easier

## How to use

For now, easiest to just watch this video and just play around with things
https://www.youtube.com/watch?v=xgQp2mm5K20

I will create detailed instructions as the tool matures.

NOTE: gngeo is the emulator that is running, and it wants your ROM files to be in a very specific format. For me, my samsho2, mslug, kof94 and kof95 roms all work fine. But my aof, aof3, pulstar, etc ROMs do not load. I'll eventually fix this.

game controls:

player one

* directions: arrow keys
* start: 1
* coin: 3
* a: z
* b: x
* c: a
* d: s
  
player two

* directions: h,j,k,l
* start: 2
* coin: 4
* a: y
* b: u
* c: i
* d: o

### Changing the controls

The controls are defined in `gngeo/src/virtualfs/gngeorc`. They are defined using SDL key codes. Make changes, then `yarn build-gngeo` to get the changed gngeorc positioned for emscripten to consume it.



