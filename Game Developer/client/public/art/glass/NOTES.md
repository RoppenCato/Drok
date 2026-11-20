# glass  (Leonard, AD, 2026-11-20)

**What it is:** the glass over the game, as pieces: bars and discs with the figures' dark line, strong flat colour only
where a thumb goes, and windows that are the inside of a treasure chest. 56 pieces in one atlas.

**What changed and why:**

*This drop: the windows are a treasure chest.* Robin, 2026-11-20, in Victor, GD's chat: "You need to have some nice
pirate design to menus and panels. Like some wooden feeling. Right now it looks bland. Also update icons so they look
fitting." Of the three wooden looks shown (`concepts\wood\`) he said in my chat, 2026-11-20: "I think 3 is good. Nice
contrast. But mind the text needs to fit and not overlap with stuff".

- **The window** (`panel`): dark wood in standing boards, an iron band all round with gold studs, a gold angle in each
  corner. Its title is a gold plate (`panel/title`), its cross a red stone in a gold ring (`button/close`).
- **What words lie on** (`row`): a dark, sunk board with a thin gold edge. **The hero's box** (`niche`, new): lined with
  dark velvet, a gold edge.
- **Slots:** a piece he owns lies on pale linen inside its rarity's colour (`slot/common` to `slot/epic`); an empty
  slot is lined with velvet (`slot/empty`). The one being looked at gets a gold frame (`slot/chosen`, new).
