# crab-cay  (Leonard, AD, 2026-11-20)

**What it is:** Crab Cay grown big, the starter island, with the pirate town Robin picked: a town on stilts. 2800 by
4200 design units, one place, walked without a break. He lands in the south, on the town's deck, which stands in a
little bay. The beach lies all round the island, with tide flats on its east side. The grove fills the middle. The cove
is the rock across the north, with its pool in the west and the chest at its far east end.

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "Make the starter island a pirate town, and the other part of the
island beginner friendly with low level mobs." Of my offer of a real town: "Yeah do an updated pirate town suggested".
Of the three shown (`concepts\town\`), in my chat: "3, but the buildings need to look nicer and have some depth to
them. Theres also no contrast to the floor so it all kinda melts together." Of the changed still: "Yes".

**What changed since the last drop of this folder (commit c179620, the old harbour at the landing):**
- The town is new and stands further south: on a deck of planks in a bay.
- **The shore is cut in at the landing**, so `land` and `walk` differ there.
- **`decks` is new:** four outlines of planks he can stand on. Two reach over the water.
- **The dock** starts at the deck's foot, 1400, 4030, and is two pieces long (the world ends at 4200).
- **The props' atlas is new:** 33 pieces, 2048 by 896. The houses and the well are gone from it; three huts, a
  lookout, a fish rack, a post and a rope of flags are in. Six pieces carry their own shadow.
- `square` is gone (no cobbles). `home`, `people`, `arrive`, where he wakes and the stall have new places.
- The rest of the island (the grove, the cove, the flats, the chest) is as it was.
- **`zones` names the monsters that live there now** (2026-11-20, as Victor, GD placed them): `sand-crab` twice at
  level 1 on the beach, `wharf-rat` at 2 on the tide flats, `bristle-piglet` at 3 and `palm-monkey` at 4 in the grove,
  `coconut-crab` at 5 in the cove. The boxes are the ones there were; `reef-gull` is gone.

**The ways, 2026-11-21.** Robin said of the swamp's roads "They clip over each other and doesnt look natural"; asked
whether Crab Cay's should be redone the same way, he said "Yeah". They were drawn roads with a line round them. Now
they are trodden earth, as on Mire Cay: close dabs that wander a little, paler down the middle, a ragged rim with no
line, the grass, sand or rock creeping in, a worn patch where ways meet or end. The town's way and the island's are
one track. **Only `ground.png` changed** (93 KB) and the look pictures; `look-ways.jpg` is three spots before and
now. `paths` in `place.json` is the same list and the ways still run through its points, wandering up to 13 units
to either side between them.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `ground.png` | the whole ground as one picture, **half a pixel a design unit: draw it at four times its size** | 1400 by 2100 | 11.8 MB | 85 KB |
| `island.png`, `island.json` | 33 props: the small island's 23; `stall`, `sign`, `lamp`; and the town's `cabin-a`, `cabin-b`, `cabin-c` (the tavern), `tower-thatch`, `rack`, `post`, `bunting` | 2048 by 896 | 7 MB | 127 + 8 KB |
| `folk.png`, `folk.json` | the four people, unchanged | 1024 by 512 | 2 MB | 72 + 21 KB |
| `place.json` | the layout | | | 29 KB |

- **With everything on it, since the five monsters (2026-11-20):** the ground 11.8, the props 7, the people 2, the
  monsters 21.9 (crab 4, rat 2.2, piglet 3.4, monkey 4.3, coconut crab 8), his body 8, gear 2, the glass 3.5, loot
  0.3, the chest's light 0.9 and the big chest 1.1: **58.5 MB decoded, 2.5 over the 56 Victor, GD set.** The big
  chest and the glass's four new discs are what was not counted then. Before the five monsters it was:
- the ground 11.8, the props 7, the people 2, the three monsters 16, his body 8, gear 2,
  the glass 3.1, loot 0.3: **50.2 MB decoded**, under the 52 you set. The hero's own pictures for his window
  (`out\hero-sheet`) are 1.6 MB on top of that when they are loaded.
- The atlases are not a power of two tall any more (`--tight`): the ground never was, and it saves 2.6 MB over three
  atlases. Say if the game needs powers of two; it is one flag.
- **436 props** from 31 names, sorted by `y`; **327 things in the way** in `solid`: 322 circles and 5 boxes (the three
  huts, the stall, the fish rack).
- **He can walk** on 7.2 million square units. `node tools/isle.js crab-cay` walks a grid from where he lands, counting
  the decks as ground: where he wakes, the stall, the chest and every zone are reached; 0.03% of the free ground is cut
  off (pockets between stones).

## How the game uses it

Copy the folder. What is new for the game, beside what it already does with this island:

1. **`decks`**: a list; each has `pts`, four corner points joined by straight lines, and `sea: true` where it reaches
   over water. **He can stand where he is inside `walk` or inside a deck.** The big one is the town's floor (1110 to
   1690 across, 3700 to 4032 down, a little wider at its foot). One runs north from it as a walk of planks to 3440.
   Two are jetties to the beach, west and east, at 3836 to 3893. The decks are painted into the ground.
2. **A piece with `shade: true`** in `island.json`'s `items` carries its shadow in its own picture: **draw no round
   shadow under it.** They are the three huts, the lookout, the stall and the fish rack. Every other prop gets its flat
   shadow as before.
3. **`home`**: `outline`, `box` (909, 3320, 983 by 767), `wake` (1400, 3900: the middle of the deck) and `stall`
   (1280, 3945: 87 units of deck before it, so a thumb has room). No monster inside the outline. The two level 1 crab zones lie west and east of it and are unchanged.
4. **`people`**: the shopkeeper beside his stall (1346, 3949: behind it the awning hid him), the harbour master
   (1470, 3900), the fisher behind her fish rack (1452, 3976), the sailor at the way north (1400, 3775). Each has a
   `note`. Nobody stands on `arrive`.
5. `dock` is 1400, 4030 and `arrive` 1400, 3976: he steps onto the deck. The two dock pieces are in `props`.
6. `walk` is the dry sand as before, now with the bay in it. `ground.px` is 0.5 as before.

`tools\scene.js --place crab-cay` in the studio draws a screen from these files the way written here.
`look-screens.jpg` is made by it.

## Mine, for Victor, GD to know

- **Depth and contrast are Robin's words; how is mine.** Each hut stands on its own dark platform with steps and is
  turned so two walls show; a porch under the roof's overhang; thatch in two tiers. The walls are painted (cream, teal,
  coral) and the deck is pale and weathered, so nothing melts into it.
- **The tavern is `cabin-c`** (the big cream one with the board and the mug). Nothing happens there yet.
- **The level 1 crabs are reached over the two jetties,** the grove over the walk north. So a new player leaves town by
  a plank way whichever way he goes: the town has an edge.
- **The stall, the sign and the lamps are the old harbour's.** They fit; say if they should be redrawn for this town.
  The two lamps stand either side of the walk north (1346 and 1454, 3600), not at the dock's foot: there one hid the
  fisher.

## Open

- New props for a ground this size: driftwood, shells and a starfish for the beach, flowers and a fallen trunk for the
  grove. The beach is plain.
- The sea does not move. Under a deck on stilts it would be worth a shimmer first.
- The people are the old harbour's four. More of them, and people who walk, when tasks come.
- The wreck on a reef with its hermit crab and its octopus waits for the second island. The two towns not picked (a
  port, a town built of ships) are in `concepts\town\` if another island wants one.

**Not tested:** not on a phone. The town is in the game (Victor, GD's commit 55c9ca8) and I saw it in the test copy
drawing as these pictures; the places changed after that (the stall, the people, the lamps) are seen in my own
drawing of the screen only. The half-size ground was judged on this PC at a phone's sharpness.
The `solid` shapes are from the pieces' sizes, as before. The zones' boxes reach over a little water and rock in
places; your rules already keep a monster off ground it cannot stand on.

**Origin and licence:** all made here. The ground, the layout and the walk check by `tools\isle.js`; the town's pieces
by `blender\town.py` from `concepts\town\build.py`, shaded by `tools\shade.js`; the rest are the small island's and the
old harbour's props. Nothing from outside.

**Where to see it:** `look-screens.jpg` (four screens with the glass on: the town on its deck, a jetty to the west
beach, the walk north out of town, the grove), `look.jpg` (the whole island with its props, at a quarter size),
`look-map.jpg` (the same with the grounds, the zones, the town and the chest drawn on it).

**Making it again:** `node tools/blender.js blender/town.py -- work/crab-cay/town`;
`node tools/merge-props.js work/crab-cay/render work/crab-cay/town work/island/render work/harbour/render --not house-a,house-b,house-c,well`;
`node tools/shade.js work/crab-cay/render`; `node tools/packset.js island work/crab-cay/render work/crab-cay/atlas --tight`;
copy the atlas into `work\crab-cay\`; `node tools/isle.js crab-cay`; copy `ground.png`, `place.json` and the atlas here;
`python tools/shrink.py out/crab-cay`.
