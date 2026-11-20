# bristle-piglet  (Leonard, AD, 2026-11-20)

**What it is:** the bristle piglet: a striped wild piglet. A brown barrel on short dark legs, big ears, a pink snout with two small tusks, pale stripes along its back and a ridge of bristles over its head. Standing, facing the camera, it is 29 design units wide and 43 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 120 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `bristle-piglet.png` 1024 by 872 (not a power of two tall), 130 KB, 3.4 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 200, looped |  |
| `move` | 4 | 90, looped | `stride` 20.16: how far one turn of it carries the feet |
| `charge` | 4 | 42, looped | a gallop with the head down, for a rule that has it charge; an extra, not one of the five every monster has |
| `attack1` | 7 | 120, 120, 120, 160, 60, 90, 100 | the wind-up is frames 1 to 4, 520 ms: it tips forward with its head down and scrapes a front hoof twice, then butts upward; the blow lands on frame 5 (`blow` 4) |
| `hit1` | 1 | 160 | thrown back with its front in the air |
| `die1` | 4 | 90, 90, 140, 220 | rolls onto its back, legs up; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `bristle-piglet/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 17 units wide each way. Its body is about 14 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** A charge: after the wind-up it runs straight through where he stood, skids, turns and comes again; a step aside dodges it. `charge` is the gallop for that run: it is drawn for about 128 units a second (one turn of it, 280 ms, carries the feet 36 units). With today's rule it works too: it darts in and butts.

**Where I would put it (mine; Victor, GD's and Robin's to say):** Crab Cay's grove, level 3.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, work\grove-mob\crab-cay-screens.jpg in the studio (the grove); moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- bristle-piglet work/bristle-piglet/render`, `node tools/pack.js bristle-piglet work/bristle-piglet/render out/bristle-piglet --tight`, `python tools/shrink.py out/bristle-piglet`.
