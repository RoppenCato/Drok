# What goes back to the game  (Leonard, AD, 2026-11-20)

One folder per delivery. Victor, GD copies each folder whole. Every folder has its files, their data, a look picture and
a NOTES.md. Nothing here has been judged by Robin: **every look and design is mine until he has seen it** (Robin,
2026-11-20, passed on by Victor, GD: "Let AD handle the art you need. I approve.").

## What holds for every folder

- **The look** (mine): figures and props are small 3D models rendered flat in two chosen tones with one dark line
  (`#33203a`); the ground is painted and has no line. It is look 1 of `concepts\look\` with a thicker line and bigger eyes.
- **Sizes**: two file pixels a design unit (`meta.filePx` 2), drawn one to one on the game's 824 by 1830 canvas. The one
  exception is a place's ground picture: one pixel a unit, drawn at double size.
- **The camera on figures**: 35 degrees above the ground, lower than the ground is painted, so faces show.
- **The light** comes from above and in front, never from a side, so the game's flip does not show.
- **Facings**: `s`, `se`, `e`, `ne`, `n` are drawn; the game flips `se`, `e`, `ne` for `sw`, `w`, `nw`. `meta.facings` in
  each atlas says which it has (the coconut crab has `s`, `e`, `n` only: take the nearest).
- **The atlas form**: Phaser JSON hash, trimmed, the pivot at the feet. Frames are named
  `<thing>/<action>/<facing>/<nnnn>`. The `actions` block has, for each action, `delay`, `loop`, sometimes `stride`
  (design units walked in one cycle of `move`), `blow` (the index of the frame the blow lands on, counted from 0) and
  `note`; and `frames`, all facings one after the other, each with `name`, `facing`, `w`, `h`, `origin`, `delay`, the box
  `lt` and `rb`, `head`, and `a0`, `a1` where it fades.
- **A set of single pictures** (gear, props, loot, glass) is the same hash with an `items` block: each picture's `w`,
  `h`, `origin` and its own data.
- **The reference drawers**: `tools\dress.js` draws the Warrior with his gear from these files the way the game should;
  `tools\scene.js` draws a whole screen. If their pictures are right, the data is right. `out\scene\beach.png` is that.

## What it costs (decoded memory, files on disk)

| Folder | Atlas | Decoded | On disk |
| --- | --- | --- | --- |
| `hero` | 1024 by 2048 | 8 MB | 254 KB |
| `gear` | two of 512 by 512 | 2 MB | 35 KB |
| `sand-crab` | 1024 by 1024 | 4 MB | 141 KB |
| `reef-gull` | 1024 by 1024 | 4 MB | 95 KB |
| `coconut-crab` | 1024 by 2048 | 8 MB | 202 KB |
| `island` | ground 1400 by 2400, props 1024 by 1024 | 13.4 + 4 MB | 67 + 52 KB |
| `loot` | 256 by 256 | 0.3 MB | 18 KB |
| `glass` | 1024 by 512 | 2 MB | 66 KB |

The island with everything on it: about 46 MB decoded, under the 48 MB set for a place. All of it on disk: about 1 MB.

## Making it again

Everything is built by scripts; nothing is edited by hand. `blender\drok.py` is the look, the camera and the render
loop. `node tools/blender.js blender/hero.py -- work/hero/render`, then `node tools/pack.js hero work/hero/render out/hero`,
then `python tools/shrink.py out/hero`. The same for `crab.py` (sand-crab, coconut-crab), `gull.py`, `gear.py` and
`props.py` (island, harbour, loot) with `tools/packset.js`; `tools/ground.js` paints a place; `tools/glass.js` the glass.
The Warrior's 195 frames render in about three minutes.
