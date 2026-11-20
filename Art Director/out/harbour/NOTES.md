# harbour  (Leonard, AD, 2026-11-20)

**What it is:** the harbour town: its ground, its props and the four people who stand in it. 900 by 1100 design units:
a quay with a dock at the south, a cobbled square with three houses, a market stall and a well, grass and palms behind.

**What changed and why:** new. The layout and the people are mine, from Victor, GD's outline of the town.

**The numbers:**
- `ground.png`: the whole ground as one picture, 900 by 1100, **one pixel a design unit: draw it at double size**
  (41 KB, 4 MB decoded).
- `harbour.png` and `harbour.json`: 13 props at two pixels a unit, 1024 by 1024, 32 KB, 4 MB decoded: `house-a`,
  `house-b`, `house-c`, `stall`, `well`, `sign`, `lamp`, `barrel`, `crate`, `dock`, `boat`, `palm-b`, `bush-b`. Each has
  its origin where it meets the ground (a house: the middle of its footprint).
- `folk.png` and `folk.json`: the people, 1024 by 512, 72 KB, 2 MB decoded. One atlas in the figures' form, where **the
  action is who it is**: `shopkeeper` (bald, a moustache, a white apron), `master` (the harbour master: a tricorn, a grey
  beard, a navy coat), `fisher` (a long pink dress, a yellow headscarf, a ginger plait), `sailor` (a blue cap, white
  whiskers, a red neckerchief). Each stands and breathes: 4 frames at 180 ms, looped, in `s`, `se` and `e` (flip for
  `sw` and `w`). Frames are `folk/<who>/<facing>/<nnnn>`. They are the Warrior's body with their own clothes, 54 tall.
- `place.json`: as the island's, with `square` (the cobbles' outline) and `people`: who stands where and which way
  (`who`, `x`, `y`, `facing`, `note`). The shopkeeper stands behind his stall. In `solid` the houses and the stall are
  boxes (`x`, `y`, `w`, `h`), the rest circles.

**How the game uses it:** copy the folder. As the island: the ground at double size, the props and the people sorted
with the hero by `y`, a flat shadow under each. Put a `mark/quest` or `mark/done` from `out\glass\` over the head of
whoever has a task (the `head` point of each frame says where the head is).

**Open:** who gives which task is the game's. The people do not walk or talk with their hands; say if they should. The
houses have no insides. The names (`master`, `fisher`, `sailor`) are mine.

**Not tested:** not in the game. The `solid` boxes are placed by eye.

**Origin and licence:** made here by `tools\ground.js`, `blender\props.py` and `blender\people.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the town whole with its people), `look-folk.jpg`.
