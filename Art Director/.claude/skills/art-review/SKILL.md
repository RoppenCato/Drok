---
name: art-review
description: Review Drok's art and say what needs improvement, with reasons and pictures, ranked. Use when Robin asks "what needs improvement?", "review the art", "what looks wrong", "how does it look now", or wants an opinion on the art direction itself.
---

# What needs improvement

An honest ranked list with pictures, not a wish list. Rank by how much of the screen a thing is on (the main view
first, then the fight or level, then the panels) and how far it sits from the direction (`docs\direction.md`), in that
order.

## 1. Look, at the judging size

- Open the game in the browser pane at the judging size (`docs\direction.md`: the mobile preset for a phone game, the
  window size for a computer one) and take screenshots of every kind of screen: the main view in two or three places,
  a fight or level in each kind of backdrop, a town or shop, the title, the biggest panel. Crop and look; never judge
  from a small sheet.
- The characters and monsters: one picture per family at game scale with the hero for size (`tools\compare.js`). Read
  each picture.
- The sentence of the look and the studio's reference board (`docs\reference\`) beside them.

## 2. Judge

For every asset and every screen, the points of the check in `docs\direction.md`. Write only what fails, and why,
against which point. Note what is right too, in one line, so Robin knows what not to touch.

Look especially for: a silhouette that does not read at a quarter size; a windup that only changes colour; a background
in the figures' values that swallows them; a view where the player cannot tell where he is and where he can go; a piece
outside its place's palette; an edge missing or heavier than its neighbours'; a far plane as sharp or as saturated as
the near one; a thing that floats (no shadow, no contact: the sticker fault); a thing drawn in another hand than what
stands beside it; thin things gone black; repeats that look stamped; a figure whose parts face different ways; eyes that
are copies; interface pieces that do not belong to the world; anything that costs frames (a huge sheet, a full-screen
effect redrawn every frame: ask Victor, GD for the frame log). Then the tests of `docs\techniques.md` section 1:
grey, quarter size, the three reads.

## 3. Report

- `docs\inventory.md`: update every row's state and "what needs work"; renew "The first three jobs, by value".
- The reply to Robin: the ranked list, each item one or two sentences with the point it fails and the picture that
  shows it (sent into the chat); then, separately and clearly marked as suggestions, anything about the direction
  itself, with a reason and a picture. Robin decides. Say what you could not see (the phone, a screen that needs a save).
- A line in `docs\log.md`.
