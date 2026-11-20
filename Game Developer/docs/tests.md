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
| `rules\test\game.test.ts` (25) | `npm test` | the same seed plays out the same; the state is never changed; a bad step refused; walking by tap and by thumb; the place's edges; who the target is in each scheme; a swing while walking; a wind-up dodged; Charge; Cleave; health coming back; a fallen monster coming back in its zone |
| `rules\test\chapter1.test.ts` (28) | `npm test` | the data is whole (places, zones clear of the dock, every wind-up can be walked out of, a piece for every slot in every tier); a rarer piece is better; a new hero; the town; sailing; the gull's retreat and the coconut crab's slam; experience, a level, the last level; armour; loot by its chances over 600 kills; picking up; a full bag; the chest and its refill by the clock; falling and its cost; potions; wearing, taking off, dropping; the stall's stock, buying, selling; the save out and back, broken files, the control test's save, data that is gone |
| `rules\test\bot.test.ts` (4) | `npm test` | each scheme fighting crabs for 90 s on 3 seeds; chapter 1 played through on 3 seeds; the game stays whole; prints the numbers |
| `rules\test\purity.test.ts` (23) | `npm test` | no `Math.random`, clock, timers, DOM or network in the rules; they import only their own files and `rules\data\` |
| typecheck | `npm run typecheck` | the whole, strict |
| build | `npm run build` | the installable page into `dist\` |
| the stepped page | the pane, `?mute=1&drive=1&seed=tide` | on 2026-11-20: a tap on the pier walks him there and opens the chart; a tap on the island sails; a fight; loot of two rarities picked up; wearing it from the bag; the hero window; the "Sea chart", "Trade" and "Open chest" buttons; buying a potion and a piece; the settings (steering, hand, "start over" asks twice); the save out and back, and a file that is not one; hold steering on the island; the chest |
| the built page, offline | the pane, `localhost:4178` | on 2026-11-20: the service worker is active and has cached the page; with the server stopped the page still opens and keeps its save |

Since Leonard, AD's island came in (2026-11-20) there are 90 tests: moving and fighting are tested on a plain test
field (`rules\test\sim.ts`), so they do not depend on where he put a palm; what must hold on the real island is
tested there. On the real island the bot still plays chapter 1 through on three seeds: level 5 at about 15.3
minutes, no falls. A crab-fighting bot that never drinks now falls once or twice in four and a half minutes: the
beach is denser than my first layout. The page was stepped again with the art on: the landing, a tap on a crab's
picture, a fight, loot of three rarities, the stall and the bag on his glass.

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

- How it feels: the walk, the three schemes, the buttons under a real thumb, the windows on a real phone.
- The page running on its own clock for minutes: the pane is hidden while the AI works and its clock barely runs,
  so the real loop was fed frames by a script, not watched.
- Sixty frames a second on his phone: the frame log (settings, "Save the log") says.
- Export and import through the phone's own file picker: the save's text was sent out and back by a script; the
  picker itself was not opened.
- Installing from a real web address: needs the public page.

## Before a commit

Tests green, the typecheck green, the pane looked at when the screen changed, `docs\state\` updated for the system
touched, the commit message says what and why.

## Before a chapter closes

Every item of the plan Checked by Robin; the bot run on the chapter's levels; the frame log on his phone; the alpha
link opened cold on a device that never saw the game.
