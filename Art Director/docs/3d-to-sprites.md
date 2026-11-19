# From Blender to sprites: the pipeline, and when to use it (Clive, GD, 2026-11-04)

How the Survival game's Art Director (Colin, AD, `C:\dev\SG\Art Director`) makes the characters and creatures, when a
thing is modelled and rendered and when it is drawn, where Mixamo fits, which tools exist and how a new game gets them
without copying gigabytes. Robin decided on 2026-10-09 to make characters and creatures in Blender rendered to sprite
sheets, after a trial; everything below came out of a month of doing it.

## When to model and render, when to draw

| Model in Blender, render to sheets | Draw (in code, or by hand as a picture) | Why |
| --- | --- | --- |
| Anything that **animates and turns**: the hero, people, animals, monsters | | A figure in eight facings with ten clips is thousands of frames; a model gives them all from one source, and every humanoid on one skeleton shares every clip |
| Big set pieces that must sit beside the models: trees, rocks, boats as props, houses' dressing (after the characters, one at a time, only where a drawn piece looks wrong next to a model) | Small props, clutter, flowers, grass, drops | Many small things are the art; a drawn prop is a few lines of code and never clips |
| | The ground, water, waves, grass, painted paths | Painted fields with ragged edges; nothing to gain from a mesh |
| | Building pieces, walls, roofs | Walls on tile edges and roofs found by flood fill are data, not meshes |
| | UI, boards, icons, effects (numbers, rings, embers, smoke), the night, the map | Screen-space and data-driven |
| A thing with **states that change its shape** (a windup, a death, a fall) | A thing whose states are a tint or a swap of one picture | Shape reads through chaos, tint does not |

For a pure 2D game with few facings (a side view, a board) drawing or a hand-drawn sheet is usually cheaper than a model;
the model pays off from about four facings and four clips up, or when the same body wears many layers.

## The pipeline

```
build script -> art/source/<name>.blend -> render.py -> art/render/<name>/*.png (2x) -> tools/sprites.js -> assets/sprites/<name>/
 (the model, rig, clips;  (reproducible)      (toon.py: look, sun,    + meta.json          (one crop box,          <clip>_<layer>.png
  never hand-edited)                            camera, ink line)                            halved, packed)         + <name>.json
```

1. **A model is built by a script, never hand-edited** (`art/build/<name>_build.py`). The `.blend` is rebuilt from the
   script, so the model stays reproducible, diff-able and small in git (the `.blend` files are not committed; the scripts
   are). A change goes into the script.
2. **One shared look** (`art/build/toon.py`): the material (a base colour, a hard shadow step toward the scene's cool tint,
   a warm light step, grain), one sun upper left, an orthographic three-quarter camera at 35 degrees, the Freestyle ink line
   (heavy on the shadow side, thinner on real overlaps). Changing the finish of every model means changing this file and
   re-rendering; changing one model means its builder. Robin chose the cel style of three (`--style cel|painted|folk`).
