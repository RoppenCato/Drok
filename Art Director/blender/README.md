# The Blender pipeline: a model built by a script, rendered to frames, packed to sheets

Copied from the Survival game (`C:\dev\SG\Game Developer\art\build\`, Clive, GD, 2026-11-04), where every character and
creature is made this way. The long form, with when to model and when to draw, costs, budgets and the sheet's JSON, is
`docs/3d-to-sprites.md`. Nothing here is rendered yet: a new game renders its own; no `.blend`, no frames, no sheets live
in the template.

```
blender/<name>_build.py -> source/<name>.blend -> blender/render.py -> render/<name>/*.png + meta.json -> tools/sprites.js -> out/<name>/
```

| File | What | Change it when |
| --- | --- | --- |
| `toon.py` | the one shared look: the toon material (base colour, a hard cool shadow step, a warm light step, grain), one sun upper left, the orthographic three-quarter camera, the ink line; three styles (`cel`, `painted`, `folk`; Robin chose cel for the Survival game) | the whole game's finish changes (then re-render everything) |
| `render.py` | renders any rigged `.blend`: every clip, facing and layer at double size, the anchor between the feet, `meta.json` | never, usually; its flags are in its header |
| `figure.py` | helpers for building a figure from simple shapes on a rig (what the builders share) | a new kind of body needs a new primitive |
| `quad_build.py` | the worked example: the Survival game's four-legged beasts (boar, deer, wolf, bear, moose) built from a spec table, rigged and given clips (idle, walk, run, windup, attack, hit, death) in the script | copy it and write the new game's own builders from its pattern; strip the Survival beasts |
| `hero2_proxy.py`, `mixamo_bind.py` | the Mixamo route: a watertight rigging proxy for Mixamo's auto-rigger, and the binding of the real parts to the skeleton it returns, with every clip collected | the game has humanoids and wants Mixamo's motion |

The packer is `../tools/sprites.js` (one crop box round the anchor for every frame, halved with a smooth filter, one sheet
per clip and layer, a row per facing, a column per frame, `<name>.json`). It finds `@napi-rs/canvas` through
`tools/paths.json` (`"canvas"`), else an install in the studio, else the game's `node_modules`.

## Running it

```
node tools/blender.js blender/quad_build.py -- boar                                   builds source/boar.blend (needs the Survival spec; a new builder takes its place)
node tools/blender.js blender/render.py -- source/boar.blend render/boar --anims idle,walk,run --dirs 8 --frames idle=16,walk=12,run=8 --layers body --size 224 --px 2 --ortho 2.828 --style cel --scene day
node tools/sprites.js boar render/boar out/boar --strides walk=12.78,run=41.07           the sheets and boar.json; strides from the walk's ground travel per cycle
```

`tools/blender.js` finds `blender.exe` under `C:\Program Files\Blender Foundation` (the newest), or `BLENDER` in the
environment, or `"blender"` in `tools/paths.json`. A render is about 0.3 s a frame; a beast's seven clips in eight facings
is three to five minutes. Keep `--size` and `--ortho` as a pair per model (pixels a metre); the packer warns `!!` when a
frame's pixels touch its edge. `--keep 1` leaves frames already on disk so one clip can be re-rendered alone.

## Mixamo, in short

Robin signs in to Mixamo himself in the browser pane; the AI never signs in, accepts terms or changes account settings.
Export the body as one mesh in a T-pose (`hero2_proxy.py` makes a watertight proxy if the rigger refuses the real mesh),
upload it, pick the clips, download them, and `mixamo_bind.py` binds the real parts to the returned skeleton and collects
the clips into one `.blend` that `render.py` renders like any other. Every humanoid on the same skeleton shares every clip.

## Before the first render in a new game

1. Set the look in `toon.py`: the shadow and light tints, the grain, the line weight, the camera's angle (35 degrees is the
   Survival game's three-quarter view; a flat side view wants its own camera).
2. Decide the pixels a unit the game draws at (`docs/3d-to-sprites.md`; the browser starter draws sheets at `Sheets.PX`).
3. Write one builder for one figure, render one clip in four facings, pack it, and look at it in the game beside the
   stand-in before building more. Judge it at Robin's screen size, on the game's own ground.
