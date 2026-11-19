# Chapter 1: the plan

The checklist of the control test and of chapter 1 (`chapters.md`), in the order it is built. Each item: who does it
(GD, AD, SD), what it needs from the studios, its sub-items, **Built** when it works with its tests, **Checked** when
Robin has tried it on his device and said so (with the date). A change to a checked item re-opens it. "What's next"
reads this list top down.

Legend: `[ ]` open, `[x]` done. Who: GD, AD, SD. A stand-in holds a place until a drop lands, so nothing here waits.

## Before chapter 1: the control test

0. `[x] Built 2026-11-20` `[ ] Checked` · GD · **Three ways to steer, on Robin's phone**
   - `[x]` the rules: walking, a target with auto-attack, rage, Charge, Cleave, the crab, falling and standing up;
     48 tests, a bot that plays each scheme
   - `[x]` the screen: the field, stand-in shapes, the switch 1 Tap, 2 Hold, 3 Stick, the two skill buttons, the menu
   - `[x]` checked in the pane at 412 by 915 by stepping the page: each scheme's steering, the buttons, the menu
   - `[ ]` **Robin plays all three on his phone** (`http://192.168.0.43:5178/` on the home Wi-Fi) and names one
   - `[ ]` his notes written as round 1 in `playtests.md`; the felt numbers into `lessons.md`
   - needs: nothing from the studios

## Chapter 1: Harbour town plus island

Built on the scheme he picks. The two schemes he does not pick are moved to `archive\` then.

1. `[ ] Built` `[ ] Checked` · GD · **The one way of steering, tuned to his notes**
   - `[ ]` the picked scheme only; its numbers (speed, dead zones, the tap's slop) as he felt them
   - `[ ]` which hand is the default; Cleave or Whirlwind (idea bank 1 and 5)
   - needs: Robin's pick and notes

2. `[ ] Built` `[ ] Checked` · GD · **The save that can leave the phone** (Robin, 2026-11-20: from day one)
   - `[ ]` "export save" writes a file; "import save" reads one back, through the same version check
   - `[ ]` a test: export, import, the same state; a broken file changes nothing
   - needs: nothing

3. `[ ] Built` `[ ] Checked` · GD · **The island as a hunting ground**
   - `[ ]` places in the data: the island and the harbour, each with its size, its monsters and their levels
   - `[ ]` three kinds of monster in the data, each with its own numbers and one thing it does differently
   - `[ ]` the bot hunts the island on many seeds and prints kills, falls and time for each level
   - needs: AD wave 1 (the island's ground kit, three monsters); stand-ins until then

4. `[ ] Built` `[ ] Checked` · GD · **Experience and levels 1 to 5**
   - `[ ]` experience per kill, the curve in the data, what a level gives
   - `[ ]` the level-up on the screen; the bar
   - needs: SD wave 1 (the level-up sound)

5. `[ ] Built` `[ ] Checked` · GD · **Loot on the ground**
   - `[ ]` money and items drop where the monster fell; a drop table per monster in the data, rolled by the rules
   - `[ ]` rarities with a coloured effect each; drops fly to him when he walks close
   - `[ ]` the bag and what he wears; the top buttons: bag, chart, character
   - needs: AD wave 1 (loot, the rarity effects, the UI kit), SD wave 1 (the pickup by rarity)

6. `[ ] Built` `[ ] Checked` · GD · **One chest**
   - `[ ]` a chest on the island with its own table; opened by walking up and tapping
   - needs: AD wave 1 (the chest), SD wave 1 (the chest)

7. `[ ] Built` `[ ] Checked` · GD · **Death that costs money**
   - `[ ]` a share of the money he carries is lost (Robin: "say 10%"; his to feel) and he wakes in the harbour
   - needs: SD wave 1 (falling)

8. `[ ] Built` `[ ] Checked` · GD · **The harbour town and the sea chart**
   - `[ ]` the harbour as a second place with no monsters; a shop that buys and sells
   - `[ ]` the chart with the two places; a tap travels
   - needs: AD wave 1 (the harbour's kit, the shop, the chart)

9. `[ ] Built` `[ ] Checked` · AD · **Wave 1 art** (`art-demands.md`)
   - `[ ]` Robin's answers to questions 20 and 21 (the looks he loves; drawn or modelled, how gear shows)
   - `[ ]` three stills of the look, Robin picks (big work: three concepts)
   - `[ ]` the Warrior, the island, three monsters, the harbour, loot and effects, the UI kit, the chart, the icon
   - needs: the budgets confirmed by the GD once the form of the art is known (question 21)

10. `[ ] Built` `[ ] Checked` · SD · **Wave 1 sound** (`sound-demands.md`)
    - `[ ]` Hugh, SD's chat started (Robin, 2026-11-20: when chapter 1 is planned; needs his go, see below)
    - `[ ]` three one-minute pieces for the title, Robin picks; the library fetched for the effects
    - `[ ]` the audio layer in the game with mute and volumes
    - needs: the budgets in `sound-demands.md`

11. `[ ] Built` `[ ] Checked` · GD · **Alpha 1 on the public page**
    - `[ ]` Robin runs the deploy to Cloudflare Pages (his login); the live build checked against `dist`
    - `[ ]` installed on his phone and played with the network off
    - needs: Robin's Cloudflare login for the deploy

## Needs from the studios, in order

1. AD: questions 20 and 21 to Robin → the look (three stills) → the Warrior → the island's ground → three monsters →
   loot and the rarity effects → the UI kit → the harbour and the shop → the chart → the icon.
2. SD (once his chat is started): the budgets agreed → the swing and the hit → the pickup and the chest → three
   pieces for the title → the level-up and falling.

## Waits for Robin

- His pick of the three ways to steer, and his notes (item 0).
- "Start Hugh, SD": he picked "when chapter 1 is planned", which is now; his chat starts on his word.
- Leonard, AD's questions 20 and 21, in Leonard's chat.

## Done when

On Robin's phone, installed from the public page and with the network off, he walks from the harbour to the island
over the chart, hunts three kinds of monster from level 1 to 5, picks up loot of more than one rarity, opens the
chest, dies once and loses money, buys something in the shop, closes the game and finds everything as he left it;
with the real art and sound of all that and no stand-in in sight; the frame log shows 60 frames a second.
