# hop-toad  (Leonard, AD, 2026-11-20)

**What it is:** the hop toad: a fat yellow toad with dark blue legs and spots, orange toes and two big eyes on top. Standing, facing the camera, it is 49 design units wide and 34 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 110 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `hop-toad.png` 1024 by 924 (not a power of two tall), 126 KB, 3.6 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 220, looped |  |
| `move` | 6 | 80, 60, 90, 90, 60, 100, looped | `stride` 40: how far one turn of it carries the feet |
| `attack1` | 7 | 130, 150, 240, 70, 80, 80, 90 | the wind-up is frames 1 to 3, 520 ms: its throat swells to a ball, then its tongue lashes straight out; the blow lands on frame 4 (`blow` 3) |
| `hit1` | 1 | 160 | squashed flat, eyes shut |
| `die1` | 4 | 90, 90, 140, 220 | flips onto its back; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `hop-toad/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 18 units wide each way. Its body is about 15 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** It moves in hops: `move` is one hop (a crouch, four frames in the air, a landing), so it may stand still between hops and travel only in the air. Its tongue reaches 48 units, so it can strike from a short way off.

**Where I would put it (mine; Victor, GD's and Robin's to say):** the swamp's reed banks, level 6.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, out\mire-cay\look-screens.jpg, screen 1; moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- hop-toad work/hop-toad/render`, `node tools/pack.js hop-toad work/hop-toad/render out/hop-toad --tight`, `python tools/shrink.py out/hop-toad`.
