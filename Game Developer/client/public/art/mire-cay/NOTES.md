# mire-cay  (Leonard, AD, 2026-11-20)

**What it is:** the second island, a swamp: its ground, its props, its layout, and since the second drop of 2026-11-20
the camp at its landing with a trader's stall. 2400 by 3200 design
units, one place, walked without a break. A drowned island: mud and moss between nine pools of green water, crossed on
four plank bridges, under mangroves hung with moss. He lands in the south, at the camp. Three grounds, south to north: the reed
banks, the mangrove wood, the old stones (a ruin's mossy floor), with the chest at the stones' far east end.

**Why.** Robin, 2026-11-20, in my chat: "Build all of them, and have the GD make a second island to go to with some of
the new mobs. That island needs to look different and have its own theme. A swamp maybe."

**How it differs from Crab Cay.** Crab Cay is yellow sand, bright grass and blue sea. This is mud, deep moss and teal
water. Its bright points are small: pink lotus on the lily pads, red and glowing toadstools, the lanterns along the
way. The three monsters that live here (the yellow toad, the violet viper, the blue lizard with its orange frill) are
each a colour the ground is not.

**Agreed with Victor, GD on 2026-11-20:** 2400 by 3200, three grounds, levels 6 to 8, a jetty in the south, the id
`mire-cay` and "Mire Cay" as a placeholder name. His one change: "the camp at the landing has a stall (a trader in a
boat or a hut, yours), and it is the safe part, as the town is". So the second drop has the camp: the trader's boat
drawn up on the bank under a patched red awning (the `stall`), the trader beside it, a reed hut on stilts, a fire.

**The third drop, 2026-11-20: the ways.** Robin, in my chat, of the swamp: "Looks good except the roads. They clip over
each other and doesnt look natural. I think you can get a lot of inapiration from my survival game project". The ways
were drawn as roads, each with a dark line round it, so one lay on the next where they met. Now they are trodden
earth, as the Survival game's village ways are: dabs of bare ground that wander a little, wider on the main way,
paler down the middle, a ragged rim with no line, moss creeping in, and a worn patch where ways meet. All of them are
laid together, so none lies on another. **Only `ground.png` changed** (and the look pictures); `paths` in
`place.json` is the same list, and the ways still run through its points.

**The fourth drop, 2026-11-20: the landmark.** Robin said the swamp "Looks good", so the old stones have their
landmark: a great stone toad on a plinth, moss on its head, its eyes still shining, looking south over the ruin's
pool, with eight broken pillars in a ring round the pool. New props: `idol`, `pillar-a`, `pillar-b`, `pillar-c`.
The atlas is 1024 by 810 with 32 props (3.2 MB); 436 props stand, 194 things are in the way (two boxes now: the stall
and the toad). `ground.png` did not change. The toad stands at 1212, 622; a few reeds round it are gone.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `ground.png` | the whole ground as one picture, **half a pixel a design unit: draw it at four times its size** | 1200 by 1600 | 7.3 MB | 96 KB |
| `island.png`, `island.json` | 28 props: 20 of the swamp's own (`mangrove-a` to `c`, `deadtree`, `reeds-a` to `c`, `log`, `stump`, `shroom-red`, `shroom-glow`, `fern-a`, `fern-b`, `mossrock-a` to `c`, `lantern`, and the camp's `stall`, `hut`, `fire`) and Crab Cay's `barrel`, `crate`, `dock`, `boat`, `post` and the three `chest/` pictures | 1024 by 682 | 2.7 MB | 67 + 7 KB |
| `folk.png`, `folk.json` | the trader: `folk/trader/<facing>/<nnnn>`, four frames of standing in `s`, `se`, `e`, the form of Crab Cay's people | 512 by 242 | 0.5 MB | 16 + 5 KB |
| `place.json` | the layout | | | 28 KB |

- **With everything on it:** the ground 7.3, the props 2.7, the trader 0.5, the three monsters 11.4 (toad 3.6, viper
  3.7, lizard 4.1), his body 8, gear 2, the glass 3.5, loot 0.3, the chest's burst and big chest 2: **38.4 MB decoded.**
