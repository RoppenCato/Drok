# The direction sheet: the look of Drok, and the form the art takes

Written by Leonard, AD from the brief, from the game's own docs, and from asking Robin with pictures. Everything marked
"(decide with Robin: ...)" is open until he has decided; then it is rewritten in his words with the date, "(Robin,
date)". The game's `..\Game Developer\docs\state\art.md` (not written yet) and `docs\art-demands.md` are the authority
on budgets, file form and what is needed; this sheet is what the studio builds to.

**Where this stands on 2026-11-20:** every startup question is answered, the Art Director's two included (20 and 21,
below). Three stills of the look went to Robin (`concepts\look\`); he has not picked. Then Robin told Victor, GD
(2026-11-20, as Victor, GD passed it on): "Make a list of things to do to finish chapter 1. Then work through the list
until you are done. Including tests. I dont need to approve or answer any questions until you are done. Let AD handle
the art you need. I approve." So the look below is **my choice**, wave 1 is being built on it, and he judges it when
he is back. If he picks another look, the models are re-finished or the figures redone, and this sheet changes.

## The house, tried and left (Robin, 2026-11-20)

Robin, in Victor, GD's chat, after seeing the house built on stand-in shapes: "I think i like pirate more. Lets expand
on pirate". Then, of three ways Victor, GD put to him, he picked "3": "Both. Big islands with several biomes each, and
the chart to sail between them." So the theme is vibrant pirate again, and everything below is the game's direction as
before.

What the house was, for the record: earlier the same day he had asked for "a shrunk person and enemies are insects",
"inside a house", and of my three sizes said "Go for 2" (bean size). I made the three stills
(`out\house-concepts\`) and a first world, a corner of a kitchen, as a kit with 30 kinds of things
(`concepts\house\kitchen\`). None of it is in the game. It is kept as concepts.

What it taught, and stays true for the islands (mine):

- **A painted ground holds at half a pixel a unit.** Shown as a phone shows it, today's island ground at a half is a
  hair softer at the foam line and the grass's edge and no different elsewhere: flat colour with no line has no small
  detail to lose. So a ground of 2800 by 4200 units is one picture of 1400 by 2100, 11.8 MB. The test is
  `work\world\ground-test.js`.
- **A kit of floors that repeat and flat pieces suits straight edges** (a room). An island's shores are curves: paint
  them.
- **A thing can carry its shadow in its own picture**, so the game draws none: the outline of what it covers on the
  ground for one that stands, its own outline a little down and right for one that lies flat (`tools\things.js`).
- **A smooth fade breaks into uneven bands in a palette PNG.** Flat steps survive it.
- **A shadow laid over bright ground as a grey turns it to mud.** Give the shaded ground its own colours.

## A big island (Robin, 2026-11-20; the form is mine)

Robin's pick, "3": "Both. Big islands with several biomes each, and the chart to sail between them." So an island is
big, has several grounds with their own levels and monsters, and is walked without a break.

- **Its ground is one painting at half a pixel a design unit**, drawn by the game at four times. 2800 by 4200 units
  is 1400 by 2100 pixels, 11.8 MB. `tools\isle.js` paints it in the hand of `tools\ground.js`.
- **Each ground has its outline in `place.json`** (`grounds`), and the shore drawn in by 24 units is there as `walk`.
- **The beach lies all round an island;** the other grounds lie on it. He lands in the south and the levels rise to
  the north.
- **The first one is Crab Cay, the starter island** (`out\crab-cay\`). Robin, 2026-11-20: "Make the starter island a
  pirate town, and the other part of the island beginner friendly with low level mobs." So the town stands at the
  landing as its safe part (`home`), and round it lie the beach with its tide flats, the grove and the cove.
- **A town on an island is its own layout** (`tools\isle.js`, `townOf`): moved there from a place of its own, its
  dock on the island's dock, or given whole. Today it is the harbour as it stood.
- **The real pirate town** (open: Robin picks; he said "Yeah do an updated pirate town suggested", 2026-11-20): three
  stills went to him the same day (`concepts\town\`): 1 a port, 2 a town built of ships, 3 a town on stilts. My pick
  is 2. Until he has picked, the game keeps the old harbour at the landing.
- **Kept for the second island (mine, a proposal):** a wreck on a reef, a hermit crab in a tankard, an octopus in a
  barrel.

## The windows' look: a treasure chest (Robin, 2026-11-20)

Robin, in Victor, GD's chat: "You need to have some nice pirate design to menus and panels. Like some wooden feeling.
Right now it looks bland. Also update icons so they look fitting." He was shown the hero's window in three wooden
looks (`concepts\wood\`: lashed planks, a chart table, a treasure chest) and said in my chat: **"I think 3 is good.
Nice contrast. But mind the text needs to fit and not overlap with stuff"**.

- **A window is the inside of a chest:** dark wood in standing boards, an iron band all round with gold studs, a gold
  angle in each corner, a gold plate for its title, a red stone in a gold ring to close it.
- **Words are pale on the dark wood** and dark on gold. What is read at length lies on a sunk board with a thin gold
  edge.
- **A slot:** a piece he owns lies on pale linen inside its rarity's colour; an empty one is lined with dark velvet
  and shows what belongs there.
- **Buttons:** a gold plate for the one that does the thing, an iron plate for the rest.
- **The frame stays in the outer 14 units of a window.** Nothing that is read or tapped comes nearer its sides or its
  foot. Every window is drawn from the pieces with long names and big numbers before it is delivered
  (`tools\window.js`): that is how his "the text needs to fit" is kept.
- The field's glass (his bar, the monsters' bars, the discs, the stick) stays as it was.

**The font** (Robin, 2026-11-20, in my chat: "Choose a good font for the game thats clear and easy to read"): my choice
is Nunito, extra bold, free under the SIL Open Font Licence 1.1. Round, clear at 13, no wider than what the phone shows
now. (decide with Robin: may I fetch the file; asked the same day.)

## The look in use (mine, 2026-11-20; not judged by Robin)

Look 1 of the three, the toy-box models, with the thicker line and the bigger eyes of look 2. It is the one that gives
a hero who turns and wears many pieces from one source.

- **Figures and props are models**, built by scripts (`blender\`), lit once and rendered flat: a base tone and one
  shade a colour, chosen by `blender\toon.py` from the base, no highlight band, no grain, no cast shadows.
- **One dark line**, `#33203a`, heavier round the outside (about 1.5 design units), thinner inside and only where two
  colours meet. No line on eyes, glints or grass: thin things ink to black (`docs\rules.md` 26).
- **The ground is painted and has no line**: sea in three steps with a white foam edge, wet sand, sand, grass, rock.
  A place's ground is one picture at one pixel a design unit, drawn at double size.
- **Shadows** are the game's: one flat ellipse of `#5b4a82` at a quarter strength under each thing.
- **The camera on figures** is 35 degrees above the ground, lower than the ground is drawn, so faces show.
- **The light** comes from above and in front, never from a side: the game flips three facings.
- **Proportions**: the Warrior is about two and a half heads tall, a round head, big eyes with a glint, heavy brows;
  54 design units tall on a footprint of 32. He holds his face a little up toward the camera.
- **Facings**: `s`, `se`, `e`, `ne`, `n` drawn; the game plays eight and flips (Victor, GD, 2026-11-20).
- **The glass**: cream panels with the same line and a small hard shadow; strong colour only where a thumb goes.
- **Rarity colours**: common `#b9b2a6`, uncommon `#4cc463`, rare `#3d9cff`, epic `#b666f2`. On the ground and in
  the bag only (Robin's pick).
- **A better piece of gear has a bigger, richer outline**, since nothing glows on the hero.
- The numbers behind all of it are in `blender\drok.py`; the deliveries and their forms in `out\README.md`.

## What Robin picked about the look and the gear (Robin, 2026-11-20, in the Art Director's chat)

His picks from choice boxes; the choices were written by Leonard, AD, and the words below are the choices'.

- **The look: "Clean line, flat colour"**: "One clear outline and a few strong, flat colours, like a print or a
  cartoon (pictures 12, 13, 16). Reads best when things are small on a phone." He did not tick "Story-book painted" or
  "Light and glow". Pictures 12, 13 and 16 are Rousseau's jungle, Gauguin's Tahiti and Hokusai's wave in
  `docs\reference\bright-sea\`.
- **Games he loves the look of**: Zelda: The Wind Waker, MapleStory, World of Warcraft. He did not tick Sea of
  Thieves. MapleStory is a look reference here; in Zite it was not.
- **Not this**: "Pale pastel phone-game look", "Grim and realistic", "Pixel art". He did not tick "Cute with huge
  heads", so round and big-headed is allowed.
- **Gear on the hero: "The big pieces"**: "Every cutlass, buckler and hat has its own shape. Coats and armour come in a
  handful of looks, and a full set shows as its own look. Boots, gloves and rings show only in the bag."
- **Rare drops: "No glow on the hero"**: "The rarity colour shows only on the ground and in the bag."

What his three games share (mine, from looking, nothing of theirs is ever taken): chunky figures with big heads, hands
and weapons; colour that is chosen and saturated, in large clean areas with one shade; simple faces; very little
texture noise. Those are studied for how they solve a problem; no asset of theirs is used.

## What Robin has decided

All from the brief, `..\..\Drok-brief.md`. "His pick" means he picked a choice Victor, GD had written; the words are
the choice's.

- **The theme: vibrant pirate** (Robin, 2026-11-20, his pick). "Bright seas, green islands, colourful crews and
  beasts. Nothing of dark fantasy comes back." It replaces his "Dark fantasy" of 2026-11-19.
- **The hero** (Robin, 2026-11-20, his pick): "Make a name". A nobody from a harbour town hunts the islands' beasts
  for bounty and loot, on his way to captain. So he starts plain and poor, and the gear he finds is what makes him
  look like somebody.
- **What the Warrior fights with** (Robin, 2026-11-20, his pick): cutlass and buckler.
- **The world** (Robin, 2026-11-20, his pick): a sea chart of islands. Each island is a hunting ground with its own
  levels; he travels by tapping the chart, with no ship to steer. So there is a chart screen, and the chart is big
  work: three concepts when its turn comes.
- **Day and night** (Robin, 2026-11-20, his pick): always day for now. Each island has its own fixed light and mood.
  So an island's light is part of its kit, and a sprite never needs a night version.
- **Hunting** (Robin, 2026-11-20, his pick): hunting grounds by level, rare spawns and bosses on timers on the real
  clock. So a rare monster and a boss must read as rare at a glance.
- **Gear** (Robin, 2026-11-20, his pick): ranks, rarities, affixes, uniques, sets, chests and keyed vaults; no talent
  trees. So: a colour for each rarity, sets that show as a look, chests and vault doors as art.
- **The monster book** (Robin, 2026-11-20, his pick): each monster has one rare signature drop, and a book fills in as
  he hunts. So every monster needs a picture for its page, and its signature drop an icon.
- **Loot** (Robin, 2026-11-19): "Needs to have coloroed effects for rarity." (Robin, 2026-11-20, his pick): money and
  items drop on the ground and fly to him when he walks close.
- **How the player is guided** (Robin, 2026-11-20, his pick): light quests. A few people in the harbour give hunting
  tasks ("30 crabs", "5 shells") with ! and ? marks. So: a few harbour people, and the two marks.
- **The screen** (Robin, 2026-11-20, after his first play): "I think the buttons should be in the middle at the
  bottom." "There should be a moving stick so you can choose to move with the stick or click where to go (both
  available at the same time)." "Health etc on your hero and on mobs needs to be easier to see." It replaces his pick
  of the same morning, made before he had played: skills in an arc in the bottom corner. Bag, chart and character stay
  small buttons at the top.
- **His own health and rage** (Robin, 2026-11-20): "I think the heros health bar should show over his character, and
  the rage bar below it. It needs to be fixated well enough that it doesnt become messy when fighting mobs." "Would be
  nice if we can keep the UI as clean as possible." Of four ways shown he picked the one small bar with two rooms: "I
  think 4, but the heart isnt needed. Also rage is traditionally red. So they need to be distinctive different red
  colors". So: one bar over his head, health over rage, no heart; rage is red, and a red clearly unlike health's.
  Which two reds is mine: health the light red `#f0503c`, rage a deep crimson `#b8122f`.
- **Chapter 1** (Robin, 2026-11-20, his pick): "Harbour town plus island". One island with three monsters, levelling 1
  to 5, loot with rarities, one chest, a small harbour town with a shop, and the sea chart between the two. "Real art
  and sound for just that."
- **The phone** (Robin, 2026-11-20): "Android with chrome".
- **Fighting** (Robin, 2026-11-20, his pick): a target with auto-attack; the hero swings by himself while in reach.
- **The Warrior's kit** (Robin, 2026-11-20, his pick): rage built by hitting, Charge, Cleave or Whirlwind, and one
  defensive cooldown. So the hero needs a charge, a wide swing and a guard besides his plain attack.
- **The view** (Robin, 2026-11-19): "Top-down 2.5D view, like Zelda. Movement must feel smooth and snappy."
- **The screen** (Robin, 2026-11-19): "Played on my phone, portrait, with one thumb."
- **The hero** (Robin, 2026-11-19): "One class to start: Warrior." "A long-lived character with permanent unlocks.
  Levelling up, finding things, opening chests, chances of rare items, meaningful progression."
- **The interface** (Robin, 2026-11-19): "Buttons at the bottom or sides, covering as little of the screen as possible."
- "The feel I want is the grind of WoW, MapleStory and Priston Tale" (Robin, 2026-11-19) is about the grind, not the
  look. In Zite he said MapleStory was not a look reference. Asked again for Drok on 2026-11-20.

## The sentence

A draft (mine), until he has chosen from the three stills: *a bright pirate world drawn with one clean line and flat,
strong colour: chunky figures and big simple shapes, like a cartoon that reads at a glance on a phone.*

## The look

- **Colour.** Bright and saturated, in a few strong flat colours (his picks above). Never pale pastel, never grim
  (his picks). (decide with Robin, on the stills: how much colour sits in the ground against the figures; one palette
  per island.) Chosen, never computed. When everything is bright, the figures must still win: the ground a step
  quieter than what stands on it. The rarity colours burn on the ground and in the bag, not on the hero (his pick).
- **Line.** One clear outline (his pick). (decide with Robin, on the stills: its weight and colour on figures; thinner
  and coloured on props, `docs\rules.md` 17.) Tested at the real size on the real screen.
- **Light.** (decide with Robin: the hour, how much the dark hides.) One light over the whole form; the shade cooler
  than the light. Whether a figure is ever flipped by the game decides if the light may come from one side
  (`docs\rules.md` 25).
- **Proportions.** (decide with Robin: how many heads tall the hero is seen from above; chunky or lean.) Once settled,
  left alone.
- **Shapes.** A monster is one shape that shows which way it faces from above; the hero is one body with one weapon
  shape that reads at a glance.
- **Places.** Islands. Quiet underfoot where the fighting is; props in clusters, every repeat its own size and lean.
  (decide with Robin: the first island and its mood.)
- **The interface.** (decide with Robin: its material and how much of the screen it takes.) It belongs to the world.

## How the game draws (found 2026-11-20, from the game's README and `docs\platform.md`)

- Phaser 4 on WebGL, TypeScript, built with Vite, an installable page (a PWA) for Chrome on Android first. It must
  work offline once installed, so every picture the game owns is part of the install.
- Portrait, **412 by 915** design pixels (`client\src\layout.ts`), fitted into the screen and centred.
- The canvas is 412 by 915 today, drawn at 1x and scaled up by the phone. Zite drew at the phone's own pixels (its
  `hires.ts`, capped at 2x), which is what lets 2x files show their detail. (decide with Victor, GD: whether Drok does
  the same; asked 2026-11-20. Until then the files are planned at 2x.)
- A top-down world much bigger than the screen, the camera following the hero. So: ground as tiles and strips, props
  placed by data, things sorted by where their feet are. No backdrop planes as in a side-on fight.
- What stands today is the starter's 3 by 3 board of stand-in squares. The first thing built is a control test with
  stand-in shapes, which needs no art.
- Robin runs it from a link on his phone: the home Wi-Fi link for the control test, a public page when chapter 1
  starts (Robin, 2026-11-20, his pick). The AI opens every page with `?mute=1`.
- The game's rules for cheap drawing: few atlases, every frame trimmed, no reading the canvas back, no filter or blur
  per frame, memory counted in decoded pixels.

## The judging size and screen

412 by 915 portrait, on Robin's phone: "Android with chrome" (Robin, 2026-11-20); no weaker phone named. Every judging
picture is a crop of the screen at that size with the game's chrome on.

The hero's height on screen: (decide with Robin: the first still shows two sizes). A starting guess (mine): about 64
CSS pixels, a common monster 40 to 90, a boss up to 200. From above on a narrow screen the world needs room round the
hero, and the thumb covers part of the bottom.

## Facings, and how gear shows on the hero

Seen from above, a figure needs more than one facing: four (down, up, and a side the game may flip) or eight. (decide
with Victor, GD: how many the game plays, and whether it flips.) Robin picked "The big pieces" (above): every cutlass,
buckler and hat its own shape, coats and armour in a handful of looks, a full set as its own look, small pieces in the
bag only, and no glow on the hero. That is way 4 of `docs\gear-on-the-hero.md`. Drawn or modelled is the studios' to
settle: I lean modelled with a flat cel finish, which gives his clean line and flat colour in every facing from one
source; it waits for Victor, GD's answers.

## The action set for figures

A figure is a set of named actions, each a list of frames with data, once per facing. The counts below are the starting
budget from Zite (about 33 frames a monster, one facing); this game multiplies them by its facings, so they will come
down. The game's `docs\state\art.md` will say what this game holds.

| Action | Frames | Rate | What it shows |
| --- | --- | --- | --- |
| `stand` | 6 | 10 a second, looped | idle: a breath or a bob, never a step |
| `move` | 6 | 10 a second, looped | walk; the game picks the frame by distance moved, so the feet do not slide |
| `attack1` | 12 | 15 a second, two frames held | windup, the strike, recovery; the blow lands on the second held frame |
| `hit1` | 1 to 3 | held | **the most exaggerated pose**: recoil; seen most |
| `die1` | 8 | 12 a second | collapse, the last frames fading |

(decide with Robin and Victor, GD: the names, the counts, which actions this game plays, the Warrior's skills once
question 7 is answered, what frame the blow lands on.)

**What the game holds, not the art:** which frame the blow lands on, whether an action loops, the stride for `move`, the
scale an atlas is drawn at, the contact shadow, the flip. Each drop's `NOTES.md` names them; Victor, GD puts them in data.

**The rig:** a drawn figure with limbs is built on `tools\rig.js` (`docs\rules.md` 52). A modelled one is built by a
script and rendered (`docs\3d-to-sprites.md`). Which of the two Drok uses is part of question 21.

**The motion rules:** change the silhouette between frames; let attached parts follow late; keep the feet at the same
height unless the thing leaves the ground; the windup is the tell.

## The atlas form the game reads

From Zite's `docs\state\art.md`; (decide with Victor, GD: whether this game reads the same form, and how facings are
named in it.)

