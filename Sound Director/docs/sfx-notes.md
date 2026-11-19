# Sound effects: the method, the measures, the rules learnt

The general part of what two studios learnt making sound effects for Robin (2026-10-15 onward), after his verdicts on
the first sets ("missing the mark on all of them; look online for tips on how it can be done nicely in Sonic Pi"). The
rules in `docs\rules.md` hold; these are more specific. The exact commands are in `docs\pipeline.md`.

## 1. An impact is four or five layers, each in its own slot and with its own job

| Layer | Job | Where it sits | How long |
| --- | --- | --- | --- |
| transient | the first millisecond: tells the ear *that* something hit | broadband, bright | 1 to 10 ms |
| body | *what* was hit: wood, stone, skin; the identity | low mid to mid (150 Hz to 1.5 kHz) | 50 to 200 ms |
| sub (weight) | *how heavy*; felt more than heard | below 100 Hz | 50 to 150 ms |
| detail | *what flew off*: chips, grit, splinters | high (2 to 8 kHz) | 10 to 60 ms, may arrive late |
| tail | the place: room, distance | spread | for a game sound, almost none |

1. **Set the body first.** It is the anchor and usually the loudest layer; the others are fitted to it.
2. **One layer owns the low end.** Roll the lows off the body and the detail, or the bottom turns to mud.
3. **Line the transients up to the same millisecond.** Layers that are not aligned read as two hits. The detail may
   land a few milliseconds late, for texture; the tail may run past the rest.
4. **Detail is a flavour, not a lead.** The commonest mistake is a high layer that dominates.
5. **Contrast makes weight.** A hit sounds heavy against silence before it, not by being loud; a short tail leaves
   that silence for the next hit (gameplay strikes come fast).
6. **Variation.** Several takes with small changes of pitch, timing and balance; the game picks one at random.
7. **Listen in context, against a reference.** The studio cannot listen; each set ships with a note of which lever to
   pull if it reads wrong.

## 2. What the first sets did wrong

- **Tonal bodies.** The body (the identity layer) was a synth: sines, bells, then plucked strings. A pluck at 73 Hz is
  a bass note with a pitch; real wood and stone have no pitch the ear can name. That is the "cyber" and the "missing
  the mark" in one.
- **No weight layer of its own**: a brown-noise burst inside the same low-pass as everything else, so the low end was
  shared and muddy.
- **Transients spread on purpose** ("blade, then haft") over 6 to 12 ms: the ear heard a flam, not one strike.
- **Detail too present and too tonal** (pink-noise grains at the level of the body; a triangle "snap").

## 3. The method: recorded samples and noise only

No oscillator anywhere in a strike (a sine or triangle only in the sub layer, where it is pitch-free to the ear, and
even there a slowed drum sample is preferred). The layers are defined in `sfx\_kit.rb`.

| Layer | Material | Treatment |
| --- | --- | --- |
| transient | a skin slap (`:tabla_tas1`), `:perc_snap2`, `:elec_tick`, at rate 1.3 to 2.5 | `sustain: 0.005..0.01, release: 0.02..0.03`; it must not ring |
| body | wood: `:perc_door` at rate 1.0 to 1.8; stone: `:perc_impact2` at 1.2 to 1.6; skin and earth: the toms; a recording from the library | `finish` and `release` cut it to 80 to 160 ms; the sample's own room is cut with it |
| sub | `:bd_boom` at rate 0.6 to 0.8, `:drum_tom_lo_hard` at 0.7 | under `with_fx :lpf, cutoff: 55..65`, 60 to 120 ms, quiet |
| detail | `:perc_snap` at rate 1.5 to 2.5 for chips and grit; `:pnoise` grains through a band-pass for dust | 15 to 30 ms after the strike, 20 to 35 percent of the body's level, two or three grains falling away |
| tail | none; the game's room can add its reverb | everything under one plain `with_fx :lpf, cutoff: 108..115` so nothing is glassy |

The envelope of the whole strike: the peak inside the first 5 ms, most of the energy gone by 120 ms, silence by 250 ms.
Variation: three seeds per sound; the body's rate moves 5 percent, the detail's timing 10 ms, the transient's level
15 percent: different enough not to sound like a machine gun, the same enough to be one tool.

## 4. Swings

- **A swing is a build to one moment, the contact.** The game lands the blow some 100 to 400 ms into the windup, so a
  swing is timed so its loudest 10 ms falls on contact and is cut at the hit. A swing loud from its first 10 ms and
  flat for 170 ms is a burst of hiss, not a blade passing: start 20 dB or more under the peak.
- **No resonant filter on noise.** A band-pass with a high res sweeping over noise is a pitched, synthetic wind: the
  "cyber" colour again. Recorded whooshes (`:perc_swoosh`, `:ambi_swoosh`), trimmed so their own peak lands on the mark,
  or noise under plain low- and high-pass filters.
- **The mirrored pass:** a recorded whoosh played backwards swells into its own attack, so backwards-then-forwards
  (approach a little higher, going away a little lower) is a blade passing by construction.
- **Robin's own swings, measured (2026-10-15):** a low-mid "whoom" centred at 300 to 400 Hz, rising from 38 dB under to
  its peak in about 50 ms and down 28 dB 40 ms later; nothing above 1 kHz. Every studio swing was a hiss centred at 2.8
  to 5.7 kHz, or a rumble at 121 Hz. For other weapons: recorded material in his manner, the weight setting how low and
  long (the playback rate), measured against his before he hears them.

## 5. Hits

