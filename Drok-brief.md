# Drok: the brief

Robin's decisions on the game, each with his name and the date, in his words. The studios read this first every
session. What is not decided is under "Open questions" or in `Game Developer\docs\idea-bank.md`, never here as if it
were decided. Started 2026-11-19 from the template at `C:\dev\2D game template`, from a brainstorm Robin held the same
day. Where he answered a startup question by picking a choice, the words of that choice are written out and marked
"his pick"; the choices were written by Victor, GD.

## The name

(Robin, 2026-11-19): "call the game "Drok"". (Robin, 2026-11-20): it is the real name, not a working title.

## In one line

(Robin, 2026-11-19): "A solo, old-school MMO grinder for the phone: one long-lived hero, hunting grounds, chests and
rare drops, in a top-down world."

## Where it is played

- (Robin, 2026-11-19): "Played on my phone, portrait, with one thumb." "Must be playable offline once installed."
- **The phone** (Robin, 2026-11-20): "Android with chrome". No weaker phone named.
- **How it gets onto his phone** (Robin, 2026-11-20, his pick): the home Wi-Fi link for the control test; a public page
  on Cloudflare Pages when chapter 1 starts, so it installs and plays offline.
- **The repo** (Robin, 2026-11-20): `https://github.com/RoppenCato/Drok`.

## Alone or with friends

(Robin, 2026-11-19): "Solo only. No server, no accounts, no co-op."

## The theme and the world

