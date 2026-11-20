# plum-viper  (Leonard, AD, 2026-11-20)

**What it is:** the plum viper: a fat violet snake with a pale yellow belly and dark saddles. Coiled, its head lifted over the coil, a red tongue that flicks. Standing, facing the camera, it is 40 design units wide and 47 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 95 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `plum-viper.png` 1024 by 950 (not a power of two tall), 113 KB, 3.7 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 200, looped |  |
| `move` | 4 | 100, looped | `stride` 30: how far one turn of it carries the feet |
| `attack1` | 6 | 120, 130, 250, 60, 90, 100 | the wind-up is frames 1 to 3, 500 ms: the head pulls far back and up with the mouth open, then strikes forward and down; the blow lands on frame 4 (`blow` 3) |
| `hit1` | 1 | 160 | the coil flattens and the head lolls |
| `die1` | 4 | 90, 90, 140, 220 | the head sinks onto the coil; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `plum-viper/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 17 units wide each way. Its body is about 16 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** A lunge: it slides near, coils, strikes across a gap of up to 48 units and draws back. It should not run 200 away: a coiled snake that waits is the threat. It uncoils to move (`move` is a slither) and coils to stand and fight; the change is not drawn, it is one frame to the next.

**Where I would put it (mine; Victor, GD's and Robin's to say):** the swamp's mangrove wood, level 7.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, out\mire-cay\look-screens.jpg, screen 2; moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- plum-viper work/plum-viper/render`, `node tools/pack.js plum-viper work/plum-viper/render out/plum-viper --tight`, `python tools/shrink.py out/plum-viper`.
