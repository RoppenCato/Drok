# frill-lizard  (Leonard, AD, 2026-11-20)

**What it is:** the frill lizard: a blue lizard with a yellow belly and spots, and an orange frill with a red rim. Low and long. The frill lies half open round its neck while it stands. Standing, facing the camera, it is 40 design units wide and 45 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 95 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `frill-lizard.png` 1024 by 1048 (not a power of two tall), 136 KB, 4.1 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 200, looped |  |
| `move` | 4 | 80, looped | `stride` 22.4: how far one turn of it carries the feet |
| `attack1` | 6 | 110, 130, 240, 60, 90, 100 | the wind-up is frames 1 to 3, 480 ms: it rears on its hind legs and throws the frill wide open, then snaps; the blow lands on frame 4 (`blow` 3) |
| `hit1` | 1 | 160 | the frill shuts and it is knocked back |
| `die1` | 4 | 90, 90, 140, 220 | rolls onto its back, the frill shut; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `frill-lizard/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 16 units wide each way. Its body is about 14 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** The gull's rule as it stands. The frill is the tell: the biggest change of outline of the six, so it reads from far off.

**Where I would put it (mine; Victor, GD's and Robin's to say):** the swamp's old stones, level 8.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, out\mire-cay\look-screens.jpg, screen 3; moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- frill-lizard work/frill-lizard/render`, `node tools/pack.js frill-lizard work/frill-lizard/render out/frill-lizard --tight`, `python tools/shrink.py out/frill-lizard`.
