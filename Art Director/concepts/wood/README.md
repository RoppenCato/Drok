# A wooden look for the windows: three ways  (Leonard, AD, 2026-11-20)

Three real and different stills for Robin to pick from (`.claude\skills\three-concepts`), asked by Victor, GD on
2026-11-20 from Robin's words of the same day, in Victor, GD's chat: "You need to have some nice pirate design to menus
and panels. Like some wooden feeling. Right now it looks bland. Also update icons so they look fitting. There should
also be more slots for items. Again, i think you can take a lot from the zite inventory and equip."

Each still is the same window: the hero and his bag as the game lays it out since today (`client\src\view\panels.ts`,
`buildSheet`), with the same things in it. Only the look changes. The places on him are Robin's own list, of the same
evening: "We need slots for trinkets also. Two trinkets. I think we can skip rings. Do: Head, chest, legs, boots,
necklace, two trinkets." So nine: head, chest, legs, boots down the left; cutlass, buckler, necklace down the right; two
trinkets side by side under the necklace. The stills were drawn first with eight other slots and redrawn the same hour.

| No. | The idea | What you read on | What it costs |
| --- | --- | --- | --- |
| 1 Lashed planks | boards lashed with rope, nails in their ends, a painted sign for the title | patches of sailcloth sewn on; dark words on light wood | a window is a whole number of boards tall (57 units each) |
| 2 Chart table | a sheet of parchment pinned on a dark table; a red ribbon, a wax seal, slots drawn in ink | the parchment; dark ink | the least: it stretches like today's panel. The least wooden too |
| 3 Treasure chest | the inside of a chest: dark wood, iron bands with gold studs, a gold plate, velvet | dark wood; light words | the studs sit at even steps, so its edges are tiled, not stretched |

**What I would pick (mine; Robin decides):** 1. It is the most wooden, it keeps the game's sunny colours, and dark
words on light wood are easy to read.

**Waiting for Robin's pick.** Sent into my chat on 2026-11-20. The page for his phone:
https://claude.ai/artifact/JM6LsoKKQCBNXgZRpdSvwD . Nothing is built from any of them until he has picked.

After the pick comes the kit for the glass: the panel, its title, the cross, the slots (empty and by rarity), the patch
or card, the buttons, the four top buttons, a mark for each empty place (eight marks: the two trinkets share one), and
the twelve new gear icons Victor, GD listed (breeches, boots, necklaces, trinkets, three of each).

## The files

- `1.png`, `2.png`, `3.png`: the stills, 412 by 915 at double size. `N-close.png`: a corner at three times.
  `pick.jpg`, `close.jpg`: the three side by side.
- `three-woods.html`: the template's pick page, filled; published with the pictures beside it.
- `still.js`: the three looks as three sets of drawing rules over one layout.

## Making them again

- `node tools/scene.js work/wood/bg.png --no-glass --pile bare --own none` (the screen behind the window, once).
- `node concepts/wood/still.js planks concepts/wood/1.png --close concepts/wood/1-close.png`, the same for `chart` (2)
  and `chest` (3).
- `node tools/concepts.js concepts/wood/pick.jpg --labels "Lashed planks|Chart table|Treasure chest" --height 915 concepts/wood/1.png concepts/wood/2.png concepts/wood/3.png`.

**Not tested:** stills only. Not in the game, not on a phone. The text face is the game's of today. The words and
numbers in the window are made up to fill it.

**Origin and licence:** all made here; the gear icons, the hero and the skill discs are the studio's own from `out\`.
The layout is the game's, after the hero sheet of Robin's own game Zite. Nothing from outside.
