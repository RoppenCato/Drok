---
name: improve-asset
description: Improve one of Drok's art assets (a monster, a character, a backdrop, a ground piece, a prop, an icon, a panel). Use when Robin says "improve the slime", "make the forest background better", "fix the hero's arms", "the eyes look odd", or names any asset of C:\dev\Drok\Game Developer to be improved. Copies the asset into work\, reworks it, delivers a before/after into out\.
---

# Improve an asset

The copy-work-judge-deliver loop. Never touch `C:\dev\Drok\Game Developer`.

## 1. Know what is wrong before touching anything

- Read the asset's row in `docs\inventory.md`, and Robin's own words about it: take them literally, find out what made
  him say it, measure it if you can ("a midget" was a head too big; "two left eyes" was a copied eye).
- Look at it at the judging size: copy it into `work\<name>\` with the game's version as `before\`, make `before.png` at
  game scale beside our player on its real background (`tools\compare.js`), and Read the picture. Write down in
  `work\<name>\NOTES.md` three to five things that are wrong, each against a point of the check in
  `docs\direction.md`. Lead with the silhouette.
- Run the readability tests of `docs\techniques.md` section 1 on the before picture and write the answers down: grey,
  quarter size, the windup's silhouette against the idle's. The after must pass what the before failed.

## 2. Work on the copy

- Change the copy only. If the shared look is the problem (the line, the shade, the rig), change it and say so: it
  reaches every asset.
- If the fault is the construction (a doll of parts; parts facing different ways; a background that is one flat
  painting where pieces are needed), no finish pass will fix it: rebuild, and show concepts first. A better finish on a
  doll is still a doll (`docs\rules.md` 1).
- If Robin said "correct it, don't redesign it", make local corrections only; his proportion stays.
- A quick check first (few frames, one facing), look, iterate; then the full set.

## 3. Judge

- `work\<name>\compare.png`: before and after at game scale on the real screen with our player beside, then the key
  frames at 2x. Read it. Then the check, each point answered in the notes, honestly.
- Shrink to a quarter (the thumbnail test) and look again.
- Beside the player, on its background, tiled 3 by 3 if it repeats, played at real delays on the moving page
  (`sites\moving.html` with before and after as the two atlases, so the switch shows the difference) if it moves.
- The weight: not heavier than before without a reason; within the budgets in the game's `docs\state\art.md`.

## 4. Deliver

- `out\<name>\` with the changed sources, the atlas or pictures, `compare.png` and `NOTES.md`: what changed and why, in
  plain words with the date; the drop-in steps (copy the whole folder; list what changed); anything Robin must decide.
- A line in `docs\log.md`; the asset's row in `docs\inventory.md`.
- Tell Robin: the picture (sent into the chat), the moving page if it moves, what changed in three lines, and what is
  his to decide. Tell Victor, GD the folder changed.
