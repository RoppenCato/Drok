# The art in the game, as it stands (2026-11-20)

**None of the Art Director's art is switched on yet.** Everything on screen is a stand-in shape drawn in code
(`client\src\view\world-view.ts`, `hud.ts`, `panels.ts`). The layer that draws his pieces is built and was tried
against the hero, the gear and the sand crab as they stood in his `out\` on 2026-11-20, before he had delivered
them: they drew, moved, faced eight ways and wore gear. They were then taken out again, because a piece comes in
when its studio hands it over with its notes, not before.

## How a drop comes in

1. Leonard, AD says a piece is in `Art Director\out\<name>\`, with its NOTES.md.
2. Copy that folder as it is into `Game Developer\client\public\art\<name>\`, leaving out only a `frames\` folder
   (the loose frames the atlas was packed from: they would ship in the build and the game never reads them).
3. Switch it on in `client\src\art.ts`. If the piece is of a kind the layer does not draw yet, write that first.
4. Check it in the pane at 412 by 915 (`?mute=1&drive=1`; step until the play scene runs, since the loader now has
   files to fetch), then commit: the folder, the switch, this file.

## What the layer draws (`client\src\view\figures.ts`, switched in `client\src\art.ts`)

| Switch | Files | What it replaces |
| --- | --- | --- |
| `ART.hero` | `art\hero\hero.png`, `hero.json` | the hero's stand-in. A `Figure`: actions `stand`, `move`, `attack1` (on a swing), `cleave`, `charge`, `hit1` (on a bite), `die1` (while he is down) |
| `ART.gear` | `art\gear\gear.png`, `gear.json`, `gear-icons.png`, `gear-icons.json` | what he wears, on the body's points `hand` (cutlass, one picture turned by the hand), `off` (buckler) and `head` (hat), each with a picture a facing; and the icons in the bag, the hero window and the stall |
| `ART.monsters` (a list of kinds) | `art\<kind>\<kind>.png`, `<kind>.json` | that kind's stand-in: `stand`, `move`, `attack1` started the step its wind-up starts, `hit1` while stunned, `die1` played out where it fell |

Not drawn by the layer yet, so still stand-ins whatever lands: the grounds and props of a place, loot on the ground
and its rarity effects, the chest, the pier, the stall and the townsfolk, the glass's bars and buttons, the windows,
the sea chart, the app's icon.

## The atlas form (Leonard, AD's `tools\pack.js`; agreed 2026-11-20)

A Phaser JSON hash. Frames are named `<thing>/<action>/<facing>/<nnnn>`; five facings are drawn (`s`, `se`, `e`,
`ne`, `n`) and the game mirrors `se`, `e` and `ne` for the other three. `meta.filePx` is 2: two file pixels a design
unit, drawn one to one on the game's canvas. An `actions` block gives each action its `delay` (ms a frame), `loop`,
and its frames with `w`, `h`, `origin` (the feet, in the frame's own pixels), `facing`, and for the hero `points`
(`hand`, `off`, `head`: x and y from the origin, `r` the turn in degrees, `front`). The game stands a figure on its
feet at the point the rules give, so the rules' "where he is" is where his feet are.

The gear atlas has one frame a cutlass (`cutlass-rusty`) and one a facing for bucklers and hats
(`hat-tricorn/se`), with each frame's `origin` under `items`. The icons are `icon/<name>`. The game's names for
gear differ from the art's; the table is `GEAR_ART` in `client\src\art.ts`.

## What his atlases carried that the game does not use yet

- `stride` on `move` (the distance one walk cycle covers): the game plays `move` by time. At the hero's 215 units
  a second, matching feet to ground would turn his legs into a blur; to settle with Leonard, AD.
- `blow` (the frame a blow lands on) and a `note` on the crab's `attack1` (wind-up frames 1 to 4, 500 ms): the
  rules' own timing decides when a blow lands; the animation is started with it.
- `lt`, `rb`, `head` (hit box and head): nothing in the game needs them yet.

## The budgets

In `docs\art-demands.md`. As tried on 2026-11-20: the hero's atlas was 1358 KB and the sand crab's 748 KB on disk,
each a 1024 by 2048 sheet (8 MB decoded): over the 300 KB an atlas was guessed at, inside the decoded budget. To
settle with Leonard, AD when he delivers: palette PNGs, or a bigger file budget.
