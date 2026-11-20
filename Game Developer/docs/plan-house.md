# The change to the house: the plan

Robin, 2026-11-20: "I think I like it more if its an open world and not tied to islands. Instead it should be
biomes." "A shrunk person and enemies are insects"; "Lets do 1, but inside a house." "I really liked the color and
aestethic of what we have now tho." Of Leonard, AD's three sizes, in the Art Director's chat: "Go for 2" (bean size:
he is 1.5 cm). The picture is `..\..\Art Director\out\house-concepts\2.jpg`, its numbers in the `NOTES.md` beside it.

Everything below is mine (Victor, GD, 2026-11-20) unless it says Robin. It is the same loop as chapter 1 (a home, a
hunting ground, three monsters, levels 1 to 5, loot, a chest, falling, a stall, the save) in new clothes and in one
world. Nothing of chapter 1 was Checked by Robin, so nothing checked is re-opened.

## What stays, what goes

| Stays as it is | Changes | Goes (to `archive\`, with a README) |
| --- | --- | --- |
| steering, the target and auto-attack, rage, Charge, Cleave | the places become one world with biomes | the sea chart and its window |
| levels, loot, rarities, the bag, gear's numbers, potions | monsters live only near him, not "in the place he is in" | sailing, docks, the `sail` action and its sound |
| the chest by the clock, falling and its cost, the stall | the ground: a floor pattern that repeats, big things on it | the island, the harbour town and their art |
| the glass, his bar, the settings, the save's file, the public page | every name: places, monsters, gear | the crab, the gull, the coconut crab |
| the basic sounds (a shell cracking fits an insect) | the map button shows the house, not a chart | |

**The pirate game stays on the public page** until the house plays from home to level 5. Then it is swapped in one
deploy. A pirate save cannot be carried over (other places, other gear): it becomes a new hero, said on the screen.

## The world

- **One world, walked from end to end.** No loading between biomes; he sees the next floor ahead of him, as the rug
  lies north of the tiles in the still.
- **The size**: 36 units a centimetre (Leonard, AD's number for bean size). The screen shows 11 by 25 cm of floor.
  **The first world is under a bed in a bedroom** (Robin, 2026-11-20: "Start building. But make the first space
  under a bed in a bedroom"), with the floor beside it: about 1.2 by 1.6 metres, 4300 by 5800 units, many times
  the island. At his speed that is 27 seconds from end to end: big enough to be a world, small enough to walk home.
- **Three biomes for levels 1 to 5**, each with its own floor and its own things:
  1. the bedside: the lit floor beside the bed. Ants. Level 1 and 2.
  2. under the bed: the shadow, dust, lost things (a sock, a marble, a coin, a toy brick), the bed's legs as
     pillars. Silverfish, which dart in, bite and back off. Level 3.
  3. the far corner by the wall, behind the stored boxes. Cockroaches, with the slow slam. Level 5. The chest.
- **Home** is a doll's house at the bedside (Robin, 2026-11-20, his pick), where small folk live and trade: no
  insect comes near, the stall is there, his health comes back, he wakes there after a fall. Whether he walks
  into it or it stands open towards him is Leonard, AD's to draw.
- **A biome is a region of the one world** in the data: its outline, its floor, its level, its zones of monsters,
  its light. A thing in the way is a round thing or a box, as today.

## The work, in order

Each item is built with its tests and committed. **Built on 2026-11-20, in one go: items 1, 2, 3, 5 and 6, and
item 4 as flat stand-in shapes.** The home link plays the house; the public page still plays the pirate game. One
thing went otherwise than planned: the code keeps the word "place" for a world that is walked without a break
(`places.json`, `state.place`); there is one, `bedroom`. A second room that joins it is more of the same place.

1. `[x]` GD · **The data of one world**: `rules\data\world.json` (size, biomes, home, the chest, zones, things in the
   way) in place of `places.json`; `state.place` goes. A stand-in world laid out by me, flat colours, until
   Leonard, AD's layout lands. Tests: the data is whole; every zone can be reached from home.
2. `[x]` GD · **Alive only near him**: built simpler: a monster further than 1500 from him that is only strolling
   does not move; the fallen still come back by their timers. The state stays small however big the world grows. Tests: the
   same seed plays the same; a zone left and come back to; nothing is lost at a border.
3. `[x]` (measured: the old way-finder is quick enough: 58 ms for the first search, the whole world's length;
   kept as it was) GD · **Finding the way in a big world**: the way-finder searches only round him and the tap (a tap can
   only land on the screen); walls and things in a grid per region, made once. Tests: round a chair leg; from
   biome to biome; the time one search takes.
4. `[ ]` (stand-in built: flat floors with boards, the bed's shadow, every thing a plain shape with its name)
   GD · **The floor on the screen**: a pattern per biome that repeats (one small picture, drawn many times),
   borders between biomes as their own strips (the rug's fringe), big things drawn only when near the screen and
   sorted by where they stand. Memory counted. Checked in the pane at 412 by 915.
5. `[x]` GD · **Without the sea**: falling wakes him at home; the stall is at home; `sail`, docks and the chart
   go to `archive\`; the map button opens a small map of the house with a dot for him. The save is version 5.
6. `[x]` GD · **The insects**: the three kinds renamed and re-sized in `monsters.json` (the ant where the sand crab
   was, the silverfish where the gull was, on the ground, the cockroach with the coconut crab's slam); gear and places renamed in `names.md`. The bot plays home to level 5 on three seeds again; the long
   balance run printed again.
7. `[ ]` AD · **Wave 1 again, for the house** (`art-demands.md`, asked by message): the three floors and their
   borders, about ten things a biome, the three insects with their actions, home, the Warrior's gear at bean size,
   the icon. The hero's body, the loot, the glass and his bar stay. **GD**: copy each drop whole, switch it on.
   Then the swap on the public page.
8. `[ ]` SD · when Hugh, SD's chat is started: the sound list in `sound-demands.md` is rewritten for the house
   (insect voices, steps on tile and on wool); the basic set stays until then.

## What it costs on the phone (to be measured, not known)

- The floor: three patterns of about 512 by 512 instead of two painted grounds of 1200 by 1500. Less memory.
- The things: about thirty models, each drawn once, some bigger than he is (a pencil is as long as the screen).
  More than the island's props. To be counted against the budget in `art-demands.md` before Leonard, AD builds.
- The frame rate: only what is near the screen is drawn and only near zones live, so it should hold. The frame
  log on Robin's phone says.

## Waits for Robin

- Answered 2026-11-20 (the brief): get big again; pin and button; a doll's house; spiders like any insect. No
  spider in the first three biomes (mine): it comes with a later room.
- Still open: the music's mood; what shrank him and who the small folk are (questions 12 and 13 in the brief).
- The names: the house's places, the insects' names if they are more than "Ant".
