# How a change is checked

Robin, 2026-11-04: automatic tests that catch errors, from the first commit. What exists is listed here; a change that
adds a test adds a line. The tests print numbers a person can read; a green run with a broken game is the mistake both
earlier games made, so the pane and Robin's device are part of the check.

## The levels

1. **The rules, headless** (`npm test`): every action and its events; the same seed gives the same result; every
   rejection with its reason; a save at an old version migrates, a broken one gives nothing. The purity test keeps the
   rules away from the screen, the clock and the network.
2. **The code** (`npm run typecheck` for TypeScript; the parse and duplicate-name checks for plain scripts): after
   every change, before every commit.
3. **The bots** (when the game has them, `tools\sim-*`): a sensible player through the whole game with many seeds;
   prints walls and numbers; every balance change runs them. When the bots show a wall, check the bot before the game.
4. **The pane at the judging size** (`docs\platform.md`), shown, with `?mute=1`: a screenshot cropped at full size,
   the console read for errors, a scripted playthrough for what Node cannot see (the starter's drive mode).
5. **Robin's device**: the link, what to tap, the frame log and error log he can download. His numbered playtest notes
   are the real test; each goes into a fix, a test, or the idea bank.

## What exists

| Test or check | Command | Covers |
| --- | --- | --- |
| _the starter's rules tests_ | `npm test` | _new game, same seed same result, rejections, tick, save round trip, migrations_ |
| _the purity test_ | `npm test` | _no Math.random, Date, timers, DOM, network in the rules_ |
| _typecheck / parse and dup checks_ | `npm run typecheck` / `npm test` | _the whole_ |

## Before a commit

Tests green, the check green, the pane looked at when the screen changed, `docs\state\` updated for the system
touched, the commit message says what and why.

## Before a chapter closes

Every item of the plan Checked by Robin; the bots run on the chapter's levels; the frame log on the weakest device;
the alpha link opened cold on a device that never saw the game.
