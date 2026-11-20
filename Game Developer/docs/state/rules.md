# The rules, as they stand (chapter 1's game side, 2026-11-20)

`rules\` is the game as a pure function: `apply(state, action, rng) → { state, events }`. It never touches the
screen, a clock or a random number of its own; every die comes from the seeded `rng`, time only from a tick's `dt`,
the real clock only from a tick's `now`. The state handed in is never changed. All of it is Victor, GD's unless it
says Robin; every number is a first guess until Robin has felt it (`docs\lessons.md`).

## The files

| File | What it holds |
| --- | --- |
| `rules\data\numbers.json` | the hero, levels, auto-targeting, Charge, Cleave, potions, drops, the bag's size, death, how near he must stand to things |
| `rules\data\monsters.json` | every kind of monster: its body, its speeds, its strike, its trick, what it gives |
| `rules\data\places.json` | the places on the chart: size, dock, where he wakes, the stall, the chest, the zones of monsters |
| `rules\data\items.json` | gear: slots, rarities, the bases in three tiers, the stall's rules, what a new hero wears |
| `rules\src\types.ts` | the state, the actions (intents), the events |
| `rules\src\data.ts` | the data files with their shapes, and the sums made from them (what a piece gives and costs, his health, armour and damage) |
| `rules\src\core.ts` | what the rest leans on: the copy of the state, the refusal, targeting, the dice, a new piece, a thing put on the ground |
| `rules\src\game.ts` | `newGame`, `apply`, and steering, targeting, Charge and Cleave |
| `rules\src\world.ts` | the step (`tick`): the hero walks, swings and mends, the monsters live, the fallen come back |
| `rules\src\loot.ts` | a hurt and a fallen monster, experience and levels, drops and picking them up, the chest |
| `rules\src\town.ts` | arriving in a place, sailing, the stall, wearing and taking off gear, potions |
| `rules\src\save.ts` | `STATE_VERSION` (2), `migrate`, and the save as a file (`packSave`, `unpackSave`) |
| `rules\src\geometry.ts`, `rng.ts`, `index.ts` | distance and angle; the seeded stream; what the rules export |

## The state

`seed`, `time`, `ticks`, `now` (the real clock as the holder last told it), `scheme`, `place`, the `hero`, the
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
| `scheme`, `moveTo`, `steer`, `target`, `skill` | as in the control test | as there |
| `potion` | drinks one: 45 health over 3 s, then an 8 s wait | down; none; waiting; full health |
| `openChest` | the chest spills its loot on his side | down; no chest here; too far; empty |
| `sail { to }` | to another place, from the dock | down; no such place; already there; not at the dock |
| `equip { item }`, `unequip { slot }`, `discard { item }` | wearing from the bag (the old piece takes its place), taking off, throwing away | down; no such item; bag full |
| `buy { what }`, `sell { item }` | at the stall: a piece by its place on it, or `'potion'`; a piece from the bag | no shop here; too far; sold out; not enough gold; bag full; potions full; no such item |

## How it plays

- **Moving and fighting** are the control test's, unchanged: 215 units a second with no acceleration; a target
  with auto-attack every 0.8 s (Robin, 2026-11-20); rage; Charge; Cleave; schemes 2 and 3 pick the nearest.
- **Places** (Robin, 2026-11-20: a sea chart of islands): a new hero starts in the harbour town. Only the place he
  is in is alive. Sailing is from a dock (within 90) and lands him on the other dock; the place he left is emptied
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
- **The chest** (Robin: one chest; timers on the real clock): at the north end of Crab Cay. Money (40 to 80), two
  potions and a tier 3 piece that is never common. It fills again 20 minutes after it was opened, by `now`.
- **Falling** (Robin: "On death you lose money"; "say 10%"; he wakes in the harbour town): a tenth of his money,
  down for 2 s, then whole in the harbour. His bag is kept.
- **The town**: no monsters; his health comes back at 25 a second. The stall (within 110) sells three pieces, each
  for another slot, of the tier his level has earned (1 up to level 2, 2 at 3 and 4, 3 at 5), mostly common, at
  three times their worth, and buys at half their worth. New pieces each time he arrives in town. A potion is 12.

## The save

`STATE_VERSION` is 2. `migrate`: version 1 (the control test) becomes a new hero in the harbour who keeps his
seed, his way of steering and his tallies; version 2 is looked over, and anything it names that today's data does
not know (a renamed piece, monster or place) is dropped rather than tripped on; everything else is null, and the
holder starts a new game. `packSave` and `unpackSave` are the same save as text, for the phone's storage and for
the exported file.

## Its tests

`rules\test\`: `game.test.ts`, `chapter1.test.ts`, `bot.test.ts`, `purity.test.ts`, with `sim.ts` as their small
holder. `docs\tests.md` lists what each covers and the numbers they print.
