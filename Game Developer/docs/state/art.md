# The art in the game, as it stands (2026-11-20)

All of Leonard, AD's wave 1 is in the game: nothing Robin sees in chapter 1 is a stand-in shape any more, except the
few small things in the last column below. Every look in it is Leonard, AD's own choice until Robin has judged it
(Robin, 2026-11-20: "Let AD handle the art you need. I approve."). What is drawn from his drops is switched on in
`client\src\art.ts`; a view draws its plain stand-in when a switch is off or a file did not load.

| Switch | Folder in `client\public\art\` | What it draws | Still a stand-in |
| --- | --- | --- | --- |
| `ART.hero` | `hero` | the Warrior, 54 units tall, in eight facings: stand, move (a run: 8 frames at 45 ms, made to read as fast at 215 units a second), attack1, cleave, charge, hit1, die1 | his coats (icons only: no coat shows on the body yet) |
| `ART.gear` | `gear` | the cutlass, buckler and hat he wears, on his hand, arm and head; the icons in the bag, the hero window and the stall | |
| `ART.monsters` | `sand-crab`, `reef-gull`, `coconut-crab` | each kind: stand, move, attack1 started the step its wind-up starts, hit1 while stunned, die1 where it fell | the ground a slam will hit (a red disc drawn by the game); the stun's star; the health bar over a monster |
| `ART.loot` | `loot` | coins, a potion, a bundle of gear on the ring of its rarity; a spark on rare, two on epic; the potion in the stall's window | |
| `ART.places` | `island` for `crab-cay` | the painted ground, 117 props sorted with the figures, a flat shadow under each, the dock, the boat, the chest closed, opening and open | the sea does not move |
| `ART.places`, `ART.folk` | `harbour` for `harbour` | the painted town: three houses, the stall, the well, lamps, a sign, barrels, crates, a boat, palms, the dock; and four people who stand and breathe (the shopkeeper in his stall, the harbour master, a fisher, a sailor) | the people do nothing yet: no tasks, no words |
| `ART.chart` | `chart` | the sea chart as one picture that fills the screen: a pin on each place, a ring round the one he is in, the dotted way between, the names, his yellow button "Sail to …" | the ring does not breathe |
| `ART.glass` | `glass` | the menu, bag, chart and hero buttons; health, rage and experience as his bars; level, coin and money; the target's plate; the skill and potion discs; the button for the thing he stands by; the mark under the target and where a tap landed; the windows' panel, title, cross, rows, buttons and slots | the stick's ring; the cooldown's dark wedge; the banners and refusals (plain words with an outline) |
| (no switch) | `client\public\pwa-192x192.png`, `pwa-512x512.png` | the app's icon: the Warrior's face on a bright sea. His folder whole, with his notes, is kept in `assets\icon\` | |

## How a drop comes in

1. Leonard, AD says a piece is in `Art Director\out\<name>\`, with its NOTES.md. (Look in his `out\` and at the
   repo's log as well: his second drop was there before any message of it reached this chat.)
2. Copy that folder into `Game Developer\client\public\art\<name>\`, leaving out `frames\` and the `look*` pictures
   (what the atlas was made from, and his pictures for judging: they would ship in the build).
3. Switch it on in `client\src\art.ts`. If the layer does not draw that kind of piece yet, write that first.
4. For a place: `node tools/place-from-art.mjs <art folder> <place id>` writes his layout into the rules' data
   (below); then `npm test`, because the ground the tests walk on has changed.
5. Check it in the pane at 412 by 915 and commit: the folder, the switch, the data, this file.
6. Before saying "all of it is in", compare every file in the game's `art\` with his `out\` (their hashes). He
   re-renders: on 2026-11-20 the Warrior in the game was ten minutes older than the one in his `out\` (a walk where
   he had made a run), and only his late message showed it. His `out\scene\` is his own judging pictures and is
   not copied.

## A place's layout is his (decided 2026-11-20, mine; Leonard, AD: "your own map data wins")

He paints the ground, so where the shore runs and where things stand is his. `tools\place-from-art.mjs` reads his
`place.json` and writes into `rules\data\places.json`: `land` (his shore curve, sampled and drawn in a little, since
his sand starts inside a band of wet sand), `water` (his inlet, drawn out a little), `solids` (his circles, the
chest, and each person who stands about), `boxes` (his houses and his stall), `dock` (12 units inland of where his
dock meets the sand), `arrive`, the chest's spot, the stall's spot, and each zone's box. Names, counts, what the
chest holds and where he wakes in town stay the game's. The rules then walk on that ground (`docs\state\rules.md`).

- **Crab Cay**: the dock is at 700, 2184 and he steps ashore at 700, 2120; the chest stands at 1040, 1250, at the
  end of a side path on the grass among the gulls, not behind the coconut crabs as in my first layout.
- **Marlow's Landing**: he steps ashore at 450, 880 and sails from 450, 922; the stall is at 300, 640 on the west
  side of the square (he trades within 110 of it; a tap on it walks him to its front); he wakes at 450, 620, in the
  square below the well, which is the game's spot and is clear ground in his layout.

## The forms (his `out\README.md` is the authority)

- **An atlas of a figure**: a Phaser JSON hash, frames `<thing>/<action>/<facing>/<nnnn>`, five drawn facings (`s`,
  `se`, `e`, `ne`, `n`; the coconut crab has `s`, `e`, `n` and the people `s`, `se`, `e`: the game takes the
  nearest), two file pixels a unit, and an `actions` block: each action's `delay` and `loop`, each frame's `origin`
  (the feet), and for the hero `points` (`hand`, `off`, `head`: x and y from the origin, `r` the turn in degrees
  clockwise, `front`). `figures.ts` draws it. In the people's atlas the action is who it is (`shopkeeper`, `master`,
  `fisher`, `sailor`).
- **A set of single pictures** (gear, props, loot, glass, pins): the same hash with an `items` block: each picture's
  size, the point it stands on, and its own data (a rarity ring's colours, a stretchable piece's `slice`). His
  frames carry that point as their pivot too, so a picture put on the screen without saying otherwise stands on it:
  in a slot, centre it by hand.
- **A place**: `ground.png` at ONE pixel a unit, drawn at the place's size; `place.json` for where things stand
  (`props`, `solid` circles and boxes, `people`, `dock`, `arrive`).
- **The chart**: `chart.png` fills the screen; `chart-places.json` has each place's point on it in design units
  under his own names (`harbour`, `island-1`; `CHART_ART` in `art.ts` says which is which of the game's), the
  dots of the way, and where the title and the button sit.

What his atlases carry that the game does not use: `stride` (he agrees `move` is played by time: his commit
4722188), `blow` and the wind-up `note` (the rules' own timing decides when a blow lands; the animation is started
with it), `lt`, `rb`, `head` (where a task's mark would go over a person's head).

## What it costs

On disk all of wave 1 is 1.5 MB; with the script the phone caches 3.0 MB in 39 files to play offline, and the first
load is 1.9 MB over the wire. Decoded: the island with everything on it about 46 MB (his number, under the 48 MB
set for a place), the harbour about 10 MB, the chart 6 MB. **The game loads all of it when it starts, about 62 MB
together**, which breaks the game's own rule of loading by place (`docs\art-demands.md`). It has not been seen on
Robin's phone; the frame log from his settings will say whether it shows. Loading by place is on the list.

## Open with Leonard, AD (all of it waits for Robin's eye)

- **The size on screen.** He finds the Warrior small at 54 and offers a camera drawn in by a quarter (and files at
  2.5 pixels a unit to stay sharp). Kept at 1 for now (mine): a quarter closer shows a third less of the island
  round him, and seeing a gull come is part of the fight. It is how the game feels, so it is Robin's to judge on
  his phone; one number on our side and a re-render on his.
- **The sea chart and the look** are one piece each, his own, where the rule would have had three for Robin to pick
  from: Robin had asked not to be asked. Both are made to be judged and changed.
- **The keeper is drawn over his stall**, not sorted by where he stands, or the stall would hide him. It matches his
  own picture of the town; he may want the stall cut in two instead.
- **Coats on the body**, a task's mark over a person, a sea that moves.
