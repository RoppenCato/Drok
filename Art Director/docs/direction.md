# The direction sheet: the look of Drok, and the form the art takes

Written by Leonard, AD from the brief, from the game's own docs, and from asking Robin with pictures. Everything marked
"(decide with Robin: ...)" is open until he has decided; then it is rewritten in his words with the date, "(Robin,
date)". The game's `..\Game Developer\docs\state\art.md` (not written yet) and `docs\art-demands.md` are the authority
on budgets, file form and what is needed; this sheet is what the studio builds to.

**Where this stands on 2026-11-20:** nothing is drawn. Robin said on 2026-11-19: "Ask me everything else, and do not
build anything before I have answered." The theme is picked (below). What the hero is after and what the Warrior
fights with are not answered yet. The hero and the first stills wait until Victor, GD sends those; references and
question 20 go ahead.

## What Robin has decided

- **The theme: vibrant pirate** (Robin, 2026-11-20, his pick from four choices in Victor, GD's chat, as Victor, GD
  reported it to me the same day; the brief follows when his questionnaire is done). The words of the choice he
  picked: "Vibrant pirate: bright seas, green islands, colourful crews and beasts. Nothing of dark fantasy comes
  back." It replaces his "Dark fantasy" of 2026-11-19.
- **The world** (Robin, 2026-11-20, his pick, reported the same way): a sea chart of islands. Each island is a hunting
  ground with its own levels; he travels by tapping the chart, with no ship to steer. So there is a chart screen, and
  a world map is big work: three concepts when its turn comes.
- **Hunting** (Robin, 2026-11-20, his pick, reported the same way): hunting grounds by level, rare spawns and bosses on
  timers on the real clock. So a rare monster and a boss must read as rare at a glance.
- **Gear** (Robin, 2026-11-20, his pick, reported the same way): ranks, rarities, affixes, uniques, sets, chests and
  keyed vaults; no talent trees. So: a colour for each rarity, sets that show as a look, chests and vault doors as art.
- **The phone** (Robin, 2026-11-20): "Android with chrome".
- **Fighting** (Robin, 2026-11-20, his pick): a target with auto-attack; the hero swings by himself while in reach.
- **The Warrior's kit** (Robin, 2026-11-20, his pick): rage built by hitting, Charge, Cleave or Whirlwind, and one
  defensive cooldown. So the hero needs a charge, a wide swing and a guard besides his plain attack.
- **The view** (Robin, 2026-11-19): "Top-down 2.5D view, like Zelda. Movement must feel smooth and snappy."
- **The screen** (Robin, 2026-11-19): "Played on my phone, portrait, with one thumb."
- **The hero** (Robin, 2026-11-19): "One class to start: Warrior." "A long-lived character with permanent unlocks.
  Levelling up, finding things, opening chests, chances of rare items, meaningful progression."
- **The interface** (Robin, 2026-11-19): "Buttons at the bottom or sides, covering as little of the screen as possible."
- **Loot** (Robin, 2026-11-19, on loot lying on the ground, still an idea in the bank): "Needs to have coloroed effects
  for rarity."
- "The feel I want is the grind of WoW, MapleStory and Priston Tale" (Robin, 2026-11-19) is about the grind, not the
  look. In Zite he said MapleStory was not a look reference. Asked again for Drok on 2026-11-20.

## The sentence

