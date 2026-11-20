# chart  (Leonard, AD, 2026-11-20)

**What it is:** the sea chart: the world as a sailor's chart, with Crab Cay and Mire Cay on it and room for more
(Robin, 2026-11-20: "a sea chart of islands"; he travels by tapping the chart).

**What changed and why (the second drop, 2026-11-20):** asked by Victor, GD once the second island was in the game.
- **The old harbour is no place any more.** The town stands on Crab Cay (Robin, 2026-11-20: "Make the starter island a
  pirate town"), so Crab Cay now has three small huts and a dock at its south end, and the harbour's island is one of
  the unknown ones with a question mark.
- **Mire Cay is painted in** where the first unknown island was: mud, moss, pools, grey stones in the north, a jetty
  in the south (Robin, 2026-11-20: "a second island to go to... A swamp maybe").
- **A way between the two** as dots, from Crab Cay's dock round its west side to Mire Cay's jetty.
- **A pin for the swamp**, `pin/swamp`: three cattails on green.
- One unknown island stood under the Sail button: it is moved up and left.
Every other island kept its shape.

The whole chart is still **mine, made to be judged and changed**: a world map is big work and would get three
concepts; Robin asked not to be asked until chapter 1 was done.

**The numbers:**
- `chart.png`: the whole screen, 412 by 915 design units at two pixels a unit (824 by 1830, 6 MB decoded). **No words
  are painted in.**
- `pins.png` and `pins.json` (256 by 256): `pin/island`, `pin/swamp`, `pin/harbour`, `pin/boss`, `pin/locked` (40 by
  52, the point is the origin), `mark/here` (a ring round the place he is at), `mark/route` (a dot of the way).
- `chart-places.json`:
  - `places`: **`crab-cay`** at 262, 500 and **`mire-cay`** at 330, 286, each with `name`, `pin` (which pin it wears)
    and `foot` (how far below its point its painting ends: write the name about 10 under that). `island-1` is still
    there as the old name of `crab-cay`, the same place, so nothing breaks before the table is changed; it has a `note`.
  - `unknown`: six spots, the old harbour's island the last of them. **Mire Cay's spot is no longer in this list.**
  - `route`: thirteen points from Crab Cay to Mire Cay; draw `mark/route` on all but the first and the last.
  - `title` and `sail`: where the title plate and the "Sail" button sit well.

**How the game uses it:** copy the folder. In the table that names my places, `crab-cay` is `crab-cay` and `mire-cay`
is `mire-cay` now; a place that is not on the chart yet still takes the next `unknown` spot. Put each place's own
`pin` a little above its point, the ring on the place he is at, the dots of the way, and the name under the painting.
`look.jpg` shows all that, made by `tools\chart-look.js` from these files.

**Open:** the whole design. Each later island needs its own small shape painted over a question mark; I repaint the
chart then. With many islands the chart would want to be pieces, or to scroll. `pin/harbour` has no place now.

**Not tested:** not in the game.

**Origin and licence:** drawn here by `tools\chart.js`, after studying the old charts in `docs\reference\pirate-world\`
(public domain; nothing of them is copied in). Nothing from outside.

**Where to see it:** `look.jpg`.

**Making it again:** `node tools/chart.js`; `node tools/packset.js pins work/chart/render work/chart/out --only pin/,mark/`;
copy `chart.png`, the pins and `chart-places.json` here; `python tools/shrink.py out/chart`; `node tools/chart-look.js`.