3. **One renderer** (`art/build/render.py`, run headless by `tools/blender.js`): every clip, facing and layer at double size,
   the figure's origin between the feet as the anchor, a `meta.json` with the numbers. Flags: `--anims idle,walk --dirs 8
   --frames idle=16,walk=12 --layers body --size 224 --px 2 --ortho 2.828 --style cel --scene day`. `--size` and `--ortho`
   fix the pixels a metre; keep a model's pair unless it no longer fits its frame (the packer warns `!!` when pixels touch
   the edge). `--keep 1` leaves frames already on disk, so one clip can be re-rendered by deleting its files.
4. **One packer** (`tools/sprites.js`): one crop box round the anchor for every frame of every clip and layer (so the layers
   stack and the clips swap without a jump), halved with a smooth filter (the line stays soft; nothing nearest-neighbour),
   one sheet per clip and layer, a row per facing, a column per frame, and `<name>.json`: the frame size, the anchor, the
   facings, the clips with their frames and fps, the layers, and for walks a **stride** (units a cycle) so the game picks
   the frame by distance walked and the feet never slide.
5. **Set pieces** (`tools/props.js`): rendered once each, halved, cut to their pixels, given the drawn world's finish (grain,
   a cool shade to the lower right, the ink line thin all round and heavy on the shadow side) and written with a JSON of
   size, origin and pixels a unit.

Facings go clockwise from facing the camera: `s, sw, w, nw, n, ne, e, se` (four for small things: `s, w, n, e`). The
frame's anchor is the point between the feet; the game draws the sheet at the anchor and sorts by it.

## Mixamo: humanoid motion without animating

- Mixamo (Adobe, free with an Adobe account) auto-rigs a humanoid mesh and gives it clips: walk, run, idles, slashes, bow,
  hit, death, chop, mine, sit, sneak. **Robin signs in himself in the browser pane; the AI never signs in, accepts terms or
  changes account settings.** Downloads land in his Downloads folder under temporary names; a README in `art/source/mixamo/`
  lists every file and its source animation.
- Mixamo's rigger could not rig the hero's own mesh (parts, holes), so `art/build/hero2_proxy.py` makes a **rigging proxy**:
  the body joined and voxel-remeshed into one watertight surface (`hero2_rigproxy.fbx`). Mixamo rigs that; `mixamo_bind.py`
  binds the real parts to that skeleton (each part named by its bone; the hands on the forearms when the skeleton has no
  finger bones), collects every clip's action and saves one `.blend` that renders like any other.
- Every humanoid on the same skeleton shares every clip: villagers, guards, the hero's kit of garments are layers over one
  body (`people_build.py`), coloured when drawn.
- Beasts and the trolls have their own rigs built in the scripts (`quad_build.py` for four legs, `troll_build.py` for bipeds
  that are not Mixamo's), with clips written as keyframes in the script.
- Hand-written clips the studio added later (a sneak, a bow walk, a carry) are keyframed in Blender by the Art Director and
  delivered with the numbers the game needs (stride, fps, the hands' positions per frame for held things).

## The sheet's JSON, in short

```
{ "name": "boar", "frame": {"w": 164, "h": 121}, "anchor": {"x": 82, "y": 89.2}, "dirs": 8, "layers": ["body"],
  "anims": { "walk": { "frames": 12, "fps": 12, "sheets": {"body": "walk_body.png"}, "stride": 12.78 }, ... },
  "figure_px": 116.8, "source": "art/source/boar.blend" }
