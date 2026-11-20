# palm-monkey  (Leonard, AD, 2026-11-20)

**What it is:** the palm monkey: a cheeky little monkey out of the palms. Brown, a pale face under heavy brows, big round ears, a ringed tail curled over its back. It goes on all fours with its knuckles on the ground. Standing, facing the camera, it is 40 design units wide and 58 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 95 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `palm-monkey.png` 1024 by 1090 (not a power of two tall), 139 KB, 4.3 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 180, looped |  |
| `move` | 4 | 90, looped | `stride` 24.64: how far one turn of it carries the feet |
| `attack1` | 6 | 110, 130, 220, 60, 90, 100 | the wind-up is frames 1 to 3, 460 ms: it rears up and throws both arms over its head, then slaps down in front; the blow lands on frame 4 (`blow` 3) |
| `hit1` | 1 | 160 | flung back, arms and legs wide, the tail straight |
| `die1` | 4 | 90, 90, 140, 220 | rolls onto its back; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `palm-monkey/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 16 units wide each way. Its body is about 14 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** The gull's rule as it stands: it darts in, slaps, hops back about 200 and comes again. No new rule.

**Where I would put it (mine; Victor, GD's and Robin's to say):** Crab Cay's grove, level 4.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, work\grove-mob\crab-cay-screens.jpg in the studio (the grove); moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- palm-monkey work/palm-monkey/render`, `node tools/pack.js palm-monkey work/palm-monkey/render out/palm-monkey --tight`, `python tools/shrink.py out/palm-monkey`.
