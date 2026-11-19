---
name: harvest
description: Move what this game taught into the 2D game template at C:\dev\2D game template, so the next game of its kind starts further along: the lessons, the playtest rules, the felt numbers, the questions missing, the mistakes with their rules, an improved tool or skill, and a starter when the game's bones are worth one. Use at every chapter close, after a long session alone, and whenever Robin says "harvest", "update the guide", "put that in the template", "the next game should know this".
---

# The harvest: this game into the template

Robin, 2026-11-04 (FapleGlory, the first side-scroller): "this project is gonna help build a different type of game
than I've built before. That needs to go in the 2D game guide as well, so that the game guide easily can create 2D
sidescrolling games too in the future with all the knowledge we're gonna learn from this project." Every game does the
same for its kind. The template is `C:\dev\2D game template` (a git repo; commit there, never push unless Robin says).

1. **Read what this game has written since the last harvest**: `docs\lessons.md` (what worked, what went wrong, the
   felt numbers), `docs\playtests.md` (every round of Robin's play with its rules), the brief's "Decisions since the
   start", `docs\idea-bank.md`'s "Turned down", and the studios' `docs\log.md` for a tool or rule they changed. The last
   harvest's date is at the bottom of `docs\lessons.md` ("Harvested: date, what moved").
2. **Sort each thing by where it belongs in the template**:
   - a mistake with a rule → `lessons\common-mistakes.md`, "Added by later games", numbered on;
   - a felt number, a design rule or a way of working for this kind of game → `lessons\<game>-<kind>.md` (as
     `lessons\zite-2d-phone.md`, `lessons\survival-2.5d-browser.md`, `lessons\fapleglory-2d-sidescroller.md`: numbered,
     one paragraph each, with the why; a table of the felt numbers), created at the first harvest and kept current;
   - a question that should have been asked at the setup → `questions_startup.md`, its group, and the "added by later
     games" list;
   - a rule of the platform (how it runs, what it costs) → `platforms\<platform>.md`;
   - a tool, a check or a skill improved here that serves any game → the same place under `studios\` or `tools\`;
   - the game's bones worth a starter (a side view's footholds, gravity, jump feel, camera; a card game's hand and
     deck) → propose `starters\<name>` to Robin with what it would hold and what it costs; build it only on his yes,
     from a clean copy with this game's names taken out and its tests kept.
3. **Write in the template's voice**: plain words, the game and the date on every line, Robin's words quoted as his,
   "mine" for the studio's choices. Nothing is appended as a dated paragraph under an old one: a lesson file says what
   is true now.
4. **One line in `CHANGELOG.md`** (the date, the game, what changed), then commit the template with a one-line
   message. Do not push.
5. **Record the harvest**: a line "Harvested: date, what moved" at the bottom of `docs\lessons.md`, so the next
   harvest starts after it.
6. **Tell Robin** in a short list what moved and what was proposed (a starter, a tool), and stop.

What is never harvested: an asset (a picture, a sound) from this game; Robin's save; anything undecided (it stays in
the idea bank until it is a decision or a rule).