- **A mark for each empty place on him** (new, Robin's places of the same day: "Head, chest, legs, boots, necklace, two
  trinkets"): `mark/slot-hat`, `-coat`, `-legs`, `-boots`, `-weapon`, `-shield`, `-necklace`, `-trinket`.
- **Buttons:** a gold plate for the one that does the thing (`button/context`), an iron plate for the rest
  (`button/plain`, new). The four top buttons are a gold ring round dark wood with a pale sign.
- **So the text fits** (Robin): I drew the hero's window from these pieces with the game's own numbers, long names and
  big numbers (`tools\window.js`, `look-window.jpg`). Six things met or ran out. The changes that cure them are under
  "The window: what the game changes".

*This drop: his own bar over his head, and rage is red.* Robin, 2026-11-20, in Victor, GD's chat: "I think the heros
health bar should show over his character, and the rage bar below it. It needs to be fixated well enough that it doesnt
become messy when fighting mobs." "Would be nice if we can keep the UI as clean as possible." Of the four ways shown
(`concepts\own-bars\four.jpg`) he said in my chat, 2026-11-20: "I think 4, but the heart isnt needed. Also rage is
traditionally red. So they need to be distinctive different red colors".

- **His own bar** (`own/back`, `own/hp`, `own/rage`, `own/lost`, `own/frame`): one dark outline with two rooms, health
  over rage, 52 long and 15 tall. No heart (Robin). Three layers, so no corner can poke out: the back, the flat fills in
  the rooms, the frame on top.
- **Rage is red** (Robin). Which two reds is mine: health keeps the light red of every health bar (`#f0503c`) with its
  light stripe; rage is a deep, flat crimson (`#b8122f`). I tried seven pairs on the scene. Two reds are only told apart
  at this size when one is clearly darker than the other; a still darker wine red read as the bar's shadow, and two
  bright reds read as one. `fill/rage` and `bar/rage` are the same crimson now, so rage is one colour everywhere.

*Before, after Robin's first play (2026-11-20):* "Health etc on your hero and on mobs needs to be easier to see." "There
should be a moving stick." Victor, GD moved the pile to the middle at the bottom and asked for a bar over a monster's
head and for the stick. All of the look is mine.

- **A monster's bar:** a dark well (`mob/well`), so it reads on sand, grass, rock and sea alike, with the same red
  inside (`mob/hp`). The one he fights has a gold rim between two dark lines (`mob/well-mine`; gold alone is lost on
  sand) and an arrow over it (`mark/mine`). A pale fill (`mob/lost`) shows what a blow just took.
- **The stick:** `stick/ring` and `stick/knob`, cream with the dark line, see-through.
- **Fills with round ends** (`fill/hp`, `fill/rage`, `fill/xp`, `fill/lost`) for the bars of the pile. The flat ones
  (`bar/hp`, `bar/rage`, `bar/xp`) stay in the atlas so nothing breaks.
- **A heart** (`mark/heart`) for the left end of his health bar in the pile. Not used over his head.

**The numbers:** `glass.png` is 1024 by 1024 now (it was 1024 by 512), 126 KB, 4 MB decoded, two pixels a unit. The
window is the reason: it is one piece as wide as a window. Sizes in design units; in `glass.json` each piece's `w` and
`h` are file pixels, and its origin is its middle.

| Piece | Size | How it stretches |
| --- | --- | --- |
| `own/back`, `own/frame` | 28 by 15 | a pill: `slice` left and right 16 file px. Drawn 52 long (`length` in the data) |
| `own/hp`, `own/lost` | 8 by 7 | flat: stretch it whole to the part's length |
| `own/rage` | 8 by 4 | flat: stretch it whole to the part's length |
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
| `button/context` | 64 by 48 | a gold plate: `slice` 44 left and right: "Wear", "Open", "Sail"; **dark** words `#3a2414`, 15 to 18 bold |
| `button/plain` (new) | 64 by 48 | an iron plate: `slice` 44 left and right: every other button; pale words `#fff3d6`, 15 bold |
| `plate` | 48 by 34 | a pill: `slice` 32: the target's name, a quest line (cream, as before: it lies on the field) |
| `row` | 48 by 44 | `slice` 24 all round: the card, a row of a list; pale words |
| `niche` (new) | 48 by 48 | `slice` 24 all round: the box the hero stands in |
| `panel` | 372 by 164 | `slice` 128 all round (file px). It is as wide as every window, so it is stretched in height only: its top and bottom 64 units keep their size |
| `panel/title` | 96 by 44 | `slice` 44 left and right; **dark** words `#3a2414`, 18 bold; it sits on the panel's top edge |
| `slot/common` ... `slot/epic`, `slot/empty` | 56 by 58 | none; an icon of 48 in its middle. Draw `slot/empty` at full strength |
| `slot/chosen` (new) | 64 by 64 | none; a gold frame over the slot being looked at, scaled as the slot is |
| `mark/slot-hat`, `-coat`, `-legs`, `-boots`, `-weapon`, `-shield`, `-necklace`, `-trinket` (new) | 32 by 32 | none; in the middle of an empty slot of that place, scaled as the slot is |
| `mark/coin`, `mark/quest` (!), `mark/done` (?) | 16, 28 | none |
| `mark/target`, `mark/tap` | 76 by 36, 44 by 24 | none; under the picked target, and where a tap landed |
| `bar/hp`, `bar/rage`, `bar/xp` | 8 by 8 | the first, flat fills; `fill/*` takes their place |

**How the game uses it:** copy the folder. `tools\scene.js` draws the field's glass from the folder and
`tools\window.js` the hero's window; they are the reference.

- **The window: what the game changes** (`panels.ts`; every number is in design units). The first five are needed for
  the look, the other six are what keeps words and pieces off each other and off the frame:
  1. **Words are pale on the dark wood:** `#fff3d6` for the plain ones, `#dab892` for the dim, `#93e283` good, `#ff9482`
     bad, `#ffd95e` gold. A rarity's name in its colour made a fifth lighter. On a gold plate (the title, the gold
     button) words are dark, `#3a2414`.
  2. **Plain buttons** are `button/plain`, not `row`. The gold one stays `button/context`.
  3. **The hero's box** is `niche`, not `row`.
  4. **The chosen slot** gets `slot/chosen` over it in place of the dark line round it, which is lost on dark wood.
  5. **An empty place on him** gets its `mark/slot-...` in its middle in place of the plain shape; `slot/empty` at full
     strength, not at 0.6 and 0.45.
  6. **The bag's cells 44, not 46** (the gap stays 5). At 46 the first and the last cell touch the iron bands.
  7. **The buttons 5 higher** (`by = cy + ch + 21`), and **three in a row 100 wide, not 104**. At 104 the outer two
     lie on the gold angles; at 26 down their feet lie on the bottom band.
  8. **The card with a piece beside the worn one:** its head 5 higher (titles at `cy + 12`, the two small slots 38 at
     `cy + 41`, the names on that line), the rows from `cy + 73` in steps of 16. Today a third row is cut by the
     card's foot.
  9. **"Felled ... · Falls" as two lines** (`by - 9` and `by + 8`). On one line it is wider than the window once he
     has felled three kinds.
  10. **The hero's box 164 wide, and he stands 8 to the right, 4 lower, at 2.0 times.** At 2.2 times in a box of 150
      the corsair's cutlass reaches the coat's slot and the feathered hat's plume leaves the box.
  11. **The experience bar** in the window: `#42241a` for its ground, the green as it is.
  Keep words and pieces 14 units in from the window's sides and 14 up from its bottom; the gold angles fill 22 by 22
  in each corner.

