# Three looks for Drok  (Leonard, AD, 2026-11-20)

The look of the game is big work, so it gets three real and different stills for Robin to pick from
(`.claude\skills\three-concepts`). All three show the same beach of the first island at 412 by 915, with the chrome laid
out as he picked it (skills in an arc in the bottom corner; bag, chart and character at the top): the hero with cutlass
and buckler, a sand crab he has picked as his target, a second crab, a rare drop in its colour, a chest, a quest line.

Sent into the chat on 2026-11-20. The page for his phone: https://claude.ai/artifact/EgCpRP3TqmZ16wWzF75cMU
**Waiting for Robin's pick.** Nothing is built from any of them until he has picked.

## What they answer to

Robin, 2026-11-20: the theme "Vibrant pirate: bright seas, green islands, colourful crews and beasts"; the look "Clean
line, flat colour"; games he loves the look of: Zelda: The Wind Waker, MapleStory, World of Warcraft; not pale pastel,
not grim, not pixel art; gear on the hero as "The big pieces".

## The three

| No. | Name | The vision | What it costs |
| --- | --- | --- | --- |
| 1 | Toy-box models (`1.png`) | The figures, palms, rocks and bushes are small 3D models, lit by one sun and rendered flat in two tones with a thin line. The ground is painted with no line. The hand of The Wind Waker. | One model gives every facing and every frame; a new cutlass or hat is one small model. The heaviest files (the hero about 12 to 20 MB in memory). The whole cast can be re-finished at once. |
| 2 | Sticker cartoon (`2.png`) | Drawn on the rig: a thick dark line round each figure, flat candy colour with one shade, a round big-headed hero with big eyes. Props with a thinner coloured line. The hand of MapleStory. | Each figure and each gear piece is drawn once for every facing (three or five). Small files. The most hand work for each new thing. |
| 3 | Painted print (`3.png`) | Drawn on the rig: a thin deep-blue line that swells to the lower right, a short list of hot flat colours, pattern in place of shading (stripes, leaf veins, wave rows), a taller hero with a bigger blade. After pictures 12, 13 and 16 of the bright board. | The same drawing work as 2, and patterns add work to every place. The busiest ground. |

`N-close.png` is the hero and the crab at three times the size. `pick.jpg` and `close.jpg` are the three side by side.

## What I would pick (mine; Robin decides)

Look 1, for how the game is built: the hero turns and wears many pieces of gear, and a model gives all of that from
one source. I would give it the thicker line and the bigger eyes of look 2, which has the most charm in the face.
Look 3 is the one that looks like nobody else's game; it costs the most to keep up.

## How they were made, and how to make them again

- `kit.js`: the scene's layout, the drawing helpers, the face (`docs\rules.md` 51, from FapleGlory's `tools\hand.js`),
  the sand crab, the chrome. `b.js` and `c.js` paint looks 2 and 3 on `tools\rig.js`. `a_build.py` builds the models
  of look 1 and renders them with `blender\toon.py`; `a.js` paints the ground under them and the chrome over them.
- `node tools/blender.js concepts/look/a_build.py -- concepts/look`, then `node concepts/look/a.js`,
  `node concepts/look/b.js`, `node concepts/look/c.js`; `node tools/concepts.js` makes `pick.jpg` and `close.jpg`.
- The models render in about ten seconds.

## Mine, not Robin's

- The hero is about 72 CSS pixels tall. The size is not decided; the one still made all the way will show two sizes.
- The figures are seen from lower (about 35 degrees) than the ground is drawn, so the face shows. Every top-down game
  of this kind does it; it is my choice here.
- The hero's design (a red head cloth, a cream shirt, blue trousers, a yellow sash), the crab, the beach and the
  rarity colour (blue for rare) are stand-ins to show the hand. None of it is a decision.
- The chrome is the studio's drawing of Robin's layout, in each look's own hand. The game's real chrome is Victor, GD's.

## Not tested

Nothing is in the game. One pose and one facing of each figure; nothing moves. The models are not packed into
atlases and their memory is an estimate. Not seen on Robin's phone by me, only at its size.
