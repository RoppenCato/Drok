# The sound library: what Robin's games already have (Clive, GD, 2026-11-04)

The Survival game's sounds, one list keyed by what a sound is for, so a new game takes a hit, a swing or a page turn by
name instead of making it again. `tools/fetch-common-sounds.mjs` copies by these names. Zite's Sound Director keeps its
own notes on the same sets in `C:\dev\Zite\Sound Director\docs\survival-library.md`.

Every sound: 48 kHz 16-bit mono WAV (a few in `free` are OGG), peak -1 dBFS, three or four variations `<name>_1.wav` ...,
a `<name>.json` with its gain (levelled against the combat hit at 0 dB), its use and its variations. Recorded material is
CC0 or "free for any use"; the credits are in each set's `ref/README.md` or the game's `assets/sfx/free/CREDITS.md`.
**Never move or rename an original**: the Survival game's `assets/sfx/keep.txt` names them. Copy, then re-level the copy
against the new game's own anchor.

A **pick** is a sound Robin chose by ear and the Survival game plays; a **candidate** was delivered and not judged, or sits
beside the pick. Where the name ends in `_a`, a `_v` (layered) and often a `_b` exist beside it; Robin picked the plain
recording nearly every time.

## Where the sets are

| Set | Path | Holds |
| --- | --- | --- |
| `combat`, `chapter1`, `flesh`, `ui` | `C:\dev\SG\Sound Director\out\sfx\<set>\` | the studio's deliveries; the game bundles them and keeps no copy |
| `free`, `bow`, `ships`, `weather`, `fishing`, `runes`, `robin` | `C:\dev\SG\Game Developer\assets\sfx\<set>\` | the game's own copies with their JSON and NOTES |

## Fighting

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| a light hit on flesh (the slap, skin first) | `hit_w` | flesh | pick (2026-10-20) |
| a heavy hit on flesh | `heavyhit_x` | flesh | pick |
| a club's hit, and heavy | `hit_club_v`, `heavyhit_club_v` | chapter1 | pick |
| a light swing (the swish) | `swing_e` | free | pick (2026-10-15) |
| a heavy swing | `swing_f` | free | pick |
| a weapon's own swish | `swish_seax`, `swish_spear`, `swish_axe`, `swish_club`, `swish_greataxe` | combat | plays |
| a block | `block_a` | free | pick |
| the shield going up | `raise_e` (light), `raise_f` (heavy) | free | pick |
| a parry | `parry` | combat | plays |
| a critical, a guard broken, a stagger | `crit`, `broken`, `stagger` | combat | plays |
| a dash, a hurt grunt, a death, a slam | `dash`, `hurt`, `die`, `slam` | combat | plays |
| a finishing blow, a heavy blow's warning, a perfect parry | `finish`, `heavytell`, `perfect` | combat | plays |
| combo steps | `chain_2`, `chain_3`, `chain_4` | combat | plays |
| a struck beast's pain (boar, wolf, deer, snake) | `pain_boar_w`, `pain_wolf_w`, `pain_deer_w`, `pain_snake_w` | flesh | pick |
| a shield breaking | `shield_break_a` (b, v) | runes | pick (2026-10-24) |

## Abilities and magic (the rune trial; `_v` layered beside each)

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| a war cry, a berserk roar, a last stand | `war_cry_a`, `berserk_roar_a`, `last_stand_a` | runes | war cry pick; others candidates |
| a riposte, a guard break, a blink step, a landing after a leap | `riposte_a`, `guard_break_a`, `blink_step_a`, `leap_land_a` | runes | riposte, blink step, leap land picks |
| a lunge, a whirl, an overhead, a sweep, a slide | `lunge_a`, `whirl_a`, `overhead_a`, `sweep_a`, `slide_a` | runes | overhead pick |
| a twin shot, a pinning shot, a fire arrow | `twin_shot_a`, `pin_shot_a`, `fire_arrow_a` | runes | candidates |
| a rock splitting, stone breaking, a cudgel's thud | `rock_split_a`, `stone_break_a`, `cudgel_thud_a` | runes | stone break pick |
| an axe thrown and caught, a shadow step | `axe_throw_a`, `axe_catch_a` (b), `shadowstep_a` | runes | picks |
| a trap thrown, landing, armed, snapping, a poison pot | `trap_throw_a`, `trap_land_a`, `trap_arm_a`, `trap_snap_a` (b), `trap_poison_a` | runes | picks |
| a rite: an altar laid, a storm gathering and rising, a rune carved, waking, ready, lightning, a small lightning, blood dripping, a sacrifice's stab | `altar_lay_a`, `storm_gather_a`, `storm_rise_a`, `rune_carve_a`, `rune_wake_a`, `rune_ready_a`, `lightning_strike_a`, `lightning_small_a`, `blood_drip_a`, `sacrifice_stab_a` | runes | altar lay, lightning small, rune ready picks |
| a man burning (a loop) | `fire_burn_man_a` | runes | plays |

## The world and tools

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| an axe on wood | `chop_a` | free | pick |
| a pick on stone | `clink_a` | free | pick |
| a tree falling | `treefall_a` | free | pick |
| a log's thud, a box breaking, a wave | `logthud_v`, `boxbreak_v`, `wave_v` | chapter1 | pick ("a nice snappy comforting sound" for the box) |

## Bow

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| a bow shot (a recurve's snap) | `shoot_b` | bow | pick (2026-10-23) |

## Interface

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| a talk window opening, the next line | `talk_open_f`, `talk_next_e` | ui | picks (2026-10-22; from Kenney's RPG Audio, CC0) |
| a book opening, closing, a page turned | `book_open_b`, `book_close_c`, `book_page_b` | ui | picks |

## Boats

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| one oar, a crew's oars | `oar_a`, `oars_v` | ships | picks (2026-10-23) |
| a sail filling, a sail flapping | `sail_fill_a`, `sail_flap_b` | ships | picks |
| a hull creaking (also a chest's lid, a wooden door) | `creak_b` | ships | pick |
| the keel on sand, pushing off | `keel_sand_v`, `keel_off_v` | ships | plays |

## Weather and water

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| rain light, rain, rain heavy, rain on water | `rain_light_a`, `rain_a`, `rain_heavy_v`, `rain_water_a` | weather | play |
| thunder | `thunder_a` | weather | pick (2026-10-23) |
| a gust, a splash | `gust_a`, `splash_a` | weather | play |
| a step on snow, in mud, on wet sand | `step_snow_b`, `step_mud_a`, `step_wetsand_v` | weather | snow pick; others play |

## Fishing (`_b` and `_v` beside most)

| For | Name | Set | Robin |
| --- | --- | --- | --- |
| a cast, the float's plop, a bite | `fish_cast_a`, `fish_plop_a`, `fish_bite_a` | fishing | not yet judged (2026-10-25) |
| the reel (a seamless 2 s loop), a splash (the hook, a run, a fish darting), the line snapping, a fish landed | `fish_reel_a`, `fish_splash_a`, `fish_snap_a`, `fish_land_a` | fishing | not yet judged |

## Robin's own

| For | Name | Set | Note |
| --- | --- | --- | --- |
| his two sword swings (24 kbps MP3) | `swing_light`, `swing_heavy` | robin | his; the source and the licence are his to say |

## Not in the library

Dice, taps and chips, grass and road steps, bells and tills and chimes, chests' shimmer, coins, fanfares (level up, victory,
defeat), stings, spell ticks (chill, poison, heal, barrier), potions, creature voices beyond the four beasts, and all music:
the Survival game's music is Viking and its own (`C:\dev\SG\Sound Director\out\music\`); its studies and Robin's rules
carry over, not the tracks.

## How to take sounds

```
node "studios/Sound Director/tools/fetch-common-sounds.mjs" --list                 the names, grouped
node "studios/Sound Director/tools/fetch-common-sounds.mjs" hit heavyhit swing block --to assets/sfx/library
node "studios/Sound Director/tools/fetch-common-sounds.mjs" --group fight ui --to assets/sfx/library
```

The script copies each sound's variations and JSON into the folder, flat, under its original name, and writes or updates
`manifest.json` there (where each came from, its gain, its use, the set's NOTES and credits to read). Short aliases:
`hit`, `heavyhit`, `swing`, `swing_heavy`, `block`, `shield_up`, `bow`, `chop`, `clink`, `treefall`, `ui_open`, `ui_next`,
`page`, `thunder`, `rain`, `step_snow`, `creak`. Then the new game's Sound Director re-levels the copies against its own
anchor and writes in its NOTES where they came from and Robin's verdict.
