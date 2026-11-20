# hero-sheet  (Leonard, AD, 2026-11-20)

**What it is:** the Warrior once more, for his own window: rendered at twice the field's pixels, standing, facing the
camera, with every cutlass, buckler and hat he can wear at the same size. Nothing here is for the field.

**Why.** In the hero's window the game drew his field picture at 2.2 times, so he was soft beside the sharp slots; I
saw it in the test copy and offered this. Victor, GD, 2026-11-20: "Yes, please, to the hero rendered once at the
window's size, standing, with every piece he can wear." The window is Robin's pick of the same day (the treasure
chest; `out\glass\NOTES.md`).

**The numbers:**
- `hero.png`, `hero.json`: 512 by 512, 1 MB decoded. The field's form: frames `hero/stand/s/0001` to `0006`, the
  `actions` block with `stand` (125 ms a frame, looped, as on the field) and on every frame its `origin` and its
  `points` (`hand`, `off`, `head`). **`meta.filePx` is 4**: four file pixels a design unit of the field's hero, where
  the field's atlas has 2. Every number in it is twice the field's.
- `gear.png`, `gear.json`: 512 by 294, 0.6 MB decoded. The field's form and names: `cutlass-rusty`, `cutlass-sailor`,
  `cutlass-corsair`, and `buckler-plank/s`, `buckler-iron/s`, `buckler-brass/s`, `hat-bandana/s`, `hat-tricorn/s`,
  `hat-feathered/s`. Only the facing `s`. `meta.filePx` is 4 here too.

**How the game uses it:** copy the folder. Load the two atlases under their own keys and give them to the figure you
already build for the window in place of the field's two. Where the field's frames are drawn at one half (two file
pixels a unit), draw these at one quarter, then at the window's size: at 2.0 times he is 108 units tall and every file
pixel lands on a canvas pixel. He breathes as on the field. His gear rides on the same points, turned the same way.

**Mine:** the line is half as heavy again as on the field's hero. At twice the size it then weighs what the window's
own lines weigh; with the field's line he looked thin beside the slots.

**Open:** coats, breeches, boots, necklaces and trinkets do not show on him, here or on the field (Robin's pick, "The
big pieces": cutlass, buckler and hat show). If the window should show a coat one day, it is drawn here first.

**Not tested:** not in the game. Seen in my drawing of the window (`tools\window.js --sheet`), with the corsair's
cutlass, the brass buckler and the feathered hat: all three sit where they sit on the field's hero.

**Origin and licence:** made here by `blender\sheet.py` from `blender\hero.py` and `blender\gear.py`. Nothing from
outside.

**Where to see it:** `look.jpg`: the hero's box at four times, with his field picture blown up and with this one.

**Making it again:** `node tools/blender.js blender/sheet.py -- work/hero-sheet`,
`node tools/pack.js hero work/hero-sheet/hero out/hero-sheet --px 4`,
`node tools/packset.js gear work/hero-sheet/gear out/hero-sheet`, `python tools/shrink.py out/hero-sheet`.
