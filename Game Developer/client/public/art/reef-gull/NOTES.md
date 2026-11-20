# reef-gull  (Leonard, AD, 2026-11-20)

**What it is:** the reef gull, level 3: a fat white thief of a bird, grey wings with black tips, a hooked orange beak, heavy brows. About 28 design units across the body. **It flies:** its body hangs about 35 design units above its origin, which stays on the ground; lay its shadow at the origin.

**What changed and why:** new. The design is mine; the id is the one Victor, GD gave.

**The numbers:** 95 frames, five facings. `reef-gull.png` 1024 by 1024, 95 KB, 4 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 4 | 90, looped | it hovers |
| `move` | 4 | 70, looped | |
| `attack1` | 6 | 140, 160, 60, 90, 90, 100 | it rises with its wings thrown up for 300 ms (frames 1 and 2), swoops and bites (`blow` 2), climbs away; the swoop is drawn up to 27 design units ahead of the origin |
| `hit1` | 1 | 160 | |
| `die1` | 4 | 90, 90, 140, 220 | tumbles and lands on its back; the last two fade |

**How the game uses it:** copy the folder. Frames are `reef-gull/<action>/<facing>/<nnnn>`; the `actions` block has the delays, `blow` and `stride`. No gear points. The wind-up changes its outline, so a player can read it without a colour change; tint it as well if you like.

**Open:** the design is for Robin to judge.

**Not tested:** not in the game; the motion is judged from frame sheets and the moving page.

**Origin and licence:** made here by `blender\gull.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack, every facing); the moving page.
