# Chapter 1: the plan

The list of things to do to finish chapter 1 (Robin, 2026-11-20: "Make a list of things to do to finish chapter 1.
Then work through the list until you are done. Including tests. I dont need to approve or answer any questions until
you are done. Let AD handle the art you need. I approve."). In the order it is built. Each item: who does it (GD, AD,
SD), what it needs, its sub-items, **Built** when it works with its tests, **Checked** when Robin has tried it on his
phone and said so (with the date). A change to a checked item re-opens it. "What's next" reads this list top down.

**2026-11-20:** a house theme was tried for an afternoon and left (Robin: "I think i like pirate more. Lets expand
on pirate"); this list is the game again. New from it, built and tested: item 20 below.

Legend: `[ ]` open, `[x]` done. Who: GD, AD, SD. A stand-in holds a place until a drop lands, so nothing here waits.

## Before chapter 1: the control test

0. `[x] Built 2026-11-20` `[x] Checked 2026-11-20` · GD · **Three ways to steer, on Robin's phone**
   - `[x]` built, tested, checked in the pane (see `tests.md`)
   - `[x]` Robin, 2026-11-20, after playing: "click to move is good, but there needs to be a simple wqy to also
     move freely", "both available at the same time". So not one of the three: tap and stick together, item 18.

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
    - `[x]` the public page: `https://drok-game.pages.dev/` (2026-11-20, on Robin's word; his Cloudflare login
      was already on this PC). `npm run deploy` from `Game Developer\`. Opened in the pane: it plays, no error,
      the offline cache is filled
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

18. `[x] Built 2026-11-20` `[ ] Checked` · GD · **After Robin's first play: one way to steer, and the glass at the
    bottom** (`playtests.md`, round 1)
    - `[x]` a tap walks him there or picks a monster; a thumb that drags is a stick where it came down; both at
      once, no switch in the settings; with nothing tapped he fights the nearest, and one he tapped stays his
    - `[x]` Charge, Cleave and the potion in a row in the middle at the bottom; his health and rage over them; who
      he fights and its health over those; experience along the floor
    - `[x]` a longer, thicker health bar over a monster, edged in gold on the one he fights
    - `[x]` he is drawn a little above the middle, and stands above the pile on a dock
    - `[x]` the save is version 4, with the step up from version 3
    - tests: tap and thumb together; who the target is; the old save. In the pane: the tap on the lift, the drag,
      the dock through the glass, a fight
    - `[x]` AD: a bar for a monster's health and a ring and knob for the stick, with round-ended fills, a heart
      for his health and his own sizes for the pile (his drop of 2026-11-20, in the game the same day)
    - `[x]` a page that is open is no longer restarted when a file is saved here (hot reload off)

19. `[x] Built 2026-11-20` `[ ] Checked` · GD and AD · **His health over his head** (`playtests.md`, round 2; Robin,
    2026-11-20: "the heros health bar should show over his character, and the rage bar below it")
    - `[x]` three ways in the game to pick from, on the row "Bars" in the settings, and three pictures in the chat
    - `[x]` Leonard, AD looked at the three on the real screen (2026-11-20, `Art Director\concepts\own-bars\`,
      `four.jpg`): he would not pick way 2 (the rage lies across the monster south of him); his sketch "4" is way
      1 as ONE small piece (one dark outline with two rooms: health 7 tall, rage 3.4 under it, the heart on its
      end, 52 long); his pick is 4, then 3. For any way: 52 long is enough (64 is twice the hero's width), and
      the arrow over the one he fights is left out while his own bars are on the field (it touches his heart
      when that monster stands beside him). Held until Robin had picked.
    - `[x]` Robin picked, in the Art Director's chat (2026-11-20): "I think 4, but the heart isnt needed. Also
      rage is traditionally red. So they need to be distinctive different red colors". Leonard, AD passed it on;
      his words were read in that chat's own record before anything was built
    - `[x]` AD: his own bar as five pieces (a back, three flat fills, a frame on top), 52 long, no heart; rage a
      deep crimson in the atlas (his commit 468df65)
    - `[x]` GD: way 4 is the only way; ways 1 to 3, the row "Bars", `?bars=` and the pile's health and rage are
      out (kept in `archive\his-bars-four-ways\`); the arrow over the one he fights is out; the bar is put on
      whole screen pixels after the camera, so it does not tremble as he walks; the camera looks 45 below him,
      not 60 (the place's foot stays at 110)
    - `[x]` a monster's bar never lies on his bar or across his face: it is lifted to sit above his (Leonard,
      AD's rule, after he looked at the bar in the game: `Art Director\concepts\own-bars\bars-apart.jpg`)
    - tests in the pane: `tests.md`, "his own bar over his head" and "a monster's bar kept off his bar and face"

20. `[x] Built 2026-11-20` `[ ] Checked` · GD and AD · **Big islands with several biomes** (Robin, 2026-11-20, his
    pick: "Big islands with several biomes each, and the chart to sail between them")
    - `[x]` a place has grounds (biomes), each a box with a name and its levels; the glass says the name when he
      walks into one. Crab Cay as it stands: the beach (1 to 2), the grove (3 to 4), the cove (5); names mine
    - `[x]` a monster far from him that is only strolling does not move, so an island can be big
    - tests: every zone lies on a ground; far ones sleep, near ones stroll, one on its way home is never asleep
    - `[ ]` AD: Crab Cay as a big island with four grounds (asked 2026-11-20). Its ground as patterns that repeat
      and edge strips, not one painting: a painting of that size would not fit a phone's memory
    - `[ ]` GD: draw a place from patterns and strips; lay his island into the rules; the bot plays it through

21. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Loot pops out of a monster** (Robin, 2026-11-20: "items should pop
    out of monsters when dropped")
    - `[x]` each thing flies out of the fallen monster (or the opened chest) in an arc, lands with a small bounce,
      and lies 0.55 s before it can fly to him; things land 38 from where it fell, not 22
    - tests: nothing is picked up before it has lain; then it flies as before

22. `[x] Built 2026-11-20` `[ ] Checked` · GD · **The hero sheet: one window for the hero and his bag** (Robin,
    2026-11-20: "a proper inventory system like my other games, look at zite for example")
    - `[x]` after Zite's hero sheet: the hero wearing his gear, four slots beside him, his numbers, the bag as a
      grid of 7 by 3, a card for the tapped piece with how it stands against what he wears, and only the buttons
      that apply (Wear, Take off, Drop, and Sell at the stall). The bag button and the hero button both open it
    - `[x]` a piece he finds for a bare part of him is put on at once (Zite's rule)
    - not taken from Zite, because this game has none yet: stacks of flasks and cards, sets, ranks, tabs

23. `[x] Built 2026-11-20` `[ ]` Checked · AD then GD · **The town on the starter island** (Robin, 2026-11-20: "Make the starter island a pirate
    town, and the other part of the island beginner friendly with low level mobs")
    - `[x]` AD: big Crab Cay, 2800 by 4200, with the town at its landing (`art\crab-cay`, his commit c179620): one
      painted ground at half a pixel a unit, 432 props, three grounds as outlines, the town's outline as `home`
    - `[x]` GD: his layout in the rules by `tools\place-from-art.mjs` (48 monsters in six zones, counted by each
      box's size); the town is safe (nothing comes for him there, none is born there, his health comes back, new
      pieces on the stall when he comes in from outside); one he has hurt fights on, town or not; nothing is born
      where he cannot walk to; he starts and wakes in the town; the harbour is no place of its own; the save is
      version 7 (he keeps all he is and has, wakes in the town)
    - `[x]` the bot plays it through on three seeds: level 5 at 11.3 minutes, no falls, 2 or 3 trips home on foot
    - open: the chart has one island and nowhere to sail; Leonard, AD finds the town small for an island this
      size and offers three stills of a real pirate town (big work): Robin's to say

24. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Eight parts to wear gear on** (Robin, 2026-11-20: "There should
    also be more slots for items ... take a lot from the zite inventory and equip")
    - `[x]` gloves, boots, a ring and a charm beside cutlass, buckler, hat and coat; twelve new pieces in three
      tiers (names and numbers mine: gloves and rings add to his swing, boots to his health, a charm to his armour)
    - `[x]` the hero sheet has four slots each side of him, as Zite's; the save is version 5 (the new parts bare)
    - the new pieces are plain shapes until Leonard, AD's icons; with eight parts each fills more slowly from the
      same drops, and a fully dressed hero is stronger than before: the balance run was not run again

    - `[x]` **changed the same day to Robin's own list** ("We need slots for trinkets also. Two trinkets. I think we
      can skip rings. Do: Head, chest, legs, boots, necklace, two trinkets"): nine places with cutlass and buckler;
      a trinket goes in a bare trinket place, and with two on it takes the place of the one worth less. Gloves
      became breeches, rings trinkets, charms necklaces, in every save (version 6): nothing he had is lost

    - `[x]` **the worn piece beside the one looked at** (Robin, 2026-11-20: "when you look at a sword you should
      see your equipped one next to it"): the card is two halves, the bag's piece left and the worn one right,
      the same numbers on the same rows, and a green or red arrow with how much more or less

25. `[ ]` · AD · **A wooden pirate look for menus, panels and icons** (Robin, 2026-11-20: "some nice pirate design
    to menus and panels. Like some wooden feeling. Right now it looks bland. Also update icons so they look
    fitting"): three stills for Robin to pick from, asked 2026-11-20; then the kit, and GD puts it in

## Waits for Robin

- Play it: `http://192.168.0.43:5178/` on the home Wi-Fi. The first minute: tap the stall to see what it sells,
  tap the dock at the bottom of the town, tap "Sail to Crab Cay", tap a crab; then put a thumb down anywhere and
  slide it. The link answers only while the dev server runs on this PC; if it is dead, say so in the chat and it is
  started again (`docs\state\pages.md`).
- The new steering (item 18): does the stick want a home on the screen (it only shows while a thumb drags).
- His own bar (item 19), on his phone: do the two reds read as two; is it still enough in a crowded fight; does he
  miss his health in numbers; should it show in the town. Whether the monster's name plate at the bottom stays.
  And Leonard, AD's note: Cleave's disc is health's red, so three reds meet on the screen now.
- A rule of the game, his and mine: may a monster stand right on him? Nothing keeps one out of him now (the rules
  push monsters apart from each other only). Its bar is kept off his face either way.
- The look: Leonard, AD chose it himself, as told ("Let AD handle the art you need. I approve."), so the first
  judging of the Warrior, the monsters, the island, the town, the chart, the glass and the icon is this play. The
  look and the chart would each have been three to pick from. And the size: he finds the Warrior small and offers
  the camera a quarter closer; kept as it is until Robin has seen it (`docs\state\art.md`).
- Installing it on his phone from `https://drok-game.pages.dev/` and playing with the network off (item 11).
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
