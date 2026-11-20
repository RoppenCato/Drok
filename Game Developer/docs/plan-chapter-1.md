# Chapter 1: the plan

The list of things to do to finish chapter 1 (Robin, 2026-11-20: "Make a list of things to do to finish chapter 1.
Then work through the list until you are done. Including tests. I dont need to approve or answer any questions until
you are done. Let AD handle the art you need. I approve."). In the order it is built. Each item: who does it (GD, AD,
SD), what it needs, its sub-items, **Built** when it works with its tests, **Checked** when Robin has tried it on his
phone and said so (with the date). A change to a checked item re-opens it. "What's next" reads this list top down.

Legend: `[ ]` open, `[x]` done. Who: GD, AD, SD. A stand-in holds a place until a drop lands, so nothing here waits.

## Before chapter 1: the control test

0. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Three ways to steer, on Robin's phone**
   - `[x]` built, tested, checked in the pane (see `tests.md`)
   - `[ ]` Robin plays all three and names one. Until he does, all three stay, on a switch in the settings
     (≡, "Steering"); tap is the default, as his brief says ("Tap to move, with skill buttons").

## Chapter 1: Harbour town plus island

1. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Two places and the sea chart**
   - `[x]` places in the data: Marlow's Landing (the harbour town) and Crab Cay (levels 1 to 5); only the place he is
     in is alive; it fills from its zones when he lands
   - `[x]` sailing from a dock only; he lands on the other dock; what lay on the ground stays behind
   - `[x]` the chart window with both places; a tap on the pier walks him there and opens it
   - tests: sailing and its refusals; the island's zones; the data is whole

2. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Three kinds of monster**
   - `[x]` the sand crab (level 1), the reef gull (level 3: bites and backs off), the coconut crab (level 5: a slow
     slam that hits all round it, with a long wind-up to get clear in)
   - `[x]` on the screen: three stand-in shapes; the slam's ground shown while it winds up
   - tests: the gull's retreat; the slam hit, near-miss and miss; every wind-up can be walked out of

3. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Experience and levels 1 to 5**
   - `[x]` experience per kill, the curve in the data, a level gives health and damage and fills his health
   - `[x]` the experience bar, the level, a banner at a new level
   - tests: a level-up; the last level; his level and cutlass in every swing

4. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Loot on the ground, the bag, gear**
   - `[x]` money, potions and gear drop where the monster fell, rolled by the rules from each kind's chances
   - `[x]` four rarities, each with its glow on the ground (and a beam for rare and epic) and its edge in the bag
   - `[x]` drops fly to him when he walks close; a full bag leaves gear lying and says so
   - `[x]` a bag of 20; four things to wear (cutlass, buckler, hat, coat); the bag and hero windows; what he wears
     shows on the stand-in
   - tests: the chances over 600 kills; pick-up; a full bag; wearing, taking off, dropping; a rarer piece is better

5. `[x] Built 2026-11-20` `[ ] Checked` · GD · **One chest**
   - `[x]` on the island, at the end of a side path among the gulls (where Leonard, AD put it; my first place was
     behind the coconut crabs); money, potions and a piece better than common
   - `[x]` it fills again 20 minutes later on the real clock, also while the game is closed
   - tests: too far, open, empty, full again by the clock

6. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Potions**
   - `[x]` three to start, bought at the stall, sometimes dropped; a potion mends over three seconds
   - tests: mending, the wait, the refusals

7. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Death that costs money**
   - `[x]` a tenth of the money he carries is lost (Robin: "say 10%") and he wakes whole in the harbour
   - tests: the cost, waking in town with his bag

8. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The harbour's stall**
   - `[x]` three pieces, each for another part of him, of the tier his level has earned; new ones each time he
     comes to town; potions; it buys what he found
   - tests: the stock, buying, selling, every refusal

9. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The save that can leave the phone** (Robin, 2026-11-20: from day one)
   - `[x]` version 2, with the step up from the control test's save; unknown gear, monsters and places are dropped
   - `[x]` "Export save" and "Import save" in the settings; "Start over" asks twice
   - tests: out and back; broken files; the old save; what today's data no longer knows

10. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The whole chapter, played by a bot**
    - `[x]` from a nobody in the harbour to level 5 and the chest on three seeds: about 16 minutes, no falls, two or
      three trips home (a person: perhaps twice that; the numbers are in `tests.md`)

11. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Installed and offline**
    - `[x]` the built page caches itself; with its server stopped it still opens and keeps the save (checked in
      the pane on `localhost:4178`)
    - `[ ]` **the public page: waits for Robin.** The deploy needs his Cloudflare login. From `Game Developer\`:
      `npm run build` and then `npx wrangler@4 pages deploy dist --project-name drok --branch main --commit-dirty=true`
    - `[ ]` installed on his phone from that page and played with the network off

12. `[x] Built 2026-11-20` `[ ] Checked` · AD · **Wave 1 art** (`art-demands.md`). **Where it stands,
    2026-11-20:** Leonard, AD delivered all of wave 1 and all of it is in the game and switched on
    (`docs\state\art.md`): the Warrior, the gear, three monsters, the island, the loot, the glass, the harbour town
    with its people, the sea chart, the app's icon. With the places the rules got a shore, things and houses to
    walk round and a way-finder for a tap (items 15 to 17 below). Not drawn yet: a coat on his body. Every look is
    his own choice and none has been seen by Robin. The sub-list below is kept as it was written before the drops.
    - `[x]` Robin's answers to questions 20 and 21; he then said (2026-11-20) "Let AD handle the art you need. I
      approve.", so Leonard, AD chooses the look himself, marked "mine", and Robin judges it when he is back
    - `[ ]` AD, in his `out\` on 2026-11-20 but not yet handed over with notes: `hero`, `gear`, `sand-crab`,
      `reef-gull`, `island`, `loot`, `glass`. Still to come: `coconut-crab`, the harbour, the sea chart, the icon.
    - `[x]` GD: the layer that draws his figures, his gear on the hero and his icons (`docs\state\art.md`); tried
      against his hero, gear and sand crab, then switched off until he hands them over
    - `[ ]` GD, the moment he hands each over (copy the folder without `frames\`, switch it on in `art.ts`, check
      in the pane, commit):
      - `hero`, `gear`, each monster: a switch only; the layer draws them
      - `island`: his `place.json` lays the island out his way (a painted ground at one pixel a unit, a shoreline
        `land`, `props` by name and place, `solid` circles that block the way, and his own `dock`, `arrive`,
        `chest` and `zones`, which differ from mine). He designs places, so his layout goes into
        `rules\data\places.json`. New in the rules, with tests: walking only on the land, and round the solids
        (a tap's straight line must slide round them); the bot must still finish the chapter. New on the
        screen: the ground picture, the props sorted by where they stand, his dock, boat and chest
      - `loot`: his coins, potion and gear pictures, the ring for each rarity and the spark; his rarity colours
        into `rules\data\items.json`
      - `glass`: his panel (nine-slice), skill discs, slots, buttons, bars and marks in `hud.ts` and `panels.ts`
      - the harbour, the sea chart and the icon when they land

13. `[ ] Built` `[ ] Checked` · SD · **Wave 1 sound** (`sound-demands.md`)
    - `[ ]` **Hugh, SD's chat: waits for Robin.** It could not be started from a phone session; his first brief
      stands ready in `sound-demands.md`. In the desktop app: a new chat in `C:\dev\Drok\Sound Director` with the
      first message "You are Hugh, SD. Read CLAUDE.md, then ..\Game Developer\docs\sound-demands.md."
    - `[ ]` the effects sprite; three one-minute pieces for the title, Robin picks
    - `[ ]` GD: the audio layer in the game with mute and volumes, when the first sprite lands

14. `[ ] Built` `[ ] Checked` · GD · **Alpha 1**: every item above Checked by Robin, the frame log read, a tag on main

15. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The island as Leonard, AD laid it out**
    - `[x]` his shore, inlet, things in the way, dock, landing, chest and zones written into the rules' data by
      `tools\place-from-art.mjs`
    - `[x]` he walks on land only and slides along the shore; walking monsters too; gulls fly over everything; a
      monster arrives only on ground it can stand on and never at the landing; nothing drops into the sea
    - `[x]` a save made on the old island puts him ashore instead of in the water
    - tests: the shore, a tap on the sea and on a rock, a safe landing, the old save

16. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Finding the way for a tap**
    - `[x]` a tap far away walks him round rocks, trunks and water (the bot had found a notch between two rocks
      that trapped a straight walk); walking up to a tapped monster does the same when something is between
    - `[x]` the save is version 3 (he carries the way he is walking), with the step up from version 2
    - tests: from the landing to the chest and back without ever standing in a solid thing; the version step

17. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The harbour as Leonard, AD laid it out, the chart and the icon**
    - `[x]` his town in the rules: the shore, three houses and the stall as boxes to walk round, the well, lamps,
      barrels and the four people as round things; he steps ashore on the quay; the stall is where one trades
    - `[x]` on the screen: his ground, his props, his people standing and breathing, the keeper in his stall
    - `[x]` his sea chart fills the screen: pins, the ring where he is, the way between, "Sail to …"
    - `[x]` his icon is the app's icon
    - `[x]` a save made in the old town does not leave him inside a house
    - tests: a house stops him and he slides along its wall; a tap behind a house finds the way round; a tap on
      the stall takes him to its front, near enough to trade; the old save

## Waits for Robin

- Play it: `http://192.168.0.43:5178/` on the home Wi-Fi. The first minute: tap the stall to see what it sells,
  tap the dock at the bottom of the town, tap "Sail to Crab Cay", tap a crab.
- The look: Leonard, AD chose it himself, as told ("Let AD handle the art you need. I approve."), so the first
  judging of the Warrior, the monsters, the island, the town, the chart, the glass and the icon is this play. The
  look and the chart would each have been three to pick from. And the size: he finds the Warrior small and offers
  the camera a quarter closer; kept as it is until Robin has seen it (`docs\state\art.md`).
- Which of the three ways to steer stays (≡, "Steering").
- The deploy to Cloudflare Pages (item 11), so it installs and plays offline.
- Starting Hugh, SD's chat (item 13).
- The felt numbers: how long a level takes, how hard the monsters bite, what things cost (`lessons.md`). The long
  balance run says the island is too kind: even a clumsy bot never falls in ten runs, it only drinks more
  (`tests.md`). Whether to make it bite harder is his after he has played.
- The smaller open points in the brief (Cleave or Whirlwind, what "Drok" means, the share lost on death, the job
  advancements, which hand).

## Done when

On Robin's phone, installed from the public page and with the network off, he walks from the harbour to the island
over the chart, hunts three kinds of monster from level 1 to 5, picks up loot of more than one rarity, opens the
chest, dies once and loses money, buys something in the shop, closes the game and finds everything as he left it;
with the real art and sound of all that and no stand-in in sight; the frame log shows 60 frames a second.
