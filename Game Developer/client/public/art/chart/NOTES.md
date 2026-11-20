# chart  (Leonard, AD, 2026-11-20)

**What it is:** the sea chart: the world as a sailor's chart, with the harbour and the first island on it and room for
many more (Robin, 2026-11-20: "a sea chart of islands"; he travels by tapping the chart).

**What changed and why:** new. A world map is big work and would get three concepts for Robin to pick from. He asked
not to be asked until chapter 1 is done, so this is one chart, **mine, made to be judged and changed**.

**The numbers:**
- `chart.png`: the whole screen, 412 by 915 design units at two pixels a unit (824 by 1830, 6 MB decoded). Cream paper,
  compass lines from two roses, the two known places painted in, six faint islands with a question mark where more
  will come, a ship, two sea serpents, a border like the scale round an old chart. **No words are painted in.**
- `pins.png` and `pins.json`: `pin/harbour`, `pin/island`, `pin/boss`, `pin/locked` (40 by 52, the point is the
  origin), `mark/here` (a ring round the place he is at), `mark/route` (a dot of the dotted line between two places).
- `chart-places.json`: `places` (`harbour` at 118, 716; `island-1` at 262, 500, in design units on the chart),
  `unknown` (where the six unknown islands are), `route` (ten dots from the harbour to the island), `title` and `sail`
  (where a title plate and the "Sail" button sit well).

**How the game uses it:** copy the folder. Draw `chart.png` to fill the screen. Put a pin on each place a little above
its point, the ring on the place he is at, the route's dots between the two, and write each name under its place in
white with the dark line (13 bold). The "Sail" button is `button/context` from `out\glass\`. `look.jpg` shows all that.

**Open:** the whole design. A later island needs its own small shape painted over a question mark; I repaint the
chart then, or we move to a chart of pieces if there are many. The chart does not scroll.

**Not tested:** not in the game.

**Origin and licence:** drawn here by `tools\chart.js`, after studying the old charts in `docs\reference\pirate-world\`
(public domain; nothing of them is copied in). Nothing from outside.

**Where to see it:** `look.jpg`.
