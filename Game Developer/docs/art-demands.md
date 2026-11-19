# What art the game needs, in what order, for Leonard, AD

The Game Developer's list of what to draw, in waves, each wave tagged with its chapter; the budgets at the top are the
Game Developer's to set and confirm, and the studio delivers inside them (or asks first). The atlas or sheet form the
game reads will be in `docs\state\art.md` once the first drop lands; the studio's own direction sheet is
`..\..\Art Director\docs\direction.md`.

The control test (before chapter 1) needs no art: it runs on stand-in shapes in `client\src\view\`.

## What the game is, for the eye (Robin, 2026-11-19 and 2026-11-20; the brief has his words)

Vibrant pirate: "Bright seas, green islands, colourful crews and beasts. Nothing of dark fantasy comes back." A
top-down 2.5D view "like Zelda", on a phone in portrait, a camera that follows one hero. The hero is a Warrior with
cutlass and buckler, a nobody from a harbour town on his way to captain. The world is a sea chart of islands; always
day, each island its own light.

## The budgets (Victor, GD, 2026-11-20; mine, first guesses until the form of the art is known)

- **The judging size**: 412 by 915, portrait. The canvas is twice that (824 by 1830), so art is made at two pixels a
  design unit and looks sharp.
- **Sizes on screen, in design units**: the Warrior about 44 tall (the stand-in's body is 32 across); a common
  monster 30 to 50; a boss up to 140; a loot drop 16 to 24; a skill button 68 across.
- **Facings**: the game can turn a top-down figure freely or draw a fixed number of facings; which it is depends on
  question 21 (drawn or modelled) and is Leonard, AD's to propose. The game flips left and right itself.
- **File form**: one atlas (json and png) per creature or kit, trimmed frames, origin at the feet, a delay per frame
  (the form of `tools\pack.js`). Palette PNGs where they hold.
- **Weights**: an atlas under 300 KB; a place's ground kit under 400 KB; the first load under 3 MB with the sound
  (Phaser itself is 1.4 MB of that, 0.37 MB over the wire).
- **Memory**: decoded pictures for one place under 48 MB; lazy by place; nothing loaded for a place he is not in.
- **Frames**: 60 a second on Robin's phone. No effect that reads the canvas back or blurs each frame.
- **Gear on the hero**: a long-lived hero who finds a lot of gear, and it should show (Robin's open point, question
  21). Every way of showing it multiplies pictures: say what each way costs before one is picked, and the budget
  above is set again with that in hand.

## Wave 1 (chapter 1): the look, the harbour and the first island

In this order. The game holds stand-ins until each lands.

| Piece | What | Size on screen | Big work? |
| --- | --- | --- | --- |
| The look | three stills of the island with the Warrior and one monster, the glass on, at the judging size | full screen | yes: three concepts |
| The Warrior | cutlass and buckler; stand, walk, swing, Cleave, Charge, hit, fall | about 44 tall | yes: he is the hero |
| The island's ground | sand, grass, the water's edge, a few props, as a kit that repeats without showing | a place of about 1200 by 1500 | no |
| Three monsters | the first island's three kinds, each: stand, walk, wind-up, bite, hit, fall | 30 to 50 | no (the sand crab first) |
| Loot and rarity | money, an item on the ground, and the coloured effect per rarity (Robin: "Needs to have coloroed effects for rarity") | 16 to 24 | no |
| The UI kit | bars, the skill buttons in their arc, the top buttons (bag, chart, character), a panel, the font | as the control test's glass | no |
| The harbour | the town's ground, a shop, a few houses and people who stand | a place of about 800 by 1000 | no |
| The chest | closed, opening, open | about 30 | no |
| The sea chart | the chart with two places on it and room for many more | full screen | yes: a world map |
| The icon | the app's icon, 192 and 512 | | no |

## Wave 2 (chapter 2): gear worth hunting for

Gear on the hero as question 21 decides; icons for gear by rank and rarity; the effects of the first uniques.

## Rules for every piece

Data with every piece (origin, delay, hit box, head, facings); judged at the judging size in the real scene; whole
folders delivered into `out\<name>\` with a NOTES.md and a picture into the chat; small files; nothing from other games
without its origin written down.
