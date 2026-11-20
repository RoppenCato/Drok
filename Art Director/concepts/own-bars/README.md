# His own bars over his head: what I saw, and a sketch  (Leonard, AD, 2026-11-20)

Robin, in Victor, GD's chat, 2026-11-20: "I think the heros health bar should show over his character, and the rage bar
below it. It needs to be fixated well enough that it doesnt become messy when fighting mobs." "Would be nice if we can
keep the UI as clean as possible." "Give me some suggestions."

Victor, GD put three ways in the game to try (his commit 61fc904; "Bars" in the settings), all with stand-ins made from
my glass. Nothing was asked of the studio yet. I looked at all three on the real screen (my test copy, 412 by 915, the
same fight) and drew one sketch.

**Robin picked** (in my chat, 2026-11-20): "I think 4, but the heart isnt needed. Also rage is traditionally red. So
they need to be distinctive different red colors". The real piece is in `out\glass\` (`own/...`), with its notes and
`look-own.jpg`. What follows is as it stood before his pick.

`four.jpg`: 1, 2 and 3 are the real screen; 4 is my sketch on `tools\scene.js`.

| No. | What | What I see (mine) |
| --- | --- | --- |
| 1 | his health over his head, rage close under it | Reads as his. Two full bars and a heart make a tall block beside the monster's bar and its arrow |
| 2 | his health over his head, rage under his feet | The one I would not pick. His feet are where the fight is: the rage bar lies across the crab that stands south of him and on the red ring. His two bars are in two places |
| 3 | his health over his head, rage as a ring round the Cleave disc | The cleanest field, and the ring says what rage is for. But rage is not by him, which is what he asked for |
| 4 | way 1 drawn as one small piece | One dark outline with two rooms: health 7 tall, rage 3.4 under it, a heart on its end, 52 long. As small as way 3's one bar, with rage where he asked. Cream inside, so it is never taken for a monster's dark bar |

Two more things, for any of the ways:
- The arrow over the one he fights touches his heart when that monster stands beside him (the picture of way 2). With
  his own bars on the field I would leave the arrow out: the gold rim, the bigger bar and the ring under its feet
  already say which one it is.
- The stand-in over his head is 64 long, twice his width. 52 is enough.

**My pick:** 4 (way 1 as one piece). Then 3. Not 2.

**If he picks 1 or 4, the real piece** would be three layers, so no corner can poke out: a back in the well's colour,
the two flat fills (`bar/hp`, `bar/rage`, already in the atlas), and a frame on top with the dark outline and the bar
between the rooms. For 2 or 3 the same with one room. For 3 also a ring for the disc.

`own.js` is the sketch's code: `node tools/scene.js out.png --pile bare --no-arrow --over concepts/own-bars/own.js --at 595,1896`.
Not tested: a sketch on a still picture; not in the game, not seen moving.
