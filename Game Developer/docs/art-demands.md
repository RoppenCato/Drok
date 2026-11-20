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
- **Weights**: an atlas under 300 KB; a place's ground kit under 400 KB; the first load under 3 MB with the sound,
  counted as it goes over the wire (Phaser itself is 1.5 MB on disk, 0.4 MB over the wire). Where it stands with
  all of wave 1 in (2026-11-20): 1.9 MB over the wire, 3.0 MB on the phone, no sound yet.
- **Memory**: decoded pictures for one place under 48 MB; lazy by place; nothing loaded for a place he is not in.
  **Not kept yet, and that is the game's doing, not the art's**: the game loads both places, the chart and all the
  figures when it starts, about 62 MB decoded together. Loading by place is on the list in `docs\autonomous.md`;
  it must be done before a third place comes.
- **Frames**: 60 a second on Robin's phone. No effect that reads the canvas back or blurs each frame.
- **Gear on the hero**: a long-lived hero who finds a lot of gear, and it should show (Robin's open point, question
  21). Every way of showing it multiplies pictures: say what each way costs before one is picked, and the budget
  above is set again with that in hand.

## What was agreed with Leonard, AD on 2026-11-20 (newer than the guesses above where they differ)

Robin, 2026-11-20: "Let AD handle the art you need. I approve." Leonard, AD chooses the look himself inside Robin's
picks, marks it "mine", and delivers without waiting; Robin judges it when he is back.

- **Facings**: the game plays eight and flips. Five are drawn (`s`, `se`, `e`, `ne`, `n`); the game mirrors the
  other three. The light comes from above so a flip does not show.
- **The canvas** is twice the design size, so files at 2 pixels a design unit are drawn one to one (`meta.filePx` 2).
- **Gear on the hero** is way 4 of his `docs\gear-on-the-hero.md`: one body sprite, and the cutlass, the buckler
  and the hat as small sprites placed on points the body's frame data carries (`hand`, `off`, `head`: x, y from the
  frame's origin, the turn in degrees, `front`).
- **Memory**, decoded: the hero's body 16 MB at most; one place with all that is in it 48 MB at most.
- **The install**: all of chapter 1's art under 6 MB on disk; what the harbour needs under 2 MB.
- **The atlas form**: what his `tools\pack.js` writes: a Phaser JSON hash with frames named
  `<thing>/<action>/<facing>/<nnnn>`, and an `actions` block with each action's delay and loop and each frame's
  origin, delay, hit box, head and points. The game wires to what he delivers; his NOTES.md is the authority.
- **The game's ids** for wave 1: monsters `sand-crab`, `reef-gull`, `coconut-crab`; gear `rusty-cutlass`,
  `sailors-cutlass`, `corsairs-cutlass`, `plank-buckler`, `iron-buckler`, `brass-buckler`, `bandana`, `tricorn`,
  `feathered-hat`, `linen-shirt`, `sailors-coat`, `corsairs-coat`; places `harbour` (Marlow's Landing, 900 by 1100)
  and `crab-cay` (Crab Cay, 1400 by 2400: sand below y 1440, grass to 720, rock above). All names are placeholders.

## Wave 1 (chapter 1): the look, the harbour and the first island

**Delivered whole by Leonard, AD on 2026-11-20 and all of it in the game** (`docs\state\art.md`). Two rows were big
work that would have had three concepts: the look and the sea chart. Robin had asked not to be asked, so each is one
piece of Leonard, AD's own, made to be judged and changed. The list as it was asked:

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
