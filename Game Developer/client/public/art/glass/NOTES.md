# glass  (Leonard, AD, 2026-11-20)

**What it is:** the glass over the game, as pieces: cream panels with the figures' dark line and a small hard shadow,
round buttons, strong flat colour only where a thumb goes. Laid out as Robin picked it (2026-11-20): skills in an arc in
the bottom corner; bag, chart and character as small buttons at the top.

**The numbers:** `glass.png` 1024 by 512, 66 KB, 28 pieces at two pixels a unit. Sizes in design units:

| Piece | Size | How it stretches |
| --- | --- | --- |
| `bar/well` | 40 by 18 | `slice` left and right 16 file px; the fill sits 2 units in, 10 tall |
| `bar/hp`, `bar/rage`, `bar/xp` | 8 by 8 | stretch whole (`fill`), cropped to the bar's part |
| `skill/cleave`, `skill/charge`, `skill/potion`, `skill/empty` | a disc of 68 in 76 by 78 | none; draw the cooldown wedge and the number over it |
| `button/bag`, `button/chart`, `button/hero`, `button/menu` | a disc of 38 in 44 by 46 | none |
| `button/close` | 36 by 38 | none |
| `button/context` | 64 by 48 | `slice` 44 left and right: for "Open", "Shop", "Sail", dark words 18 bold |
| `plate` | 48 by 34 | `slice` 32 left and right: the target's name and bar, a quest line |
| `row` | 48 by 44 | `slice` 24 all round |
| `panel` | 96 by 100 | `slice` 44, 44, 44, 52 (left, top, right, bottom, file px) |
| `panel/title` | 96 by 44 | `slice` 44 left and right; white words 18 bold; it sits on the panel's top edge |
| `slot/common` ... `slot/epic`, `slot/empty` | 56 by 58 | none; an icon of 48 in its middle |
| `mark/coin`, `mark/quest` (!), `mark/done` (?) | 16, 28 | none |
| `mark/target`, `mark/tap` | 76 by 36, 44 by 24 | none; under the picked target, and where a tap landed |

Each piece's `slice`, `fill` and `note` are in `glass.json` under `items`. Origins are the middles.

**The colours:** line `#33203a`, cream `#fffaec` and `#f3e8cc`, wells `#cdbfae`; health `#f0503c`, rage `#ff9a2e`,
experience `#6fd060`; Cleave `#f0503c`, Charge `#3f9fe8`, potion `#4cbf68`; gold `#f6c23a`. Words on the field (a hit's
number, the level) are white with the dark line round them, 4 units thick.

**The font:** the pictures use Trebuchet MS bold as a stand-in. I would pick a round, heavy face to go with the look
(Fredoka or Baloo 2, both free under the Open Font Licence). That is a file to add to the game and to tell Robin about,
so I have not fetched one.

**How the game uses it:** copy the folder. The places are yours (`hud.ts`); `tools\scene.js` draws them as the control
test has them, with the top right taken by bag, chart and hero.

**Open:** the whole design is for Robin to judge. The potion disc's place (left of Cleave) is a guess.

**Not tested:** not in the game; nothing pressed.

**Origin and licence:** drawn here by `tools\glass.js`. Nothing from outside.

**Where to see it:** `look.jpg`; `out\scene\beach.png`.