- **A new direction, being drawn** (Robin, 2026-11-20): "I think I like it more if its an open world and not tied
  to islands. Instead it should be biomes." "A shrunk person and enemies are insects"; then, of that idea: "Lets do
  1, but inside a house." And: "I really liked the color and aestethic of what we have now tho." He asked "Does it
  really work well im 2D tho? Scale can be tricky", so Leonard, AD draws three concepts first and Robin judges
  them. **Until he has, the pirate lines below are what the game is built as**; when he picks, they are rewritten
  (the theme, the hero's aim, his weapons, the world, the towns, the monsters, the names).
- **The theme** (Robin, 2026-11-20, his pick): vibrant pirate. "Bright seas, green islands, colourful crews and
  beasts. Nothing of dark fantasy comes back." It replaces "Dark fantasy" (Robin, 2026-11-19); he first wrote "Maybe
  vibrant pirate is a better theme", then picked it.
- **The hero and what he is after** (Robin, 2026-11-20, his pick): "Make a name". A nobody from a harbour town hunts
  the islands' beasts for bounty and loot, on his way to captain. Open-ended, so the grind never has to end.
- **What the Warrior fights with** (Robin, 2026-11-20, his pick): cutlass and buckler.
- **The world** (Robin, 2026-11-19): "A big world map." (Robin, 2026-11-20, his pick): a sea chart of islands. Each
  island is a hunting ground with its own levels. He travels by tapping the chart; there is no ship to steer.
- **Day and night, weather** (Robin, 2026-11-20, his pick): always day for now. Each island has its own fixed light and
  mood.

## How it plays

- **The view** (Robin, 2026-11-19): "Top-down 2.5D view, like Zelda. Movement must feel smooth and snappy."
- **The pace** (Robin, 2026-11-19): "Real time, not turn-based. Not a card game."
- **The input** (Robin, 2026-11-19): "Tap to move, with skill buttons. Buttons at the bottom or sides, covering as
  little of the screen as possible." (Robin, 2026-11-20, after playing): "I think click to move is good, but there
  needs to be a simple wqy to also move freely." "There should be a moving stick so you can choose to move with the
  stick or click where to go (both available at the same time) or some other way to move." So there is one way to
  steer: a tap walks him there, and a thumb that drags is a stick. How the stick works (it appears where the thumb
  comes down and slides) is the Game Developer's, for him to judge.
- **Fighting** (Robin, 2026-11-20, his pick): a target with auto-attack. He picks a target and the hero swings by
  himself while in reach; his thumb steers and presses skills. Not swings he aims himself.
- **The hero** (Robin, 2026-11-19): "One class to start: Warrior." "A long-lived character with permanent unlocks.
  Levelling up, finding things, opening chests, chances of rare items, meaningful progression."
- **The Warrior's kit** (Robin, 2026-11-20, his pick): rage built by hitting, Charge, Cleave or Whirlwind, and one
  defensive cooldown. Cleave or Whirlwind is not chosen yet; the control test has Cleave.
- **The feel** (Robin, 2026-11-19): "The feel I want is the grind of WoW, MapleStory and Priston Tale."
- **While he is away** (Robin, 2026-11-19): "The hero does not hunt while I am away."
- **Hunting grounds** (Robin, 2026-11-20, his pick): hunting grounds by level, rare spawns, and bosses on timers, all
  three. The timers run on the real clock, also while the game is closed, so "the boss is up in two hours" is a reason
  to come back.
- **Gear** (Robin, 2026-11-20, his pick): from Zite's ideas, the ideas only, no code or art copied: ranks, rarities,
  affixes, uniques, sets, chests and keyed vaults. No talent trees; job advancements shape the Warrior instead.
- **The monster book** (Robin, 2026-11-20, his pick): each monster has one rare signature drop. A monster book fills
  in as he hunts, and a finished page gives a small bonus for good, shared by every class he ever plays. Uniques
  change how a skill works, not only numbers.
- **Job advancements and upgrading** (Robin, 2026-11-20, his pick): job advancements at set levels, and risky gear
  upgrading. A failed upgrade wastes the scroll and uses up one of the item's upgrade slots, as in MapleStory. Harsher
  scrolls can be added later.
- **Loot** (Robin, 2026-11-19): "Needs to have coloroed effects for rarity." (Robin, 2026-11-20, his pick): money and
  items drop on the ground and fly to him when he walks close, so the thumb stays free.
- **Losing** (Robin, 2026-11-19): "On death you lose money." (Robin, 2026-11-20, his pick): a share of the money he
  carries (say 10%), and he wakes in the harbour town.
- **How the player is guided** (Robin, 2026-11-20, his pick): light quests. A few people in the harbour give hunting
  tasks ("30 crabs", "5 shells") with ! and ? marks and one short list. They speak in short lines; no long story.
- **The screen** (Robin, 2026-11-20, his pick): bag, chart and character as small buttons at the top. (Robin,
  2026-11-20, after playing; this takes the place of his pick of the same day, an arc in the bottom corner): "I think
  the buttons should be in the middle at the bottom." "Health etc on your hero and on mobs needs to be easier to see.
  Its all the way at top now making it hard to glance over. Maybe it should be at the bottom." (Robin, 2026-11-20,
  after seeing it at the bottom; this takes the place of "at the bottom" for his own health): "I think the heros
  health bar should show over his character, and the rage bar below it. It needs to be fixated well enough that it
  doesnt become messy when fighting mobs." "Would be nice if we can keep the UI as clean as possible." "Give me some
  suggestions". (Robin, 2026-11-20, in the Art Director's chat, of four ways shown; the fourth was Leonard, AD's:
  health and rage as one small piece over his head): "I think 4, but the heart isnt needed. Also rage is
  traditionally red. So they need to be distinctive different red colors".
- **The save**: on the phone only, since there is no server and no account. (Robin, 2026-11-20, his pick): an "export
  save" button in the settings from day one.

## The look and the sound

- **The look** (Robin, 2026-11-20, his picks in the Art Director's chat, from choices Leonard, AD wrote; the full
  record is `Art Director\docs\direction.md`): vibrant pirate, in "Clean line, flat colour": "One clear outline and a
  few strong, flat colours, like a print or a cartoon. Reads best when things are small on a phone." Games he loves
  the look of: Zelda: The Wind Waker, MapleStory, World of Warcraft. Not this: "Pale pastel phone-game look", "Grim
  and realistic", "Pixel art". The Art Director's three stills come next, and Robin picks.
