# coconut-crab  (Leonard, AD, 2026-11-20)

**What it is:** the coconut crab, level 5: long and dark on stilted orange legs, one giant claw, a coconut husk on its back, two feelers. About 46 design units across. Its own outline and its own slow way of moving, not the sand crab made bigger.

**What changed and why:** new. The design is mine; the id is the one Victor, GD gave.

**The numbers:** 66 frames in **three facings** (`s`, `e`, `n`; flip `e` for `w`), to keep it at 8 MB instead of 16: for a facing it has not, take the nearest. `coconut-crab.png` 1024 by 2048, 202 KB, 8 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 3 | 240, looped | |
| `move` | 4 | 150, looped | `stride` is in the json |
| `attack1` | 10 | 140, 150, 160, 160, 150, 140, 70, 120, 120, 120 | it rises on its legs and hauls the giant claw overhead for 900 ms (frames 1 to 6), then slams it down in front (`blow` 6); the slam hits everything within 70 |
| `hit1` | 1 | 160 | |
| `die1` | 4 | 90, 90, 140, 220 | the last two fade |

**How the game uses it:** copy the folder. Frames are `coconut-crab/<action>/<facing>/<nnnn>`; the `actions` block has the delays, `blow` and `stride`. No gear points. The wind-up changes its outline, so a player can read it without a colour change; tint it as well if you like.

**Open:** the design is for Robin to judge.

**Not tested:** not in the game; the motion is judged from frame sheets and the moving page.

**Origin and licence:** made here by `blender\crab.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack, every facing); the moving page.
