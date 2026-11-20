# Chapters: the game built one part at a time, each ending in something playable

Robin, 2026-11-04 (the template): chapters from the start, even when there is only one; a chapter is a piece of the
game that matters (move your character and fight), not a piece of story; finish one before spreading out. A chapter is
done when every line of its "done when" is true on Robin's device, not before; the next starts when the one before is
done, except art and sound, which may run one chapter ahead. The checklist of the current chapter is
`plan-chapter-N.md`; the art per chapter is `art-demands.md`, the sound `sound-demands.md`; what is open is `idea-bank.md`.

## Before chapter 1: the control test. **Built 2026-11-20; answered by Robin 2026-11-20: tap and a stick, both at once**

(Robin, 2026-11-19): "one small field, one monster, and three control schemes for me to try on my phone, so I can pick
by feel: 1. Tap to move, tap a monster to target it. 2. Hold and drag to steer, auto-attack the nearest monster. 3. A
floating stick with buttons." (Robin, 2026-11-20, his pick): with two skill buttons, Charge and Cleave.

**Game** (exists): one field of sand (1200 by 1500 units, the screen shows 412 by 915 of it); the Warrior as a
stand-in shape; sand crabs as stand-in shapes, three at a time by default (his words were "one monster": one kind, and
three of it is mine, so "nearest" and Cleave have something to choose between; the menu sets 1 to 8); a target with
auto-attack; rage; Charge and Cleave in an arc in the bottom corner; health, falling and standing up; the three ways
to steer on a switch at the top; a menu (crabs, which hand, fewer effects, save the log, start over); the save.

**Art and sound**: none. Stand-in shapes in vibrant pirate colours, no sound.

**Done when** Robin has played all three on his phone and named the one that feels right. His pick goes into the
brief, his notes into `playtests.md` as round 1, and chapter 1 is built on it.

## Chapter 1: Harbour town plus island. _The first real loop._ **Alpha 1**

**The theme changed on 2026-11-20** (Robin: an open world of biomes, a shrunk person in a house, insects; bean
size, "Go for 2"). The loop below is rebuilt as a home and the kitchen floor around it, in one world, with no sea
chart: the plan is `plan-house.md`. What is written below is the pirate game as built, which stays on the public
page until the house plays through. The headlines of the later chapters hold, with "islands" read as "rooms".

(Robin, 2026-11-20, his pick): one island with three monsters, levelling 1 to 5, loot on the ground with rarities, one
chest, death that costs money, and the save; plus a small harbour town with a shop to walk back to, and the sea chart
between the two. Real art and sound for just that. (Robin, 2026-11-20): "Make a list of things to do to finish
chapter 1. Then work through the list until you are done."

**Where it stands (2026-11-20)**: the game side is built and tested, on stand-in shapes and in silence. The art is
being made by Leonard, AD on his own calls (Robin: "Let AD handle the art you need. I approve."). The sound, the
public page and Robin's own play wait for Robin. The list is `plan-chapter-1.md`.

**Game** (all of it exists)
- Marlow's Landing, the harbour town, and Crab Cay, the island, on a sea chart; sailing from a dock.
- Three kinds of monster: the sand crab, the reef gull, the coconut crab. Experience and levels 1 to 5.
- Money, potions and gear that drop on the ground with the glow of their rarity and fly to him when he walks close;
  a bag; four things to wear; one chest that fills again by the clock; potions.
- Death that costs a tenth of his money and wakes him in the harbour; a stall that sells and buys.
- Bag, chart and hero at the top; export and import of the save in the settings; the built page works offline.
- One way to steer (Robin, 2026-11-20, after playing): a tap walks him there, a thumb that drags is a stick. The
  skills in the middle at the bottom, his health and the target's over them.
- **Still to do**: the audio layer when the first sounds land. The public page is up since 2026-11-20:
  `https://drok-game.pages.dev/`.

**Art** (wave 1): the look (three stills, Robin picks); the Warrior with cutlass and buckler; the island's ground kit;
three monsters; the harbour's ground kit and the shop; loot on the ground and the rarity effects; the UI kit; the sea
chart; the icon.

**Sound** (wave 1): the Sound Director's chat starts with this chapter. The title's three one-minute pieces, Robin
picks; steps, the swing, the hit, a crab's noises, the pickup by rarity, the chest, the level-up, falling.

**Done when**: on Robin's phone, installed from the public page and with the network off, he walks from the harbour
to the island over the chart, hunts three kinds of monster from level 1 to 5, picks up loot of more than one rarity,
opens the chest, dies once and loses money, buys something in the shop, closes the game and finds everything as he
left it; with the real art and sound of all that and no stand-in in sight; the frame log shows 60 frames a second.

## Chapter 2: Gear worth hunting for

Gear ranks, rarities and affixes in full; what he wears shows on him; uniques that change how a skill works; sets; the
rest of the Warrior's kit (the defensive cooldown; Cleave or Whirlwind settled). Planned when chapter 1 closes.

## Chapter 3: The monster book and the rare ones

A rare signature drop per monster; the monster book and its bonuses for good; rare spawns; a boss on a timer that
runs on the real clock.

## Chapter 4 and on: headlines

- More islands on the chart, by level, each with its own light and mood.
- Chests and keyed vaults.
- Job advancements at set levels.
- Risky gear upgrading with scrolls.
- Light quests from the people of the harbour.

The order after chapter 1 is mine (Victor, GD, 2026-11-20) and is Robin's to change; each is planned only when the
one before closes.

## How a chapter runs

1. The chapter's art and sound lists go to the studios at the chapter's start; drops land piece by piece and replace
   the stand-ins.
2. The game's pieces are built one at a time, each with its tests, committed; anything that needs the screen is
   checked in the browser pane at the judging size and on Robin's device.
3. The alpha is a build on the link friends can open; what they say goes into the idea bank and the next chapter's
   list, or into a fix before the chapter closes.
4. A chapter closes with its "done when" true, `docs\state\` current, and a tag on main (`alpha-1`, …). The next
   chapter's plan is written then (the skill `chapter-plan`), not before.
