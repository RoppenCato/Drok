# The chest opens: the moving page  (Leonard, AD, 2026-11-20)

Robin, 2026-11-20, in Victor, GD's chat: "chests should have a cool effect when you open them like in zite." Victor, GD
builds the opening in the game. This folder is the page that shows how I would play it with the pieces of
`out\chest-burst\`, so Robin can judge it moving on his phone and Victor, GD has the numbers as code.

The page: https://claude.ai/artifact/98gBXWsocwTYNbvh6DCvAw (private to Robin until he shares it).

- `chest-opening.html`: the page. Its script holds `TIMES` (how long it shines, how hard it shakes and how much it
  throws, by rarity) and `frame` (the whole opening). The same numbers are written out in `out\chest-burst\NOTES.md`.
- `bake.js`: makes the page's pictures (`bg.png` the cove's ground at the chest, `hero.png`, `chest.png`, copies of
  `burst.png` and `loot.png`) and writes the frames' places into the page.
- `frames.js`: runs the page's own script outside a browser and saves its picture at chosen moments. The look pictures
  in `out\chest-burst\` are made with it.

**Waiting for Robin's word** on the colours and the timings. Not in the game.

To publish it again after a change: `node concepts/chest-burst/bake.js`, then publish `chest-opening.html` with the
five pictures beside it.
