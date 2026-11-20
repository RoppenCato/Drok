# How a change is checked

Robin, 2026-11-04: automatic tests that catch errors, from the first commit. What exists is listed here; a change that
adds a test adds a line. The tests print numbers a person can read; a green run with a broken game is the mistake both
earlier games made, so the pane and Robin's device are part of the check.

## The levels

1. **The rules, headless** (`npm test`, from `Game Developer\`): every action and its events; the same seed gives the
   same game; every rejection with its reason; the data is whole; a save out and back, an old one brought up, a
   broken one gives nothing. The purity test keeps the rules away from the screen, the clock and the network (it
   reads the source, comments included: never write the browser's own words there).
2. **The code** (`npm run typecheck`): TypeScript strict, the rules without the browser's types, then the whole.
3. **The bots** (`rules\test\bot.test.ts`, part of `npm test`): one fights crabs with each way of steering; one
   plays chapter 1 through, from a nobody in the harbour to level 5 and the chest, on three seeds, as a sensible
   player would (hunts what his level can take, drinks when hurt, steps out of slams, sells and restocks in town).
   Every change to `rules\data\` reads their lines. When they look wrong, check the bot before the game.
4. **The pane at 412 by 915** with `?mute=1&drive=1`: the page's own clock is stopped and `window.dev.step(n)` moves
   it n frames, so a hidden or slow pane tests exactly. Fingers are made by a script; the state is read back and
   compared with what the rules should give. `docs\state\pages.md` has the addresses and the script's shape.
5. **Robin's phone**: the link, what to tap, the frame log and error log he can save from the settings. His numbered
   playtest notes are the real test; each goes into a fix, a test, or the idea bank (`playtests.md`).

## What exists

| Test or check | Command | Covers |
| --- | --- | --- |
| the ground (in `chapter1.test.ts`, 4) and the save's steps (2 more) | `npm test` | on Leonard, AD's island: the shore stops him and he slides along it; a tap from the landing to the chest and back finds the way and never stands in a solid thing; a tap on the sea or a rock takes him to the nearest ground; a landing is safe and walking monsters keep to the land; a version 2 save gets its `route`; a hero saved where the sea now is, is put ashore |
| the harbour's ground (in `chapter1.test.ts`, 4) and one more save test | `npm test` | on Leonard, AD's town: a house is a box that cannot be stood in; a tap behind a house finds the way round and he never stands in a wall, the well or a person; pushed slantwise at a wall he slides along it; a tap on the stall takes him to its front, near enough to buy; a hero saved where a house now stands is put on the quay, one beside it is left be |
| `rules\test\game.test.ts` (27) | `npm test` | the same seed plays out the same; the state is never changed; a bad step refused; walking by tap and by thumb, and the two together (a push takes over from a tap, a tap walks him again after it); the place's edges; who the target is: the nearest when nothing is tapped, the tapped one kept against a nearer one, let go when far behind; a swing while walking; a wind-up dodged; Charge; Cleave; health coming back; a fallen monster coming back in its zone |
| `rules\test\chapter1.test.ts` (28) | `npm test` | the data is whole (places, zones clear of the dock, every wind-up can be walked out of, a piece for every slot in every tier); a rarer piece is better; a new hero; the town; sailing; the gull's retreat and the coconut crab's slam; experience, a level, the last level; armour; loot by its chances over 600 kills; picking up; a full bag; the chest and its refill by the clock; falling and its cost; potions; wearing, taking off, dropping; the stall's stock, buying, selling; the save out and back, broken files, the control test's save, data that is gone |
| `rules\test\bot.test.ts` (3) | `npm test` | a bot fighting crabs for 90 s on 3 seeds by taps, and one by the thumb's push; chapter 1 played through on 3 seeds; the game stays whole; prints the numbers |
| `rules\test\purity.test.ts` (23) | `npm test` | no `Math.random`, clock, timers, DOM or network in the rules; they import only their own files and `rules\data\` |
| the long balance run (in `bot.test.ts`, 2, skipped by `npm test`) | `npm run balance` (40 s) | chapter 1 played through on ten seeds by a sensible player and by a clumsy one (stands in every slam, drinks only at a quarter health, never uses Charge); prints the middle, the least and the most of: the minute each level comes, the chest, falls, trips home, potions, money |
| typecheck | `npm run typecheck` | the whole, strict |
| build | `npm run build` | the installable page into `dist\` |
| the stepped page | the pane, `?mute=1&drive=1&seed=tide` | on 2026-11-20: a tap on the pier walks him there and opens the chart; a tap on the island sails; a fight; loot of two rarities picked up; wearing it from the bag; the hero window; the "Sea chart", "Trade" and "Open chest" buttons; buying a potion and a piece; the settings (steering, hand, "start over" asks twice); the save out and back, and a file that is not one; hold steering on the island; the chest |
| the built page, offline | the pane, `localhost:4178` | on 2026-11-20: the service worker is active and has cached the page; with the server stopped the page still opens and keeps its save |
| steering and the glass at the bottom | the pane, `?mute=1&drive=1&seed=tide` | on 2026-11-20, after Robin's first play: a touch does nothing until it lifts, then he walks to it; a touch that slides is the stick (he is steered, the tap's place is dropped, he stops dead on the lift, and no tap comes of it); a tap on the dock through the glass walks him there and he stands above the pile (y 627), not under it; a tap on a crab makes it his and he fights it; the pile, the plate and the bar over the crab are drawn as in `state\client.md`. Again with Leonard, AD's second glass drop: his wells and round fills, the heart, the pale part after a blow, the gold-rimmed bar and its arrow over the crab he fights, the number beside it, his ring and knob for the stick; no error. And a page that is open is not reloaded when a source file is saved (a mark set on it was still there). Not checked: two fingers at once (the pane has one mouse), the bars seen moving at the page's own speed, and how any of it feels |
| his own bar over his head | the pane, `?mute=1&drive=1&seed=tide`, the scene `drok.scene4` | on 2026-11-20, after Robin's pick: read pixel by pixel, a column through the bar is outline, health with its light stripe, outline, crimson rage, outline, with no line of the back between a fill and the frame; the empty part is the back's colour; over 90 frames of walking by the thumb the bar is always on a whole pixel, never more than half a pixel off his middle, and its height over him holds within a pixel; a blow leaves the pale part at the old health and it shrinks to the new; a saved game with half his health opens with no blow shown; hidden in the harbour, while he is down and when he wakes; on the island's dock he stands at y 589 with the "Sea chart" button at 739; no arrow over the crab he fights; no error. Not checked: at the page's own speed, on a phone, on a screen with one pixel a unit (a desktop: the half units of his fills fall between pixels there), and how the two reds read to Robin |
| a monster's bar kept off his bar and face | the pane, the scene `drok.scene4`, three crabs held in place each step | on 2026-11-20, the three places Leonard, AD named: the crab he fights 8 east and 5 north of his feet has its bar's foot 2 above his bar's top; a hurt crab 38 north of him is piled 2 above that one; a crab 40 west of him keeps its bar over its own head. When the first steps away its bar slides back in 12 frames and the second comes down to sit 2 above his bar. A fight of 600 steps with nothing held: no bar lifted, none changed its mind, no error. Not checked: with "fewer effects", at the page's own speed, on a phone |
| the basic sounds | the pane, `?mute=1&drive=1&seed=tide`, the scene `drok.scene4` | on 2026-11-20: the list and all 65 files load, no error; ten seconds of a fight with a Cleave and a potion started `swing` 7, `hit` 7, `cleave` 1, `hit_heavy` 1, `hero_hurt` 4, `monster_die` 3, `coin` 3, `potion` 1 (read from `dev.sounds.played`); with the engine silenced and the page's mute lifted, every one of the 20 names plays without an error; the settings show "Sound: on". Not checked: heard by anyone, the levels, on a phone, the first touch that unlocks sound there |

**106 tests on the big island (2026-11-20, Leonard, AD's Crab Cay with the town on it).** New: the town on the
island (4: he starts there and none is born there; health and nothing comes for him; one he has hurt fights on;
new pieces on coming back), the save's step to version 7, two trinkets (2), gloves and rings brought up. The
harbour's and the small island's own tests now run on the one island. The bot: level 5 at 11.3 minutes on three
seeds, the chest right after, no falls; the two fighting bots fall 3 times in four and a half minutes (the beach
is denser). In the pane: the town as he starts in it, a walk west to the crabs, a walk north into the grove with
"The grove" on the glass and a gull; no error. Not checked: the cove and the chest on the screen, the frame rate
with 432 props (the pane's clock is stepped), anything on a phone, the long balance run.

**99 tests since the grounds (2026-11-20, after the house was tried and left):** two more in `chapter1.test.ts`:
far from him a strolling monster sleeps, near him it strolls, and one on its way home is never asleep; Crab Cay
has three grounds and he lands on the beach. In the pane: sailed to Crab Cay, walked up the path, and the glass
said "The grove, Levels 3 to 4" where the grass begins; no error.

Since Robin's first play (2026-11-20) there are 97 tests (the save is version 4: one more step up). Since Leonard,
AD's places came in, moving and fighting are tested on a plain test
field (`rules\test\sim.ts`), so they do not depend on where he put a palm; what must hold on the real island and
in the real town is tested there. On the real places the bot still plays chapter 1 through on three seeds: level 5
at about 15.2 minutes, no falls, two to four trips home to his stall. A crab-fighting bot that never drinks now
falls once or twice in four and a half minutes: the beach is denser than my first layout. The page was stepped
again with all the art on, the dev page and the built one: the town with its people; a tap on the stall walks him
to it and opens it; a tap on the dock opens the chart; "Sail to Crab Cay" sails; a tap on the harbour's pin sails
home; the cross closes the chart; a tap on a crab's picture, a fight, 40 crabs, loot of three rarities, the bag.
No error in the page's own log.

**The long balance run, 2026-11-20** (ten seeds each; the middle first, then the least and the most):

| | A sensible player | A clumsy player |
| --- | --- | --- |
| Level 2 at minute | 1.2 (1.2 to 1.3) | 1.3 (1.1 to 1.4) |
| Level 3 | 4.7 (4.1 to 4.8) | 4.9 (4.6 to 5.1) |
| Level 4 | 8.3 (7.7 to 8.4) | 8.5 (8.2 to 8.9) |
| Level 5 | 15.4 (14.5 to 15.6) | 15.6 (15.0 to 16.0) |
| The chest | 15.6 | 15.7 |
| Falls | 0 (0 to 0) | 0 (0 to 0) |
| Trips home | 2 (2 to 4) | 4 (3 to 5) |
| Potions drunk | 6 (5 to 8) | 33 (23 to 36) |
| Money earned, and left | 1206, 1110 left | 1261, 996 left |

What it says (mine): **nobody falls.** A player who stands in every slam and drinks late still never goes down in
ten runs: he pays for it in potions, about 33 of them (some he finds; the rest cost him about 265 of the 1260 money
he earns), and he has nothing else to spend it on. So "on death you lose money" (Robin, 2026-11-19) never happens on Crab Cay as the
numbers stand, and the clumsy player is only a few seconds a level behind the careful one. The bot is still a bot:
it never walks into the coconut crabs at level 1, as a curious person will. What would make falling real, each a
number in `rules\data\`: the monsters' bite up by a third to a half; a potion's wait from 8 s to about 15, so they
cannot be drunk through a fight; or a potion's price up. Robin's to feel first; nothing was changed.

The numbers the tests printed on 2026-11-20, before the island came in:

- 300 units walked in 1.40 s; the island's length in 11.2 s.
- A sand crab (55 health) falls to 4 swings with a rusty cutlass in about 2.5 s.
- With each way of steering the bot fells 18 to 19 crabs a minute and loses 76 to 78 health a minute.
- 600 sand crabs: money from 67% of them (1.7 a kill), a potion from 4.7%, gear from 10.7% (50 common, 9
  uncommon, 5 rare, 0 epic).
- Chapter 1 played through (three seeds): level 2 at 1.3 minutes, 3 at 4.9, 4 at 8.5, 5 at 15.5; the chest right
  after. About 96 sand crabs, 68 reef gulls, 40 coconut crabs. No falls, 2 or 3 trips home, 3 to 5 potions drunk,
  1200 to 1340 money earned and almost none of it spent.

What those say (mine): a person will be slower and clumsier than the bot, so about half an hour to level 5; the
bot never falls and hardly drinks, so the island is on the mild side; and money piles up with nothing to buy,
which the later chapters' upgrading is meant to answer. All three are Robin's to feel.

## Not checked by anything yet

- How it feels: the walk, the tap and the stick, the buttons under a real thumb, the windows on a real phone.
- Two fingers at once on the field (one steering, one tapping a monster): written, never pressed.
- The page running on its own clock for minutes: the pane is hidden while the AI works and its clock barely runs,
  so the real loop was fed frames by a script, not watched.
- Sixty frames a second on his phone: the frame log (settings, "Save the log") says.
- Export and import through the phone's own file picker: the save's text was sent out and back by a script; the
  picker itself was not opened.
- Installing from the public page on a real phone, and playing it there with the network off (in the pane on
  2026-11-20 the public page played with no error and its offline cache was filled).

## Before a commit

Tests green, the typecheck green, the pane looked at when the screen changed, `docs\state\` updated for the system
touched, the commit message says what and why.

## Before a chapter closes

Every item of the plan Checked by Robin; the bot run on the chapter's levels; the frame log on his phone; the alpha
link opened cold on a device that never saw the game.
