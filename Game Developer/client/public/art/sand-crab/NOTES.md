# sand-crab  (Leonard, AD, 2026-11-20)

**What it is:** the sand crab, level 1: round and bright, two even claws. About 30 design units across the shell.

**What changed and why:** new. The design is mine; the id is the one Victor, GD gave.

**The numbers:** 90 frames, five facings. `sand-crab.png` 1024 by 1024, 141 KB, 4 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 3 | 200, looped | |
| `move` | 4 | 100, looped | `stride` is in the json |
| `attack1` | 6 | 120, 150, 230, 60, 90, 100 | it rears up and lifts both claws for 500 ms (frames 1 to 3), then nips; `blow` 3 |
| `hit1` | 1 | 160 | squashed, eyes shut |
| `die1` | 4 | 90, 90, 140, 220 | rolls on its back, the legs curl; the last two fade |

**How the game uses it:** copy the folder. Frames are `sand-crab/<action>/<facing>/<nnnn>`; the `actions` block has the delays, `blow` and `stride`. No gear points. The wind-up changes its outline, so a player can read it without a colour change; tint it as well if you like.

**Open:** the design is for Robin to judge.

**Not tested:** not in the game; the motion is judged from frame sheets and the moving page.

**Origin and licence:** made here by `blender\crab.py`. Nothing from outside.

**Where to see it:** `look.jpg` (the attack, every facing); the moving page.
