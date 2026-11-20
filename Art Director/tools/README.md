# The studio's tools

Every script's header says what it does and its command; this is the short list. Run them from the studio folder. All
of them read `tools\paths.json` through `paint.js`: set it in the first session (the game folder, the judging size, the
files' scale, where the canvas library is, the player's atlas, the stage picture, the ink and flat colours).

| Tool | What it does | Command |
| --- | --- | --- |
| `rig.js` | a figure on a skeleton: fixed bone lengths, the solver for elbows and knees, limbs as one shape round their joints, a breath and a walk from one formula, the clips written as sheets with `meta.json` (a module; the game's own draw function paints the parts; FapleGlory's `tools\rig\mage.js` is the worked example; rules.md 52) | `const R = require('./rig.js')` |
| `pack.js` | frames with a `meta.json` into the game's atlas form: trimmed, hard edges, origin at the feet, delay, hit box, head, fades, `meta.filePx` | `node tools/pack.js <name> <render dir> <out dir>` |
| `shrink.py` | every PNG of a delivery to a palette PNG, about a third the size; skip glows and fades | `python tools/shrink.py out/<name> [--skip glow] [--dry]` |
| `anim_gif.js` | a packed figure moving at its real delays on the stage, as a GIF (for the PC; the phone gets `sites\moving.html`) | `node tools/anim_gif.js out/<name>/<name>.json out/<name>/<name>.gif` |
| `gif.py` | a GIF from a JSON spec of layered frames at real delays (what `anim_gif.js` calls) | `python tools/gif.py spec.json out.gif` |
| `compare.js` | the judging picture: the figure beside our player on the stage at the judging size, every action's key pose, the telling ones at 2x | `node tools/compare.js out/<name>/<name>.json work/<name>/compare.png` |
| `look.js` | a quick judging picture: pictures on a ground line beside our player at the real size and at a zoom | `node tools/look.js out.png [--bg file.png] [--zoom 2] a.png b.png` |
| `sheet.js` | a contact sheet of a render: a row per action, a column per frame, the feet lined up | `node tools/sheet.js <render dir> sheet.png` |
| `board.js` | a contact sheet of a folder of pictures (reference boards, screenshots) | `node tools/board.js <dir> board.jpg [columns] [cell px]` |
| `numbered.js` | a numbered board of pictures of mixed shapes in columns, a big number on each and a line under it, to ask Robin with (Leonard, AD, 2026-11-20) | `node tools/numbered.js board.jpg --cols 3 --title "..." --labels "a\|b\|c" 1.jpg 2.jpg 3.jpg` |
| `commons_fetch.py` | chosen Wikimedia Commons pictures into a folder at 960 px, the licence checked per file (public domain or CC0 only), with `_fetched.json` (from the Survival game's studio) | `python -I tools/commons_fetch.py <out dir> <list file> [width]` |
| `isle.js` | a big island: paints its ground as one picture at half a pixel a unit, places the props in clumps, writes `place.json` with the grounds and the walkable outline, walks it from the landing, draws the island small with and without names (Leonard, AD, 2026-11-20) | `node tools/isle.js crab-cay` |
| `shade.js` | a building's own shadow into its own picture: the outline of its foot, a little down and to the right; marks it `shade` so no round shadow is laid under it (Leonard, AD, 2026-11-20) | `node tools/shade.js <render dir>` |
| `window.js` | the hero's window drawn from the glass's own pieces with the game's layout numbers, long names and big numbers, to see that every word fits; `--fix` lays it out with the changes that keep everything clear (Leonard, AD, 2026-11-20) | `node tools/window.js out.png [--fix] [--state bag\|worn\|none]` |
| `merge-props.js` | several folders of rendered props into one, so a place has one atlas; with no words it does big Crab Cay's (Leonard, AD, 2026-11-20) | `node tools/merge-props.js [out dir] [render dir ...]` |
| `world.js` | a concept, the house's world as a kit (the house was left on 2026-11-20): paints the floors, cuts the pieces, lays out the things, writes `world.json`; checks the kit against the painting; walks it; draws the map and any screen from the delivered files (Leonard, AD, 2026-11-20) | `node tools/world.js kit\|check\|walk\|deliver\|map\|screen x y` |
| `things.js` | bakes each rendered thing's shadow into its picture, steps out the top of a leg, cuts a long thing in three; a sheet of all of them beside the hero (Leonard, AD, 2026-11-20) | `node tools/things.js [render dir] [baked dir]`, `node tools/things.js --sheet out.png <atlas dir>` |
| `concepts.js` | two to four concept stills side by side with a big number and a label each, as one picture | `node tools/concepts.js pick.png --labels "a|b|c" 1.png 2.png 3.png` |
| `player.js` | our player for scale, from the atlas in `paths.json`; a code-drawn stand-in until one exists (a module) | `const { player, load } = require('./player.js')` |
| `chrome.js` | the game's HUD, title pill, big button and panel drawn plainly at the judging size (a module; redraw to the game's layout) | `const C = require('./chrome.js'); C.hud(g, 'Title')` |
| `paint.js` | canvas helpers: gradients, ink, blobs, seamless drawing, trim, harden, tile 3 by 3, save, labels; loads `paths.json` (a module) | `const P = require('./paint.js')` |
| `blender.js` | runs a Blender Python script headless | `node tools/blender.js build/model.py -- args` |

