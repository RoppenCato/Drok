# What art the game needs, in what order, for Leonard, AD

The Game Developer's list of what to draw, in waves, each wave tagged with its chapter; the budgets at the top are the
Game Developer's to set and confirm, and the studio delivers inside them (or asks first). The atlas or sheet form the
game reads is in `docs\state\art.md` once it exists; the studio's own direction sheet is `..\..\Art Director\docs\direction.md`.

## The budgets (GD, 2026-11-19; mine until felt)

- **The judging size**: _412 by 915 portrait (phone) or the size in `docs\platform.md` (computer)_.
- **File form**: _one atlas (json + png) per creature or kit, trimmed frames, origin at the feet, a delay per frame_
  (phone: the atlas form of `tools\pack.js`; computer: the sheet form of `tools\sprites.js`).
- **Sizes**: _a figure about N px tall on screen; an atlas under N KB; a backdrop under N KB; the first load under N MB_.
- **Memory**: _decoded pixels per scene under N MB; few atlases loaded at once_.
- **Motion**: _the action set and frame counts from the studio's direction sheet; delays in ms per frame_.

## Wave 1 (chapter 1): the look and the first screen

| Piece | What | Size on screen | Big work? |
| --- | --- | --- | --- |
| The look | three stills of the first screen with the player and one thing, at the judging size | full screen | yes: three concepts |
| The player | the figure the player is, with its action set | _N px_ | yes if it is the hero |
| The first ground | the ground or board of the first place, as a kit (tiles, edges, props) | _…_ | no |
| The first thing | the first creature or object to act on, with its action set | _N px_ | no |
| The UI kit | buttons, bars, a panel, a card, the font's look | _…_ | no |

## Wave 2 (chapter 2): _headline_

_…_

## Rules for every piece

Data with every piece (origin, delay, hit box, head, facings); judged at the judging size in the real scene; whole
folders delivered into `out\<name>\` with a NOTES.md and a picture into the chat; small files; nothing from other games
without its origin written down.