- Atlases only, never loose PNGs: one per monster, one for the hero's body, one per place's kit, one for the interface.
  TexturePacker "Phaser 3" JSON hash form (`tools\pack.js` writes it): trimming on, rotation off, padding 2, extrude 1.
- Frame names `<thing>/<action>/<nnnn>` with four digits, so the loader builds animations by name.
- **The pivot at the feet** for every character and monster frame, so trimmed frames do not jump; for an icon, the centre.
- Sides powers of two, never over 2048 by 2048.
- `meta.filePx` says the file's scale (2 for 2x files drawn at half size in CSS pixels).
- An `actions` block carries every action's `delay` and `loop`, and each frame's `name`, `w`, `h`, `origin` (the feet, in
  the frame's own pixels), `delay` in milliseconds, the hit box `lt` and `rb` and the `head` point relative to the
  origin, and `a0`, `a1` opacity for fades.
- A ground tile or a prop carries: size, origin, whether it blocks, and its animation frames and delays if it moves;
  nine-slice pieces carry their corner.
- Budgets: the game's to set (`docs\art-demands.md` has blanks today). Palette PNGs where they hold; RGBA for glows and
  soft gradients.

## Before anything is shown

1. It reads as one shape at a quarter size, in grey, and shows which way it faces.
2. Its tones are chosen, with one light over the whole form.
3. Nothing is saturated except what is allowed to burn.
4. It sits on the real ground at Robin's size, beside the hero, with something at its foot.
5. Line weight and colour match what stands beside it.
6. Nothing thin has gone black, and nothing small has vanished.
7. Repeats differ. Nothing looks stamped. Ground pieces tiled 3 by 3 show no seam.
8. If it moves, it has been played at real delays, feet locked, frames not cut off.
9. Its data is complete, and what was not tested is said.