- **His own bar, over his head.** Five pictures at one place, in this order:
  1. `own/back`, 52 long: the colour of the empty rooms.
  2. `own/lost` in the health room, as long as his health was before the blow (if you show that).
  3. `own/hp` in the health room: it starts **1.5 in from the frame's left edge and 1.5 down from its top, 7 tall**.
  4. `own/rage` in the rage room: **1.5 in, 9.5 down, 4 tall**.
  5. `own/frame`, 52 long, on top. It hides the fills' square corners.

  A whole fill is the bar's length less 3, so 49. The same numbers are in `own/frame`'s data as `rooms`. Hide a fill at
  nothing. Keep the five on the same whole pixels, so no line of the back shows between a fill and the frame.
  **Where:** its middle 13 above the top of his first `stand` `s` frame, at his feet's x, over every monster's bar. One
  height, never the top of the picture now shown: that is what keeps it still in a fight. The length is mine: 52 is a
  little wider than he is; the pill takes any length.
- **With his bar on the field I would leave `mark/mine` out** (the arrow over the one he fights): it touches his bar
  when that monster stands beside him, and the gold rim, the bigger bar and the ring under its feet already say which
  one it is. Mine.
- **Rage's colour in the code:** `#b8122f` wherever the game colours rage itself (the ring round Cleave, a plain bar).
- **A fill of the pile is a pill, made as long as the bar's part** (a nine-slice whose width is set, not a picture
  scaled): its ends stay round. Hide it at nothing; while there is any, not shorter than its two ends (10 units for
  `fill/*`, 5 for `mob/*`).
- **The bars of the pile:** the fill's left end is 3 units in from the well's left edge. Its middle is **1 unit above
  the well's middle** (the well's picture has room for a shadow under it), and it is **10 tall**. Whole, it is the
  well's length less 6.
- **Over a monster:** for a fill `w` long (44 or more), `mob/well` is `w + 6` long and the fill starts 3 in, on the
  well's middle. For the one he fights: `mob/well-mine` is `w + 10` long, the fill starts 5 in, and the whole bar is
  drawn **a fifth bigger** (well and fill alike). `mark/mine` sits 16 above that bar's middle.
