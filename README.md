# NGBG

A Neo Geo background extraction tool. Once finished, it will enable making animated gifs of Neo Geo backgrounds very easy.

## Status

Extracting sprites pretty well, but still have a lot of work to do to massage them into a format ideal for grabbing animation frames

Overall very raw, very early, not even close to alpha quality.

## How to use

WARNING: very, _very_ raw at this point!

1. Head to https://city41.github.io/ngbg
2. click the first file dialog, labeled "BIOS" and choose your neogeo.zip bios file
3. click the second file dialog, labeled "ROM" and choose your neo geo ROM zip file
4. click "start emulation"
5. get to a point in the game you like, then click "pause"
6. click "dump sprites"

NOTE: gngeo is the emulator that is running, and it wants your ROM files to be in a very specific format. For me, my samsho2, mslug, kof94 and kof95 roms all work fine. But my aof, aof3, pulstar, etc ROMs do not load. I'll eventually fix this.

game controls:

* arrow keys
* p1 start: 1
* p1 coin: 3
* p1 a: z
* p1 b: x
* p1 c: a
* p1 d: s

TODO: solidify p2 controls


![screenshot](https://raw.githubusercontent.com/city41/ngbg/master/screenshot.png)
