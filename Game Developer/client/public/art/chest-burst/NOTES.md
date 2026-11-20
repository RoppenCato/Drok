# chest-burst  (Leonard, AD, 2026-11-20)

**What it is:** the light of a chest that opens: a glow, rays, a shaft of light, a ring on the ground, a sparkle, a
mote and a gold coin that turns. Ten pictures in one small atlas. All but the coin are white, so the game colours each
with the rarity of the chest's best prize.

**Why.** Robin, 2026-11-20, in Victor, GD's chat: "chests should have a cool effect when you open them like in zite."
Zite's chest shines in the colour of its best prize, shakes harder and longer the rarer it is, pops, and bursts into
sparkles of that colour. This is that on Drok's field, where the chest stands in the world and the loot flies out of it
onto the ground. Victor, GD builds the opening; he asked whether I wanted to give it pieces. These are they, with how I
would play them.

**The numbers:** `burst.png` 512 by 470, 46 KB, 0.9 MB decoded, two pixels a unit. Not a palette PNG: the pieces are
soft. With it the starter place is 51.1 MB decoded, under the 52 set.

**New on 2026-11-20: `chest.png`, `chest.json`, the chest for its own screen.** An hour after these pieces were asked
for, Robin said in Victor, GD's chat: "I think the chests should open like in zite where its a big pop up screen and
the game pauses". Victor, GD built that screen (`vieweveal.ts`) with these pieces as its light. I looked at it in
the test copy: the light reads well on the dark veil, but the chest is the field's small picture drawn at about three
times its size, so it is soft, and at that size a box with two bands is plain. So here is the chest again, built
richer (a lid in planks, gold straps with studs, corner caps, a lock and its hasp, feet, a heap of coins inside) and
rendered at **three times the field's pixels**: `chest/closed`, `chest/opening`, `chest/open`, the field's names,
the origin where it stands. 512 by 568, 17 KB, 1.1 MB decoded. **`meta.filePx` is 6**: where the field's chest is
drawn at one half, draw this at one sixth, then at the screen's size. The field keeps its own small chest.
Its mouth is about 19 field units above the origin, where the field chest's is 18.
The `TIMES` below were made for the field; on the screen Zite's longer charge (0.7 to 2.3 s) is right, as you have it.