- **The slap or crack in the 1 to 4 kHz octaves is the loudest moment** (Robin, 2026-10-16: a hit all body reads as "a
  bump"; the reference "a sharp fleshy slap"). Targets: attack under 5 ms; centre 800 to 1600 Hz; a third or more of the
  energy from 1 to 4 kHz, under a fifth below 250 Hz; 150 to 250 ms, 30 dB down by about 120 ms.
- Sonic Pi has recorded slaps: the tabla strokes are a hand on skin (`tas1` to `tas3` at 650 to 750 Hz, `na` at about
  900); `perc_snap` is a crack (89 % between 2 and 8 kHz). Real flesh: a recorded hand slap on skin (2.7 to 6 kHz,
  attacks of 1 to 2 ms) over a recorded punch high-passed at 185 Hz, the low end small.
- Keep the low body small and short under a high-pass; start a sample past its own build-up when its peak comes late; a
  plain low-pass near 6 kHz keeps a hit sharp without hiss. In a layered sound, measure the attack as the time to within
  3 dB of the peak.

## 6. Building from recordings

- **Sonic Pi plays WAV, FLAC and OGG** as samples, so a pack is layered straight from its folder; **not MP3** here. To
  measure a FLAC or an OGG, play the files one by one in a small decode file and let `render-sfx.js` split them.
- **Look at the head of every file.** Some start with 20 to 70 ms of silence: layered at once with one that does not,
  the knock lands after the thump and the blow is soft. The split's trim times give the lead; `start:` skips it.
- **Do not use Sonic Pi's `onset:` to pick a hit**: on some files slice 0 is a near-silent sliver. Cut each hit out of a
  decode render instead (the split trims at the sound's start) into `ref\cut\`, peak-normalised.
- **Recorded levels differ by 30 dB and more between packs.** Layer from peak-normalised pieces, or the quiet one
  vanishes.
- **The attack measure follows the biggest sample**, and a low wave's samples are big: a blow whose knock is 10 to 20 dB
  under its thump reads as slow even when the knock is at 1 ms. The knock must be the loudest moment.
- **A recording's loudest moment is not its peak sample.** Timing to the game (a crash landing at 0.95 s) uses the
  loudest 10 ms. **A splat that peaks late makes a flam**: only a quick one works under a slap.
- **A pack may hold a copy** (two files with correlation 0.999); **a recorded yell may start with a long silence**: cut
  past the head.
- **A decode's slot must be longer than its lead-in**, or label the pieces by number: with short slots the labeller
  named every piece two recordings off and three renders were built on the wrong knock. Slots of 3 s or more, and
  check one piece by ear or by its length.
- **Heavy impacts in free packs are low thumps** (98 to 133 Hz, all under 250 Hz, a 15 ms swell): under a knock they add
  weight; louder than the knock they set the attack and the sound turns dull. A small hard object (a die, a chip) is a
  bright knock at 2.5 to 3.5 kHz with an attack under 3 ms; few packs have one.

## 7. Levelling

- **Level by a hearing-weighted loudness, not plain RMS.** Plain RMS over-counts low thumps (they measure loud and sound
  quiet): `tools\sfx-level.js --weighted` high-passes at 100 Hz and adds a 4 dB shelf above 1.5 kHz over the loudest
  50 ms. A normalised file can measure louder than a heavier one: set the ladder from the printed loudness, and check
  that no gain has hit the ceiling of 1.0.
- **Targets in a spec are dB against the anchor as the ear measures it.** When a sound must match one the game plays,
  level it against that sound itself (its file and its gain as the anchor, target 0), then write the equivalent target
  against the anchor into the spec. "As loud as the dash" or "heavier than the swing" are measured, not guessed.
- **The anchor moves with the archive.** When the anchor sound is replaced in the game, keep levelling against its file
  where it now lies, so a new sound sits where the game's mix already is; `docs\pipeline.md` names the path.

## 8. The phone

- **Measure the band shares before a sound ships for a phone.** Sounds with 95 to 100 % of their energy under 250 Hz
  (a hurt, a stagger, a slam, a thunder) nearly vanish on a phone speaker. Use them only under a sound that lives in
  the mids (a wooden knock, a club's hit, a recorded breath); or swap the recording.
- **Recorded roars and groans are mostly under 250 Hz**: high-pass them at 330 Hz (`:hpf, cutoff: 64`) before anything
  else; some recordings stay low whatever is done, and are swapped.
- **A lightning that is a rumble** on a phone becomes a recorded whip's crack with the rumble under it.

## 9. What Robin picks

- **The plain recording over the layered version**, nine times of nine (2026-10-24). Lead with the best single
  recording, cut at its sound; a layered version is worth offering only where no one recording does what the moment
  needs (a gathering storm, a sound the game times to the frame).
- **Candidates by letter** (A, B, C) with a preview that plays them in the game's order; his pick becomes the game's,
  the rest are archived.
- **Repeated sounds** (a tap, a line of talk) sit a few dB under what he first liked, or they wear; a sound heard a
  hundred times an hour is dull on purpose.
- **Free recordings first**, with the licence and the origin written at delivery (CC0 or "free for any use": Kenney,
  OpenGameArt, BigSoundBank, qubodup, rubberduck, HaelDB; the itch.io packs that allow use in games). Every download is
  listed for Robin (name, source, licence, size) and waits for his yes; the studio never downloads from a site that
  needs a sign-in or a terms click.

## 10. Sources

Morphic, "How to layer sound effects" (the four-layer table, body first, align transients, detail may arrive late); the
IRPR sound design guide, "How to add weight to impacts" (booms, cracks and tails; contrast and headroom); the Sonic Pi
forum's kick drum threads (a click, a pop and a body layered); general game-audio practice (short tails, several
variations played at random, the player's ear tires of a single file within minutes).
