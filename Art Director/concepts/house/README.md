# A shrunk person in a house: three sizes  (Leonard, AD, 2026-11-20)

Three real and different stills for Robin to pick from (`.claude\skills\three-concepts`), asked by Victor, GD on
2026-11-20 from Robin's words of the same day: "A shrunk person and enemies are insects", "inside a house", an open
world of biomes, and "Does it really work well im 2D tho? Scale can be tricky."

The same corner of the kitchen floor three times; only the hero's size in the house changes: 1 thumb size (5 cm), 2
bean size (1.5 cm), 3 ant size (0.6 cm). What each shows, the numbers, what I would pick and what is open are in the
delivery's notes: `out\house-concepts\NOTES.md`.

Sent into the chat on 2026-11-20. The page for his phone: https://claude.ai/artifact/LxsNeaPvVNjVtG2g1LYo6B
**Waiting for Robin's pick.** Nothing is built from any of them until he has picked.

## The files

- `1.png`, `2.png`, `3.png`: the stills, 412 by 915 at double size. `N-close.png`: the hero and the insect he fights
  at three times. `3-big.png`: size 3 when a cockroach comes. `pick.jpg`, `close.jpg`: the three side by side.
- `three-sizes.html`: the template's pick page, filled; published with the pictures beside it.
- `build.py`: the models (ant, ladybird, cockroach, spider; coin, dice, toy brick, marble, pencil, button, bottle cap,
  cereal ring, pea, crumbs, macaroni, a pet's bowl, a table leg, a chair leg; his gear by size), on `blender\drok.py`.
- `still.js`: the floor (tiles, the rug with its fringe, the shadows), where everything stands, the glass.

## Making them again

- `node tools/blender.js concepts/house/build.py -- work/house` renders every model into `work\house\<size>\` (about
  two minutes). A size and names can be given: `-- work/house bean ant-ne,coin`.
- `node concepts/house/still.js thumb concepts/house/1.png --close concepts/house/1-close.png`, the same for `bean`
  (2) and `ant` (3); `node concepts/house/still.js antbig` writes `3-big.png`.
- `node tools/concepts.js concepts/house/pick.jpg --labels "..." --height 915 concepts/house/1.png concepts/house/2.png concepts/house/3.png`.
