# How a change is checked

Robin, 2026-11-04: automatic tests that catch errors, from the first commit. What exists is listed here; a change that
adds a test adds a line. The tests print numbers a person can read; a green run with a broken game is the mistake both
earlier games made, so the pane and Robin's device are part of the check.

## The levels

1. **The rules, headless** (`npm test`, from `Game Developer\`): every action and its events; the same seed gives the
   same game; every rejection with its reason; a save round trip, a broken save gives nothing. The purity test keeps
   the rules away from the screen, the clock and the network (it reads the source, comments included: never write
   the browser's own words there).
2. **The code** (`npm run typecheck`): TypeScript strict, the rules without the browser's types, then the whole.
3. **The bot** (`rules\test\bot.test.ts`, part of `npm test`): a sensible thumb plays each way of steering for 90
   seconds on three seeds and prints kills a minute, health lost, falls, Charges and Cleaves. Every change to
   `rules\data\numbers.json` reads these lines. When they look wrong, check the bot before the game.
4. **The pane at 412 by 915** with `?mute=1&drive=1`: the page's own clock is stopped and `window.dev.step(n)` moves
   it n frames, so a hidden or slow pane tests exactly. Fingers are made by a script (mouse events for taps, touch
   events for holds); the state is read back and compared with what the rules should give. `docs\state\pages.md` has
   the addresses and the script's shape.
5. **Robin's phone**: the link, what to tap, the frame log and error log he can save from the menu. His numbered
   playtest notes are the real test; each goes into a fix, a test, or the idea bank (`playtests.md`).

## What exists

| Test or check | Command | Covers |
| --- | --- | --- |
| `rules\test\game.test.ts` (30 tests) | `npm test` | a new game; the same seed plays out the same; the state is never changed; a bad step refused; walking by tap and by thumb (full speed on the first step, a dead stop on the lift, half push half speed); the field's edges; scheme 1 targets by tap only, 2 and 3 pick the nearest and never leave one in reach; struck with no target he turns on the striker; the next attacker becomes the target; a swing while walking; a wind-up dodged; Charge; Cleave; falling and standing up; health coming back; respawns; the crab count; the save |
| `rules\test\bot.test.ts` (3 tests) | `npm test` | each scheme played for 90 s on 3 seeds: the game stays whole, nothing refused; prints the numbers |
| `rules\test\purity.test.ts` (15 tests) | `npm test` | no `Math.random`, clock, timers, DOM or network in the rules; they import only their own files and `rules\data\` |
| typecheck | `npm run typecheck` | the whole, strict |
| build | `npm run build` | the installable page into `dist\` |
| the stepped page | the pane, `?mute=1&drive=1&seed=tide` | on 2026-11-20: tap to walk lands where the tap pointed; a tapped crab is targeted and fought; hold steers towards the finger and stops dead on the lift; the stick's half push is half speed and its base follows the thumb; the skill buttons and their refusals; the menu; frames at 60, 120 and 30 a second all give 60 steps a second; the save |

The numbers the tests printed on 2026-11-20: 300 units walked in 1.40 s (215 units a second; the screen's width in
1.92 s); a sand crab (55 health) falls to 4 or 5 swings in about 2.5 s; a Charge over 300 units takes 0.27 s; a
Cleave on three hits for 17 to 20 each; the bot gets 14 to 15 crabs a minute and loses 71 to 78 health a minute with
no falls.

## Not checked by anything yet

- How it feels: the walk's speed, the three schemes, the buttons under a real thumb. Only Robin's phone can say.
- The page running on its own clock for minutes: the pane is hidden while the AI works and its clock barely runs, so
  the real loop was fed frames by a script, not watched.
- Sixty frames a second on his phone: the frame log (menu, "Save the log") says.
- Installing and playing offline: needs the public page (chapter 1).

## Before a commit

Tests green, the typecheck green, the pane looked at when the screen changed, `docs\state\` updated for the system
touched, the commit message says what and why.

## Before a chapter closes

Every item of the plan Checked by Robin; the bot run on the chapter's levels; the frame log on his phone; the alpha
link opened cold on a device that never saw the game.