- **435 props** from 25 names, sorted by `y`; **188 things in the way** in `solid`: 187 circles and one box (the stall).
- **He can walk** on 3.3 million square units. `node tools/mire.js` walks a grid from where he lands, the bridges
  counted as ground: where he wakes, the chest and every zone are reached; 0.09% of the free ground is cut off.

## How the game uses it

Copy the folder. It is Crab Cay's form (`out\crab-cay\NOTES.md`), with **one new thing**:

1. **`pools`**: a list of nine outlines, each the edge of a pool as straight points. **He cannot stand in a pool**, and
   the walk check keeps him 16 units from its edge, as from Crab Cay's `inlet`. So here he can stand where he is
   inside `walk` and in no pool, or inside a deck. There is no `inlet`, `grass`, `rock` or `flats` on this island.
2. **`decks`**: the four bridges, each with `pts` and `sea: true`. A bridge crosses a pool, so the deck must win over
   the pool. The pools are painted into the ground, lily pads and all; the bridges too.
3. **`home`**: the camp at the landing, the island's safe part. `outline`, `box`, `wake` (1200, 2830) and `stall`
   (1076, 2806: the trader's boat, with the whole bank before it). No monster inside. **`people`**: the `trader` beside
   his boat (1152, 2818), with a `note`. His pictures are `folk.json` here, in the form of Crab Cay's people.
4. `dock` 1200, 2990 and `arrive` 1200, 2930; two dock pieces in `props`. `chest` 1900, 610.
5. **`zones`**: `hop-toad` twice at level 6 on the banks, `plum-viper` twice at 7 in the wood, `frill-lizard` twice at
   8 on the stones. The banks' and the wood's boxes are half water: a monster must be kept off the pools as he is.
6. **`grounds`**: `banks`, `wood`, `stones`, each with `name`, `levels`, `box` and `outline`.
7. Every other prop gets the flat round shadow as on Crab Cay. No piece here carries its own shadow.
8. The sea round it is its own colour (`#1c7d86` where it is deepest), if the game paints sea beyond the picture.

## Open

- **The look:** Robin, 2026-11-20: "Looks good except the roads." The roads are redone (above) and shown to him again.
- The stone toad only stands there. If the rules want it to be something (a door, a boss's seat, a place to pray), say.
- The camp has one person. More of them, and a second hut, when tasks come here.
- The stall, the hut and the fire take the round shadow; the fire does not flicker.
- The lanterns do not glow and the water does not move. Fireflies would be the chest's `mote`, tinted yellow.
- The viper's and the toad's zones are half water, so they hold fewer monsters than their boxes say.
- A boss, a second chest, keyed vaults: whatever the rules want on this island is not placed.

**Not tested:** not in the game and not on a phone. The `solid` circles are from the pieces' sizes, not walked by a
figure. The mangroves' roots are wide: a circle of 15 to 20 may feel small or large when he walks round one.

**Origin and licence:** all made here: the ground and the layout by `tools\mire.js`, the swamp's props by
`blender\swamp.py`, the rest Crab Cay's. Nothing from outside.

**Where to see it:** `look-screens.jpg` (four screens with the glass on: the camp with the trader's boat, the reed
banks with toads, the mangrove wood with vipers, the old stones with lizards), `look.jpg` (the whole island at a quarter size), `look-map.jpg` (the same
with the grounds, the zones, the landing and the chest drawn on it).

**Making it again:** `node tools/blender.js blender/swamp.py -- work/mire/render`;
`node tools/blender.js blender/people.py -- work/mire-folk/render trader`, `node tools/pack.js folk work/mire-folk/render work/mire-cay --tight`;
`node tools/merge-props.js work/mire-cay/render work/mire/render work/island/render work/crab-cay/town --not palm-a,palm-b,palm-c,bush-a,bush-b,bush-c,bush-d,bigleaf-a,bigleaf-b,rock-a,rock-b,rock-c,rock-d,rock-e,tuft-a,tuft-b,cabin-a,cabin-b,cabin-c,tower-thatch,rack,bunting`;
`node tools/packset.js island work/mire-cay/render work/mire-cay --tight`; `node tools/mire.js`; copy `ground.png`,
`place.json` and the two atlases here; `python tools/shrink.py out/mire-cay`.
