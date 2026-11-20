# The sound, as it stands (2026-11-20)

Robin, 2026-11-20: "You can set up some basic sounds and effects. But dont create anything new yet. Just things you
can get from the storage to use." So the game has a basic set, every sound a copy from the common library (the
Survival game's sounds, `..\..\..\Sound Director\library\INDEX.md`). Nothing was made new. No music. Hugh, SD's chat
is not started; when his own set lands it replaces this one, name by name.

## Where things are

| What | Where |
| --- | --- |
| The files | `client\public\sfx\`: 65 OGG files (mono, 48 kHz), 433 KB together; `sfx.json` (name, its files, its volume); `NOTES.md` (where each came from, the licence: CC0 or free for any use) |
| The tool | `node tools\sounds.mjs`: its table says which library sound plays for what. It fetches with the Sound Director's own fetch script, converts with ffmpeg, and writes the folder whole. To change a pick or a volume, change the table and run it |
| The layer | `client\src\sound.ts`: `sounds.play(name)` and `sounds.event(e)`. Loaded in the boot scene from the list; a missing file is logged and the game goes on |

## What plays (the picks are mine)

| When | Name | From the library |
| --- | --- | --- |
| every swing; the swing landing | `swing`; `hit` | `swing_e`; `hit_w` (both Robin's picks in the Survival game) |
| Cleave; Cleave landing, Charge arriving | `cleave`; `hit_heavy` | `swing_f`; `heavyhit_x` |
| Charge starting | `charge` | `dash` |
| a bite on him; he falls | `hero_hurt`; `hero_down` | `hurt`; `die` |
| a monster falls | `monster_die` | `boxbreak_v` (a wooden crack: a shell) |
| a blow wound up for 0.8 s or more (the coconut crab) | `windup` | `heavytell` |
| money picked up, bought, sold | `coin` | `clink_a` (a pick on stone) |
| gear or a potion picked up; a rare or epic piece adds a quiet chime | `pickup` (+ `level_up` at half) | `altar_lay_a` |
| a level | `level_up` | `rune_ready_a` |
| the chest; a potion; gear on or off; sailing | `chest`; `potion`; `equip`; `sail` | `creak_b`; `fish_plop_a`; `raise_e`; `sail_fill_a` |
| a window opens, closes; a button in a window | `open`; `close`; `tap` | `book_open_b`; `book_close_c`; `talk_next_e` |
| a button that cannot act now (cooldown, no rage, bag full) | `refuse` | `block_a`, quiet |

## How it behaves

- A sound is one of its variations, never the same one twice running, at a pitch within 5% up or down.
- The same name is not started twice within 50 ms: Cleave on five crabs is one blow.
- The volume is the Survival game's own gain times my guess. **Not levelled by ear**: nobody has heard this mix.
- Silent with "Sound: off" in the settings (kept on the phone) and with `?mute=1` in the address. Mute or not,
  `window.dev.sounds.played` counts what was started, so a mute test page can check the wiring.
- A phone plays nothing until the first touch (the browser's rule); Phaser unlocks the sound on that touch.
- The offline cache takes the `.ogg` files (39 entries became 105).

## Not there

Steps, a monster's voice, the skill buttons' own press, the sea, any music: the library has none that fit, or
they wait for Hugh, SD. A sprite (one file for all) as `sound-demands.md` asks: these are single files, which is
simpler for a stand-in set. OGG does not play in some older iPhone browsers; Robin's phone is Android with Chrome.
