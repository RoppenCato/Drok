# The basic sounds (Victor, GD, 2026-11-20)

Robin, 2026-11-20: "You can set up some basic sounds and effects. But dont create anything new yet. Just things you
can get from the storage to use." Every sound here is a copy from the common library (the Survival game's sounds,
`Sound Director\library\INDEX.md`), turned into OGG (mono, 48 kHz) and renamed. Nothing was made new, nothing was
mixed or changed but the format; the originals are untouched. Which sound plays for what is Victor, GD's pick, a
stand-in until Hugh, SD's own set replaces it. Written by `tools\sounds.mjs`; run it again to change a pick.

The volume is the Survival game's own gain for the sound, times my guess for this game. Not levelled by ear.

| Name here | Plays for | From the library | The library says | Files | Volume |
| --- | --- | --- | --- | --- | --- |
| `swing` | every swing of his | `swing_e` (free) | a light swing (pick) | 1 | 0.273 |
| `hit` | a swing landing on a monster | `hit_w` (flesh) | a blow on a beast or a man, the slap: skin first (Robin, 2026-10-20: "we still need to find good sounds of enemies getting hit"); dB relative to the current hit at its game gain | 4 | 0.683 |
| `cleave` | Cleave | `swing_f` (free) | a heavy swing (pick) | 1 | 0.385 |
| `hit_heavy` | Cleave landing, and Charge arriving | `heavyhit_x` (flesh) | the heavy blow with hit_x | 4 | 0.803 |
| `charge` | Charge starting | `dash` (combat) | the dodge | 3 | 0.424 |
| `hero_hurt` | a bite on him | `hurt` (combat) | the hero struck | 3 | 0.488 |
| `hero_down` | he falls | `die` (combat) | a man or a beast falls | 3 | 0.484 |
| `monster_die` | a monster falls (a shell cracking) | `boxbreak_v` (chapter1) | kicking a box open ("something wooden breaking, a nice snappy comforting sound"); as loud as a hit | 3 | 0.49 |
| `windup` | a slow, heavy blow being wound up (the coconut crab) | `heavytell` (combat) | an unparriable blow winding up (the red glint) | 3 | 0.193 |
| `coin` | money picked up, a thing bought or sold | `clink_a` (free) | a pick on stone (pick) | 3 | 0.367 |
| `pickup` | a piece of gear or a potion picked up | `altar_lay_a` (runes) | a beast laid on the altar stone (plain, as recorded) | 3 | 0.242 |
| `level_up` | a level gained; and quietly, a rare piece picked up | `rune_ready_a` (runes) | an active rune ready, by the toolbar, in a fight: noticed, never in the way (plain, as recorded) | 3 | 0.043 |
| `chest` | the chest opening | `creak_b` (ships) | the hull and rigging creaking (the tree creak and a wood squeak, slowed) | 4 | 0.29 |
| `potion` | a potion drunk | `fish_plop_a` (fishing) | the cork float landing on calm water (plain, as recorded) | 3 | 0.204 |
| `equip` | a piece put on or taken off | `raise_e` (free) | the shield up, light (pick) | 5 | 0.572 |
| `sail` | sailing to another place | `sail_fill_a` (ships) | the sail catching the wind as it is set (raw flag snaps); once | 4 | 0.788 |
| `tap` | a button | `talk_next_e` (ui) | the next line (Robin's E): 3 dB under what he heard, as promised, since it comes at every line | 4 | 0.037 |
| `open` | a window opening | `book_open_b` (ui) | the Lore Book opening (Robin's B): Kenney's book sounds are about 20 dB louder files than the leather ones, and he heard them so | 4 | 0.707 |
| `close` | a window closing | `book_close_c` (ui) | the Lore Book shutting (Robin's C) | 4 | 0.784 |
| `refuse` | a thing that cannot be done now | `block_a` (free) | a block (pick) | 3 | 0.288 |

All together 433 KB.

**Origin and licence.** The library's index says of its recorded material: CC0 or "free for any use". The credits
of each set are in the Survival game's own files on Robin's PC:

- `C:\dev\SG\Game Developer\assets\sfx\free\CREDITS.md`
- `C:\dev\SG\Sound Director\out\sfx\flesh\NOTES.md`
- `C:\dev\SG\Sound Director\out\sfx\combat\NOTES.md`
- `C:\dev\SG\Sound Director\out\sfx\chapter1\NOTES.md`
- `C:\dev\SG\Game Developer\assets\sfx\runes\NOTES.md`
- `C:\dev\SG\Game Developer\assets\sfx\ships\NOTES.md`
- `C:\dev\SG\Game Developer\assets\sfx\fishing\NOTES.md`
- `C:\dev\SG\Sound Director\out\sfx\ui\NOTES.md`
- `undefined`

**Not here, because the library has none**: steps, a monster's voice, coins as such (a pick on stone stands in), a
fanfare for a level (a rune's chime stands in), a potion's gulp (a plop stands in), any music.
