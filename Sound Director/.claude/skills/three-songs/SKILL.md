---
name: three-songs
description: Answer any request for a song with three different one-minute versions (A, B, C) for Robin to pick from, then finish the pick as the full loop. Use whenever Robin or Victor, GD asks for music ("make a track for X", "we need boss music", "compose the title", "a theme for the forest", "music for the shop") and no version exists yet, or Robin says "try three candidates" or "do a few versions". Robin's rule (2026-11-04): any song request gets three versions.
---

# Three songs

Never touch `C:\dev\Drok\Game Developer`. Read `docs\rules.md` (section 3: what Robin's ear taught us),
`docs\direction.md` and `docs\pipeline.md` first. The place and the energy come from the `new-track` skill's step 1;
this skill says how three candidates differ, how they are delivered and how the pick is finished.

## 1. Three that really differ (Robin, 2026-11-03: "Use different instruments")

Each candidate is a different answer, not the same tune re-dressed (his rule: a second theme differs in its rhythmic
cell, its meter or its contour, not only in its notes). Before any code, write the three in a table in a note: for each,
the lead instrument, the key or mode, the tempo and meter, the rhythmic cell of its hook, the accompaniment engine, and
one line on its mood. Make them differ in **at least three** of: the lead voice (a flute, a kalimba, a horn, a clarinet,
a piano), the meter or feel (4/4 straight, 6/8, a march, a waltz, a 3+3+2), the key or mode, the tempo, the engine (a
piano's off-beats, a plucked gallop, a drum, a walking bass). All three keep the place's energy numbers and the game's
sentence; none is calm by emptying. One may quote the title's hook if the game has one.

Each is a real piece of about a minute (a hook said twice, a second idea, the hook back), full from bar one, in the
template with its own file `music\<place>\<name>-a.rb`, `-b.rb`, `-c.rb` and a header that says what makes it A, B or C.

## 2. Render and check

As `new-track` steps 2 and 3: `tools\sonicpi-play.cmd FILE.rb 30 --silent` for errors, then
`node tools\render-track.js FILE.rb --deliver` for each (the queue runs the three in a row). The bar table of each must
show no hole; peak and RMS in the numbers; the three within about 1 dB LUFS of each other, so the louder one does not
win by being louder. Each to `out\music\<name>-a\` and so on with `full.mp3` and a `NOTES.md`.

## 3. Deliver all three at once

- On the phone page (`viewer\listen.html`): three rows under the place's tab, titled "<the place>, A: <the lead>" and
  so on, state `candidate`, each row's notes naming what to listen for and when (0:00 the hook, 0:18 the second idea).
- Into the chat: the three MP3s (SendUserFile) in one message, with one line each on what differs, and the question:
  a letter, or what is wrong with all three. Say that a mix of two is fine too (Robin, 2026-10-14: "combine the ideas").
- `docs\catalog.md` (one row for the three), `docs\feedback.md` (what was asked, what waits), `docs\log.md`.
- Tell Victor, GD that candidates are out and nothing is in the game yet.

## 4. Finish the pick

- **A letter:** that source becomes `music\<place>\<name>.rb`, written out to the length the budget allows (the
  `new-track` skill: the hook back in new colours with something new between, never emptied; whole bars; seamless),
  rendered with `--deliver`, encoded for the game, delivered under the game's name with the notes, the chat and the page
  as in `new-track` step 4. The row on the page becomes `current`; the two others move to `out\_archive\<name>-candidates-<date>\`
  and come off the page.
- **"A, but with B's drums":** combine, and say in the notes what came from where.
- **"Keep what we had":** all three to the archive, the old piece stays, the page cleared; no regret (Robin, 2026-11-03).
- **"None of them":** read his words against `docs\rules.md`, write what each missed, and make three new ones; do not
  re-dress the same three.
- Write his words and the date in `docs\feedback.md`; a rule, if one shows, in `docs\rules.md` section 3.