## What they need

- **Node** (22 or newer) with **`@napi-rs/canvas`**. There is no `node_modules` here. Either install it in the studio
  with `npm i @napi-rs/canvas` (then `paint.js` finds it on its own), or point `"canvas"` in `paths.json` at a copy; on
  Robin's PC one is at `C:\dev\SG\Game Developer\node_modules\@napi-rs\canvas`. One crash to know about: drawing big
  pieces and gradients on a canvas returned by another painter crashed Node at random; copy it to a fresh canvas first.
- **Blender** for rendered sprites: `blender.js` finds the newest install under `C:\Program Files\Blender Foundation`
  (5.2 on Robin's PC), or `BLENDER` in the environment, or `"blender"` in `paths.json`. The pipeline is the studio's
  `docs\3d-to-sprites.md`.
- **Python 3 with PIL** (Pillow) for `shrink.py` and `gif.py`. Robin's PC has Python 3.14 with PIL.
- To look at a picture, use the Read tool on the PNG. The Read tool cannot open AVIF or WebP: draw it onto a canvas and
  save a PNG in the scratch folder.

## From the Survival game's pipeline (Clive, GD, 2026-11-04)

- `sprites.js`: frames with a `meta.json` from `blender\render.py` into sheets for the browser starter: one crop box
  round the feet, halved, a row per facing, a column per frame, `<name>.json` with the frame, the anchor, the facings
  and the walk stride. `node tools\sprites.js <name> <render dir> <out dir> [--strides walk=N]`. It finds
  `@napi-rs/canvas` through `paths.json` ("canvas"), else an install in the studio, else the game's `node_modules`.
  `pack.js` makes the phone atlas; `sprites.js` makes the browser sheets; `docs\3d-to-sprites.md` says which is which.
- `..\blender\`: the Blender pipeline, Python beside Python: `toon.py` (the look), `render.py` (the renderer),
  `figure.py`, `quad_build.py` (the worked example: four-legged beasts), `hero2_proxy.py` and `mixamo_bind.py` (the
  Mixamo route through a rigging proxy), with its own README: the commands, Mixamo in short, what to set before a first
  render. `blender.js` here finds Blender and runs a script headless.

## The two pages

`C:\dev\2D game template\sites\moving.html` (atlases moving at their delays on a stage, a switch to compare
two, play and pause, speed, size, an action picker, the hit boxes) and `sites\pick.html` (numbered pictures to pick
from). Copy the page beside the files it shows, fill the JSON block at its top, and publish the folder as an artifact
with the files under `files`. GIFs show as stills on Robin's phone; the moving page is how he sees motion.
