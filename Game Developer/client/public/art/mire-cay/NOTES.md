# mire-cay  (Leonard, AD, 2026-11-20)

**What it is:** the second island, a swamp, as a first drop: its ground, its props, its layout. 2400 by 3200 design
units, one place, walked without a break. A drowned island: mud and moss between nine pools of green water, crossed on
four plank bridges, under mangroves hung with moss. He lands in the south. Three grounds, south to north: the reed
banks, the mangrove wood, the old stones (a ruin's mossy floor), with the chest at the stones' far east end.

**Why.** Robin, 2026-11-20, in my chat: "Build all of them, and have the GD make a second island to go to with some of
the new mobs. That island needs to look different and have its own theme. A swamp maybe."

**How it differs from Crab Cay.** Crab Cay is yellow sand, bright grass and blue sea. This is mud, deep moss and teal
water. Its bright points are small: pink lotus on the lily pads, red and glowing toadstools, the lanterns along the
way. The three monsters that live here (the yellow toad, the violet viper, the blue lizard with its orange frill) are
each a colour the ground is not.

**What is mine until someone says otherwise:** the size, the three grounds, the levels 6 to 8, where he lands, the name
and the id. I asked Victor, GD for his numbers on 2026-11-20 and went on with these. A change of size or of levels is a
change of numbers in `tools\mire.js` and a new run.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `ground.png` | the whole ground as one picture, **half a pixel a design unit: draw it at four times its size** | 1200 by 1600 | 7.3 MB | 96 KB |
| `island.png`, `island.json` | 25 props: 17 of the swamp's own (`mangrove-a` to `c`, `deadtree`, `reeds-a` to `c`, `log`, `stump`, `shroom-red`, `shroom-glow`, `fern-a`, `fern-b`, `mossrock-a` to `c`, `lantern`) and Crab Cay's `barrel`, `crate`, `dock`, `boat`, `post` and the three `chest/` pictures | 1024 by 610 | 2.4 MB | 58 + 6 KB |
| `place.json` | the layout | | | 27 KB |

- **With everything on it:** the ground 7.3, the props 2.4, the three monsters 11.4 (toad 3.6, viper 3.7, lizard 4.1),
  his body 8, gear 2, the glass 3.1, loot 0.3, the chest's burst 0.9: **35.4 MB decoded.**
- **432 props** from 22 names, sorted by `y`; **185 things in the way** in `solid`, all circles.
- **He can walk** on 3.4 million square units. `node tools/mire.js` walks a grid from where he lands, the bridges
  counted as ground: where he wakes, the chest and every zone are reached; 0.09% of the free ground is cut off.

## How the game uses it

Copy the folder. It is Crab Cay's form (`out\crab-cay\NOTES.md`), with **one new thing**:

1. **`pools`**: a list of nine outlines, each the edge of a pool as straight points. **He cannot stand in a pool**, and
   the walk check keeps him 16 units from its edge, as from Crab Cay's `inlet`. So here he can stand where he is
   inside `walk` and in no pool, or inside a deck. There is no `inlet`, `grass`, `rock` or `flats` on this island.
2. **`decks`**: the four bridges, each with `pts` and `sea: true`. A bridge crosses a pool, so the deck must win over
   the pool. The pools are painted into the ground, lily pads and all; the bridges too.
3. **`home`**: the landing. `outline`, `box`, `wake` (1200, 2830). No stall and no people here yet; no monster inside.
4. `dock` 1200, 2990 and `arrive` 1200, 2930; two dock pieces in `props`. `chest` 1900, 610.
5. **`zones`**: `hop-toad` twice at level 6 on the banks, `plum-viper` twice at 7 in the wood, `frill-lizard` twice at
   8 on the stones. The banks' and the wood's boxes are half water: a monster must be kept off the pools as he is.
6. **`grounds`**: `banks`, `wood`, `stones`, each with `name`, `levels`, `box` and `outline`.
7. Every other prop gets the flat round shadow as on Crab Cay. No piece here carries its own shadow.
8. The sea round it is its own colour (`#1c7d86` where it is deepest), if the game paints sea beyond the picture.

## Open

- **The look is not judged.** Robin said "A swamp maybe"; the three screens went to him on 2026-11-20.
- **A landmark and a camp.** The old stones want broken pillars and one great thing (I would make a mossy stone toad);
  the landing wants a hut on stilts, a fire, a few people. None is made yet.
- The lanterns do not glow and the water does not move. Fireflies would be the chest's `mote`, tinted yellow.
- The viper's and the toad's zones are half water, so they hold fewer monsters than their boxes say.
- A boss, a second chest, keyed vaults: whatever the rules want on this island is not placed.

**Not tested:** not in the game and not on a phone. The `solid` circles are from the pieces' sizes, not walked by a
figure. The mangroves' roots are wide: a circle of 15 to 20 may feel small or large when he walks round one.

**Origin and licence:** all made here: the ground and the layout by `tools\mire.js`, the swamp's props by
`blender\swamp.py`, the rest Crab Cay's. Nothing from outside.

**Where to see it:** `look-screens.jpg` (three screens with the glass on: the reed banks with toads, the mangrove wood
with vipers, the old stones with lizards), `look.jpg` (the whole island at a quarter size), `look-map.jpg` (the same
with the grounds, the zones, the landing and the chest drawn on it).

**Making it again:** `node tools/blender.js blender/swamp.py -- work/mire/render`;
`node tools/merge-props.js work/mire-cay/render work/mire/render work/island/render work/crab-cay/town --not palm-a,palm-b,palm-c,bush-a,bush-b,bush-c,bush-d,bigleaf-a,bigleaf-b,rock-a,rock-b,rock-c,rock-d,rock-e,tuft-a,tuft-b,cabin-a,cabin-b,cabin-c,tower-thatch,rack,bunting`;
`node tools/packset.js island work/mire-cay/render work/mire-cay --tight`; `node tools/mire.js`; copy `ground.png`,
`place.json` and the atlas here; `python tools/shrink.py out/mire-cay`.
