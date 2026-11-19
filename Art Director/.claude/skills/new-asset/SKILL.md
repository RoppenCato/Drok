---
name: new-asset
description: Suggest and then build a new monster, boss or character for Drok, as named actions with frame data in the game's atlas form. Use when Robin says "a new monster for the swamp", "what should live in the mountains", "we need a boss for the first gate", "make the archer", or names a creature or character to be designed or built.
---

# A new asset: a monster, a boss or a character

Two halves: the list to pick from, then the build. Stop after the list unless Robin has already picked. The look is
`docs\direction.md`; the game's `..\Game Developer\docs\art-demands.md` says which creatures are needed, at what size
and in what order. Never work in `C:\dev\Drok\Game Developer`.

## 1. The list (what Robin picks from)

- Read the brief and the game's docs for the place: its mood, its level band, what lives there already
  (`docs\inventory.md` and the game's `art-demands.md`), and the game's idea bank for creatures Robin has noted.
- Offer five to eight, **each with a picture**: a quick still of the silhouette and colour beside our player, on one
  page with a number and a caption each (`sites\pick.html`, or `tools\concepts.js` for one picture). Robin picks from
  pictures, never from names. For each, in three lines:
  1. **Name and what it is**, in one sentence. What it does in a fight is Victor, GD's; say only what the look
     promises (slow and heavy, quick and bouncy, a caster with a glow).
  2. **The look**: the one thing that carries the silhouette at a hundred pixels, the face, and the one exaggeration
     `hit1` will make.
  3. **The actions and the cost**: `stand`, `move` (or `fly`), `hit1`, `die1`, `attack1`; the frame counts from
     `docs\direction.md`; the file size.
- Say which one or two you would do first and why. Then stop and let Robin pick.

## 2. Big work gets three concepts

A main creature, a boss that fills the screen, a class character, anything that matters a lot: the skill
`three-concepts` before any rig or clip. A random monster of the place goes straight to the build.

## 3. The build (after the pick)

- Write the design in `work\<name>\NOTES.md` first: the silhouette in the game's facing; the proportions against the
  player; the colours (the place's palette, the edge); every action with what each pose is (the windup is the tell;
  `hit1` the most exaggerated; the feet at one height; parts that follow late); the construction it shares with the
  cast (the eye, the face, the skeleton), so it belongs beside them.
- A new creature is its own idea, never an old one changed a bit (`docs\rules.md` 5). Its own silhouette, its own way
  of moving.
- Anything with arms and legs is built on `tools\rig.js` from the first still, never posed by hand (`docs\rules.md`
  52): the skeleton and the bone lengths first, the parts drawn from its joints, the clips as lists of poses; the face
  by `docs\rules.md` 51.
- Build, quick check (one action, a few frames), look; iterate; the full set; pack with `tools\pack.js`; the frame data
  (origin at the feet, delay, hit box, head, fades) in the meta.json.
- Judge: next to our player for scale (`tools\compare.js`); on its own place's background; the animation at real delays
  on the moving page (`sites\moving.html`); the check in `docs\direction.md`, each point answered in the notes.
- Shrink to palette PNGs (`tools\shrink.py`), check the budget in the game's `docs\state\art.md`.
- Deliver into `out\<name>\` with the data and `NOTES.md` (what it is, the scale the game draws it at, the blow frame,
  what was not tested); the log; the inventory row. Send the picture and the moving page into the chat. Tell Robin
  what is his to decide, and tell Victor, GD how the game draws it (a new key, the atlas and its frame data).
