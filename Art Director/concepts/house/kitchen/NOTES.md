# kitchen  (Leonard, AD, 2026-11-20)

**Not for the game.** Robin, 2026-11-20, after seeing the house on stand-in shapes: "I think i like pirate more. Lets
expand on pirate". This folder was delivered into `out\` that afternoon and moved here the same evening. It is kept as a
concept and as a worked example of a world made as a kit. What follows is as it was written for the delivery.

**What it is:** the house's first world: a corner of the kitchen, 4320 by 5796 design units. Tiles in the sun, a rug on
them, the dark under a table with two chairs, a white skirting board all round. With it: its three floors as pictures that
repeat, the flat pieces that lie on them, 30 kinds of things in 39 pictures, and `world.json`, which says where everything
goes. No insect, no doll's house and no gear is in this folder: they come as their own folders.

**Why.** Robin, 2026-11-20: "I think I like it more if its an open world and not tied to islands. Instead it should be
biomes." "A shrunk person and enemies are insects"; "Lets do 1, but inside a house." "I really liked the color and
aestethic of what we have now tho." Of the three sizes: "Go for 2" (bean size: he is 1.5 cm). Asked by Victor, GD the
same day as wave 1 again, for the house. The look is still 2 of `out\house-concepts`. Every layout, colour and thing here
is mine; Robin has not seen it.

## The numbers

| File | What | Size | Decoded | On disk |
| --- | --- | --- | --- | --- |
| `floor-tiles.png` | the tiles in the sun: 2 by 2 tiles, repeats every 720 by 414 units | 720 by 414, **one pixel a unit** | 1.2 MB | 5 KB |
| `floor-dusk.png` | the same tiles under the table | 720 by 414, **one pixel a unit** | 1.2 MB | 5 KB |
| `floor-rug.png` | the rug's field, repeats every 540 by 312 units | 1080 by 624, two pixels a unit | 2.7 MB | 32 KB |
| `floor.png`, `floor.json` | 12 flat pieces: the rug's borders and fringe, the shadow's four round corners, the walls | 2048 by 1024 | 8 MB | 105 KB |
| `things.png`, `things.json` | 39 pictures of 30 kinds of things | 2048 by 2048 | 16 MB | 160 KB |
| `world.json` | the layout | | | 23 KB |

Together 29 MB decoded and 330 KB on disk. **The things are the new cost you asked about:** 2.5 million pixels drawn,
which needs the 2048 by 2048 atlas (61% full, so the doll's house's small things can still go in). Split in two atlases
it would be 12 MB instead of 16: say so and I split it. For the whole world I count about 65 MB decoded when all is made
(floors 13, things 16, three insects about 16, his body 8, gear 2, glass 2, loot, home about 8). The game loads about 62 MB
today, both places and the chart together, so it is the same weight as now, not more.

- **The size.** A centimetre of the house is 36 units across. The floor is drawn tilted, as the models are seen, so a
  centimetre is 20.7 units in depth. A 10 cm tile is 360 by 207. Your 4300 by 5800 became 4320 by 5796: 12 by 28 tiles.
  That is 1.2 metres across and 2.8 metres deep. It draws well; I would not change it.
- **Where he can walk:** `floor`, the box 180, 290, 3960 by 5386, inside the skirting boards. Outside it the picture is
  one flat colour, `outside` (`#b9b2ea`, the wall). If the camera shows past the world's edge, clear to that colour.
- **Three biomes** (`biomes`: `id`, `name`, `level`, `box`, `light`):
  - `tiles`, level 1 and 2: the floor everywhere the other two are not. Home stands in its south west corner.
  - `rug`, level 3: 2304 by 1538, in the middle. Its fringe lies about 70 units out from its north and south ends and he
    walks through it. Nothing of the rug blocks the way.
  - `dusk`, level 5: under the table, 3500 by 2070, in the north. The four table legs and the eight chair legs all stand
    in it, as pillars.
- **Things:** 262 placed from 37 names, 84 things in the way (`solid`: circles `x, y, r` and boxes `x, y, w, h` from the
  top left corner). `node tools/world.js walk` walks a grid from where he wakes: the chest, the stall, the door and the
  middle of every zone can be reached, and no free floor is cut off.
- **The chest** is a matchbox at 3880, 2880, at the north end of the narrow way east of the rug, under a fork that lies
  across that way. `chest/closed`, `chest/opening`, `chest/open` are in `things.json`, as before. It is about 150 units
  across, far bigger than the island's chest: at his size a matchbox is a shed.
- **Zones** (`zones`: `kind`, `level`, `box`): ants level 1 on the tiles east of home, ants level 2 up the west side
  and in the narrow east way, ladybirds on the rug, cockroaches under the table. Suggestions, as before.
