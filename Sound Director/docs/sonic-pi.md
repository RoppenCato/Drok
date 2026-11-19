# Sound: Sonic Pi, recordings, and what Node or Python does (Clive, GD, 2026-11-04)

How the Survival game's Sound Director (Derek, SD, `C:\dev\SG\Sound Director`) works: when a sound is made in Sonic Pi,
when it is a downloaded recording, when a script makes or finishes it; how the studio runs Sonic Pi headless and records;
the tools and where they live. The studio has made the game's music and some 400 sound files this way since 2026-10-14.

The one fact everything follows from: **nobody in the project can hear but Robin.** The studio measures, compares at
matched loudness, delivers candidates, and Robin picks by ear on a board. A sound that nobody heard is a candidate, not a
delivery.

## When to use what

| Use | For | Why |
| --- | --- | --- |
| **Sonic Pi** | music (every track), ambience pads and drones, UI blips and tonal cues, anything with a pitch or a tune | it is code: a tune is written, varied, rendered to stems, cut to a seamless loop and re-rendered after a change; the AI handles it well |
| **A downloaded recording** (CC0 or "free for any use": Kenney, OpenGameArt, BigSoundBank, Freesound with the licence checked) | impacts, flesh, foley, footsteps, weather, water, animals, doors, cloth | Robin picked a plain recording over a layered synth nearly every time (nine of nine in one round); a real strike is irregular and dull, a synth one is clean and wrong |
| **Sonic Pi layered over a recording** | a hit that needs weight, a magic sound with a real core | lead with the recording, layer only to fix it (add weight, a snap, a tail); the recording stays the loudest moment |
| **Node or Python** | levelling, trimming, splitting, measuring, loop cutting, bundling, previews, MP3s for the phone; a quick sfxr-style burst (noise through an envelope and a filter) when nothing else fits | the measurements are how a studio that cannot hear judges; a script does them the same way every time |

Write down the licence and the origin of every recording at delivery, not later (`ref/README.md` in the set, `CREDITS.md`
in the game). The AI never downloads from a site that needs a sign-in or a terms click; Robin does that himself.

## How Sonic Pi is run headless (Windows, Sonic Pi 5)

