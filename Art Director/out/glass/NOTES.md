# glass  (Leonard, AD, 2026-11-20)

**What it is:** the glass over the game, as pieces: cream panels with the figures' dark line, round buttons, strong flat
colour only where a thumb goes. 40 pieces in one atlas.

**What changed and why:** Robin played chapter 1 (2026-11-20) and said: "Health etc on your hero and on mobs needs to be
easier to see." "There should be a moving stick." Victor, GD moved the pile to the middle at the bottom and asked for a
bar over a monster's head and for the stick. Twelve new pieces; the 28 earlier ones are as they were. All of it is mine.

- **A monster's bar:** a dark well (`mob/well`), so it reads on sand, grass, rock and sea alike, with the same red
  inside (`mob/hp`). The one he fights has a gold rim between two dark lines (`mob/well-mine`; gold alone is lost on
  sand, as the gold edge in the game is now) and an arrow over it (`mark/mine`). A pale fill (`mob/lost`) shows what a
  blow just took.
- **The stick:** `stick/ring` and `stick/knob`, cream with the dark line, see-through. The white ring in the game now is
  all but lost on sand.
- **Fills with round ends** (`fill/hp`, `fill/rage`, `fill/xp`, `fill/lost`): on the real screen the flat fills showed
  square corners outside my round wells and covered the well's lower line. That was my data: the first notes gave two
  different heights. The flat ones (`bar/hp`, `bar/rage`, `bar/xp`) stay in the atlas so nothing breaks.
- **A heart** (`mark/heart`) for the left end of his own health bar, so his bar is never taken for the monster's.

**The numbers:** `glass.png` 1024 by 512 as before, 100 KB (was 67), 2 MB decoded, two pixels a unit. Sizes in design
units; in `glass.json` each piece's `w` and `h` are file pixels, and its origin is its middle.

| Piece | Size | How it stretches |
| --- | --- | --- |
| `bar/well` | 40 by 18 | a pill: `slice` left and right 16 file px |
| `fill/hp`, `fill/rage`, `fill/xp`, `fill/lost` | 24 by 10 | a pill: `slice` 10 file px. Inside `bar/well` |
| `mob/well` | 28 by 13 | a pill: `slice` 12 file px |
| `mob/well-mine` | 32 by 17 | a pill: `slice` 16 file px |
| `mob/hp`, `mob/lost` | 12 by 7 | a pill: `slice` 5 file px. Inside the two wells above |
| `mark/mine` | 18 by 16 | none: the arrow over the bar of the one he fights |
| `mark/heart` | 30 by 30 | none |
| `stick/ring` | 100 by 100, the ring's radius 46 | none; its see-through is in the picture |
| `stick/knob` | 52 by 52, radius 22 | none; its see-through is in the picture |
| `skill/cleave`, `skill/charge`, `skill/potion`, `skill/empty` | a disc of 68 in 76 by 78 | none; draw the cooldown wedge and the number over it |
| `button/bag`, `button/chart`, `button/hero`, `button/menu` | a disc of 38 in 44 by 46 | none |
| `button/close` | 36 by 38 | none |
| `button/context` | 64 by 48 | a pill: `slice` 44: "Open", "Shop", "Sail", dark words 18 bold |
| `plate` | 48 by 34 | a pill: `slice` 32: the target's name, a quest line |
| `row` | 48 by 44 | `slice` 24 all round |
| `panel` | 96 by 100 | `slice` 44, 44, 44, 52 (left, top, right, bottom, file px) |
| `panel/title` | 96 by 44 | a pill: `slice` 44; white words 18 bold; it sits on the panel's top edge |
| `slot/common` ... `slot/epic`, `slot/empty` | 56 by 58 | none; an icon of 48 in its middle |
| `mark/coin`, `mark/quest` (!), `mark/done` (?) | 16, 28 | none |
| `mark/target`, `mark/tap` | 76 by 36, 44 by 24 | none; under the picked target, and where a tap landed |
| `bar/hp`, `bar/rage`, `bar/xp` | 8 by 8 | the first, flat fills; `fill/*` takes their place |

