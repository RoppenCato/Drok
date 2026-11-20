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

**Robin picked 3, with changes** (in my chat, 2026-11-20, by choice box, in his own words): "3, but the buildings need to
look nicer and have some depth to them. Theres also no contrast to the floor so it all kinda melts together."

What I changed for that, shown to him the same day as one still (`3-changed.jpg`), before any kit is built:

- **Depth:** each hut stands on its own dark platform with steps, and is turned so two of its walls show. A porch
  under the roof's overhang with posts and a rail; the thatch in two tiers with crossed poles at the ridge; a door in a
  frame, shutters, floats hung on the wall, a lantern. The tavern has its board with a mug.
- **Contrast:** the walls are painted (cream, teal, coral) where they were bare wood on a wooden floor. The deck is
  paler and greyer, weathered, every third board a shade lighter. Every building throws the outline of its foot on the
  floor as a shadow (`bake.js`).

**Waiting for his word on the changed still.** The page of the three as first shown:
https://claude.ai/artifact/DF8E5yUvJ4ESqXuBjnN3LQ . Nothing is built for the game until he has said yes: the game keeps
today's town.

## The files

- `1.png`, `2.png`, `3.png`: the stills, 412 by 915 at double size, the glass on, him in the square. `N-above.png`: the
  whole town from above at one pixel a unit. `pick.jpg`, `above.jpg`: the three side by side.
- `three-towns.html`: the template's pick page, filled; published with the pictures beside it.
- `3-changed.png`, `3-changed-above.png`, `3-changed.jpg`: town 3 after Robin's two changes.
- `build.py`: the models (18 at first; three new huts, `cabin-a` to `-c`, for the changed town 3), on `blender\drok.py`
  and `blender\props.py`. `bake.js`: a shadow under each building, in its own picture.
- `town.js`: the three layouts. It hands each to `tools\isle.js`, which paints the island with that town and writes
  `work\crab-cay-1` to `-3`; then it draws the views from above.

## Making them again

- `node tools/blender.js concepts/town/build.py -- work/town/render` (the models, about a minute).
- `node concepts/town/bake.js`, `node tools/merge-props.js work/town/all work/town/baked work/crab-cay/render`, then
  `node tools/packset.js island work/town/all work/town/atlas` (one atlas of all the props).
- `node concepts/town/town.js` (the three islands and the views from above).
- `node tools/scene.js work/town/1.png --place crab-cay-1 --at 1300,3610 --pile bare --no-mobs --no-loot`; town 2 at
  `1335,3650`, town 3 at `1390,3870`.

**Not tested:** stills only, one screen of each town. Not in the game, not on a phone. In town 3 he stands on a deck
over the sea, which the island's walkable outline does not hold yet, so my walk check fails there; that is part of what
it costs. The people are the four of the old harbour.

**Origin and licence:** all made here. Nothing from outside. No other game's town was copied; the ideas (a port, a town
of wrecks, a town on stilts) are old ones.
