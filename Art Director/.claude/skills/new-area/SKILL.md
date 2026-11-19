---
name: new-area
description: Make the art kit for a new area of Drok (a region, a level, a mood): its idea and palette, the ground and edge pieces, the backdrop layers with scroll factors, the props, previewed at the judging size and delivered with data. Use when Robin or Victor, GD says "we need a desert area", "make the forest region's kit", "a background for the swamp", "the next level", or names a place that has no art.
---

# A new area

The look is `docs\direction.md`; the pieces, counts and sizes the game needs are in its `..\Game Developer\docs\art-demands.md`.
Never work in `C:\dev\Drok\Game Developer`.

## 1. The idea before any piece

- Find the place in the brief and the game's docs: what it is for, its level band, what the player does there, which
  creatures live there, what the places next to it look like (so this one differs).
- Write in `work\<area>\NOTES.md`: the one idea of the place in a sentence, its palette (five or six colours: the sky,
  the far, the mid, the ground's top edge and body, the accent), what the near and the far planes hold, the kind of
  ground, the props that make it this place and no other, its landmark.
- Decide the planes: two or three strips over a code-drawn sky, each with a scroll factor with clear gaps, what each
  holds, whether it repeats or is placed once, whether anything drifts (one thin strip, nothing else).
- **One still first**: the place with our player and one creature standing in it, at the judging size, with the chrome
  on, before any kit piece is made. Robin agrees the look on that picture. The first place of a game is big work:
  three concepts (`three-concepts`); a later place in an agreed hand is one still.

## 2. Make the kit

- **One palette for every kit of the place.** If the game has two views of a place (a map or board, and a fight or a
  level), they share the props' designs and differ in camera; the one the player sees most comes first.
- **Ground**: tiles and edge pieces (where land steps, where it ends), path pieces, markers; every ground tile shares
  one base colour at its edges; no outline ring on tiled pieces. Seen small when the camera pulls back: broad shapes.
- **Backdrop**: the ground band with a bright top edge over a darker body, seamless sideways; the strips behind, far
  ones paler, hazier, less saturated, with an irregular upper edge; sky a third at most; framing at the screen's sides
  only; nothing tall near where the figures stand.
- **Props**: ten to twenty, more small than large, in clusters; side on for a side view, a touch from above for a
  raised camera; a thinner coloured line than the figures'; a shadow baked only if the piece is never flipped; a few
  animated.
- Tile every repeating piece 3 by 3 and look.

## 3. Judge

- Lay the kit as a place at the judging size: the planes stacked, props placed, our player and one creature in it. Pan
  the planes on the moving page and look at the left, middle and right.
- Look for gaps at the ends, hard bottom edges below the ground, planes that move at the same speed, a flat stack, a
  busy band behind the figures, seams in the ground, pieces that look pasted on (no foot, no shadow), anything in the
  figures' values that swallows them.
- The check in `docs\direction.md`, point by point, in the notes.

## 4. Deliver

- `out\<area>\`: the atlases and strips, and `kit.json` with every piece's data (size, origin, repeat type, scroll
  factor, drift, opacity, front, animation frames and delays), in the shape the game's `docs\state\art.md` names; the
  laid-out pictures; `NOTES.md` with the idea, the palette, the budget and the drop-in steps.
- Send the pictures and the moving page into the chat; a line in `docs\log.md`; the place's rows in `docs\inventory.md`.
- Tell Robin what is his to decide (the palette, the idea, which props) and tell Victor, GD what the game gets.