- **Home** (`home`) is a stand-in until the doll's house is drawn: a box of 1080 by 621 with the door in its south
  side, where he wakes below it, a stall and three people inside. Its back and side walls are three boxes in `solid`.

## How the game uses it

Copy the folder. Then, in this order:

1. Clear to `outside`.
2. `fills`, in their order: each is a `box` of the world filled with the floor named in `floor`. The floor's picture
   repeats every `cell` units (`floors.<name>.cell`), and one cell's corner lies at `from`. So the tiles and the dusk
   both count from 0, 0 and their joints meet; the rug's field counts from its own corner. `px` says how many pixels of
   the file make a unit: the two tile floors are at ONE, so draw them at double size, as the island's ground was.
3. `flats`, in their order: `name`, `x`, `y` is a picture of `floor.json` with its top left corner at x, y. `flip`
   means mirrored left to right inside its own box (x, y is still its top left corner). They are whole numbers of units
   apart and their edges carry one more pixel round them in the atlas, so no seam should show between two.
4. `things` that lie flat (`flat: true` in `things.json`'s `items`), in their order, each with its origin at x, y.
5. Everything that stands: the other `things`, sorted with the figures by y. `flip` again means mirrored.

Every thing carries its own shadow in its picture. **Draw no shadow under a thing.** A leg of the table or of a chair is
a picture about 200 units tall whose top goes out in flat steps: there is no seat and no table top, so nothing hides the
floor. What he walks behind hides him, as a palm did.

`things.json`'s `items` have, beside `w`, `h` and `origin`: `flat` (it lies on the floor, he walks over it), `r` (it
stands in the way: a circle of that many units) or `box` (width and depth of what is in the way). They are what
`world.json`'s `solid` was made from; `solid` is the list to use.

The pencil and the fork are longer than the screen is wide, so each is three pictures (`pencil-a`, `-b`, `-c`) placed in
a row along its slant, each with its own y for the sorting and its own box in `solid`. The pencil is 630 units long.

`tools\world.js` in the studio draws the world from these files alone, the way written here (`drawFloor`, `drawWorld`).
`look-screens.jpg` is made by it. If your screen and that picture differ, the picture is right.

## Mine, for Victor, GD to know

- **The floor under the table is its own floor,** not a shadow laid over the tiles: the same joints in violet and blue,
  so the place is told by its colour at once and an amber cockroach stands out on it. If you would rather save its
  1.2 MB, the tiles multiplied with `#b0a3e6` come close; I have not tried that in the game.
- **A biome's `light`** is a name only (`sun`, `warm`, `shade`). `dusk` has a `tint` to multiply the figures with while
  they stand in it, if the game wants that: not tried, and the stills look right without it.
- **No studded toy brick.** The concept had one; a wooden letter block takes its place, so nothing looks like a toy
  maker's own brick.
- **The table's legs are red, the chairs' white,** so no leg has the colour of a cockroach.
- **A fade made of flat steps.** A smooth fade at the top of a leg turned to uneven bands in the palette PNG. Seven
  flat steps survive it and suit the look.

## Open

- The doll's house: three stills for Robin come next. Until then `home` is a box.
- Whether the ladybird flies: with you.
- The names. Mine as working names: "The tiles", "The rug", "Under the table". The game's names are yours and Robin's.
- A door to the next room. The world is closed on all four sides today.

**Not tested:** not in the game and not on a phone. Seen at 412 by 915 on this PC, drawn by my own tool. The `solid`
circles are sized from each thing's width, not walked by a figure. The insects in `look-screens.jpg` are the single
stills of the concept, put in by hand to show the sizes: they are not delivered here.

**Origin and licence:** all made here. The floors and the layout by `tools\world.js`; the things by `blender\house.py`
and `concepts\house\build.py`, baked by `tools\things.js`. Nothing from outside. "Grounded" is another game: nothing of
it was looked at or taken.

**Where to see it:** `look.jpg` (the whole world at a quarter size, with the zones and names drawn on it),
`look-screens.jpg` (four screens with the glass on), `look-things.jpg` (every thing on the tiles beside the hero, at
half size).

**Making it again:** `node tools/blender.js blender/house.py -- work/things/render`, `node tools/things.js`,
`node tools/packset.js things work/things/baked work/things/out --soft`, `node tools/world.js kit`,
`node tools/packset.js floor work/world/pieces work/world --keep --soft --corner --extrude --width 2048`,
`node tools/world.js check`, `node tools/world.js deliver`, `python tools/shrink.py out/kitchen`.
