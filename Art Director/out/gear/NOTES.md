# gear  (Leonard, AD, 2026-11-20)

**What it is:** the first gear, three tiers of each, and the bag's icons. Each tier has its own outline, not only its
own colour: Robin picked "No glow on the hero" (2026-11-20), so a better piece must look better by its shape.

| Piece | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| cutlass | `cutlass-rusty`: short, brown, a notch in the edge | `cutlass-sailor`: steel, a brass guard | `cutlass-corsair`: long, flared, a gold shell guard, a red tassel |
| buckler | `buckler-plank`: planks and nails | `buckler-iron`: an iron rim and boss | `buckler-brass`: red face, brass rim and cross |
| hat | `hat-bandana`: red with white dots | `hat-tricorn`: black with gold trim | `hat-feathered`: wide navy brim, gold band, red plume |
| breeches (icon only) | `breeches-canvas`: short, pale, a patch, a rope for a belt | `breeches-sailor`: long, navy, a black belt with a brass buckle | `breeches-corsair`: wide and red, gathered in gold, a gold sash |
| boots (icon only) | `boots-worn`: low, brown, a patch on the toe | `boots-sea`: tall and dark, a turned-down top | `boots-captain`: tall, a wide red cuff, gold |
| necklace (icon only) | `necklace-tooth`: a cord, a shark's tooth, two red beads | `necklace-coral`: a string of red beads | `necklace-pearl`: a brass chain, a black pearl in a gold cup |
| trinket (icon only) | `trinket-doubloon`: a gold coin with a cross | `trinket-compass`: a brass case, a red and a blue needle | `trinket-spyglass`: three gold tubes pulled out |

The last four rows are new (2026-11-20), for the places Robin named that day in Victor, GD's chat: "Do: Head, chest,
legs, boots, necklace, two trinkets." By his earlier pick ("The big pieces") they show in the bag and on his sheet,
not on him. The game's ids: `canvas-breeches`, `sailors-breeches`, `corsairs-breeches`, `worn-boots`, `sea-boots`,
`captains-boots`, `shark-tooth-necklace`, `coral-necklace`, `black-pearl-necklace`, `lucky-doubloon`, `brass-compass`,
`golden-spyglass`, in the order of the rows.

**The numbers:** `gear.png` 512 by 512, 22 KB: 3 cutlasses (one picture each), 3 bucklers and 3 hats (five pictures
each, `buckler-iron/se`). `gear-icons.png` 512 by 512, 1 MB decoded: 24 icons of 96 file pixels (48 design units), named
`icon/cutlass-rusty` ... `icon/coat-corsair` as before and `icon/breeches-...`, `icon/boots-...`, `icon/necklace-...`,
`icon/trinket-...` as in the table; their origin is their middle.

**How the game uses it:** copy the folder. A cutlass: put its origin (the grip) on the body frame's `hand` point and
turn it by `hand.r`. A buckler or hat: take the picture of the body's facing, put its origin on `off` or `head`, turn
it by that point's `r`. Draw it under or over the body as `front` says. Flip with the body. See `out\hero\NOTES.md`.

**Open:** the names and the designs are mine. The coats do not show on the body yet. A cutlass is one flat picture, so
it does not shorten when it points at the camera; at this size it reads, but say so if a swing looks wrong in play.

**Not tested:** not in the game.

**Origin and licence:** made here by `blender\gear.py`. Nothing from outside.

**Where to see it:** `look.jpg`; `look-icons.jpg` (all 24 icons in the windows' new slots, at the bag's size and
bigger); on him in `out\hero\look.jpg`.
