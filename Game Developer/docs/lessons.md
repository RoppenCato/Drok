# What this game taught

Numbered, one paragraph each, with the why: what worked, what went wrong and the rule it left. Robin's decisions
"(Robin, date)", ours "mine". Anything here that would serve any game goes back into the template
(`C:\dev\2D game template\lessons\common-mistakes.md`) with a line in its `CHANGELOG.md`: at every chapter's close,
the skill `harvest` does it (Robin, 2026-11-04). The rounds of Robin's play are in `playtests.md`.

## The felt numbers (the next game of this kind starts from these)

Units: one unit is one design pixel; the screen shows 412 by 915 units; the hero's body is 32 across. Every number is
Victor, GD's first guess of 2026-11-20 and is pending until Robin has played the control test.

| What | Number | Robin's word | Date |
| --- | --- | --- | --- |
| The walk | 215 units a second; the screen's width in 1.9 s; no acceleration, a dead stop on the lift | pending | |
| The camera | closes on the hero at 14 a second (all but there in 0.2 s) | pending | |
| The swing | one every 0.8 s; lands 0.12 s after it starts | pending | |
| A crab's fall | 55 health, 4 or 5 swings, about 2.5 s | pending | |
| The crab's wind-up | 0.5 s to step away in; he needs to move 12 units | pending | |
| Charge | up to 340 units at 950 a second (0.27 s for 300); stun 1.2 s; 8 s cooldown | pending | |
| Cleave | 170 degrees, 62 units to a crab's edge; 30 rage; 3 s cooldown | pending | |
| Tap on a crab | counts within 26 units of its body | pending | |
| Hold | stands within 14 units of the finger; full speed from 54 | pending | |
| The stick | reach 46 units, dead middle 7; the base follows the thumb | pending | |
| The skill buttons | 68 across, pressed within 84; 108 from the corner, 24 above the bottom | pending | |
| The canvas | twice the design size (824 by 1830) | pending: the frame log | |
| The climb to level 5 | 150, 420, 1000, 2200 experience; a bot does it in 16 minutes, a person perhaps in 30 | pending | |
| The monsters' bite | sand crab 5 to 8, reef gull 9 to 13, coconut crab's slam 20 to 28, against 100 health at level 1 | pending | |
| The gull | backs off about 200 units for 1.1 s after each bite | pending | |
| The slam | 0.9 s of wind-up; everything within 74 is hit | pending | |
| Loot | money from 7 kills in 10; gear from 1 in 10 (crab) to 1 in 3 (coconut crab); 70, 22, 7, 1 by rarity | pending | |
| Picking up | flies to him from 72 units | pending | |
| The chest | fills again 20 minutes later, by the clock | pending | |
| Falling | a tenth of his money; 2 s down; wakes in the harbour | Robin: "say 10%"; pending | |
| A potion | 45 health over 3 s, an 8 s wait, 12 gold, 10 carried | pending | |
| Prices | the stall sells at three times a piece's worth and buys at half | pending | |
| The island | 1400 by 2400: 11 s to walk its length | pending | |

## What worked

1. **The way of playing as the first build.** Robin asked for three ways to steer on one small field before chapter
   1, so the pick is made by his thumb and not by argument (Robin, 2026-11-19). The rules know only "walk there",
   "push this way", "that is my target", so all three schemes are thin: about a hundred lines of fingers-to-intents.
2. **Even steps under uneven frames.** The rules step sixty times a second whatever the screen does, and the screen
   draws between the last two steps. A script that fed the page frames at 60, 120 and 30 a second got 60 steps a
   second each time.
3. **Drawn from the state.** A wind-up, a stun, the target's ring and every position are read from the state each
   frame; only one-shots come from events. Nothing on screen can drift from the rules.

4. **A bot that plays the chapter.** The first run finished chapter 1 in nine minutes with no falls, which no
   reading of the numbers had shown. The bot is twenty lines of "what a sensible thumb does"; it is the cheapest
   balance tool there is, and it found that money piles up unspent.
5. **A kind of monster is two numbers.** The gull's retreat and the coconut crab's slam are `retreatSeconds` and
   `slamRadius` in the data, on top of one shared way of living. A fourth kind is a row in a file.
6. **One window at a time, rebuilt whole.** Each window is drawn again from the state whenever it may be stale,
   so it cannot show an old number, and there is no code that updates a window in place.

## What went wrong, and the rule each left

1. Nine lettered questions in one chat message, on his phone, got "Questionaire please" (Robin, 2026-11-20). Rule:
   a round of several questions with choices is asked with choice boxes; the root `CLAUDE.md` has the rule.
2. A commit message with quotation marks, passed on PowerShell's command line, was split into arguments and the
   commit did not happen. Rule: the message goes in a file and `git commit -F` reads it.
3. The page's clock was stopped when the game said it was ready, which is before the clock starts, so it ran on.
   Rule: stop it on the first step (`POST_STEP`), and again from `dev.step` if something woke it.
4. Two quick presses on the menu's "+" counted once, because the count was taken from what the menu last drew.
   Rule: a button changes the state from the state, never from the screen's copy of it.
5. The console showed errors that were not the page's: half-saved files during editing. Rule: read the page's own
   count (`window.dev.log.errorCount`) after a fresh load.

## Harvested

- 2026-11-20 (the setup): the questionnaire rule, the commit message file, the drive-mode clock, the root launch
  config and the port for the phone starter, and the questions a real-time fighting game needs, into the template.
