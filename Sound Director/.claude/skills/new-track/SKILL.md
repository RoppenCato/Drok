---
name: new-track
description: Compose a music track for Drok in Sonic Pi (a region, a town, a shop, a fight, a boss, the title, a menu) and finish it as a seamless loop the game can play. Use to finish the candidate Robin picked after three-songs, or when he asks for exactly one piece ("just make the shop loop", "write the ramp for the boss"). Writes the source under music/, renders one mix to out/music/<name>/ and delivers with notes, an MP3, the game's file and the phone page. A new song request with no versions yet starts with three-songs, not here.
---

# A new track

Never touch `C:\dev\Drok\Game Developer`. Read `docs\direction.md`, `docs\rules.md` (section 3 is Robin's own rules
from his verdicts) and `docs\pipeline.md` first. If Robin asked for a song and no versions exist, the skill `three-songs`
comes first; this skill finishes the pick.

## 1. The place before the notes

- Find the place and state in `docs\game-notes.md` and the game's docs (ask Victor, GD what the place is like and
  Leonard, AD what it looks like); note what the player is doing there and for how long (a fight is a minute or two;
  a map is looked at for long stretches). Only places the game has or builds next.
- Choose tempo and key against the tracks of the same place in `docs\catalog.md` (a shared key family; a night slower
  than its day).
- **Name the energy in numbers before any note** (Claude's own taste drifts to slow, gentle, ambient counterpoint;
  Robin heard it as "too much lullaby"): the tempo; the notes per bar in the busiest part; what moves under a long
  melody note (a figure in eighths, a bass that walks, a drum); which bars have percussion. Only a night or a rest may be
  still. If Robin names a game as the reference, the arrangement follows it.
- Write the plan into the header comment: a table of sections in bars, the instrument that leads each, what B changes,
  where the percussion drops out. Then the hook as note names, four bars at most. If it cannot be hummed from the names,
  it is not a hook yet.
- **Cap the parts:** one lead, one accompaniment figure, bass, light percussion, a pad. More layers make parts inaudible.
- **The length is the budget's** (`docs\game-notes.md`): a title loop 30 to 45 s, a fight 45 to 60 s, a main theme up to
  2.5 minutes, unless Victor, GD says otherwise.

## 2. Write it in the template

- Copy `music\_template.rb` to `music\<place>\<name>.rb`; load `music\_lib.rb` (and `music\_fight.rb` for a fight). Keep
  `STEM` and `PASSES` as they are: the renderer rewrites them. One mix, no layers (Robin, 2026-10-14).
- Instruments from `_lib.rb`; parts one `in_thread` each; every part takes `b` (the bar number); every part lasts exactly
  the piece's total beats per pass. Heavy FX (reverb) wrap a whole part, never a fast loop.
- Humanise from the seeded stream (`use_random_seed` once at the top); drums tight, the lead loose.
- Write the last bar so nothing with a strong fundamental crosses the loop point.

## 3. Hear and measure

- `tools\sonicpi-play.cmd music\<place>\<name>.rb 30 --silent` to check for errors (audible only when Robin wants to hear).
- `node tools\render-track.js music\<place>\<name>.rb` renders the mix and prints the per-bar loudness. A section
  quieter than its neighbours is a hole; a peak over -1 dBFS or a seam click goes back to step 2. Check the energy numbers
  of step 1 against what was written. `ffmpeg -i work\<name>\full.wav -af ebur128 -f null -` for the LUFS.

## 4. Deliver

- `--deliver` copies the loop and `manifest.json` into `out\music\<name>\`; encode `full.mp3` (`tools\mp3.js`) and the
  game's file in the format Victor, GD confirmed (`ffmpeg -i full.wav -c:a libvorbis -q:a 4 <name>.ogg`); check the
  size against the budget.
- `NOTES.md`: what it is for, the form and the hook in words, the loop length in seconds and samples, the measurements,
  every file's size, how the game plays it, what is Robin's to decide. Send the MP3 into the chat; put it on Robin's
  phone page (`viewer\listen.html`, republished with the file under `files`); log, catalog, feedback; tell
  Victor, GD the path and the name.
- **Tell Robin where to hear it** (his rule, 2026-10-23): the phone page's tab and the row's title, and what to listen
  for (a time, a section). When a version is turned down or replaced, move its folder to `out\_archive\` and take its row
  off the page and out of `out\music\catalog.json`.