*(decide with Robin: one sentence for the look. What it is drawn like, what it feels like. The theme is his: "bright
seas, green islands, colourful crews and beasts". Which pictures he likes is question 20, asked on 2026-11-20 with the
boards in `docs\reference\`. Written in his words once he has chosen from the three stills.)*

## The look

- **Colour.** Bright and saturated: "vibrant" is his word. (decide with Robin: how much colour sits in the ground
  against the figures; one palette per island; which one thing may burn. Rare loot's colour by rarity is a likely
  answer to the last.) Chosen, never computed. Bright is not pastel: in Zite a flat pastel look was "a bit of a mobile
  game" to him (`docs\rules.md` 16). When everything is bright, the figures must still win: the ground a step quieter
  than what stands on it.
- **Line.** (decide with Robin: an ink line, a painted edge, or none.) Tested at the real size on the real screen.
- **Light.** (decide with Robin: the hour, how much the dark hides.) One light over the whole form; the shade cooler
  than the light. Whether a figure is ever flipped by the game decides if the light may come from one side
  (`docs\rules.md` 25).
- **Proportions.** (decide with Robin: how many heads tall the hero is seen from above; chunky or lean.) Once settled,
  left alone.
- **Shapes.** A monster is one shape that shows which way it faces from above; the hero is one body with one weapon
  shape that reads at a glance.
- **Places.** Islands. Quiet underfoot where the fighting is; props in clusters, every repeat its own size and lean.
  (decide with Robin: the first island and its mood.)
- **The interface.** (decide with Robin: its material and how much of the screen it takes.) It belongs to the world.

## How the game draws (found 2026-11-20, from the game's README and `docs\platform.md`)

- Phaser 4 on WebGL, TypeScript, built with Vite, an installable page (a PWA) for Chrome on Android first. It must
  work offline once installed, so every picture the game owns is part of the install.
- Portrait, **412 by 915** design pixels (`client\src\layout.ts`), fitted into the screen and centred.
- The canvas is 412 by 915 today, drawn at 1x and scaled up by the phone. Zite drew at the phone's own pixels (its
  `hires.ts`, capped at 2x), which is what lets 2x files show their detail. (decide with Victor, GD: whether Drok does
  the same; asked 2026-11-20. Until then the files are planned at 2x.)
- A top-down world much bigger than the screen, the camera following the hero. So: ground as tiles and strips, props
  placed by data, things sorted by where their feet are. No backdrop planes as in a side-on fight.
- What stands today is the starter's 3 by 3 board of stand-in squares. The first thing built is a control test with
  stand-in shapes, which needs no art.
- Robin runs it from a link on his phone: the home Wi-Fi link for the control test, a public page when chapter 1
  starts (Robin, 2026-11-20, his pick). The AI opens every page with `?mute=1`.
- The game's rules for cheap drawing: few atlases, every frame trimmed, no reading the canvas back, no filter or blur
  per frame, memory counted in decoded pixels.

## The judging size and screen

412 by 915 portrait, on Robin's phone: "Android with chrome" (Robin, 2026-11-20); no weaker phone named. Every judging
picture is a crop of the screen at that size with the game's chrome on.

The hero's height on screen: (decide with Robin: the first still shows two sizes). A starting guess (mine): about 64
CSS pixels, a common monster 40 to 90, a boss up to 200. From above on a narrow screen the world needs room round the
hero, and the thumb covers part of the bottom.

## Facings, and how gear shows on the hero

Open question 21 of the brief. Seen from above, a figure needs more than one facing: four (down, up, and a side the game
may flip) or eight. (decide with Victor, GD: how many the game plays, and whether it flips.) (decide with Robin: which
pieces of gear he wants to see on the hero.) The ways and what each costs are in `docs\gear-on-the-hero.md`.

## The action set for figures

A figure is a set of named actions, each a list of frames with data, once per facing. The counts below are the starting
budget from Zite (about 33 frames a monster, one facing); this game multiplies them by its facings, so they will come
down. The game's `docs\state\art.md` will say what this game holds.

| Action | Frames | Rate | What it shows |
| --- | --- | --- | --- |
| `stand` | 6 | 10 a second, looped | idle: a breath or a bob, never a step |
| `move` | 6 | 10 a second, looped | walk; the game picks the frame by distance moved, so the feet do not slide |
| `attack1` | 12 | 15 a second, two frames held | windup, the strike, recovery; the blow lands on the second held frame |
| `hit1` | 1 to 3 | held | **the most exaggerated pose**: recoil; seen most |
| `die1` | 8 | 12 a second | collapse, the last frames fading |

(decide with Robin and Victor, GD: the names, the counts, which actions this game plays, the Warrior's skills once
question 7 is answered, what frame the blow lands on.)

**What the game holds, not the art:** which frame the blow lands on, whether an action loops, the stride for `move`, the
scale an atlas is drawn at, the contact shadow, the flip. Each drop's `NOTES.md` names them; Victor, GD puts them in data.

**The rig:** a drawn figure with limbs is built on `tools\rig.js` (`docs\rules.md` 52). A modelled one is built by a
script and rendered (`docs\3d-to-sprites.md`). Which of the two Drok uses is part of question 21.

**The motion rules:** change the silhouette between frames; let attached parts follow late; keep the feet at the same
height unless the thing leaves the ground; the windup is the tell.

## The atlas form the game reads

From Zite's `docs\state\art.md`; (decide with Victor, GD: whether this game reads the same form, and how facings are
named in it.)

- Atlases only, never loose PNGs: one per monster, one for the hero's body, one per place's kit, one for the interface.
  TexturePacker "Phaser 3" JSON hash form (`tools\pack.js` writes it): trimming on, rotation off, padding 2, extrude 1.
- Frame names `<thing>/<action>/<nnnn>` with four digits, so the loader builds animations by name.
- **The pivot at the feet** for every character and monster frame, so trimmed frames do not jump; for an icon, the centre.
- Sides powers of two, never over 2048 by 2048.
- `meta.filePx` says the file's scale (2 for 2x files drawn at half size in CSS pixels).
- An `actions` block carries every action's `delay` and `loop`, and each frame's `name`, `w`, `h`, `origin` (the feet, in
  the frame's own pixels), `delay` in milliseconds, the hit box `lt` and `rb` and the `head` point relative to the
  origin, and `a0`, `a1` opacity for fades.
- A ground tile or a prop carries: size, origin, whether it blocks, and its animation frames and delays if it moves;
  nine-slice pieces carry their corner.
- Budgets: the game's to set (`docs\art-demands.md` has blanks today). Palette PNGs where they hold; RGBA for glows and
  soft gradients.

## Before anything is shown

1. It reads as one shape at a quarter size, in grey, and shows which way it faces.
2. Its tones are chosen, with one light over the whole form.
3. Nothing is saturated except what is allowed to burn.
4. It sits on the real ground at Robin's size, beside the hero, with something at its foot.
5. Line weight and colour match what stands beside it.
6. Nothing thin has gone black, and nothing small has vanished.
7. Repeats differ. Nothing looks stamped. Ground pieces tiled 3 by 3 show no seam.
8. If it moves, it has been played at real delays, feet locked, frames not cut off.
9. Its data is complete, and what was not tested is said.
