# The rules, as they stand (chapter 1 on Leonard, AD's island, 2026-11-20)

`rules\` is the game as a pure function: `apply(state, action, rng) → { state, events }`. It never touches the
screen, a clock or a random number of its own; every die comes from the seeded `rng`, time only from a tick's `dt`,
the real clock only from a tick's `now`. The state handed in is never changed. All of it is Victor, GD's unless it
says Robin; every number is a first guess until Robin has felt it (`docs\lessons.md`).

## The files

| File | What it holds |
| --- | --- |
| `rules\data\numbers.json` | the hero, levels, auto-targeting, Charge, Cleave, potions, drops, the bag's size, death, how near he must stand to things |
| `rules\data\monsters.json` | every kind of monster: its body, its speeds, its strike, its trick, what it gives |
| `rules\data\places.json` | the places on the chart: size, dock, where he steps ashore and wakes, the stall, the chest, the zones of monsters; and each place's shore, water, round things and boxes in the way, written by `tools\place-from-art.mjs` (never by hand) |
| `rules\data\items.json` | gear: slots, rarities, the bases in three tiers, the stall's rules, what a new hero wears |
| `rules\src\types.ts` | the state, the actions (intents), the events |
| `rules\src\data.ts` | the data files with their shapes, and the sums made from them (what a piece gives and costs, his health, armour and damage) |
| `rules\src\core.ts` | what the rest leans on: the copy of the state, the refusal, targeting, the dice, a new piece, a thing put on the ground |
| `rules\src\game.ts` | `newGame`, `apply`, and steering, targeting, Charge and Cleave |
| `rules\src\world.ts` | the step (`tick`): the hero walks, swings and mends, the monsters live, the fallen come back |
| `rules\src\loot.ts` | a hurt and a fallen monster, experience and levels, drops and picking them up, the chest |
| `rules\src\town.ts` | arriving in a place, sailing, the stall, wearing and taking off gear, potions |
| `rules\src\ground.ts` | the ground of a place: what is land, what can be stood on, a step that slides along a shore, a wall or round a thing |
| `rules\src\path.ts` | the way-finder for a tap: whether he can walk straight, and the way round when he cannot |
| `rules\src\save.ts` | `STATE_VERSION` (4), `migrate`, and the save as a file (`packSave`, `unpackSave`) |
| `rules\src\geometry.ts`, `rng.ts`, `index.ts` | distance and angle; the seeded stream; what the rules export |

## The state

`seed`, `time`, `ticks`, `now` (the real clock as the holder last told it), `place`, the `hero`, the
`monsters`, the `respawns` (a countdown and a zone each), the `drops` on the ground, `chests` (when each place's
chest was opened), the `shop`'s pieces, the `book` (how many of each kind he has felled), `nextId`, `kills`,
`deaths`. Solo for good (Robin, 2026-11-19), so an action carries no player and no id.

The hero adds to the control test's: `level`, `xp`, `gold`, `potions` with their wait and their mending, the `bag`
(20 pieces), and what he `worn`s in four slots. A piece of gear is `{ id, base, rarity }`; its numbers come from
the data, nothing else is stored.

## The actions

| Action | What it does | Refused when |
| --- | --- | --- |
| `tick { dt, now }` | the world moves on; the holder sends 1/60 s and its clock | `dt` not between 0 and 0.1 |
| `moveTo { x, y }` | a tap on the ground: he walks there, round what stands between | down; not a number |
| `steer { x, y }` | the thumb's push, 0 to 1 long; it wins over a tap while it lasts; 0, 0 lets go | not a number |
| `target { monster }` | a tap on a monster: it is his target (`hero.chosen`) and he walks up to it | down; no such monster |
| `skill { skill }` | Charge or Cleave | down; on cooldown; not enough rage; no target in range |
| `potion` | drinks one: 45 health over 3 s, then an 8 s wait | down; none; waiting; full health |
| `openChest` | the chest spills its loot on his side | down; no chest here; too far; empty |
| `sail { to }` | to another place, from the dock | down; no such place; already there; not at the dock |
| `equip { item }`, `unequip { slot }`, `discard { item }` | wearing from the bag (the old piece takes its place), taking off, throwing away | down; no such item; bag full |
| `buy { what }`, `sell { item }` | at the stall: a piece by its place on it, or `'potion'`; a piece from the bag | no shop here; too far; sold out; not enough gold; bag full; potions full; no such item |

## How it plays

- **Moving**: 215 units a second with no acceleration. One way to steer, with two hands to it (Robin, 2026-11-20,
  after playing: tap to move stays, and a way to move freely comes with it, "both available at the same time"): a
  tap sends him somewhere (`moveTo`) or at a monster (`target`), the thumb's push (`steer`) takes him where it
  points and wins while it lasts. The rules never knew which finger did what; the three schemes and their switch
  are gone from the state.
- **Fighting**: a target with auto-attack every 0.8 s (Robin, 2026-11-20); rage; Charge; Cleave. Who he fights
  (mine): one he tapped or took with a skill is his (`hero.chosen`) until it falls, he taps another, or it is more
  than 300 behind him while he is not walking up to it. With nothing chosen the rules pick: the nearest within 210;
  then one in reach rather than one that is not, or one 40 nearer; never away from one he can hit. When his target
  falls, the next one that is after him takes its place.
- **Places** (Robin, 2026-11-20: a sea chart of islands): a new hero starts in the harbour town. Only the place he
  is in is alive. Sailing is from a dock (within 90) and lands him where one steps ashore (`arrive`); the place he left is emptied
  with everything on its ground. Soft gates: nothing stops him sailing anywhere.
- **Monsters** all stroll near home, come for him inside their range or when hit, wind up, strike, rest, and go home
  when he is down or they are far from home. Two numbers make a kind its own: `retreatSeconds` (the reef gull backs
  off about 200 units after a bite and comes again, so it must be caught or met) and `slamRadius` (the coconut
  crab's strike hits everything within 74 of it after a 0.9 s wind-up; he walks 194 in that time). A zone keeps its
  count: a fallen one comes back in its zone after 12 to 25 s, at least 260 from him.
- **Levels** (Robin: 1 to 5): a kill gives the kind's experience (6, 15, 55); the levels need 150, 420, 1000 and
  2200. A level gives 14 health and 1.5 damage, and fills his health. At level 5 nothing more is gained.
- **Loot** (Robin: on the ground, with a coloured effect by rarity, flying to him when he walks close): a fallen
  monster may leave money, a potion, a piece of gear of its tier, each by its own chance; the rarity by weight
  (70, 22, 7, 1). Within 72 of him a drop flies to him. A full bag (20) leaves gear lying; so do full potions (10).
  A drop lies 120 s.
- **Gear** (Robin: "The big pieces"): cutlass, buckler, hat, coat; three tiers; a rarer piece gives its base's
  numbers times 1, 1.35, 1.8 or 2.4, and never less than one more a step. A cutlass adds to every swing, a
  buckler takes from every bite (never below 1), hats and coats add health.
- **The chest** (Robin: one chest; timers on the real clock): on Crab Cay, at the end of a side path among the
  gulls, where Leonard, AD put it. Money (40 to 80), two
  potions and a tier 3 piece that is never common. It fills again 20 minutes after it was opened, by `now`.
- **Falling** (Robin: "On death you lose money"; "say 10%"; he wakes in the harbour town): a tenth of his money,
  down for 2 s, then whole in the harbour. His bag is kept.
- **The town**: no monsters; his health comes back at 25 a second. The stall (within 110 of it; it stands where
  Leonard, AD put it and cannot be walked through) sells three pieces, each
  for another slot, of the tier his level has earned (1 up to level 2, 2 at 3 and 4, 3 at 5), mostly common, at
  three times their worth, and buys at half their worth. New pieces each time he arrives in town. A potion is 12.

## The ground (`ground.ts`, `path.ts`; since Leonard, AD's island of 2026-11-20)

A place may have a shore (`land`: outside it is sea), waters inside it, `solids` (circles: trunks, rocks, barrels,
the chest, a person who stands about) and `boxes` (a house, the stall: a top left corner and a size). They come
from the Art Director's layout through `tools\place-from-art.mjs` (`docs\state\art.md`), for the island and for the
harbour town; a place without them (the tests' plain field) is its whole box.

- **Walking** (`walk`): a step that would end in a round thing is pushed out to its edge, so a body slides round
  it; a step into a wall is pushed straight back out of it, so he slides along the wall; met head on, he steps
  aside first. A step that would leave the land slides along the shore, or does not happen. The hero's feet are 8
  units across for this; a monster's are half its body. A kind that `flies` (the reef gull) ignores all of it.
- **A tap** (`route`): if he cannot go straight, the place's grid of 16-unit squares is searched for the shortest
  way over open ones (A*), and the way is pulled straight wherever he can see from one corner to a later one. He
  carries the corners still ahead in `hero.route`; `hero.dest` is the last. A tap on what cannot be reached (the
  sea, a rock) takes him to the nearest ground. Walking up to a tapped monster with something between uses the same
  way-finder, found afresh twice a second.
- **Monsters** arrive only on ground they can stand on, at least 270 from where he steps ashore; a stroll only goes
  where it can stand; nothing drops into the sea.
- The thumb's push is not steered round things: he slides along them, as the thumb pushes.

## The save

`STATE_VERSION` is 4. `migrate` goes a step at a time: version 1 (the control test) becomes a new hero in the
harbour who keeps his seed and his tallies; version 2 (chapter 1 before the island had a shore) gets an empty
`route`; version 3 (three ways to steer on a switch) loses its `scheme` and gets `hero.chosen`; version 4 is
looked over: anything it names that today's data does not know (a renamed piece, monster or
place) is dropped rather than tripped on, and a hero standing where there is no ground any more (a place's layout
changed under him: he is in the sea, or right inside a house or a rock) is put where one steps ashore, with the
place started over. Standing beside a thing is not standing in it. Everything else is null, and the holder starts
a new game. `packSave` and `unpackSave` are the same save as text, for the phone's storage and for
the exported file.

## Its tests

`rules\test\`: `game.test.ts`, `chapter1.test.ts`, `bot.test.ts`, `purity.test.ts`, with `sim.ts` as their small
holder. `docs\tests.md` lists what each covers and the numbers they print.
