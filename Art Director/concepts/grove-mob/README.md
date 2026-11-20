# A monster for the grove: six candidates  (Leonard, AD, 2026-11-20)

Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs." The reef gull goes. One new
monster takes its place in the grove of Crab Cay, levels 3 to 4, between the sand crab (1 to 2) and the coconut crab
(5). Asked by Victor, GD the same day: a monster, not big work, so candidates with pictures, Robin says which, then the
build (`.claude\skills\new-asset`).

**Robin picked all six** (in my chat, 2026-11-20): "Build all of them, and have the GD make a second island to go to
with some of the new mobs. That island needs to look different and have its own theme. A swamp maybe." They are built
(`blender\beasts.py`) and delivered, each in its own folder of `out\`. `six-beasts.html` is their moving page:
https://claude.ai/artifact/BGaj7BQj44y6dNL6v91Zv5 . `crab-cay-screens.jpg` shows the monkey, the piglet and the rat on
Crab Cay; the toad, the viper and the lizard are shown on the swamp island (`out\mire-cay\look-screens.jpg`).

What follows is the showing he picked from: one standing still each, quick models in the game's look (`build.py`),
beside the Warrior in the grove at the game's size (`pick.jpg`).

What the gull does in the rules today (Victor, GD): it darts in, bites and backs off about 200 units, then comes again;
fast, small, 46 health. The new one may keep that or want a trick of its own; what suits each body is said below, and
the rule is Victor, GD's to write.

| No. | Id | What it is | The look | What suits its body |
| --- | --- | --- | --- | --- |
| 1 | `palm-monkey` | a cheeky little monkey out of the palms | the curled tail over its back carries the outline; a pale face with heavy brows. Wind-up: it rears up with both arms thrown high. Hit: flung back, arms and legs wide, tail straight | the gull's rule as it stands: darts in, slaps, hops back, comes again. No new rule |
| 2 | `plum-viper` | a fat violet snake, coiled | a coil with the head lifted over it; white eyes, a red tongue. Wind-up: the head pulls far back into an S. Hit: the coil springs open | a lunge: it slides near, coils, strikes across a gap and draws back. It would not run 200 away |
| 3 | `bristle-piglet` | a striped wild piglet | a barrel on short legs, big ears, a pink snout, pale stripes and a ridge of bristles. Wind-up: head down, a hoof scraping. Hit: bowled over, legs in the air | a charge: straight through where he stood, a skid, a turn, again. Stepping aside dodges it |
| 4 | `wharf-rat` | a ship's rat gone wild, with an eye patch | big round ears and a long pink tail. Wind-up: it sits up on its haunches, teeth out. Hit: flipped on its back | the gull's rule as it stands: scurries in, nips, scurries off |
| 5 | `frill-lizard` | a blue lizard with an orange frill | low and long with the frill as a collar. Wind-up: it rears on its hind legs and throws the frill wide open, the biggest change of shape of the six. Hit: frill shut, knocked flat | the gull's rule; it runs on its hind legs |
| 6 | `hop-toad` | a fat yellow toad with blue legs | two big eyes on top of a round body. Wind-up: the throat swells to a ball. Hit: squashed flat, eyes shut | it moves in hops, so where it will land can be read; a tongue lash from a short way off |

**The actions and the cost** are the same for all six: `stand`, `move`, `attack1` with its wind-up, `hit1`, `die1`, in
five facings, about a hundred frames in one atlas of 1024 by 1024: 4 MB decoded, the gull's own budget, so the place
stays at 50.2 MB. The monkey is the most work to move well (arms, legs and a tail); the piglet and the toad the least.

**What I would pick (mine; Robin decides):** 1, the monkey. A pirate island wants a monkey, it comes out of the palms
the grove is made of, and the dart-in-and-back rule fits it without a new rule. Second 3, the piglet: its charge is the
clearest tell for a beginner. The viper and the toad are the ones a new rule would be written for.

**Colours:** each is chosen to stand off the grove's green (Robin on the town, 2026-11-20: "no contrast to the floor so
it all kinda melts together"). None is orange-red like the sand crab or dark brown like the coconut crab.

**Making it again:** `node tools/blender.js concepts/grove-mob/build.py -- work/grove-mob/render`; then for each name
`CAND=<name> node tools/scene.js work/grove-mob/<n>.png --place crab-cay --at 1180,2610 --no-mobs --no-loot --pile bare --own none --over concepts/grove-mob/over.js --crop 136,302,190,170,4`;
then `node tools/concepts.js concepts/grove-mob/pick.jpg --labels "..." --cols 2 --height 680 work/grove-mob/1.png ... 6.png`.

**Not tested:** nothing moves yet, and nothing is in the game. The stills are judged on this PC, not on a phone.

**Origin and licence:** all made here. Nothing from outside.
