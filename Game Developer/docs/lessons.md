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
| Steering | a tap walks him there, a thumb that drags is a stick, both at once | Robin: "click to move is good, but there needs to be a simple wqy to also move freely" | 2026-11-20 |
| Tap on a crab | counts within 26 units of its body | pending | |
| A tap or a drag | a touch is a drag once it has slid 10 units; a tap is acted on when the thumb lifts | pending | |
| The stick | appears where the thumb came down; reach 46 units, dead middle 7; the base follows the thumb | pending | |
| The skill buttons | in a row in the middle at the bottom; 72 across (the potion 56), pressed within 8 more; their middle 64 above the bottom | Robin: "the buttons should be in the middle at the bottom"; the sizes pending | 2026-11-20 |
| Health | his over the buttons with its numbers, the target's over that; a bar 44 or more long and 7 thick over a monster | Robin: at the top it was "hard to glance over. Maybe it should be at the bottom"; the sizes pending | 2026-11-20 |
| Where he is drawn | 60 above the screen's middle, since the glass covers the bottom | pending | |
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

7. **The Art Director lays the place out; a tool carries it into the rules.** His painted ground and his list of
   props came with a shore and circles to walk round. One script writes them into the rules' data, so the ground
   the rules walk on is the ground the picture shows, and it can be run again when he moves a palm.
8. **A plain field for the tests of feel.** Moving and fighting are tested on an open test field; what must hold on
   the real island is tested on the real island. A moved rock then breaks only the tests that are about rocks.

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

6. With things in the way, a tap that walks in a straight line and slides round what it meets got trapped in a
   notch between two rocks; the play-through bot found it by standing there for 70 minutes. Rule: the day a place
   has things in the way, a tap needs a way-finder, not a slide.
7. With pictures to load, the stopped page of a pane test never finished loading: the loader works through its
   files on the game's steps. Rule: in drive mode the page's clock runs until the play scene stands, and a test
   steps the page by hand while it waits.
8. The offline cache took pictures but not their data files, so the installed game would have had art it could not
   place. Rule: after adding a kind of file to the game, read the build's list of what it caches.

9. The Art Director's second drop lay in his `out\` for half an hour before this chat saw it: his message did not
   arrive, and the docs here still said "to come". Rule: before saying what is missing from a studio, look in its
   `out\` and at the repo's log.
10. A picture put in a window sat too high: its frame carries the point it stands on as a pivot, and the engine
    takes that as the picture's middle. Rule: a picture from a set is placed by its own point on the ground, and
    centred by hand everywhere else.
11. The game loads every picture at the start: 62 MB decoded with two places, over its own rule of 48 a place.
    Nobody broke a budget; the rule "by place" was simply never built. Rule: a budget that needs code gets an item
    on the plan the day it is written.
12. Robin came to play and "the link doesnt seem to work" (Robin, 2026-11-20): the app had stopped the dev server
    hours before, while the chat was quiet, and the report still gave the home link as if it would last. Rule: a
    link in a report is fetched from this PC in the same turn, and a home link is said to live only while the chat
    does; a game meant to be played when the developer is away needs its public page.
13. Three ways to steer were built as a choice of one, on a switch. Robin's answer after playing was none of the
    three: tap and a stick "both available at the same time" (2026-11-20). The rules already took both; only the
    screen made him choose. Rule: before putting ways of doing a thing on a switch, ask whether they can simply all
    work at once.
14. The first screen put health at the top and the skills in a corner, both picked from words in a questionnaire.
    One play moved both to the middle at the bottom. Rule: a screen layout is settled by a thumb on a phone, not by
    a question; build the first one fast and expect it to move.
15. With the glass at the bottom, he stood on the dock under his own health bar: the camera kept him in the middle
    and stopped at the place's foot. Rule: when the glass covers part of the screen, the camera's middle is the
    middle of what is left, and it may look past a place's edge on that side.
16. Robin's link was the dev server's page, and the dev server restarts every open page when a file is saved: the
    rule "never reload a page he is playing on" was being broken by every edit. Rule: the page the player plays on
    never has hot reload (`hmr: false`); he reloads it himself when told there is something new.
17. The pile had two red bars of one length, one over the other: his health and the monster's. Leonard, AD saw
    it on the real screen and made the monster's dark, his the biggest, with a heart. Rule: two bars that mean
    different things never share a colour and a size; and the Art Director looks at a layout on the real screen
    before it goes to Robin.
18. The ground of a place was one flat blue the second time he came to it. The strip of sea under a place's foot
    had been added to the ground's texture as a frame; from then on a picture made from that texture without
    naming a frame is that strip. It went out in a commit and was pushed: the pane test had sailed to the island
    once, never home and back. Rule: a frame added to a texture changes what "the picture" means; name the frame
    every time. And a change to how a place is drawn is tested by coming to the place twice.
19. The link died a second time the same day, eleven minutes before Robin's next message: the app stops the dev
    server when the chat has been quiet. Rule: until the public page exists, every reply to Robin starts by
    fetching the link, and says so when it had to be started again.
20. A picture of the stopped page kept timing out in the pane: the page draws only when it is stepped, and the
    picture waits for a frame. Rule: start a timer that steps the page a few times a second, then take the picture.

## Harvested

- 2026-11-20 (the setup): the questionnaire rule, the commit message file, the drive-mode clock, the root launch
  config and the port for the phone starter, and the questions a real-time fighting game needs, into the template.
- 2026-11-20 (chapter 1 alone, then with the art): the template's lessons 70 to 81, and json in the phone
  starter's offline cache. Committed in the template on this PC; not pushed (that is Robin's word to give).
