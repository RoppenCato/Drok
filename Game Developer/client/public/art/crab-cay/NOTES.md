# crab-cay  (Leonard, AD, 2026-11-20)

**What it is:** Crab Cay grown big, the starter island: 2800 by 4200 design units, six times the small island, with the
pirate town on it. One place, walked without a break. He lands in the south, in the town. The beach lies all round the
island, with tide flats on its east side. The grove fills the middle. The cove is the rock across the north, with its
pool in the west and the chest at its far east end. It takes the place of `out\island` and of `out\harbour`; both stay
as they are until you switch.

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think i like pirate more. Lets expand on pirate". His pick of
three ways, "3": "Both. Big islands with several biomes each, and the chart to sail between them." Then: "Make the
starter island a pirate town, and the other part of the island beginner friendly with low level mobs." Asked by
Victor, GD the same day. The layout and every look are mine; Robin has not seen it.

**What changed since the first drop of this folder (commit 7282e71, the same day):** the town is on the island; the
reef and the channel are gone from the shape (a harder ground is for another island); the cove now runs across the
whole north and the chest stands at its far east end; the east beach has tide pools; all the props and the town's
pieces are in one atlas.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `ground.png` | the whole ground as one picture, **half a pixel a design unit: draw it at four times its size** | 1400 by 2100 | 11.8 MB | 93 KB |
| `island.png`, `island.json` | 30 props under today's names: the small island's 23 and the town's 7 (`house-a`, `house-b`, `house-c`, `stall`, `well`, `sign`, `lamp`) | 1024 by 1024 | 4 MB | 67 + 7 KB |
| `folk.png`, `folk.json` | the town's four people, unchanged from `out\harbour` | 1024 by 512 | 2 MB | 72 + 21 KB |
| `place.json` | the layout | | | 28 KB |

- **With everything on it:** the ground 11.8, the props 4, the people 2, the three monsters 16, his body 8, gear 2,
  glass 2, loot 0.3: about 46 MB decoded, under the 48 MB set for a place. The harbour as its own place (10 MB) goes.
- **432 props** from 28 names, sorted by `y`; **292 things in the way** in `solid`: 288 circles and the four boxes of
  the houses and the stall.
- **He can walk** on 7.3 million square units. `node tools/isle.js crab-cay` walks a grid from where he lands: where he
  wakes, the stall, the chest and every zone are reached; 0.03% of the free ground is cut off (pockets between stones).

## How the game uses it

Copy the folder. It is the small island's form with these changes:

1. `ground.px` is 0.5: draw `ground.png` at (0, 0) at **four** times its size. Nothing else in the drawing changes:
   the props with their origin at `x`, `y`, sorted with the figures; a flat shadow under each, as today.
2. **`home`** is the town: `outline` (corner points of a smooth curve, like `land`), a `box` round it, `wake` (1400,
   3658: in the square below the well, the game's own spot in the harbour) and `stall` (1250, 3678). No monster inside
   the outline. The zones do not reach into it.
3. **`people`** as in the harbour's layout: `who`, `x`, `y`, `facing`. They stand where they stood, 950 further east
   and 3038 further south. `square` is the cobbles' outline.
4. **`walk`** is the outline of the dry sand, the shore drawn in by 24 units, as 168 corner points joined by straight
   lines. Use it for where he can stand, in place of scaling `land` toward its middle. `land` is still the shore.
5. **`zones`** has several boxes for a kind, and each box has a fifth number, its level: `[x, y, w, h, level]`. Sand
   crabs level 1 on the beach either side of the town and level 2 on the tide flats in the east; gulls level 3 in the
   south of the grove and level 4 in its north; coconut crabs level 5 in the cove. Suggestions, as before.
6. **`grounds`**: for each ground its `id`, `name`, `levels`, a `box` and its `outline`. `beach`, `grove`, `cove`
   carry your names. The beach is the land where the other two are not, so test them first.
7. `flats` is the outline of the tide flats, for the painter only. `inlet` is the cove's pool; he cannot stand in it.
8. `paths` holds the island's three ways and the town's two. They are painted into the ground.

`dock` is where the dock meets the sand (1400, 3972), `arrive` where he steps ashore (1400, 3918). The chest stands at
2275, 850, at the end of a side way that leaves the cove's path and runs east: the far end of the island from the town.

`tools\scene.js --place crab-cay` in the studio draws a screen from these files the way written here, the people
too. `look-screens.jpg` is made by it.

## Mine, for Victor, GD to know

- **The town is the harbour as it stood,** moved so its dock lies on the island's dock: three houses, the stall, the
  well, two lamps, a sign, barrels, crates, a boat, palms, four people. It is small on an island this size. That is the
  first drop, so Robin sees the island whole today. A real pirate town is big work, the first place of the game: more
  houses, a tavern, a lookout, flags. Three stills for him first; say when.
- **The tide flats are beach,** not a ground of their own: the level 2 crabs live among the pools, so the two levels
  look different without a fourth ground.
- **The coconut crab stays at the far end,** as you asked: the cove is the whole north, 2300 units from where he wakes.
- **The cobbles are drawn a little heavier** than in the harbour's ground, so they hold at half a pixel a unit.

## Open

- New props for a ground this size: driftwood, shells and a starfish for the beach, flowers and a fallen trunk for the
  grove. The 23 of today carry it, but the beach is plain.
- The sea does not move, as before.
- The paths are painted into the ground. If the ways change, the picture is painted again: one command.
- The wreck on a reef with its hermit crab and its octopus, proposed for a fourth ground, waits for the second island.

**Not tested:** not in the game and not on a phone. The half-size ground was judged on this PC at a phone's sharpness,
not on a phone's screen. The `solid` circles are from the props' sizes, as before. The zones' boxes reach over a little
water and rock in places; your rules already keep a monster off ground it cannot stand on.

**Origin and licence:** all made here, by `tools\isle.js` (the ground, the layout, the walk check) in the hand of
`tools\ground.js`. The props are `out\island`'s and `out\harbour`'s, packed again into one atlas from the same renders;
the people are `out\harbour`'s file. Nothing from outside.

**Where to see it:** `look-screens.jpg` (four screens with the glass on: the town, the tide flats, the grove, the cove
with the chest), `look.jpg` (the whole island with its props, at a quarter size), `look-map.jpg` (the same with the
grounds, the zones, the town and the chest drawn on it).

**Making it again:** `node tools/merge-props.js` and `node tools/packset.js island work/crab-cay/render work/crab-cay/atlas`
(the one atlas), `node tools/isle.js crab-cay` (the ground, the layout, the looks, the walk check); copy `ground.png`,
`place.json` and the atlas here and run `python tools/shrink.py out/crab-cay`.
