# Rules: where a sound comes from, the numbers, and what Robin's ear taught us

The rules that carry over from game to game. The first two parts say how the studio decides and measures; the third is
Robin's taste, rule by rule, in his words with the dates (his Survival game's studio from 2026-10-14, his board world
game from 2026-11-01). Add to the third part as he reacts; never take a rule out without his word.

## 1. Where a sound comes from

| Made in | For | Why |
| --- | --- | --- |
| **Sonic Pi** (`music\`, `sfx\`, `ambience\`) | all music; anything tonal (bells, chimes, fanfares, stings, a spell's shimmer); layered effects built from recordings and noise; anything that must follow a tune or a tempo | the piece is code: a bar can be changed, a hook kept, a key shared; seeded renders repeat exactly |
| **The common library** (`library\INDEX.md`, `node tools\fetch-common-sounds.mjs`) **or a recording** | real-world noises (steps, wood, water, wind, animals, blows, cloth, coins, doors); anything the library already has, above all Robin's picks from an earlier game | synthesis missed every real-world sound it had no reference for; Robin picks the plain recording nearly every time. The origin and the licence go in `NOTES.md` at delivery (CC0 or "free for any use" only, unless Robin says otherwise) |
| **Node or Python** (`tools\`, `sfx\_make.py`) | procedural noise beds that need no ear (a steady wind, rain); every measurement (peak, RMS, LUFS, bands, attack, the seam); packing (levels, sprites, OGG, MP3); writing a set's sources from one spec | measured in numbers, not heard; Python 3.14 has no numpy here, so the measuring is Node's |

A library sound that fits is fetched, re-levelled against this game's set, renamed as this game names it, delivered
with its origin, Robin's verdict and its licence in `NOTES.md`; the original is never moved. Only what the library lacks
is made new, from a reference Robin likes or candidates he picks between.

## 2. The numbers

**Music, the mix.** Peak under -1 dBFS in every file; the full mix -22 to -16 dBFS RMS, about -18 LUFS (the GD's number
wins where the game sets one). Sonic Pi's limiter never works: `set_volume!` stays at its default, `set_drive!` is never
raised; the level is set by `MASTER` and measured. Fight pieces at master 1.0, place pieces at 0.6, then measure. A
new section that measures quieter than the one before it is a hole.

**Music, the loop.** Whole bars: the length is bars times beats at the tempo. Rendered as two passes and the second cut
out at the marker, so the last bar's tails lie under the first bar. The seam step under 0.5 %FS (above 2, a part is
sounding at the end of the last bar). Nothing with a strong fundamental
crosses the loop point: the last note of a line as `h. r:q` rather than `w`, no bass approach note in the last bar. A
piece that ramps up is a ramp (`<name>-intro`) played once and a loop. An MP3 carries the encoder's delay (1105 samples
in Chrome), so a game that loops an MP3 loops from 1105; an OGG loops whole.

**Effects, the masters.** 48 kHz 16-bit WAV, mono unless the sound has width, trimmed to the first and last sample above
-60 dBFS with 2 ms before and 10 ms after, peak-normalised to -1 dBFS, 5 ms fades at both ends. Short: 60 to 400 ms for a
tap, a step, a hit; up to 1.2 s for a roar, a big spell or a fanfare; a chest or a level up may run to 2 s. Three
variations for anything heard every turn (a tap, a step, the die, a hit), one for anything heard less than once a minute.
Named as the game names them.

**Effects, the set.** A set is levelled against itself by a hearing-weighted loudness (a high-pass at 100 Hz and a 4 dB
shelf above 1.5 kHz over the loudest 50 ms: plain RMS over-counts low thumps), with a gain per sound in the set's JSON.
The first set delivered is the anchor every later set is levelled against (`docs\pipeline.md` says which); a sound that
must match one the game already plays is levelled against that sound itself. The UI set sits a touch under the fight
set; a sound heard a hundred times an hour sits a few dB under what Robin first liked, or it wears. The sprite's peak at
-3 dBFS (effects around -16 LUFS in the game).

**The speaker.** Measure the band shares (`tools\sfx-measure.js`) before a sound ships for a phone: a sound with 90 % of
its energy under 250 Hz nearly vanishes on a phone speaker; a recorded roar or groan is high-passed at about 330 Hz first;
the tune in the middle register, the bass as a line; a sound that reads on a phone reads anywhere.

**Sizes (the GD sets and confirms them; these are one game's, 2026-11-01, as a start).** OGG Vorbis at 48 kHz, quality 4
(effects mono, music stereo), quality 5 only where a piece suffers. Short sounds as one audio sprite per
wave (`ui`, `fight`, `creatures-<area>`), 50 ms between sounds, each sprite under 1.5 MB and 60 s. Music streamed, one
file per piece: the title loop 30 to 45 s and under 1 MB; an area's main theme up to 2.5 minutes and 2.5 MB; its fight
theme 45 to 60 s; boss and town themes 60 to 90 s; an area's music under 6 MB; the first load (the title, the UI sprite,
the fight sprite) under 3 MB. The WAV masters stay out of git; the notes give each file's size.

## 3. What Robin's ear taught us

- **A tune he can hum is what makes him keep a piece** (2026-10-15: "I like it a lot; missing a memorable tune, so that
  you remember the song and start humming it"). A chord outlined slowly is not a tune; a hook has one short rhythmic
  cell, a leap in it, and is said twice with a changed ending.
- **One mix, no layers that react to the game** (2026-10-14: "the music will just be what it is").
- **Do not make a piece calm by emptying it** (2026-10-14, an "ambient" version with the tune in a third of the bars and
  pad-only bars: "did not like this ambient version; maybe a church or credits"). Sparseness read as a different place.
- **The slow build is not for Robin** (2026-10-14, a piece built up over sixty thin bars: "good from around 2:27", the
  return with everything; "together with your first version that can become something very good if you combine the
  ideas"). Full within the first sixteen bars; keep the breakdown and the return as the one big event.
- **The place's colour goes in the tune and the mode, not in the instruments** (2026-10-14, a drone-and-lyre version:
  "pretty cool, but better closer to your first version"). But when Robin names a game as the reference, the
  arrangement follows it: his references are about the instruments and the motion.
- **A second theme must differ in its rhythmic cell, its meter or its contour, not only in its notes** (2026-10-14:
  "needs another melody; now it sounds like the meadows theme just with other instruments").
- **A new place gets a new key, a new lead voice and a new rhythmic cell** (2026-10-14, the village on a clarinet with
  the piano's off-beats: "the village is good").
- **When a tune fails in two arrangements, the tune is the problem**; drop it rather than re-dress it a third time
  (2026-10-14, the third try: "bad, can be removed").
- **Mysterious and foreign is a mode first** (the flat second, the augmented second), then slowness and size (a
  heartbeat, a drone, the pad with the fifth below) (2026-10-14: "very good").
- **Colour notes belong to the key, not to the chord of the moment** (2026-10-15, bells taking a raised fourth from each
  chord's root: "after 15 sec the tunes get weird"). **A climax is louder and fuller, not busier** ("later on too crazy").
- **No drum machine, no pulsing saw** (2026-10-15, two fight pieces: "too much like some 80s retro cyber music"). Heroic
  is real drums (a low drum on 1 and 3, toms off the beat, a frame drum), bowed strings, a round horn, a chant-like tune,
  around 116.
- **A long version is the theme coming back in new colours with something new between** (2026-10-15: make it longer "to
  not grow tired of it, and to also make you remember the theme tune"): the hook four times in three minutes, each in
  another voice, between them sections that are new but keep the energy. Never a quiet stretch made by taking parts away.
- **Relaxing is the same tune in warmer, lower voices, not fewer notes** (2026-10-15, the night: "longer and some low
  variation, so that it feels relaxing"): the clarinet an octave down, a soft piano, the harp thinner, the tempo unchanged.
- **"Adventure" is motion under a broad tune** (2026-10-15, the mountains: "add some adventure background"): the tune
  stays in long notes; a frame drum in sixteenths, low strings in eighths, a second tune in eighths under it.
- **A major chord in a dark place reads as happy** (2026-10-15, the cave: "a bit too happy around 44 seconds"). Light in a
  dark piece comes from register and timbre over minor, suspended or open chords.
- **A fight starts where the action is** (2026-10-15: "I like it from 1:14; it needs a quick upbeat to 1:14, then more
  drums and more action; excited and adventure, but not happy"): a ramp of a few seconds, drums from the first bar of
  the loop, a fill every four bars; "not happy" means no relative-major chords. His brief for a fight: "lots of drums;
  going up quick the first 5 seconds to become intense and adventurous".
- **The studio's soft voices together read as a lullaby** (2026-10-15: "sounds too much lullaby; it should be more like
  Wind Waker, like you are traversing water and going on adventure"). Flute, harp arpeggios, bells, a pad and a skipping tune are the night's palette; a happy tempo
  does not undo them. Adventure is a brass lead on a broad tune with big leaps and long notes, strings doubling it, an
  accompaniment that never stops running. Claude's own taste drifts the same way (research, 2026-10-22), so every brief
  names its energy in numbers before any note.
- **A triangle wave reads as a flute; a horn is saws through a low-pass** (2026-10-15).
- **No plucked string as the engine of a fight** (2026-10-15, five versions driven by a lyre: "I don't like the lyre for
  fighting"). The drive comes from drums played soft and fast under sustained strings and a horn, never from a plucked or
  a short repeated synth note (that is the "80s retro" pulse).
- **A sound effect from a reference, always** (2026-10-15, four swings: "The sounds of the sword swing are all bad"; the
  first strikes: "missing the mark on all of them"). Not cyber: a tonal
  body (a sine, a pluck, a bell) is the "cyber"; a real strike is recorded material and noise.
- **A hit's crack or slap, in the 1 to 4 kHz octaves, is its loudest moment** (2026-10-16, a hit all body: "a bump"; the
  reference "a sharp fleshy slap"). **A swing is a low-mid "whoom" that builds to the contact, not a high hiss**
  (2026-10-15, measured from his own swings: 300 to 400 Hz, a 50 ms rise). No resonant filter on noise.
- **Free recordings first** (2026-10-20: "it might be easier to get better sounds that way"), and **the plain recording
  over the layered version** (2026-10-24: nine times of nine). Lead with the best single recording; layer only where no
  recording does what the moment needs.
- **Reuse the sounds of his other games** (2026-11-01: "whenever you need a new sound, check if those could be used"):
  the common library first. **The GD confirms the sizes** (2026-11-01: "the GD needs to confirm what sizes sounds and
  music can be").
- **Three candidates for a song, different in their instruments** (2026-11-03: "Try making three different meadows
  candidates. Use different instruments. Around 1 min each"); every song request since (the brief, 2026-11-04). When the
  old one wins ("I think we keep what we had"), the candidates are archived.
- **Ask before making ambience beds** (2026-11-03, beds offered for every area: "Nah we dont need ambient sound").
- **Silence while working** (2026-10-14). **Make it easy to test** (2026-10-23). **Clear what is not wanted**
  (2026-10-23): turned-down work is archived and taken off the page.
