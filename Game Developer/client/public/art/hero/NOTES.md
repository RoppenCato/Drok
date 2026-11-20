# hero  (Leonard, AD, 2026-11-20)

**What it is:** the Warrior's body. A nobody from the harbour: bare head, linen shirt, blue trousers, a rope belt, bare
feet. Plain on purpose (Robin, 2026-11-20: "Make a name"): his gear is what makes him somebody. His hands are empty;
the cutlass, buckler and hat are in `out\gear\`.

**What changed and why:** new. The design is mine.

**The numbers:** 54 design units tall on a footprint of about 32 (Victor, GD's budget said 44; at 44 the face and the
hat lose their shape; mine). 195 frames, five facings. `hero.png` 1024 by 2048, 254 KB, 8 MB decoded.

| Action | Frames a facing | Delays (ms) | Note |
| --- | --- | --- | --- |
| `stand` | 6 | 125, looped | a breath |
| `move` | 8 | 45, looped | a run, **played by time** (360 ms a cycle): the game moves him 215 units a second, and feet matched to that ground would be a blur (Victor, GD, 2026-11-20). He leans, takes long steps and pumps his arms, so it reads as fast. `stride` (35.84) is what one cycle would cover were it played by distance; if he ever moves slower than about 100 a second, slow the delays with him |
| `attack1` | 6 | 60, 60, 70, 90, 90, 90 | `blow` 2: the third frame, 120 ms in |
| `cleave` | 7 | 50, 50, 50, 60, 60, 80, 100 | one wide level sweep, right to left; `blow` 3 |
| `charge` | 4 | 70, looped | a lean, the buckler leading, the blade trailing; play it while he dashes |
| `hit1` | 2 | 90, 110 | thrown back, eyes shut |
| `die1` | 6 | 80, 80, 80, 90, 120, 200 | falls on his back; the last two frames fade (`a0`, `a1`) |

**How the game uses it:** copy the folder. Each frame in `actions[...].frames` has `points`: `hand`, `off`, `head`, each
`{ x, y, r, front }`. `x`, `y` are file pixels from the frame's origin (halve them for design units). `front` true: draw
the piece over the body; false: under it. `r` is a turn in degrees, clockwise: for `hand` from pointing straight up (a
cutlass picture points up); for `off` and `head` from the rest pose (their pictures are made on the rest pose, so `r` is
0 while he stands). When the body is flipped, flip the pieces with it (draw them inside the same flipped frame).
`tools\dress.js` is 20 lines and does exactly this.

**Open:** the size (54) and the whole design are for Robin to judge. If the figures feel small on the phone, a camera
zoom of about 1.25 is one number on the game's side; I can re-render everything at 2.5 pixels a unit in minutes.
A coat on the body is not made: for now the three coats are icons only.

**Not tested:** not in the game. The motion is judged from frame sheets and the moving page, not from play. The blow
frames are set to Victor, GD's times but not felt.

**Origin and licence:** made here by `blender\hero.py` and `blender\drok.py`. Nothing from outside.

**Where to see it:** `look.jpg` (him dressed in each tier, eight facings); the moving page; `out\scene\beach.png`.
