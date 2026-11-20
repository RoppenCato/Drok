# Inventory

Every asset of Drok, its state, and what needs work. Kept up to date by Leonard, AD at every delivery and
every review (`art-review`). The game's `..\Game Developer\docs\art-demands.md` says what is still to be drawn, in
order; this file says what exists and how good it is.

**State** is one of: *concept* (a still, nothing built), *built* (in `out\`, not yet in the game), *in the game*
(copied in by Victor, GD; say the commit), *judged by Robin* (his words and the date), *scrapped*.
**Designs are marked "mine" until Robin has judged them.** Nothing below has been judged by him yet: he told
Victor, GD on 2026-11-20 to finish chapter 1 without asking, and "Let AD handle the art you need. I approve."

## Wave 1 (chapter 1), in the order the game needs it

| No. | Piece | State on 2026-11-20 |
| --- | --- | --- |
| 0 | One scene all the way (the Warrior, a sand crab, the glass, 412 by 915) | built: `out\scene\` |
| 1 | The Warrior's body | built: `out\hero\` |
| 2 | Cutlasses, bucklers, hats, three of each, and the bag's icons with three coats | built: `out\gear\` |
| 3 | Sand crab, reef gull, coconut crab | built: `out\sand-crab\`, `out\reef-gull\`, `out\coconut-crab\` |
| 4 | The island's ground kit | built: `out\island\` |
| 5 | Loot on the ground and the rarity effect in four colours | built: `out\loot\` |
| 6 | The chest: closed, opening, open | built: in `out\island\` as `chest/...` |
| 7 | The harbour's kit: ground, houses, a stall, the shopkeeper, townsfolk | to do |
| 8 | The glass | built: `out\glass\` (a first set; more pieces as the game asks) |
| 9 | The sea chart | to do |
| 10 | The icon, 192 and 512 | to do |

## Assets

| Asset | Where | What it is | State | What needs work |
| --- | --- | --- | --- | --- |
| The look, three concepts | `concepts\look\` | the same beach in three hands: 1 toy-box models, 2 sticker cartoon, 3 painted print; the page https://claude.ai/artifact/EgCpRP3TqmZ16wWzF75cMU | concept; sent to Robin 2026-11-20, not picked. Look 1 with 2's thicker line and bigger eyes is in use, as my choice | his pick, when he is back; if it is not 1, the models are re-finished or redone |
| The Warrior's body | `out\hero\` | 54 tall, 195 frames, five facings; stand, move, attack1, cleave, charge, hit1, die1; gear points on every frame | built; design mine | the size (54 against the budget's 44); the motion judged from sheets and the moving page only; no coat on the body |
| The gear | `out\gear\` | cutlass, buckler, hat, three tiers each; 12 bag icons | built; design mine | a cutlass does not shorten when it points at the camera |
| Sand crab | `out\sand-crab\` | level 1, 90 frames, five facings | built; design mine | |
| Reef gull | `out\reef-gull\` | level 3, flies, 95 frames, five facings | built; design mine | |
| Coconut crab | `out\coconut-crab\` | level 5, 66 frames, three facings | built; design mine | three facings only, to save memory |
| The island | `out\island\` | the ground as one picture (1 px a unit), 23 props, the chest, `place.json` | built; layout mine | the grass is plain between props; the sea does not move |
| Loot | `out\loot\` | coins, a bundle, a potion; a ring for each of four rarities; a spark | built; colours mine | |
| The glass | `out\glass\` | 28 pieces: bars, skill discs, top buttons, plates, panel, rows, slots, marks | built; design mine | no font chosen; more pieces as screens are built |

## Not assets, but kept

| What | Where | Note |
| --- | --- | --- |
| The two look boards, dark and bright | `docs\reference\dark-fantasy\`, `docs\reference\bright-sea\` | eighteen public-domain pictures to ask Robin with (2026-11-20); the dark nine set aside since he picked the theme; the licences in `docs\reference\README.md` |
| The pirate-world study board | `docs\reference\pirate-world\` | nine public-domain pictures the studio learns from: crews, sea beasts, old sea charts (2026-11-20) |
| The moving page | `viewer\drok-moving.html`, https://claude.ai/artifact/4zddYTgjvci4aQeqd61cnS | the Warrior and the monsters moving at their real delays, every facing, each tier of gear |
