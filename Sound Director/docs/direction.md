# Sound direction

The direction for Drok, distilled into rules to check work against. The sentence and the places are
Hugh, SD's until Robin says yes; the general rules are his (`docs\rules.md`). Every "(decide with Robin: ...)" is
a thing to settle in the first session and then write here with his name and the date.

## The sentence

**(decide with Robin: one sentence that says what the game sounds like: the reference game or style if he names one,
the handful of instruments, the mood of the map, the towns, the fights, the bosses.)** Example from the board world game
(mine, 2026-10-31): "MapleStory in a bright fantasy board world: a few clearly drawn instruments playing tunes you hum; a
theme and a key for every region of the map; the map itself wide and inviting, towns warm, fights quick and driving but
never ugly, bosses big."

## 1. The instruments (the map from the voices to Sonic Pi, in `music\_lib.rb`)

| Voice | Studio instrument | How it is built |
| --- | --- | --- |
| flute | `FLUTE` | `:sine` + `:tri` (octave up, 0.25) with a 0.06 s attack, slow vibrato by `control`, breath: `:noise` through a band filter at the note, very quiet |
| clarinet | `CLARINET` | `:pulse` at half width through `:lpf` 90, attack 0.05 |
| piano | `PIANO` | `:piano`, `vel` 0.25 to 0.5 and `hard` 0.4 to 0.7 varied per note, `stereo_width` 0.3 |
| celesta, music box | `BELL` | `:pretty_bell` an octave up, release 0.8, a `:sine` two octaves up at 0.15 for the shimmer |
| harp | `HARP` | `:pluck` `coef` 0.25, with a soft `:sine` behind it at 0.2 for warmth |
| strings | `STRINGS` | `:blade` or `:dsaw` `detune` 0.1 through `:lpf` 85, attack 0.4, release 0.8, quiet; a pad never leads |
| brass, horn | `music\_fight.rb` (`WARHORN`) | saws through a low-pass (a triangle reads as a flute, Robin, 2026-10-15) |
| bass | `BASS` | `:fm` `depth` 0.6 `divisor` 1 plus `:sine` an octave up at 0.3; release 0.35; sits under C3 |
| shaker, rim, kick | `shaker`, `rim`, `kick` | light; the kick dry, never through the reverb |
| fight drums | `fk_big`, `fk_lo`, `fk_mid`, `fk_hi`, `fk_rumble`, `fk_hand`, `fk_crash`, `fk_roll` | real drums and wood only |

One lead at a time. A lead and an answering voice may share a section (flute and bell), never two leads in the same
octave. **(decide with Robin: any voice this game adds, such as a kalimba, a tuba, an organ, a choir, or a sampled
instrument; and any voice it bans.)**

## 2. The places (ask Victor, GD which exist and for how long the player is in each)

| Place | Heard for | Tempo and key | Model |
| --- | --- | --- | --- |
| the map or the world, by region | long stretches | 118 to 135, a key of its own per region | bright regions open and major; dark or cold ones minor or Dorian; caves and ruins minor and slow |
| a town, a hub | a minute or two at a time | 105 to 130 | a pedal opening, the middle voice working, a sus held before the cadences |
| a shop, an inn, a menu | short | 100 to 120 | a thinner cousin of the town's theme, the same key |
| a fight, by region | one to two minutes | 116 to 140 | a ramp of a few seconds, then drums from the first bar; the region's key, its minor or Dorian |
| a boss | a few minutes | 116 to 130 | a ramp played once and an intense loop; big and broad, no happy relative-major chords |
| the title | first thing heard | 100 to 120 | the game's hook, hummable; the one theme every region's theme can quote |
| an event, a shrine, a treasure | a sting or a short loop | | stings in the region's key |

**(decide with Robin: the list of places for this game, which get a theme first, and whether there are ambience beds at
all: one game had none.)**

## 3. Composing

- Tempos 100 to 140 for the map, the towns and the fights; 70 to 90 only where a place is meant to be slow. Keys: one per
  region; the tracks of one region share a key family so the map theme, the fight and the town crossfade without a clash.