- **How gear shows on the hero** (Robin, 2026-11-20, his pick in the Art Director's chat): "The big pieces". "Every
  cutlass, buckler and hat has its own shape. Coats and armour come in a handful of looks, and a full set shows as its
  own look. Boots, gloves and rings show only in the bag." Rare drops: "No glow on the hero": "The rarity colour shows
  only on the ground and in the bag."
- **The music** (Robin, 2026-11-20, his pick): no reference. The Sound Director writes three different one-minute
  pieces for the title in a vibrant pirate mood, and Robin picks the direction.
- **The sound effects** (Robin, 2026-11-20, his pick): the common library of recorded sounds from his other games
  first; new ones only for what it lacks.

## The work

- **Before chapter 1: the control test** (Robin, 2026-11-19): "one small field, one monster, and three control schemes
  for me to try on my phone, so I can pick by feel: 1. Tap to move, tap a monster to target it. 2. Hold and drag to
  steer, auto-attack the nearest monster. 3. A floating stick with buttons." (Robin, 2026-11-20, his pick): it gets two
  skill buttons, Charge and Cleave, so he can feel buttons under his thumb; the rest of the kit comes in chapter 1.
  It is over (Robin, 2026-11-20): tap to move stays, with a stick at the same time; see "The input".
- **Chapter 1** (Robin, 2026-11-20, his pick): "Harbour town plus island". One island with three monsters, levelling 1
  to 5, loot on the ground with rarities, one chest, death that costs money, and the save; plus a small harbour town
  with a shop to walk back to, and the sea chart between the two. Real art and sound for just that. The chapters are
  in `Game Developer\docs\chapters.md`.
- **What the Game Developer may do alone** (Robin, 2026-11-20, his pick): anything on the chapter's checklist that
  needs no decision of his: build, test, ask the studios, commit each item, report in the morning. The list is
  `Game Developer\docs\autonomous.md`.
- **The studios**: Victor, GD; Leonard, AD; Hugh, SD (named 2026-11-19, mine). Remote control on for the Game
  Developer's and the Art Director's chats (Robin, 2026-11-19). The Sound Director's chat starts when chapter 1 is
  planned (Robin, 2026-11-20, his pick).
- **How he is asked** (Robin, 2026-11-20): "Questionaire please", after a round of nine lettered questions in a chat
  message. The rule is in the root `CLAUDE.md`.

## Decisions since the start

A line each, newest at the bottom: the date, the decision, Robin's words.

- 2026-11-19: the game set up from the template (the phone starter); the answers above, from his brainstorm.
- 2026-11-19: the game is called "Drok" (Robin: "call the game "Drok""); the art direction "will be "Dark fantasy"".
- 2026-11-20: round 1 of the startup questions: the repo link; "Real name"; "Android with chrome"; the Wi-Fi link
  first and the public page at chapter 1; a target with auto-attack; the suggested Warrior's kit, with Charge and
  Cleave in the control test; the Sound Director later.
- 2026-11-20: the theme put in doubt: "Maybe vibrant pirate is a better theme".
- 2026-11-20: "Questionaire please": the rest was asked with choice boxes, four pages of four.
- 2026-11-20: the theme is vibrant pirate, nothing of dark fantasy comes back; the world is a sea chart of islands;
  the hero makes a name, with cutlass and buckler; and the picks above on hunting grounds, gear, the monster book,
  advancements and upgrading, loot, death, guidance, the screen, chapter 1, day and night, music, sound effects and
  working alone.
- 2026-11-20: after his first play of chapter 1: tap to move stays and a stick comes with it, both at once ("click to
  move is good, but there needs to be a simple wqy to also move freely"); the skill buttons go to the middle at the
  bottom; health, his and the monsters', must be easy to glance at, "maybe at the bottom".
- 2026-11-20: after seeing his health at the bottom: it goes over his character, the rage bar below it, steady in a
  fight, and the screen as clean as it can be. He asked for suggestions; three are in the game to try.
- 2026-11-20: his own bar is way 4: health over rage in one small piece over his head, no heart, and rage a red
  clearly other than health's ("I think 4, but the heart isnt needed. Also rage is traditionally red").

## Open questions

All 24 startup questions are answered (2026-11-20) and stand in their sections above; 20 and 21 he answered in the
Art Director's chat. What is open now, numbered so Robin can answer any of it whenever he likes; the full wording is
in `Game Developer\docs\idea-bank.md`:

1. Answered 2026-11-20: tap to move, with a stick at the same time ("The input").
2. Cleave or Whirlwind.
3. Whether "Drok" means something in the world.
4. The share of money lost on death (his pick said "say 10%").
5. The levels of the job advancements, and what the Warrior can become.
6. Which hand the skill buttons sit under by default. (They are in the middle now; the hand only says on which side
   of the row the potion sits.)
7. Answered 2026-11-20: his health and rage are one small piece over his head ("The screen"). Still open from it:
   whether the monster's name plate at the bottom stays.
