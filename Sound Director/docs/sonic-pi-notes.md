# Sonic Pi 5: what was learnt

The general part of what two studios learnt driving Sonic Pi 5 headless on Windows (2026-10-14 onward), from the
installed tutorial (`C:\Program Files\Sonic Pi\etc\doc\tutorial`), the synth definitions
(`app\server\ruby\lib\sonicpi\synths\synthinfo.rb`), the v5 changelog and the forum (in-thread.sonic-pi.net). The exact
commands are in `docs\pipeline.md`; how Sonic Pi is installed and run on this PC is `docs\sonic-pi.md`.

## How it is built, and how we drive it

- **v5.0.0 "SuperSonic"** replaced SuperCollider's scsynth with Sam Aaron's own engine. Audio settings change live; the
  engine here runs at **48 kHz**, block 128, on the Windows "Primary Sound Driver": **it needs a playback device**, even
  for a silent render (a sleeping monitor's audio is none).
- Three processes: the **daemon** (boots the rest, prints ports and a token, dies without a keep-alive), the **spider**
  (the Ruby language server: `/run-code TOKEN CODE` over UDP, `/log/*`, `/error`, `/syntax_error` back) and the
  **engine** (OSC over TCP). The studio's `tools\record.rb` asks the spider to record the way the app's Rec button does;
  Sonic Pi's own `headless-record.rb` writes nothing on Windows.
- **Renders are real time.** There is no faster-than-realtime render inside Sonic Pi (the forum confirms it). Two passes
  of a 90-second loop take about three and a half minutes. Only one engine can run at a time: queue renders.
- Code starts about half a second after the run message (the schedule-ahead time; 1.4 s with `set_sched_ahead_time! 1`),
  so a recording has silence at the front. The renderer finds the marker click or the first onset and cuts from there.
- `set_volume!` is 0 to 1 and sits after a **limiter**; `set_drive!` (0.5 unity) feeds it. Never rely on the limiter:
  it changes the sound. Set the level with a `MASTER` constant and measure.
- Sonic Pi runs Ruby: code it evaluates can do anything on the machine (Sam Aaron's warning). The studio runs only its
  own files.

## The synths worth using

| Role | Synth and opts | Notes |
| --- | --- | --- |
| piano | `:piano, vel: 0.2..0.5, hard: 0.3..0.7, stereo_width:` | a real plucked model; `attack/sustain/release` only shorten the natural note; vary `vel` and `hard` per note |
| electric piano | `:rhodey` (vel, mod_index), `:rodeo` (chorus and compressor built in) | a hall, a shop |
| harp, lute | `:pluck, coef: 0.3, pluck_decay: 30, noise_amp: 0.8` | Karplus-Strong; whole tones only; `coef` higher is duller; the envelope cannot be lengthened |
| celesta, music box | `:pretty_bell`, `:dull_bell`; `:kalimba, clickiness:` | short release, an octave or two up |
| flute, recorder | `:sine` + `:tri` an octave up at 0.25, slow attack, a touch of `:noise` through `:bpf` for breath; vibrato with `control ... note_slide` | no wind synth exists; it must be built |
| clarinet | `:pulse, pulse_width: 0.5` through `:lpf cutoff: 90`, soft attack | odd harmonics as a clarinet |
| strings | `:blade` (`vibrato_rate: 6, vibrato_depth: 0.15, vibrato_delay: 0.5`, `cutoff: 100`) or `:dsaw, detune: 0.1` through `:lpf cutoff: 80..95`, `attack: 0.3..0.6, release: 0.6` | `:blade` fills a pad well; quiet as a lead (below) |
| horn, brass | two `:saw` a hair apart and a `:tri` an octave below through `:lpf` (`music\_fight.rb`) | a triangle alone reads as a flute (Robin, 2026-10-15) |
| bass | `:fm, depth: 0.5..1, divisor: 1..2` plus `:sine` an octave up; `release: 0.4`; `:bass_foundation, cutoff: 83` | keep it under C3 |
| organ | `:organ_tonewheel` (drawbars, rotary speaker opts) | a church |
| kick, snare, hats | samples `:bd_pure`, `:bd_sone`, `:bd_haus`, `:sn_dolf`, `:drum_cymbal_closed`, `:hat_tap`, `:perc_snap`, `:elec_tick`; the `:sc808_*` synths | 207 bundled samples at 44.1 kHz, FLAC, loaded on first use (`load_samples` first). Drum-machine samples read as "80s retro" in a fight: use the toms, `:bd_boom`, the frame drum there |
| shaker, rim | `:sc808_maracas, decay: 0.1, hpf: 113`; `:sc808_rimshot, decay: 0.07` or `:perc_snap` | |
| pads, drones | `:dark_ambience`, `:hollow`, `:growl`, `:prophet`, `:tech_saws`, `:supersaw` | the darker ones for caves and bosses |
| noise for effects | `:noise`, `:pnoise`, `:bnoise`, `:gnoise`, `:cnoise`, `:chipnoise` | attack is 0; the hit lives in `release:` and `cutoff:` |

FX (defaults): `:reverb mix: 0.4 room: 0.6 damp: 0.5`, `:gverb` (bigger), `:echo phase: 0.25 decay: 2`, `:ping_pong`,
`:compressor`, `:tremolo`, `:chorus`, `:lpf/:hpf/:rlpf`, `:eq`, `:band_eq`, `:pan`, `:level`, `:pitch_shift`, `:octaver`,
`:distortion`, `:bitcrusher`, `:krush`, `:tanh`, `:slicer`.

**The built-in synths lean electronic.** The community does acoustic and orchestral music with recorded samples: the
nearest recorded note pitched the rest of the way (`rpitch:`), a velocity layer per dynamic. VSCO 2 Community Edition
(CC0) is the free orchestra for it; a download for Robin's yes.

## Techniques that matter

- **Structure in bars first.** A table of sections and which instrument enters where; then code. One `define` or lambda
  per instrument (a voice is one place to fix), one `in_thread` per part, all started together so they share time.
  `use_bpm` once at the top; everything in beats. A `live_loop` is for performing; a finite piece uses `in_thread` and
  plain loops so it ends and the renderer knows its length.
- **Envelope times are in beats**, not seconds: `attack: 0.12` at 118 bpm is 60 ms. Sound effects run at `use_bpm 60`
  so their times are seconds.
- **`play_pattern_timed`** stretches each note's `sustain:` to the next note; pass `sustain: 0` for natural envelopes.
  Rests are `:r`. The studio's own notation (`parse_notes` in `_lib.rb`: `F5:q. E5:e r:e Bb4+D5:h@70`) is clearer for
  written lines.
- **`with_fx` outside the loop**, never inside a per-note loop (a new reverb per note eats CPU and sounds different; a
  big room keeps each alive for about ten seconds). Wrap a whole part. An FX block that returns tears its reverb down
  under the parts: the block sleeps until the piece ends.
- **Chords and scales**: `chord(:f4, :major7)`, `chord_degree(2, :f, :major, 4)`, `scale(:f3, :major, num_octaves: 2)`,
  `.invert`, `.tick`/`.look` on rings, `ring.invert_around` (v5).
- **Humanising.** Seeded (`use_random_seed`) so every render is the same. Amplitude jitter of 5 to 10 percent and timing of
  5 to 15 ms; drums and bass tight, the lead looser; `with_swing -0.08, 2` for a light shuffle. Vary `vel:` and `hard:`
  on the piano note by note. Parts draw their random numbers through one helper every pass, sounding or not, so a
  stem's stream is the same whether or not it sounds.
- **Shaping a line.** Louder at the top of a phrase, softer at its end; a pickup into a section; the fifth of the next
  chord just before a change leads the ear. The hook with a new ending (A, A') before the B section.
- **Controlling running synths.** `s = play ...; control s, note: 65, note_slide: 0.2` for slides and vibrato;
  `with_fx :lpf do |fx| control fx, cutoff_slide: 4, cutoff: 110 ... end` for filter sweeps.
- **Samples**: `sample :bd_pure, amp: 0.8, rate: 0.9`; `rate:` changes pitch and length; `start:`/`finish:` slice; the
  envelope can only shorten. Load them up front with `load_samples [...]`. Sonic Pi plays WAV, FLAC and OGG from a path;
  **not MP3** here, whatever the docs say. **A wrong sample path plays nothing and says nothing much**: check every path
  before a render.
- **Names that may not be variables or defines**: `line`, `spread`, `on?` and every other Sonic Pi function name (the
  preparser refuses the whole run). Sharps are written `Fs6`, not `F#6`.
- **`run_file` cannot load the library**: it starts the file as a separate run and the definitions are not there in
  time. Tracks use `eval File.read(...)`.
- **Random melodies on demand** (a seeded `.shuffle` of a scale, `one_in(2)` for rhythm) are a way to find material, not
  to ship it. We write the tunes.
- **Grains scheduled one by one under 10 ms apart come late** in the headless engine ("can't keep up") and smear into a
  tail: chop one noise with `:slicer` (`probability` for random grains) instead. `use_debug false` helps "can't keep up".

## Levels learnt by measurement

- `play 60` at amp 1 records at about -13 dBFS peak: levels are set by measurement, not by the numbers in the code.
- A fight piece with the same voices as a place piece needs about **twice the master level** (its parts are short and
  percussive): fight pieces at 1.0, place pieces at 0.6, then measure (2026-10-15).
- **`:blade` is quiet as a lead**: at the same amp about 10 dB less power than the flute's sine. A fiddle line leading
  alone wants 3.5 to 4.5 times the flute's amp, but pushed that hard it turns harsh ("too noisy", 2026-10-15). Where a
  section is quiet, give the line to a voice that is naturally present (bells, the flute); if the blade must lead loud,
  darken it first (a lower cutoff, no saw layer).
- **The saw horn reads quiet too**: through its low-pass, 4 to 6 dB under the flute at the same amp. A horn carrying a
  tune wants about 1.6 times the flute's amp; a low horn about 2 times.
- **Measure every new section's bars against the section before it**: a "lift" that measures quieter is a hole. The
  renderer's bar table shows the form (intro quiet, A, A' louder, B loudest, the bridge quiet, A again).
- `:piano`, `:pluck` and `:kalimba` envelopes only shorten; a held note on them is a repeated note.

## Limits

Sonic Pi plays very evenly (a wooden Debussy); there is no convincing wind or sax; `:pluck` only plays whole tones;
renders are real time; the engine's message is one UDP datagram (about 64 KB), so a long note list is read from a file at
run time, not written inline.

## Sources

- The v5 release: in-thread.sonic-pi.net/t/sonic-pi-v5-released/10033 and the changelog on GitHub.
- The installed tutorial: 5.4 Threads, 5.7 Cue and Sync, 6.2 FX in Practice, 7.3 Sliding, 8.2 Chords, 8.3 Scales, 9.4
  Ticking, A.1 Tips, A.4 Synth Riffs, A.18 Additive and A.19 Subtractive Synthesis; the examples `sorcerer/bach.rb`,
  `illusionist/ocean.rb`, `magician/ambient.rb`.
- Forum threads: structuring songs (7501, 5792), humanisation (2393), piano sound (4735), recording from code (949, 4674),
  FX in loops, "what genre is Sonic Pi best suited for".
- arXiv 2508.05473: code models handle Sonic Pi better than other music languages, but rank their candidates by how the
  code reads, not how it sounds: measure the render, always.
