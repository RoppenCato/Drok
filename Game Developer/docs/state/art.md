# The art in the game, as it stands (2026-11-20)

Leonard, AD's first drop of wave 1 is in the game (his commit 848d838; ours 22ab703 and the one after). Every look
in it is his own choice until Robin has judged it (Robin, 2026-11-20: "Let AD handle the art you need. I approve.").
What is drawn from his drop is switched on in `client\src\art.ts`; what has no switch is still a stand-in shape.

| Switch | Folder in `client\public\art\` | What it draws | Still a stand-in |
| --- | --- | --- | --- |
| `ART.hero` | `hero` | the Warrior, 54 units tall, in eight facings: stand, move, attack1, cleave, charge, hit1, die1 | his coats (icons only: no coat shows on the body yet) |
| `ART.gear` | `gear` | the cutlass, buckler and hat he wears, on his hand, arm and head; the icons in the bag, the hero window and the stall | |
| `ART.monsters` | `sand-crab`, `reef-gull`, `coconut-crab` | each kind: stand, move, attack1 started the step its wind-up starts, hit1 while stunned, die1 where it fell | the ground a slam will hit (a red disc drawn by the game); the stun's star; the health bar over a monster |
| `ART.loot` | `loot` | coins, a potion, a bundle of gear on the ring of its rarity; a spark on rare, two on epic | |
| `ART.places` | `island` for `crab-cay` | the painted ground, 117 props sorted with the figures, a flat shadow under each, the dock, the boat, the chest closed, opening and open | the sea does not move |
| `ART.glass` | `glass` | the menu, bag, chart and hero buttons; health, rage and experience as his bars; level, coin and money; the target's plate; the skill and potion discs; the button for the thing he stands by; the mark under the target and where a tap landed; the windows' panel, title, cross, rows, buttons and slots | the sea chart's own picture; the stick's ring; the cooldown's dark wedge; the banners and refusals (plain words with an outline) |
| (none) | | | **the harbour town** (ground, houses, stall, keeper, townsfolk, pier), **the sea chart**, **the app's icon**: his next drops |

## How a drop comes in

1. Leonard, AD says a piece is in `Art Director\out\<name>\`, with its NOTES.md.
2. Copy that folder into `Game Developer\client\public\art\<name>\`, leaving out `frames\` and the `look*` pictures
   (what the atlas was made from, and his pictures for judging: they would ship in the build).
3. Switch it on in `client\src\art.ts`. If the layer does not draw that kind of piece yet, write that first.
4. For a place: `node tools/place-from-art.mjs <art folder> <place id>` writes his layout into the rules' data
   (below); then `npm test`, because the ground the tests walk on has changed.
5. Check it in the pane at 412 by 915 and commit: the folder, the switch, the data, this file.

## A place's layout is his (decided 2026-11-20, mine; Leonard, AD: "your own map data wins")

He paints the ground, so where the shore runs and where things stand is his. `tools\place-from-art.mjs` reads his
`place.json` and writes into `rules\data\places.json`: `land` (his shore curve, sampled to 126 corners and drawn in a
little, since his sand starts inside a band of wet sand), `water` (his inlet, drawn out a little), `solids` (his 75
circles, and the chest), `dock` (12 units inland of where his dock meets the sand), `arrive`, the chest's spot, and
each zone's box. Names, counts, what the chest holds and the chart stay the game's. The rules then walk on that
ground (`docs\state\rules.md`). What differs from my first layout: the dock is at 700, 2184 and he steps ashore at
700, 2120; the chest stands at 1040, 1250, at the end of a side path on the grass among the gulls, not behind the
coconut crabs.

## The forms (his `out\README.md` is the authority)

- **An atlas of a figure**: a Phaser JSON hash, frames `<thing>/<action>/<facing>/<nnnn>`, five drawn facings (`s`,
  `se`, `e`, `ne`, `n`; the coconut crab has `s`, `e`, `n` and the game takes the nearest), two file pixels a unit, and
  an `actions` block: each action's `delay` and `loop`, each frame's `origin` (the feet), and for the hero `points`
  (`hand`, `off`, `head`: x and y from the origin, `r` the turn in degrees clockwise, `front`). `figures.ts` draws it.
- **A set of single pictures** (gear, props, loot, glass): the same hash with an `items` block: each picture's
  size, the point it stands on, and its own data (a rarity ring's colours, a stretchable piece's `slice`).
- **A place**: `ground.png` at ONE pixel a unit, drawn at the place's size; `place.json` for where things stand.

What his atlases carry that the game does not use: `stride` (he agrees `move` is played by time: his commit
4722188), `blow` and the wind-up `note` (the rules' own timing decides when a blow lands; the animation is started
with it), `lt`, `rb`, `head`.

## What it costs (his numbers, for the island with everything on it)

About 46 MB decoded, under the 48 MB set for a place. On disk the whole drop is 1.2 MB; the built page with it is
2.6 MB, and the phone caches all of it (pictures and their data) to play offline.

## Open with Leonard, AD

- **The size on screen.** He finds the Warrior small at 54 and offers a camera drawn in by a quarter (and files at
  2.5 pixels a unit to stay sharp). Kept at 1 for now (mine): a quarter closer shows a third less of the island
  round him, and seeing a gull come is part of the fight. It is how the game feels, so it is Robin's to judge on
  his phone; one number on our side and a re-render on his.
- **Coats on the body**, and the harbour, the sea chart and the icon.
