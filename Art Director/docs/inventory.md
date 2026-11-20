# Inventory

Every asset of Drok, its state, and what needs work. Kept up to date by Leonard, AD at every delivery and
every review (`art-review`). The game's `..\Game Developer\docs\art-demands.md` says what is still to be drawn, in
order; this file says what exists and how good it is.

**State** is one of: *concept* (a still, nothing built), *built* (in `out\`, not yet in the game), *in the game*
(copied in by Victor, GD; say the commit), *judged by Robin* (his words and the date), *scrapped*.
**Designs are marked "mine" until Robin has judged them.** Nothing below has been judged by him yet: he told
Victor, GD on 2026-11-20 to finish chapter 1 without asking, and "Let AD handle the art you need. I approve."

## Wave 1 (chapter 1), in the order the game needs it

All of it is in the game since 2026-11-20 (Victor, GD's commits 22ab703, 5785c55, fa7b6dd; the glass's second drop 47c3209; his table of what is drawn from
which drop is the game's `docs\state\art.md`). Robin has played it once (2026-11-20) and spoke of the buttons, the stick and the health bars; **he has not judged the look.**

| No. | Piece | State on 2026-11-20 |
| --- | --- | --- |
| 0 | One scene all the way (the Warrior, a sand crab, the glass, 412 by 915) | in the game: `out\scene\` |
| 1 | The Warrior's body | in the game: `out\hero\` |
| 2 | Cutlasses, bucklers, hats, three of each, and the bag's icons with three coats | in the game: `out\gear\` |
| 3 | Sand crab, reef gull, coconut crab | in the game: `out\sand-crab\`, `out\reef-gull\`, `out\coconut-crab\` |
| 4 | The island's ground kit | in the game: `out\island\` |
| 5 | Loot on the ground and the rarity effect in four colours | in the game: `out\loot\` |
| 6 | The chest: closed, opening, open | in the game: in `out\island\` as `chest/...` |
| 7 | The harbour's kit: ground, houses, a stall, the shopkeeper, townsfolk | in the game: `out\harbour\` |
| 8 | The glass | in the game: `out\glass\` as 40 pieces (the first 28, and twelve since Robin's first play: a monster's bar, the stick, fills with round ends, a heart; Victor, GD's 47c3209). Since his 0f7c744: 45 pieces, with his own bar for over his head (`own/...`) and rage turned red |
| 9 | The sea chart | in the game: `out\chart\` (one chart, mine, where the rule is three) |
| 10 | The icon, 192 and 512 | in the game: `out\icon\` |

## Open after wave 1 (asked by nobody yet; noted so they are not lost)

| What | Who raised it | Note |
| --- | --- | --- |
| A coat on the body | Leonard, AD and Victor, GD | the three coats are bag icons only |
| A task's mark over a person | Victor, GD | `mark/quest` and `mark/done` are in `out\glass\`; each `folk` frame has its `head` point |
| A sea that moves | both | frames for a foam line that breathes, or a shimmer |
| The stall cut into a back and a front | Victor, GD | he draws the shopkeeper over the stall for now, as in `look.jpg` |
| 60 more units south of the harbour's square | Victor, GD | the lower half of the dock lies under the skill buttons on a 412 by 915 screen; for when the town is redone. Then he runs `tools\place-from-art.mjs` again |
| Plain shapes still in the game | Victor, GD | the slam's disc, the stun's star, the cooldown wedge, the banners. A monster's health bar and the stick are made now (`mob/...`, `stick/...` in `out\glass\`) |
| The pile at the bottom, my way | Leonard, AD | in the game (47c3209): his health the biggest thing with a heart on its end, the monster's bar dark on its plate. Robin's to judge |
| The small shadow under each piece of glass | Leonard, AD | the tool draws it, the packer's hard edge cuts it away, so the game has never shown it; back with `--soft` if wanted. In Victor, GD's list for Robin |
| The potion's colour | Leonard, AD | its disc is green, the health it fills is red. In Victor, GD's list for Robin, with the text face |
| His own health and rage over his head | Robin (2026-11-20) | he picked: "I think 4, but the heart isnt needed. Also rage is traditionally red. So they need to be distinctive different red colors". The piece is in `out\glass\` (`own/back`, `own/hp`, `own/rage`, `own/lost`, `own/frame`), with `look-own.jpg`, and in the game as the only way (Victor, GD's 0f7c744; seen on the real screen, as drawn). Open: Robin judges the two reds on his phone (which reds is mine) |
| A monster's bar on his face | Leonard, AD, seen on the real screen | when the one he fights stands on him or north of him, its bar lay on his face or under his bar. My rule lifts it above his bar; in the game since Victor, GD's 75af4e7 and seen there (`concepts\own-bars\bars-apart.jpg`, `bars-apart-in-game.jpg`). Open: whether a monster may stand in him at all, a rule of the game, on Victor, GD's list for Robin |
| Three reds on the screen | Leonard, AD | health, rage and Cleave's disc are all red now; Cleave's disc is health's red. Nobody has asked |
| The camera | Robin's to judge | it stays at 1; a quarter closer is one number in the game and a re-render at 2.5 pixels a unit here |

## Assets

| Asset | Where | What it is | State | What needs work |
| --- | --- | --- | --- | --- |
| The look, three concepts | `concepts\look\` | the same beach in three hands: 1 toy-box models, 2 sticker cartoon, 3 painted print; the page https://claude.ai/artifact/EgCpRP3TqmZ16wWzF75cMU | concept; sent to Robin 2026-11-20, not picked. Look 1 with 2's thicker line and bigger eyes is in use, as my choice | his pick, when he is back; if it is not 1, the models are re-finished or redone |
| Crab Cay grown big, with the town | `out\crab-cay\` | the starter island, 2800 by 4200 units (Robin, 2026-11-20: "Big islands with several biomes each"; "Make the starter island a pirate town"): one painted ground at half a pixel a unit, the harbour town moved to the landing as `home`, the beach with tide flats, the grove, the cove; 432 props and the town's pieces in one atlas; the layout with `home`, `grounds`, `walk` and zones by level | delivered 2026-11-20 (twice: the town came second); not in the game, not judged by Robin | the town is three houses on a big island: a real pirate town wants three stills first; the beach is plain: new props (driftwood, shells, a starfish, flowers); the sea does not move |
| The windows' look, three ways | `concepts\wood\` | the hero window in three wooden looks (Robin, 2026-11-20: "some nice pirate design to menus and panels. Like some wooden feeling"): lashed planks, a chart table, a treasure chest; the page https://claude.ai/artifact/JM6LsoKKQCBNXgZRpdSvwD | concept; sent to Robin 2026-11-20, not picked. My pick is 1 | his pick; then the kit for the glass, a mark for each of the eight empty slots, twelve new gear icons (gloves, boots, rings, charms) |
| The kitchen corner: the world, three floors, 30 kinds of things | `concepts\house\kitchen\` | the house's first world as a kit (Robin, 2026-11-20: open world, a shrunk person in a house, "Go for 2"): `world.json`, tiles, the same tiles under the table, the rug with its borders and fringe, the walls, 39 pictures of things, the matchbox as the chest | a concept: the house was tried and left (Robin, 2026-11-20: "I think i like pirate more. Lets expand on pirate") | nothing: kept as it is. Its tools (`tools\world.js`, `tools\things.js`, `blender\house.py`) are free to take from |
| The new theme, three sizes | `concepts\house\`, `out\house-concepts\` | a shrunk person in a house, insects as enemies (Robin, 2026-11-20): the same kitchen floor with the hero at 5 cm, 1.5 cm and 0.6 cm; the page https://claude.ai/artifact/LxsNeaPvVNjVtG2g1LYo6B | judged by Robin (in my chat, 2026-11-20): "Go for 2", bean size; then the house was left the same day | nothing: kept as a concept |
| The Warrior's body | `out\hero\` | 54 tall, 195 frames, five facings; stand, move, attack1, cleave, charge, hit1, die1; gear points on every frame | in the game; design mine | the size (54 against the budget's 44); the motion judged from sheets and the moving page only; no coat on the body |
| The gear | `out\gear\` | cutlass, buckler, hat, three tiers each; 12 bag icons | in the game; design mine | a cutlass does not shorten when it points at the camera |
| Sand crab | `out\sand-crab\` | level 1, 90 frames, five facings | in the game; design mine | |
| Reef gull | `out\reef-gull\` | level 3, flies, 95 frames, five facings | in the game; design mine | |
| Coconut crab | `out\coconut-crab\` | level 5, 66 frames, three facings | in the game; design mine | three facings only, to save memory |
| The island | `out\island\` | the ground as one picture (1 px a unit), 23 props, the chest, `place.json` | in the game; layout mine | the grass is plain between props; the sea does not move |
| Loot | `out\loot\` | coins, a bundle, a potion; a ring for each of four rarities; a spark | in the game; colours mine | |
| The glass | `out\glass\` | 40 pieces: bars and their fills, a monster's bar, the stick, skill discs, top buttons, plates, panel, rows, slots, marks | in the game; design mine | no font chosen; more pieces as screens are built |

## Not assets, but kept

| What | Where | Note |
| --- | --- | --- |
| The two look boards, dark and bright | `docs\reference\dark-fantasy\`, `docs\reference\bright-sea\` | eighteen public-domain pictures to ask Robin with (2026-11-20); the dark nine set aside since he picked the theme; the licences in `docs\reference\README.md` |
| The pirate-world study board | `docs\reference\pirate-world\` | nine public-domain pictures the studio learns from: crews, sea beasts, old sea charts (2026-11-20) |
| The moving page | `viewer\drok-moving.html`, https://claude.ai/artifact/4zddYTgjvci4aQeqd61cnS | the Warrior and the monsters moving at their real delays, every facing, each tier of gear |
