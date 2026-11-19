---
name: improve-track
description: Improve or lengthen one of Drok's tracks (one already in this studio) by rewriting it in Sonic Pi. Use when Robin says "improve the forest theme", "make it longer", "it gets too happy at 44 seconds", "redo X", "tone down the intro", "use another instrument there". Keeps the hook recognisable, pins the version he liked, compares at matched loudness, says what changed.
---

# Improve a track

Never touch `C:\dev\Drok\Game Developer`. Read `docs\direction.md`, `docs\rules.md` section 3 and
`docs\feedback.md` (the piece's row: Robin's words so far) first.

## 1. Know what is there

- **Pin the original:** the version Robin liked is the fixed reference for every round; name each change against it,
  never against the last draft (revising from the latest draft drifts away from what was liked). Copy its source to
  `music\<place>\<name>-v<N>.rb` before touching anything, so the old render can always be made again.
- Transcribe the hook and the form into the new file's header comment. The hook stays recognisable unless he says
  otherwise.
- Write down what is weak, each point against his words or a rule of `docs\rules.md`. A time he names ("from 1:14",
  "around 44 seconds") is found in the per-bar table and the source before anything is changed.

## 2. Rewrite

- Follow `new-track` steps 2 and 3, keeping key, tempo and bar count unless there is a reason to change them (say it).
- A long version: the theme returns in new colours with new sections between; never emptied (`docs\rules.md`).
- "Another instrument": change the voice, keep the line; check the new voice's level against the old by the bar table
  (a blade or a saw horn reads quieter than a flute at the same amp: `docs\sonic-pi-notes.md`).
- "Too happy at 0:44": a major chord in a dark place; swap it for the minor, a sus or an open fifth, keep the tune.

## 3. Compare and deliver

- **Compare at matched loudness:** when Robin hears the old and the new, both play at the same LUFS, or the louder one
  wins whatever it is. Give him both on the page (the old row set to `kept` until he decides).
- As in `new-track` step 4, with a **Before and after** section in `NOTES.md`: what was weak, what was done about each
  point, what was kept on purpose. The old version's folder moves to `out\_archive\` once he takes the new one, and the
  game's file keeps its name so Victor, GD swaps it in place.
