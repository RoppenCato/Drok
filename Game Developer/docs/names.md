# Everything in the game that carries a name

All placeholders until Robin names them (or says the placeholders stay). The studios read this for the words they put
on screen and in files; a change here is a change everywhere, so the Game Developer keeps it current. Every name
below marked "mine" is Victor, GD's placeholder of 2026-11-20 and is in the data files, one edit away from another.

## The game

| What | Name now | Whose | Since |
| --- | --- | --- | --- |
| The game | Drok | Robin: the real name | 2026-11-20 |

Whether "Drok" means something in the world (the sea, the islands, a pirate lord, the ship) is open: idea bank,
open question 2.

## Places (`rules\data\places.json`)

| Id | Name shown | Whose | Since |
| --- | --- | --- | --- |
| `harbour` | Marlow's Landing | mine | 2026-11-20 |
| `crab-cay` | Crab Cay | mine | 2026-11-20 |

## Creatures (`rules\data\monsters.json`)

| Id | Name shown | Whose | Since |
| --- | --- | --- | --- |
| `sand-crab` | Sand crab | mine | 2026-11-20 |
| `reef-gull` | Reef gull | mine | 2026-11-20 |
| `coconut-crab` | Coconut crab | mine | 2026-11-20 |

## Gear (`rules\data\items.json`)

| Id | Name shown | Whose |
| --- | --- | --- |
| `rusty-cutlass`, `sailors-cutlass`, `corsairs-cutlass` | Rusty cutlass, Sailor's cutlass, Corsair's cutlass | mine |
| `plank-buckler`, `iron-buckler`, `brass-buckler` | Plank buckler, Iron buckler, Brass buckler | mine |
| `bandana`, `tricorn`, `feathered-hat` | Bandana, Tricorn, Feathered hat | mine |
| `linen-shirt`, `sailors-coat`, `corsairs-coat` | Linen shirt, Sailor's coat, Corsair's coat | mine |
| the rarities | Common, Uncommon, Rare, Epic | mine: the old grinders' words |
| (a draught) | Healing potion, "Potion" on its button | mine |

## The hero and his skills

| Id | Name shown | Whose | Since |
| --- | --- | --- | --- |
| (the class) | Warrior | Robin, 2026-11-19: "One class to start: Warrior" | 2026-11-19 |
| `charge` | Charge | Robin's pick of the suggested kit, 2026-11-20 | 2026-11-20 |
| `cleave` | Cleave | Robin's pick; "Cleave or Whirlwind" still open | 2026-11-20 |
| (the bar) | rage | Robin's pick of the suggested kit | 2026-11-20 |
| (money) | gold | mine | 2026-11-20 |

These are the common words of the old grinders. Whether Drok gets its own names for them in a pirate world is
Robin's to say; not asked yet.

## People

| Id | Name shown | Lines | Whose | Since |
| --- | --- | --- | --- | --- |
| the stall's keeper | Old Marlow | none: his stall's window is titled "Old Marlow's stall" | mine | 2026-11-20 |

Robin, 2026-11-20: light quests; a few people in the harbour who speak in short lines. Nobody speaks yet; two more
townsfolk stand on the quay without names. Lines, when they come, are the Game Developer's placeholders, each marked.

## The screen's own words

The glass: `Lv N`, `N` after a coin (`N gold` without the Art Director's glass), `Bag`, `Chart`, `Hero`; `Cleave` / `30 rage`; `Charge` / `dash`; `Potion`;
`Open chest`, `Trade`, `Sea chart`; `<monster>  ·  level N`; `Down!` / `Lost N gold` / `Waking in N`;
`Level N` / `Stronger, and whole again` / `As far as this chapter goes`; the place's name / `Levels 1 to 5` /
`The harbour town`.
The refusals: `Not ready`, `Not enough rage`, `Nothing in range`, `No potions left`, `Health is full`, `The chest
is empty`, `Too far away`, `Sail from the dock`, `The bag is full`, `Not enough gold`, `No room for more potions`,
`Sold`, `Sell at the stall in the harbour`, `That file is not a Drok save`, `Press again to erase this hero for good`.
The help line: "Tap to walk or to fight. Drag anywhere to steer."
The windows' words are in `client\src\view\panels.ts`.
