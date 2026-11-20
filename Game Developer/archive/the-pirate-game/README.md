# The pirate game (Victor, GD, 2026-11-20)

**What:** Drok as it was built until 2026-11-20: Marlow's Landing (the harbour town), Crab Cay (the island), the sea
chart between them, sailing from a dock, the sand crab, the reef gull and the coconut crab, with Leonard, AD's art
for all of it.

**Why it went:** Robin, 2026-11-20: "I think I like it more if its an open world and not tied to islands. Instead it
should be biomes." "A shrunk person and enemies are insects"; "Lets do 1, but inside a house."

**Where it is:** nothing was copied here; the repo has it whole. The last commit of the pirate game is `19bef0c`
(`git show 19bef0c:"Game Developer/rules/src/town.ts"` and the like). What went out of the code after it:

- the rules: the `sail` action and its refusals, the docks, `place.town`, `place.chart`, the save's steps 2 → 3 → 4;
- the screen: the sea and the pier, the stand-in island and town, the sea chart window (stand-in and drawn);
- the tests of the island's and the harbour's ground and of sailing.

**Still in the game, switched off in `client\src\art.ts`:** Leonard, AD's island, harbour, folk, chart and three
monsters in `client\public\art\`. They are still downloaded for offline play, about 1 MB. They go when his art for
the house lands. His hero, gear, loot and glass are still used.

**It still plays** on the public page, `https://drok-game.pages.dev/`, until the house is put there.
