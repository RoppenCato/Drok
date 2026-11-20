# The pirate town: three ways  (Leonard, AD, 2026-11-20)

Three real and different stills for Robin to pick from (`.claude\skills\three-concepts`), asked by Victor, GD on
2026-11-20. Robin, in Victor, GD's chat: "Make the starter island a pirate town, and the other part of the island
beginner friendly with low level mobs." The first town on the island was the old harbour moved there as it stood; I
said it was small and offered a real one. Robin: "Yeah do an updated pirate town suggested".

Each town stands at the landing of Crab Cay and has what the game needs: the square where he wakes, the stall, the
dock, four people who can give tasks later, and ways out to the beach on both sides and north to the grove. Its outline
is `home`. Each is laid out on the island itself and its ground is painted into the island's ground at half a pixel a
unit, so the stills show what the game would show.

| No. | The idea | New pieces | What it costs |
| --- | --- | --- | --- |
| 1 Port | today's town, grown: seven plaster houses with coloured roofs round a cobbled square, a tavern, a lookout tower, ropes of flags, a cannon | tavern, three houses, tower, flags, cannon: 7 | the least new. The props' atlas grows from 1024 by 1024 to 2048 by 1024: 4 MB more |
| 2 Wreck | built of ships on the sand: an upturned hull for a tavern, a stern for a house, a mast with its sail for a lookout, a market under a sail, old deck planks to walk on | hull house, stern house, mast, sail market, anchor, cannon, post, flags: 8 | the same 4 MB. The old houses, stall and well are not needed and can leave the atlas |
| 3 Stilts | on a deck over a little bay: thatched huts, a thatched lookout, a fish rack, boats at the posts | three huts, tower, rack, post, flags: 7 | the same 4 MB, and two changes to the island: the shore is cut in at the landing, and the deck must be added to where he can walk |

**What I would pick (mine; Robin decides):** 2. A town built of ships says pirate at one glance, and no other town
looks like it. 1 is the safe one.

**Waiting for Robin's pick.** Sent into my chat on 2026-11-20. The page for his phone:
https://claude.ai/artifact/DF8E5yUvJ4ESqXuBjnN3LQ . Nothing is built for the game from any of them until he
has picked: the game keeps today's town.

## The files

- `1.png`, `2.png`, `3.png`: the stills, 412 by 915 at double size, the glass on, him in the square. `N-above.png`: the
  whole town from above at one pixel a unit. `pick.jpg`, `above.jpg`: the three side by side.
- `three-towns.html`: the template's pick page, filled; published with the pictures beside it.
- `build.py`: the 18 new models, on `blender\drok.py` and `blender\props.py`.
- `town.js`: the three layouts. It hands each to `tools\isle.js`, which paints the island with that town and writes
  `work\crab-cay-1` to `-3`; then it draws the views from above.

## Making them again

- `node tools/blender.js concepts/town/build.py -- work/town/render` (the models, about a minute).
- `node tools/merge-props.js work/town/all work/crab-cay/render work/town/render`, then
  `node tools/packset.js island work/town/all work/town/atlas` (one atlas of all 48 props).
- `node concepts/town/town.js` (the three islands and the views from above).
- `node tools/scene.js work/town/1.png --place crab-cay-1 --at 1300,3610 --pile bare --no-mobs --no-loot`; town 2 at
  `1335,3650`, town 3 at `1390,3870`.

**Not tested:** stills only, one screen of each town. Not in the game, not on a phone. In town 3 he stands on a deck
over the sea, which the island's walkable outline does not hold yet, so my walk check fails there; that is part of what
it costs. The people are the four of the old harbour.

**Origin and licence:** all made here. Nothing from outside. No other game's town was copied; the ideas (a port, a town
of wrecks, a town on stilts) are old ones.