```

A clip rendered in a frame of its own (a death that ends outside the common frame) carries its own `frame` and `anchor`.
Layers that pile on a body (clothes, a shield, a weapon) are packed into their own boxes with `--only`, so a new garment
does not repack twenty thousand frames. The game's drawer (`src/sprites.js` in the Survival game; the browser starter has a
small one) draws by facing, clip and frame from this JSON.

## Costs and budgets (measured 2026-10-13 to 2026-10-21)

- A render is about 0.3 s a frame. A beast's seven clips in eight facings is about 580 frames, three to five minutes; the
  hero's eighteen clips twelve to fifteen minutes.
- **Sheet weight is the real cost.** A beast is about 4 MB on disk, the hero 22 MB; decoded in the browser the hero's sheets
  were 1.5 GB until the game loaded clips lazily. Budgets agreed 2026-10-20: a beast 50 MB decoded, a big monster 80, the hero
  350. Fewer idle frames, four facings for small things, trimmed boxes and WebP sheets bring it down.
- The game must warm a clip before it is shown (draw it once off screen), or the figure vanishes while its sheet loads.

## The finish that makes a model sit in a painted world ("the sticker cure", Robin, 2026-10-21)

Three rules for every rendered set piece, after Robin said the trees "look pasted on like stickers":

1. The studio renders set pieces with the outer contour at about half the figures' line weight, in a dark green-brown, and
   the inner line thinner still; people, beasts and the hero keep the heavy black line.
2. The game draws a **cast shadow** under every set piece: a soft blue ellipse to the lower right, its reach about half the
   piece's height; full by day, longer and bluer through dusk and dawn, gone at night when the fires' shadows take over.
3. **Ground contact on grass only**: a dark halo under the foot before the piece, and the meadow's own grass blades over the
   lowest bit of its base after it.

The studio showed the options on one board at Robin's screen size, with the game's own ground behind, and he picked.

## How the studio works with Robin and the game

- **Three options for anything big** (the hero, a map, a look, a significant set piece): the studio renders a board with
  three candidates side by side on the game's own ground at Robin's screen size, with a line on each, and Robin picks. Small
  things (a random monster, a button) are just made. In the template this is `sites/pick.html`.
- **Judge at the player's size.** The studio's `compare.js` lays a before and after on the game's own ground with the hero
  for scale, because the pane's canvas is smaller than Robin's screen.
- **A drop is a whole folder**: `out/<name>/` with `sheets/` (the packed sheets and the JSON), `build/` (the scripts that made
  them), a picture or board, and `HANDOFF.md` (what is in it, the numbers the game needs, what changed, "copy the whole
  folder"). The game copies it whole; the JSON's boxes and anchors move with the pictures.
- The studio never edits the game's files; it reads them, and renders its boards from the game's own ground and kit so what
  is judged is what the game shows.
- Robin's rule of 2026-10-31 applies to art as to lore: deliver without waiting for his yes, marked as the studio's choice;
  his decisions are marked as his with the date.

## Checks before a delivery

Silhouette first (does it read at a quarter size, in grayscale, in the night scene?); the three reads (far: the silhouette;
middle: the big colour blocks; close: detail only where the eye should go); a windup whose silhouette differs from the walk;
every facing's feet on the anchor; the packer's `!!` for pixels touching the frame; the decoded budget; a before-and-after
board at Robin's size. The studio's `docs/techniques.md` has the long form with its sources.

## What is in the template, and what stays in SG

The scripts are in the template already (this studio folder); the renders and sheets are made in the new game. Nothing
big is copied: no `.blend`, no frames, no sheets.

| What | Where | Note |
| --- | --- | --- |
| `toon.py` (the look), `render.py` (the renderer), `figure.py`, `quad_build.py` (the worked example: the Survival beasts), `hero2_proxy.py` and `mixamo_bind.py` (the Mixamo route) | this studio's `blender/`, with its own README | change the colours and the camera in `toon.py` for the new look; write the new game's builders from the example's pattern |
| `tools/sprites.js` (the packer) | this studio's `tools/` | finds `@napi-rs/canvas` through `tools/paths.json`, else an install in the studio, else the game's `node_modules`; tested on a render set |
| `tools/blender.js` (runs a script headless), `board.js`, `compare.js`, `look.js`, `sheet.js`, `concepts.js`, `pack.js` (frames to the phone game's atlas form) | this studio's `tools/`, Miles, GD's set, `tools/README.md` | `pack.js` is the phone starter's atlas; `sprites.js` the browser starter's sheets |
| `tools/props.js` (a rendered set piece finished with the drawn world's grain, shade and ink line) | `C:\dev\SG\Game Developer\tools\props.js` | not copied: it uses the Survival game's own drawing kit; copy and rewrite the finish for the new game's look |
| `commons_fetch.py` (public-domain references with the licence checked), `layer_sheet.js` | `C:\dev\SG\Art Director\tools\` | copy if wanted |
| The studio's `docs/style-guide.md`, `docs/techniques.md`, `docs/pipeline.md`, `docs/animation-findings-2026-10-21.md` | `C:\dev\SG\Art Director\docs\` | read; the template's `docs/techniques.md` and `docs/direction.md` are the shape to fill |
| `.blend` files, `art/render/`, `assets/sprites/` (hundreds of MB) | | never copied: rebuilt from the scripts in the new game |

Needs: Blender 4.x or newer installed (the newest under Program Files, `BLENDER` in the environment, or `"blender"` in
`tools/paths.json`), Node 20 or later, `@napi-rs/canvas` once (in the studio or pointed at by `paths.json`), Python inside
Blender (nothing to install).
