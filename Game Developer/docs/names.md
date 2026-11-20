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
| `bedroom` | The bedroom | mine | 2026-11-20 |
| its floors: `bedside`, `under-bed`, `far-corner` | The bedside, Under the bed, The far corner | mine | 2026-11-20 |
| (the safe spot) | Home | mine; it is the doll's house (Robin's pick, 2026-11-20) | 2026-11-20 |

The pirate game's places (Marlow's Landing, Crab Cay) went out with it on 2026-11-20.

## Creatures (`rules\data\monsters.json`)

| Id | Name shown | Whose | Since |
| --- | --- | --- | --- |
| `ant` | Ant | mine (Leonard, AD's still has it) | 2026-11-20 |
| `silverfish` | Silverfish | mine | 2026-11-20 |
| `cockroach` | Cockroach | mine (Leonard, AD's still has it) | 2026-11-20 |

## Gear (`rules\data\items.json`)

| Id | Name shown | Whose |
| --- | --- | --- |
| `rusty-cutlass`, `sailors-cutlass`, `corsairs-cutlass` | Bent pin, Ball-head pin, Darning needle | mine, on Robin's "Pin and button" |
| `plank-buckler`, `iron-buckler`, `brass-buckler` | Shirt button, Coat button, Bottle cap | mine, on Robin's "Pin and button" |
| `bandana`, `tricorn`, `feathered-hat` | Thread cap, Acorn cap, Thimble | mine |
| `linen-shirt`, `sailors-coat`, `corsairs-coat` | Lint wrap, Felt coat, Ribbon coat | mine |
| the rarities | Common, Uncommon, Rare, Epic | mine: the old grinders' words |
| (a draught) | Healing potion, "Potion" on its button | mine |

The gear's ids are still the pirate game's (Leonard, AD's gear pictures are keyed by them, and the hero still
carries his cutlass picture); the names shown are the house's. Both change to his when his gear for the house lands.

## The hero and his skills

| Id | Name shown | Whose | Since |
| --- | --- | --- | --- |
| (the class) | Warrior | Robin, 2026-11-19: "One class to start: Warrior" | 2026-11-19 |
| `charge` | Charge | Robin's pick of the suggested kit, 2026-11-20 | 2026-11-20 |
| `cleave` | Cleave | Robin's pick; "Cleave or Whirlwind" still open | 2026-11-20 |
| (the bar) | rage | Robin's pick of the suggested kit | 2026-11-20 |
| (money) | gold | mine | 2026-11-20 |

These are the common words of the old grinders. Whether Drok gets its own names for them is Robin's to say; not asked yet.

## People

| Id | Name shown | Lines | Whose | Since |
| --- | --- | --- | --- | --- |
| the stall's keeper | Old Thimble | none: the stall's window is titled "Old Thimble's stall" | mine | 2026-11-20 |

Robin, 2026-11-20: light quests; a few people in the town who speak in short lines (the town is the doll's house
now, with small folk in it). Nobody speaks yet. Lines, when they come, are the Game Developer's placeholders, each marked.

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
