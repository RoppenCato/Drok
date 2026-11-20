# island  (Leonard, AD, 2026-11-20)

**What it is:** the first island's ground, its props and the chest. 1400 by 2400 design units: a beach with a small
dock at the south, grass and palms in the middle, a rocky cove at the north with an inlet of the sea.

**What changed and why:** new. The layout is mine, from Victor, GD's outline of the place.

**The numbers:**
- `ground.png`: the whole ground as one picture, 1400 by 2400, **one pixel a design unit: draw it at double size**
  (67 KB, 13.4 MB decoded). Flat colour with no line takes the doubling well, and it costs a quarter of a 2x picture.
- `island.png` and `island.json`: 23 props at two pixels a unit, 1024 by 1024, 52 KB, 4 MB decoded: `palm-a` to
  `palm-c`, `bush-a` to `bush-d`, `bigleaf-a`, `bigleaf-b`, `rock-a` to `rock-e`, `tuft-a`, `tuft-b`, `barrel`, `crate`,
  `dock`, `boat`, and the chest as `chest/closed`, `chest/opening`, `chest/open` (about 34 across). Each has its origin
  where it meets the ground.
- `place.json`: `size`; `props` (117 of them: `name`, `x`, `y` in design units, already sorted by `y`); `solid` (75
  circles `x`, `y`, `r` to walk round: trunks, rocks, barrels); `land`, `grass`, `rock`, `inlet` (the outlines of each
  ground as corner points of a smooth curve: `land` is the shore, outside it is sea); `paths`; `dock` (where the dock
  meets the sand), `arrive` (where he steps ashore), `chest`; `zones` (a box for each monster: sand crabs on the south
  beach, gulls over the grass, coconut crabs in the cove).

**How the game uses it:** copy the folder. Draw `ground.png` at (0, 0) scaled by two under everything. Draw each prop
with its origin at its `x`, `y`, sorted with the figures by `y`. Lay a flat shadow under each (the look uses an ellipse
of `#5b4a82` at a quarter strength, about a third of the prop's width). The dock is three `dock` pieces end to end
running south from `dock`; it is in `props` already. Swap `chest/closed` for `chest/opening` (about 150 ms) and then
`chest/open`. Use what you like of `place.json` and ignore the rest: your own map data wins.

**Open:** the layout, the zones and where the chest stands are suggestions. The sea does not move; a simple shimmer or a
foam line that breathes would be the game's, and I can make frames for it. The grass is plain where no props stand.

**Not tested:** not in the game. The `solid` circles are placed by eye from the props' sizes, not walked.

**Origin and licence:** made here by `tools\ground.js` and `blender\props.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the island whole, at half size), `look-props.jpg`; `out\scene\beach.png`.
