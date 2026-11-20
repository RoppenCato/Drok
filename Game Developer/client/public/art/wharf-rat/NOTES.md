# wharf-rat  (Leonard, AD, 2026-11-20)

**What it is:** the wharf rat: a ship's rat gone wild. Grey, big round pink ears, a long pink tail, buck teeth and a pirate's eye patch. Standing, facing the camera, it is 30 design units wide and 46 tall (the Warrior is 54 tall).

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." Six candidates went to him for the gull's place (`concepts\grove-mob\`); he said, in my chat: "Build all of them, and have the GD make a second island to go to with some of the new mobs." The design is mine; the id is mine to propose.

**The numbers:** 95 frames, five facings (`s`, `se`, `e`, `ne`, `n`). `wharf-rat.png` 1024 by 926 (not a power of two tall), 114 KB, 3.6 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 160, looped |  |
| `move` | 4 | 70, looped | `stride` 17.92: how far one turn of it carries the feet |
| `attack1` | 6 | 110, 120, 200, 60, 90, 100 | the wind-up is frames 1 to 3, 430 ms: it sits up on its haunches with its teeth out, then drops and nips; the blow lands on frame 4 (`blow` 3) |
| `hit1` | 1 | 160 | thrown up and back, paws wide |
| `die1` | 4 | 90, 90, 140, 220 | rolls onto its back; the last two frames fade |

**How the game uses it:** copy the folder. It is in the monsters' form of today: frames `wharf-rat/<action>/<facing>/<nnnn>`; the `actions` block has each frame's origin, delay, box and head, and each action's `blow`, `stride` and `note`. No gear points. Lay its shadow at the origin, about 15 units wide each way. Its body is about 12 units from its middle to its edge. The wind-up changes its outline, so it reads without a colour; tint it as well if you like.

**What suits its body (mine; the rule is Victor, GD's):** The gull's rule as it stands: it scurries in, nips and scurries off.

**Where I would put it (mine; Victor, GD's and Robin's to say):** the beach by Crab Cay's town, level 2, if a second beginner's monster is wanted.

**Open:** the design and the motion are for Robin to judge on the moving page.

**Not tested:** not in the game and not on a phone. The motion is judged from frame sheets, from my own drawing of the screen and from the moving page's frames; I have not watched the published page play.

**Origin and licence:** made here by `blender\beasts.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack in every facing); in its place, work\grove-mob\crab-cay-screens.jpg in the studio (the beach); moving: https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 .

**Making it again:** `node tools/blender.js blender/beasts.py -- wharf-rat work/wharf-rat/render`, `node tools/pack.js wharf-rat work/wharf-rat/render out/wharf-rat --tight`, `python tools/shrink.py out/wharf-rat`.
