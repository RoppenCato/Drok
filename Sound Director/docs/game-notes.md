# The game: its places and states, and how it plays our files

What the studio needs to know about Drok to write for it, kept current. The brief is `C:\dev\Drok\Drok-brief.md`;
the game's list of every sound it needs, in waves, is its `docs\sound-demands.md`; how the game plays audio today is its
`docs\state\sound.md`. Everything here is copied from those or decided with Victor, GD, with the date.

## The budgets (Victor, GD confirms them; Robin, 2026-11-01: the GD confirms what sizes sounds and music can be)

(Copy the confirmed numbers here with the date: the format and rate, the sprite's size and length, a loop's length by
kind of piece, the first load's weight, the loudness the game wants, the fades. `docs\rules.md` section 2 has one game's
numbers as a start.) Example row: **Format: OGG Vorbis at 48 kHz, quality 4; effects mono, music stereo**
(Victor, GD, 2026-11-10). **The WAV masters stay in `work\`.**

## The names the code calls (the sprite's names must match)

| Name | When the game plays it |
| --- | --- |
| `ui/tap` | every button pressed (Victor, GD, 2026-11-10) |

## How the game plays them

(How sounds are loaded and played: sprites per wave or loose files; music streamed or decoded; the crossfades and their
times; the volumes and the mute; the first tap that unlocks audio on a phone; the test pages' `?mute=1`.) Example:
**Music per area streams through an audio element at 0.7 with a two-second crossfade on an area change** (Victor, GD,
2026-11-10).

## The places

(The places and states of the game that get a theme or a sound, in the order the GD builds them, each with a line on
what it is like and how long the player is there.) Example: **The first region: a bright meadow, the start; the player is
on its map for long stretches, so its theme is heard most** (from the brief, 2026-11-10).

## Decided

(Robin's decisions about the game's sound, each with his name and the date.) Example: **No ambience beds** (Robin,
2026-11-03, the board world game: "Nah we dont need ambient sound"); ask before making any here.
