# crab-cay  (Leonard, AD, 2026-11-20)

**What it is:** Crab Cay grown big: 2800 by 4200 design units, six times the small island, with four grounds walked
without a break. The beach lies all round, he lands at a dock in the south. The grove fills the middle. The cove is the
rock in the north west, with its pool and the chest. The reef is the north east, beyond a channel of the sea: its
ground is painted, but nothing lives there yet. It takes the place of `out\island`, which stays as it is until you
switch.

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think i like pirate more. Lets expand on pirate". Then his pick of
three ways, "3": "Both. Big islands with several biomes each, and the chart to sail between them." Asked by Victor, GD
the same day. The layout and every look are mine; Robin has not seen it.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `ground.png` | the whole ground as one picture, **half a pixel a design unit: draw it at four times its size** | 1400 by 2100 | 11.8 MB | 86 KB |
| `island.png`, `island.json` | the 23 props of the small island, unchanged, under the same names | 1024 by 1024 | 4 MB | 54 + 6 KB |
| `place.json` | the layout | | | 29 KB |

- **Why one picture after all.** You said the ground cannot be one painting: at one pixel a unit it is 47 MB. At half
  a pixel it is 11.8 MB, less than the small island's ground (13.4 MB). I tried it first: the small island's ground at
  one pixel, at two thirds and at a half, each shown as a phone shows it, with a palm and the hero sharp on top. At a
  half the foam line and the grass's edge are a hair softer and nothing else changes, because the ground is flat colour
  with no line: it has no small detail to lose. A kit of patterns and strips suits straight edges; an island's shores
  are curves. The richness is the props, as before.
- **With everything on it:** the ground 11.8, the props 4, the three monsters 16, his body 8, gear 2, glass 2, loot
  0.3: about 44 MB decoded, under the 48 MB set for a place.
- **444 props** from 21 names, sorted by `y`; **313 circles** in `solid`. The grove is as thick as the small island's:
  about one green thing in 9000 square units, in clumps with clearings between.
- **He can walk** on 7.1 million square units. `node tools/isle.js crab-cay` walks a grid from where he lands: the
  chest and every zone are reached; 0.07% of the free ground is cut off (pockets between stones).

## How the game uses it

Copy the folder. It is the small island's form with five changes:

1. `ground.px` is 0.5: draw `ground.png` at (0, 0) at **four** times its size. Nothing else in the drawing changes:
   the props with their origin at `x`, `y`, sorted with the figures; a flat shadow under each, as today.
2. **`walk`** is new: the outline of the dry sand, the shore drawn in by 24 units, as 168 corner points joined by
   straight lines. Use it for where he can stand. Your tool draws `land` in by scaling it toward its middle; on this
   island that would be wrong at the channel between the cove and the reef, where the shore turns back on itself.
   `land` is still there: the shore itself, as corner points of the smooth curve.
3. **`zones`** has several boxes for a kind, and each box has a fifth number, its level: `[x, y, w, h, level]`. Sand
   crabs level 1 round the landing and level 2 on the two arms of the beach; gulls level 3 in the south of the grove
   and level 4 in its north; coconut crabs level 5 in the cove. Suggestions, as before.
4. **`grounds`** is new: for each ground its `id`, `name`, `levels`, a `box` round it and its `outline` (corner points
   of a smooth curve, like `land`). `beach`, `grove`, `cove` carry your names. The beach is the land where the others
   are not, so test the others first. `reef` has `later: true`: no zone, nothing to fight.
5. `reef` is new beside `grass` and `rock`: the reef's outline. `inlet` is the cove's pool; he cannot stand in it.

`dock` is where the dock meets the sand (1400, 3972), `arrive` where he steps ashore (1400, 3900). The chest stands at
470, 705, at the end of the side way that leaves the cove's path and runs west round the pool.

`tools\scene.js --place crab-cay` in the studio draws a screen from these files the way written here.
`look-screens.jpg` is made by it.

## The fourth ground, my proposal (Robin decides)

**The reef**, levels 6 to 8: flats of wet sand with tide pools and coral, and on them **a wreck**: the broken hull of a
small ship, its ribs, a mast lying across a pool, barrels and a torn sail. He reaches it over the sand from the grove's
north east corner. Two monsters to go with it, neither a crab with a new coat:

- **a hermit crab in a tankard**, level 6: it walks in a lost beer mug, pulls in when hit and cannot be hurt for a
  moment, then lunges. A fight with a rhythm of its own.
- **an octopus in a barrel**, level 7 to 8: it sits in a barrel and looks like one. It spits ink from afar and slaps
  with an arm when he is close; a tell before each.

I judge the wreck and the octopus big enough for pictures before they are built: stills at the judging size for Robin
when you say the reef is next. The other two you named would also work: a mangrove (mudskippers) and a waterfall pool
(monkeys). The reef is the most pirate of the three.

## Open

- The names of the reef and of what lives there.
- New props for a ground this size: driftwood, shells and a starfish for the beach, flowers and a fallen trunk for the
  grove, a tide pool as a prop. The 23 of today carry it, but the beach is plain. Say when and I make a second atlas.
- The sea does not move, as before.
- The paths are painted into the ground. If the ways change, the picture is painted again: one command.

**Not tested:** not in the game and not on a phone. The half-size ground was judged on this PC at a phone's sharpness,
not on a phone's screen. The `solid` circles are from the props' sizes, as before. The zones' boxes reach over a little
water and rock in places; your rules already keep a monster off ground it cannot stand on.

**Origin and licence:** all made here, by `tools\isle.js` (the ground, the layout, the walk check) in the hand of
`tools\ground.js`; the props are `out\island`'s. Nothing from outside.

**Where to see it:** `look-screens.jpg` (four screens with the glass on), `look.jpg` (the whole island with its props,
at a quarter size), `look-map.jpg` (the same with the grounds, the zones, the landing and the chest drawn on it).

**Making it again:** `node tools/isle.js crab-cay` paints the ground, places the props and writes `work\crab-cay\`;
copy `ground.png` and `place.json` here and run `python tools/shrink.py out/crab-cay`.