Sonic Pi 5 ("SuperSonic", 2026) is three processes: the daemon (boots the rest, prints ports and a token), the spider (the
Ruby language server: code in over UDP, logs and errors back) and SuperSonic (the engine, OSC over TCP, 48 kHz). The
studio's tools, copied into this studio's `tools/` (the originals are SG's `Sound Director\tools\`):

| Tool | What it does |
| --- | --- |
| `sonicpi-play.cmd FILE.rb [SECONDS]` (`sonicpi-play.rb`) | boots a headless engine, plays a file audibly for N seconds, prints every log and error line, shuts down; exit 1 on any error; `-e "play 60"` for inline code |
| `sonicpi-gui.cmd FILE.rb` | sends code into Robin's open Sonic Pi app (ports and token from `~\.sonic-pi\log\gui.log`); the output shows in the app |
| `sonicpi-record.cmd OUT.wav SECONDS FILE.rb [SEED]` (`record.rb`) | records to 48 kHz 24-bit WAV **in real time** (there is no faster-than-real-time render; the forum confirms it) |
| `appmute.ps1`, `unmute.cmd` | mutes the engine's own Windows audio session while it records, so the studio makes no sound while Robin works (his rule, 2026-10-14); a run that dies before unmuting leaves it silent until `unmute.cmd` |
| `node tools/render-track.js FILE.rb [--stems a,b] [--quick] [--deliver]` | the track renderer: records each stem, cuts the seamless loop, measures, writes `manifest.json`; `--deliver` copies to `out/music/<name>/` |
| `node tools/render-sfx.js FILE.rb [--deliver]` | records a sound file, splits it at the silences into its variations, trims and normalises each, writes `<name>_N.wav` and a manifest |
| `node tools/wavtool.js info\|onset\|loopcut\|cut\|seam\|bars\|trim\|split\|diff\|sum` | the measurements, no dependencies |
| `node tools/sfx-level.js SET LEVELS.json` | makes a delivered set mono, holds each sound to its length, normalises peaks, and levels the sounds against each other with a gain per sound (the hit = 0 dB, hearing-weighted) |
| `node tools/sfx-measure.js FILE...` | the numbers a strike is judged by: length, attack, decay, spectral centre, energy per band, weighted loudness |
| `node tools/sfx-preview.js SET OUT.wav TIMELINE.json` | lays a set's sounds on a timeline at their gains, for a listening pass |
| `node tools/mp3.js IN.wav [OUT.mp3]` | an MP3 for the phone or the chat (lamejs, pure JavaScript) |
| `node tools/serve.js` | the studio's viewer: `viewer/listen.html` lists the deliveries with a player, on localhost |
| `node tools/transcribe.js`, `study.js`, `recreate.js` | a reference track to notes (Spotify's Basic Pitch in TensorFlow.js), to a structure and chords, to a Sonic Pi playback with the studio's voices; for study only, never delivered |

Things learnt the hard way, in one line each: Sonic Pi's own `headless-record.rb` writes nothing on Windows (it talks UDP
to an engine that records over TCP), so `record.rb` asks the spider to record the way the GUI's Rec button does; the sound
starts about 0.9 s into a recording (the schedule-ahead time), so the renderer finds the first onset and cuts from there; a
big take needs seconds to close, so the recorder waits and asks again; envelope times are in beats, not seconds; `line`,
`spread` and other Sonic Pi names may not be variables; the first use of a sample loads it (a hitch unless `load_samples`
runs first); `play 60` at amp 1 records at about -13 dBFS, so levels are set by measurement, never by ear; never rely on
the limiter.

## A track, in short

Source `music/<place>/<name>.rb` from a template: a header of metadata the renderer reads (`# name:`, `# bpm:`, `# bars:`,
`# beats:`, `# stems:`), a shared library of instruments and notation (`_lib.rb`), `STEM` and `PASSES` lines the renderer
rewrites, written lines as strings in a plain notation (`F5:q. E5:e r:e Bb4+D5:h@70`), parts that compute everything every
pass and sound only when their stem is on (so the stems sum to the mix), a marker click at beat one of pass one, and the
piece in threads inside FX blocks. A loop render records two passes and cuts pass two out, so the tails of the last bar lie
under the first. Delivered: `out/music/<name>/` with `full.wav`, `full.mp3`, the stems, `manifest.json` (bpm, bars,
seconds, loudness per stem), `NOTES.md`; a `catalog.json` and a `HANDOFF.md` over the drop.

**Robin's rule for songs (the brief of 2026-11-04): any song asked for, a theme, a zone, anything, comes as three different
versions of about a minute each**, so he can test and say what he likes. The studio delivers all three with MP3s for the
phone, and the game plays the one he picks.

## A sound effect, in short

- Three or four **variations** of every sound (`<name>_1.wav` ...), never the same one twice running in the game.
- A **recipe letter** on the name: `a` a plain recording, `v` the studio's layered version, `b`, `c`, `w`, `x`, `y` other
  candidates. Robin picks one; the others stay as candidates in the studio's `out/`.
- Every file 48 kHz 16-bit mono, peak -1 dBFS; every sound has a **gain** in its JSON, levelled against the set's anchor
  (the combat hit at 0 dB) by a hearing-weighted measure of its loudest 50 ms. The game plays a sound at its gain.
- An impact is four or five layers in their own frequency slots: a transient (1 to 10 ms, broadband), a body (what was hit,
  150 Hz to 1.5 kHz, the anchor), a sub (how heavy, under 100 Hz), detail (what flew off, 2 to 8 kHz, may land late), a tail
  (almost none for a game tool). Set the body first; one layer owns the low end; line the transients up; detail is a flavour.
- A swing is a low-mid "whoom" that builds to the contact, never a high hiss. A hit's slap sits in 1 to 4 kHz and is its
  loudest moment; a thump with no slap reads as "a bump" (Robin's word for the first hits). Repeated sounds (talk, taps)
  sit a few dB under what he first liked, or they wear.
- The game aligns a hit's loudest moment to the contact frame (the bundler measures where the peak comes).
- Delivered: `out/sfx/<set>/` with `<name>_N.wav`, `<name>.json` (name, category, gain, use, the variations' seconds and
  peak), `<set>.json` (every sound), `NOTES.md` (why, what was built from what, the measurements), `preview.mp3` (a tour),
  `ref/README.md` (licences). The game bundles the picked names into one script per set (`tools/sfxjs.js`, base64 WAVs,
  gains and peaks) and plays them with a small player (variations, gain, pitch jitter, peak alignment, fade out).

## Where the sound board is

In the Survival game Robin picks sounds in the Combat Arena's "The sounds" panel (every candidate beside the game's own
synthesized sound, played on a blow) and listens to tracks in the studio's `viewer/listen.html`. The template's
`sites/listen.html` (from Zite) is the board to copy. Test pages open with `?mute=1`, because Robin hears the AI's browser
pane and cannot silence it.

## Alternatives the studio researched (2026-10-22), not adopted

A score (JSON or Python) rendered offline through MIDI and FluidSynth or sfizz, faster than real time, with sampled
instruments; Strudel or SuperCollider through an MCP server; a DAW driven through MCP; generative audio models for effects.
Every serious project agrees on the checks (peak, RMS, LUFS, matched loudness, silence, clipping) and that musical quality
still needs a listener. The studio stayed with Sonic Pi for the tune and recordings for the strikes.

## What is in the template, and what stays in SG

| What | Where | Note |
| --- | --- | --- |
| `record.rb`, `sonicpi-play.rb`, `sonicpi-record.cmd`, `sonicpi-play.cmd`, `sonicpi-gui.cmd`, `appmute.ps1`, `unmute.cmd`, `render-track.js`, `render-sfx.js`, `wavtool.js`, `sfx-level.js`, `sfx-measure.js`, `sfx-preview.js`, `mp3.js`, `sprite.js`, `serve.js`, `transcribe.js`, `study.js`, `recreate.js`, `test-hello.rb` | this studio's `tools/`, with `tools/README.md` (one line and the command each) and `tools/paths.json` (where Sonic Pi, ffmpeg and the viewer's port are on this PC) | plain Node and Ruby; `transcribe.js` needs `npm install` (Basic Pitch, 300 MB) and is only for a game with reference tracks to study |
| `music/_lib.rb`, `music/_template.rb`, `music/_fight.rb` (the instruments, the notation, the track shape), `sfx/_kit.rb`, `sfx/_template.rb`, `sfx/_make.py` | this studio's `music/` and `sfx/` | change the instruments for the new game's colour |
| `docs/pipeline.md`, `docs/sfx-notes.md`, `docs/sonic-pi-notes.md`, `docs/direction.md`, `docs/rules.md` | this studio's `docs/` | the shape to fill; the Survival game's own are in `C:\dev\SG\Sound Director\docs\` (`sound-direction.md`, `maple-guide.md`, `research-tools.md`) |
| `library/INDEX.md` and `tools/fetch-common-sounds.mjs` | this studio | the sounds Robin's games already have, taken by name |
| The deliveries (`out/sfx`, `out/music`, hundreds of MB) | `C:\dev\SG\Sound Director\out\` | never copied whole: take named sounds with the fetch script |

Needs: Sonic Pi 5 installed (`C:\Program Files\Sonic Pi`, its own Ruby inside; set it in `tools/paths.json`), Node 20 or
later, ffmpeg for `mp3.js` if `lamejs` is not installed.