- Form: 64 to 100 bars, two to three minutes a loop where the budget allows, full from the first sixteen bars, the
  breakdown and the return as the one big event, the hook back late and varied, a short tail. Shorter loops (a fight at
  45 to 60 s, the title at 30 to 45 s) keep the same shape with fewer sections.
- The hook: two to four bars, one rhythmic cell, stepwise with a leap at the phrase end, chord tones on the strong beats,
  said twice with a changed ending. If it cannot be hummed from the written notes, it is not a hook yet.
- Harmony: maj7 on I and IV, m7 on ii, iii, vi, a dominant seventh or a sus4 on V; loops of two to four chords; one
  borrowed chord per piece as colour; a sus before a cadence. **(decide with Robin: the colour, such as the jazz sevenths
  of early MapleStory, plain triads, or modal.)**
- Three registers, each with a job: bass below E3, the busy middle voice E3 to E4, the lead E4 and up, sparse.
- Percussion light or none on the map and in towns; real drums in a fight; never a drum machine, never a pulsing saw.
- Dynamics from a seeded stream: amplitude varies 5 to 10 percent, timing 5 to 12 ms on the lead and the harp, less on
  the bass, none on the kick. A phrase climbs in loudness to its highest note and falls off.
- Energy named in numbers before any note (the tempo, the notes per bar in the busiest part, what moves under a long
  note, which bars have drums), or the piece drifts toward a lullaby.

## 4. One mix, no layers

**Robin, 2026-10-14: the music will just be what it is.** A track renders to one file, exactly the loop length, seamless.
No layer that reacts to the game; a fight has its own track. A boss is a ramp (`<name>-intro`) played once and a loop.

## 5. Mixing and rendering

- Peak under -1 dBFS in every file; RMS of the full mix between -22 and -16 dBFS, about -18 LUFS. No limiter work. Fight
  pieces at master 1.0, place pieces at 0.6, then measure.
- One reverb for the room (`mix` 0.25 to 0.35, `room` 0.6 to 0.8) around the lead, bell and harp; a smaller one around
  the piano; the bass dry or nearly; the kick dry.
- Every instrument has a register of its own: bass below C3, piano comp C3 to C5, harp C4 to C6, lead C5 to C6, bell C6 up.
- The loop length is bars times beats at the bpm; rendered as two passes and the second cut out. The seam is checked.
- 48 kHz 24-bit from the engine; the master is a 48 kHz 16-bit WAV; the game gets what the GD asks for (OGG Vorbis, or
  an MP3 that loops from the encoder's delay); the notes give every file's size.
- **The speaker:** listen on the phone page before calling it done. **(decide with Robin: the platform: a phone speaker,
  a computer's speakers, headphones; what the delivery is judged on.)**

## 6. Sound effects

- The game's sounds come from the GD's `docs\sound-demands.md`, in waves. Each must read at a glance on the platform's
  speaker. **(decide with Robin: the few sounds that carry the game, the "dopamine" moments that get the most work.)**
- Short: 60 to 400 ms, up to 1.2 s for a roar or a big spell. Three variations for every-turn sounds, one for rare ones.
- Named as the game names them, mono unless the sound has width, peak-normalised to -1 dBFS, trimmed to -60 dBFS.
- The common library first; then **from a reference, always**: a recording Robin likes, or candidates for him to pick
  from. Not cyber. Layers each with one job: the front (under 10 ms, above 1 kHz) is the loudest moment; the body under
  it; weight only on heavy sounds and never leading; a tiny tail. No limiter.
- A set is levelled against itself (`tools\sfx-level.js --weighted`); the first set delivered is the anchor the later
  ones are levelled against; `docs\pipeline.md` says which.

## 7. The check (before a delivery)

1. Does the hook come back, and can it be hummed from the written notes?
2. One lead at a time; every part in its own register; nothing doubled for thickness.
3. Is it full from the first sixteen bars, and does the breakdown-and-return land?
4. Does the loop seam pass, and is there a sound on beat one?
5. Peak and RMS within the numbers; the limiter untouched; the file's size and the loop length in the notes.
6. Does it belong to its place, and does it sound like no other place's theme (its own key, lead voice and rhythmic cell)?
7. Was it heard on the platform's speaker, and did Robin get it from the chat and the phone page, with what changed
   written in plain words with the date?
