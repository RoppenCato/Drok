# The direction sheet: the look of Drok, and the form the art takes

Written by Leonard, AD in the first session, from the brief and from asking Robin with pictures. Everything marked
"(decide with Robin: ...)" is open until he has decided; then it is rewritten in his words with the date, "(Robin,
date)". The game's `..\Game Developer\docs\state\art.md` and `docs\art-demands.md` are the authority on budgets, file
form and what is needed; this sheet is what the studio builds to.

## The sentence

*(decide with Robin: one sentence for the look. What it is drawn like, what it feels like, who it is for. Example from
an earlier game: "A bright storybook fantasy drawn simply: round chunky shapes with one clean dark line, flat saturated
colour with one soft shade, big simple faces." Written in Robin's words once he has chosen from the concept stills.)*

## The look

- **Colour.** (decide with Robin: bright or muted; the fill, one shade a step darker and cooler, a small highlight only
  on what shines; one palette per place; which one thing may burn.) Chosen, never computed. No grey from a formula.
- **Line.** (decide with Robin: one clean line of even weight, a tapered ink, or none; its colour on figures and the
  thinner, coloured one on props; none on the far planes.) Tested at the real size on the real screen, never zoomed.
- **Light.** (decide with Robin: from above, from one side; the hour.) One light over the whole form; the shade cooler
  than the light; every upright thing casts one flat shadow in the same direction, or the game lays the shadow.
- **Proportions.** (decide with Robin: heads tall for the hero, the monsters' construction, how simple the faces are;
  what Robin's own sketches show.) Once settled, left alone.
- **Shapes.** (decide with Robin: round and chunky, lean and sharp, real.) A monster is one shape with its face taking
  most of its front; a hero is one body with one garment, one class shape and one weapon; props fat and simple.
- **Places.** Lush behind, quiet underfoot; far planes without line, paler with distance; props in clusters, every
  repeat its own size and lean. (decide with Robin: the mood of the first place.)
- **The interface.** (decide with Robin: wood, parchment, stone, glass; how much of the screen it takes.) It belongs to
  the world: the same line and palette as what stands behind it.

## The judging size and screen

(decide with Robin: the design size in CSS pixels and whether portrait or landscape, for example 412 by 915 portrait on
a phone, or 1280 by 720 in a computer browser; the device pixel ratio the files are made for, usually 2x on a phone;
where he judges: his phone, the browser pane's mobile preset, a desktop window.) Every judging picture is a crop of the
screen at that size with the game's chrome on. The player's height on screen (decide with Robin: in the fight or main
view, on the map or board if there is one; show two sizes in the first still).

Sizes from the board world game, as a starting point only: a board token about 40 CSS px tall; in a fight the player
about 150, a monster 120 to 240, a boss up to 400; the board drawn at 0.8 and seen whole at 0.3, so board pieces are
broad shapes with little fine detail.

## The action set for figures

A figure is a set of named actions, each a list of frames with data. The counts below are the starting budget from the
board world game (about 33 frames a monster); the game's `docs\state\art.md` says what this game holds.

| Action | Frames | Rate | What it shows |
| --- | --- | --- | --- |
| `stand` | 6 | 10 a second, looped | idle: a breath or a bob, never a step |
| `move` | 6 | 10 a second, looped | walk or hop (`fly` for flyers, hovering above an origin that stays on the ground) |
| `attack1` | 12 | 15 a second, two frames held | windup, the strike with a flash or lunge, recovery; the blow lands on the second held frame |
| `hit1` | 1 to 3 | held | **the most exaggerated pose**: recoil, shock, pieces knocked loose; seen most |
| `die1` | 8 | 12 a second | collapse, squash or crumble, the last frames fading |

A class character: about 26 frames (`stand` 4, `move` 6, `attack1` 6 with the fourth held, `defend` 2 held, `hit1` 2,
`die1` 6 with the last two fading). A boss may add a second phase as a second atlas (`<name>2`: its own `stand` and
`attack1`, drawn under half health). More actions (a cast, a block, a special) only when the game's `art-demands.md`
asks. (decide with Robin and Victor, GD: the names, the counts, which actions this game plays, what frame the blow
lands on, how many directions: one facing flipped by the game, four, or eight.)

**What the game holds, not the art:** which frame the blow lands on, whether an action loops, the stride a second for
`move`, the scale an atlas is drawn at, the contact shadow, the flip. Each drop's `NOTES.md` names them; Victor, GD
puts them in data.

**The rig:** a figure with limbs is built on `tools\rig.js` (`docs\rules.md` 52): one skeleton, fixed bone lengths, the
solver, the clips as poses. The parts and their draw order are written here once the first figure is approved.

**The motion rules:** change the silhouette between frames (shading alone does not read at this size); let attached
parts follow late; keep the feet at the same height unless the thing leaves the ground; the windup is the tell.

## The atlas form the game reads

From the board world game's `docs\state\art.md`; (decide with Victor, GD: whether this game reads the same form.)

- Atlases only, never loose PNGs: one per monster, one per class character, one per place's kit, one for the interface.
  TexturePacker "Phaser 3" JSON hash form (`tools\pack.js` writes it): trimming on, rotation off, padding 2, extrude 1.
- Frame names `<thing>/<action>/<nnnn>` with four digits, so the loader builds animations by name.
- **The pivot at the feet** (bottom centre) for every character and monster frame, so trimmed frames do not jump; for a
  board piece, the point that sits on the space; for an icon, the centre.
- Sides powers of two, never over 2048 by 2048; a character or monster at most 1024 by 2048 (8 MB decoded).
- `meta.filePx` says the file's scale (2 for 2x files drawn at half size in CSS pixels); `meta.facing` says which way the
  figures face; the game flips them.
- An `actions` block carries every action's `delay` and `loop`, and each frame's `name`, `w`, `h`, `origin` (the feet, in
  the frame's own pixels), `delay` in milliseconds, the hit box `lt` and `rb` and the `head` point relative to the
  origin, and `a0`, `a1` opacity for fades.
- A layer of a backdrop or a kit piece carries: size, origin, repeat type, scroll factor, drift, opacity, whether it is
  in front of the fighters, and its animation frames and delays if it moves; nine-slice pieces carry their corner.
- Budgets (the game's numbers; starting points): a monster under 300 KB on disk, a class character under 400 KB, a place's
  kit under 2.5 MB, the first load under 3.5 MB of art, one scene under 64 MB decoded; at most 4 full-screen layers in a
  fight and 3 on the board. Palette PNGs where they hold; RGBA for glows and soft gradients.

## Before anything is shown

1. It reads as one shape at a quarter size, in grey, and shows which way it faces.
2. Its tones are chosen, with one light over the whole form.
3. Nothing is saturated except what is allowed to burn.
4. It sits on the real background at Robin's size, beside the player, with something at its foot.
5. Line weight and colour match what stands beside it.
6. Nothing thin has gone black, and nothing small has vanished.
7. Repeats differ. Nothing looks stamped. Ground pieces and repeating layers tiled 3 by 3 show no seam.
8. If it moves, it has been played at real delays, feet locked, frames not cut off.
9. Its data is complete, and what was not tested is said.