**How the game uses it:** copy the folder. `tools\scene.js` draws all of this from the folder and is the reference.

- **A fill is a pill, made as long as the bar's part** (a nine-slice whose width is set, not a picture scaled): its ends
  stay round. Hide it at nothing; while there is any, not shorter than its two ends (10 units for `fill/*`, 5 for
  `mob/*`).
- **His own bars:** the fill's left end is 3 units in from the well's left edge, as now. Its middle is **1 unit above
  the well's middle** (the well's picture has room for a shadow under it), and it is **10 tall**, not 12. Whole, it is
  the well's length less 6.
- **Over a monster:** for a fill `w` long (44 or more), `mob/well` is `w + 6` long and the fill starts 3 in, on the
  well's middle. For the one he fights: `mob/well-mine` is `w + 10` long, the fill starts 5 in, and the whole bar is
  drawn **a fifth bigger** (well and fill alike). `mark/mine` sits 16 above that bar's middle; let it bob 2 units, once
  a second, if you like.
- **`mob/lost` and `fill/lost`** go under the red, as long as the health was before the blow, and shrink to the red a
  moment later (I would hold 200 ms, then shrink over 300; how it feels is Robin's).
- **The stick:** `stick/ring` where the thumb came down, `stick/knob` under the thumb, both at full strength (no alpha
  on top: it is in the pictures). Their middles are their origins.
- **The heart:** its middle 3 units in from the left end of his health bar and 1 above the bar's middle.

**Three things seen on the real screen (Victor, GD's to take or leave):**
1. The bar over a monster rides on the top of the picture now shown, so it jumps as the crab moves its claws. One
   height for each kind is steadier: I use the top of its first `stand` frame, and put the bar's middle 12 above it
   (14 for the one he fights). The raised claw then passes behind the bar for a moment.
2. A blow's number starts on top of the bar and hides it. Beside the bar, or starting above it, both stay readable.
3. The pile has two red bars of nearly the same length, one over the other: his and the monster's. Mine instead, in
   `look-bars.jpg` and `look-screen.jpg` (the middles, of 412 by 915): experience 200 long at y 901, drawn at 0.72 of
   its size; the discs as they are; rage 184 long from x 122, y 800, at 0.8 of its size; his health 200 long at y 775,
   at 1.3 of its size, the heart on its left end, the numbers 14 bold; the plate at y 733 with the monster's bar on its
   foot as `mob/well-mine` (the fill 172 long, a fifth bigger, y 748): the dark bar is the monster's, on the plate as
   over its head. The button for the thing he stands by at y 683.

**The colours:** line `#33203a`, cream `#fffaec` and `#f3e8cc`, wells `#cdbfae`, the monster's well `#5a4062`; health
`#f0503c`, rage `#ff9a2e`, experience `#6fd060`, what a blow took `#fff1c9`; Cleave `#f0503c`, Charge `#3f9fe8`, potion
`#4cbf68`; gold `#f6c23a`. Words on the field (a hit's number, the level) are white with the dark line round them.

**The font:** the pictures use Trebuchet MS bold as a stand-in. I would pick a round, heavy face to go with the look
(Fredoka or Baloo 2, both free under the Open Font Licence). That is a file to add to the game and to tell Robin about,
so I have not fetched one.

**Open:** the whole design is for Robin to judge. The small hard shadow the tool draws under each piece is cut away by
the packer's hard edge, so the game has shown the glass without it since the first drop; it comes back with one flag
(`--soft`) if it is wanted. The potion's disc is green while the health it fills is red.

**Not tested:** the new pieces are not in the game. `look-bars.jpg` has the real screen on the left (a test copy of the
game on this PC, a fresh game, not Robin's save) and `tools\scene.js` on the right. Nothing pressed; the stick not felt
under a thumb; the bars not seen moving.

**Origin and licence:** drawn here by `tools\glass.js`. Nothing from outside.

**Where to see it:** `look-bars.jpg` (now and new, side by side), `look-screen.jpg` (the whole screen), `look-grounds.jpg`
(the bars and the stick on sand, grass, rock and sea), `look.jpg` (every piece).