- **`mob/lost`, `fill/lost` and `own/lost`** go under the red, as long as the health was before the blow, and shrink to
  the red a moment later (I would hold 200 ms, then shrink over 300; how it feels is Robin's).
- **The stick:** `stick/ring` where the thumb came down, `stick/knob` under the thumb, both at full strength (no alpha
  on top: it is in the pictures). Their middles are their origins.
- **The heart**, in the pile only: its middle 3 units in from the left end of his health bar and 1 above the bar's middle.

**The pile, my way** (in the game since 47c3209; pictured in `look-bars.jpg`, where rage still has its first orange):
experience 200 long at y 901, drawn at 0.72 of its size; the discs as they are; rage 184 long from x 122, y 800, at 0.8
of its size; his health 200 long at y 775, at 1.3 of its size, the heart on its left end, the numbers 14 bold; the plate
at y 733 with the monster's bar on its foot as `mob/well-mine` (y 748; the fill 172 long as drawn, so 143 before the
fifth, and the whole bar 184 long, inside the plate). With his bar over his head the pile is the plate with the name,
the discs and experience, as in `look-screen.jpg`.

**The colours:** line `#33203a`, cream `#fffaec` and `#f3e8cc`, wells `#cdbfae`, the monster's well `#5a4062`; health
`#f0503c` (its light stripe `#ff7a62`), rage `#b8122f` (its light stripe on the pile's pill `#d2324a`), experience
`#6fd060`, what a blow took `#fff1c9`; Cleave `#f0503c`, Charge `#3f9fe8`, potion `#4cbf68`; gold `#f6c23a`. Words on
the field (a hit's number, the level) are white with the dark line round them.

The window's own colours: wood `#6b3f27` and `#5e3621`, its grain `#42241a`; iron `#4b4759`; gold `#f6c23a` with
`#ffe27a` and `#c4871c`; velvet `#45294e`; linen `#ecdcb4`; the sunk board `#43261a`.

**The font:** Robin, 2026-11-20, in my chat: "Choose a good font for the game thats clear and easy to read". My choice
is **Nunito**, extra bold: round and friendly, very clear at 13, and no wider than what the phone shows now, so what
fits today still fits. It is free under the SIL Open Font Licence 1.1 (read on Google's fonts repository, 2026-11-20).
It is a file to add to the game. **Not fetched yet:** I asked Robin first. The pictures here use Segoe UI bold, close
to the phone's own Roboto in width.

**Open:**
- The two reds are for Robin to judge on his phone. If they still read as one, the next steps are a taller rage room or
  a still deeper red.
- Cleave's disc is the same red as health. It was before rage turned red too; now three reds meet on the screen.
- The small hard shadow the tool draws under each piece is cut away by the packer's hard edge, so the game has shown the
  glass without it since the first drop; it comes back with one flag (`--soft`) if it is wanted.
- The potion's disc is green while the health it fills is red.

- Whether a monster may stand in him is a rule of the game, on Victor, GD's list for Robin. Its bar no longer lies on
  him either way: a monster's bar that would lie on his bar or across the middle of his face is lifted to sit right
  above his (my rule, in the game since Victor, GD's 75af4e7; `concepts\own-bars\bars-apart.jpg` and
  `bars-apart-in-game.jpg`).

**Not tested:** his own bar is in the game since Victor, GD's 0f7c744 and seen there in three stills at 412 by 915 (a
test copy on this PC): as drawn, no line of the back showing; with three crabs held round him the bars pile up above
his and his face is free. Not seen on a phone and not moving. The earlier pieces
are in the game since 47c3209 and 9c937fb. Nothing pressed; the stick not felt under a thumb.

**Origin and licence:** drawn here by `tools\glass.js`. Nothing from outside.

**The window's pieces are not in the game yet** and nothing of them was pressed. `look-window.jpg` is drawn by my own
tool from the packed atlas, on this PC.

**Where to see it:** `look-window.jpg` (the hero's window from these pieces: as the game lays it out today, with the
changes above, with nothing tapped, with a worn piece tapped), `look-own.jpg` (his own bar: as Robin saw it and as it is now, and four states on sand, grass and
rock), `look-screen.jpg` (the whole screen with it), `look-bars.jpg` (the monsters' bars, the pile and the stick, before
and after), `look-grounds.jpg` (the monsters' bars and the stick on sand, grass, rock and sea), `look.jpg` (every piece).