| Piece | Size in units | Its origin | What it is |
| --- | --- | --- | --- |
| `glow` | 96 by 96 | its middle | a soft round light |
| `rays` | 136 by 136 | its middle | fourteen uneven rays from one point, each fading out |
| `beam` | 50 by 121 | **its foot** | a shaft of light, wider and fainter upward |
| `ring` | 108 by 64 | its middle | a flat ring, lying on the ground |
| `star` | 30 by 30 | its middle | a sparkle with a small halo (the loot's `spark` is the plain small one) |
| `mote` | 10 by 10 | its middle | a soft dot of light |
| `coin/1` to `coin/4` | 14 by 14 | its middle | one gold coin turning, with the dark line; 70 ms a picture; **not tinted** |

## How I would play it (mine; the numbers are a start for Victor, GD)

The chest's mouth is 18 units above its origin. The colours are the rarity's two tones in `out\loot\loot.json`
(`colour` and `light`). "As light" means Phaser's ADD.

**One rule keeps the colour:** a coloured piece drawn as light goes white on the cove's pale rock. So the coloured
pieces are drawn the plain way, and only white pieces and the beam are drawn as light.

| Best prize | It shines for | Shake, units | The flash grows to | Coins | Sparkles | Motes | The screen jolts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| common | 450 ms | 1.0 | 1.6 | 5 | 6 | 6 | no |
| uncommon | 650 ms | 1.4 | 1.75 | 6 | 8 | 8 | no |
| rare | 900 ms | 1.8 | 1.9 | 8 | 10 | 10 | 1 unit |
| epic | 1300 ms | 2.4 | 2.2 | 10 | 14 | 12 | 2.5 units |

1. **It shines and shakes.** `chest/closed` shakes from side to side, harder toward the end (the shake above times
   the square of how far along it is), leans one to three degrees each way and squats a little. Behind it a `glow` in the
   `colour`, from half size at 35% to full size at 85%; on that a small `glow` in the `light` tone as light. Three
   white `star`s blink by the lid.
2. **The pop.** `chest/opening` for 80 ms, then `chest/open`. The chest jumps to 1.28 times its size and settles in
   240 ms. A `ring` in the `colour` runs out on the ground from 0.3 to 1.8 in 520 ms, fading from 120 ms. A white
   `glow` as light grows from 1.0 to the flash size in 280 ms and fades. Rare and epic: the screen jolts for 180 ms.
3. **The burst.** Behind the chest, on its mouth: `rays` in the `light` tone, grown to full in 220 ms with a little
   overshoot, turning 40 degrees a second; a second `rays` at 0.62, white, as light, turning the other way at 63
   degrees a second. Both fade between 0.9 and 1.8 s after the pop. A `glow` in the `colour` at 1.3: 70% until 0.9 s,
   then 45%. Over the chest the `beam` in the `light` tone as light, its foot on the mouth, stretched up to its full
   height in 160 ms, 85%, fading between 0.5 and 1.4 s.
4. **What flies.** Coins thrown up at 125 to 200 units a second and up to 62 sideways, falling at 430 units a second
   squared, one small bounce, lying half a second, then gone. White `star`s thrown all round at 70 to 150, slowing,
   each growing and shrinking over 0.5 to 0.8 s while it turns. `mote`s in the `light` tone rising slowly for one to
   two seconds. **The prizes themselves fly out** in an arc of about 0.6 s, turning, and land with a small squash: the
   gear on its rarity's ring from `out\loot`, with its spark.
5. **What is left.** `chest/open`, the loot on the ground, the glow at 45% for as long as you like.

The page plays exactly this: https://claude.ai/artifact/98gBXWsocwTYNbvh6DCvAw . Its script
(`concepts\chest-burst\chest-opening.html`, the table `TIMES` and the function `frame`) is the same numbers as code.

## Mine, for Victor, GD to know

- **Whose colour:** the best prize's, as in Zite. A chest of coins only would be common. Yours to say.
- **Quicker than Zite** (0.45 to 1.3 s where Zite builds for 0.7 to 3.7 s): here he stands in the world with monsters
  about. If Robin wants the long build for an epic, it is one number.
- **Sound** is Hugh, SD's: the shake, the pop and the coins are three moments that want one each.
- The chest keeps its three pictures. A lid that flies off, as in Zite, would be new pictures of the chest: say if
  it is wanted.

**Open:** the colours and the timings are for Robin to judge on the page. No piece for a legendary or a unique: the
game has four rarities today.

**Not tested:** not in the game and not on a phone. The page's own frames were made outside a browser
(`concepts\chest-burst\frames.js`) and looked at one by one; `look.jpg` is those. The cost in frames of about forty
small pictures and three drawn as light is not measured: the frame log will say.

**Origin and licence:** made here by `tools\burst.js`. How Zite opens a chest was read in Robin's own game
(`C:\dev\Zite\Game Developer\client\src\scenes\RevealScene.ts`) for the idea and the order; no picture and no code is
taken from it.

**Where to see it:** `look.jpg` (eight moments of a rare chest, from the page's real frames), `look-rarities.jpg` (the
burst in the four colours), and the page above, moving.

**Making it again:** `node tools/burst.js`; `node tools/packset.js burst work/chest-burst/render out/chest-burst --tight --width 512`;
the page's pictures and data: `node concepts/chest-burst/bake.js`; the look: `node concepts/chest-burst/frames.js rare work/chest-burst/f 300 800 p+40 p+160 p+420 p+800 p+1400 p+2600`
and `tools/concepts.js` over those.
