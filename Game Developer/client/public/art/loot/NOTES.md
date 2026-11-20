# loot  (Leonard, AD, 2026-11-20)

**What it is:** what lies on the ground after a kill, and the coloured effect for each rarity (Robin, 2026-11-19: "Needs
to have coloroed effects for rarity.").

**The numbers:** `loot.png` 256 by 256, 18 KB. `coins`, `gear` (a tied bundle), `potion`: 16 to 24 design units, the
origin where they meet the ground. `ring/common`, `ring/uncommon`, `ring/rare`, `ring/epic`: a flat ring of 52 by 28
design units to lay on the ground under a drop, its origin its middle. `spark`: a white four-point spark to tint and blink.

**The rarity colours (mine):**

| Rarity | Colour | Its light tone |
| --- | --- | --- |
| common | `#b9b2a6` | `#f4efe6` |
| uncommon | `#4cc463` | `#6fe07f` |
| rare | `#3d9cff` | `#5fb2ff` |
| epic | `#b666f2` | `#cf8cff` |

The same four are the edges of the bag's slots in `out\glass\`. They are in `loot.json` under each ring's `colour` and `light`.

**How the game uses it:** copy the folder. Under a gear drop draw its rarity's ring, then the bundle. Coins and potions
need no ring. For a rare or epic drop, one or two sparks in the light tone, blinking, are enough to catch the eye.
The rings keep their soft edge (they are not hardened); the three objects have hard edges.

**Open:** the colours are for Robin to judge. No effect is drawn on the hero (his pick).

**Not tested:** not in the game.

**Origin and licence:** made here by `blender\props.py` (loot) and `tools\rings.js`. Nothing from outside.

**Where to see it:** `look.jpg`; a rare drop and coins in `out\scene\beach.png`.
