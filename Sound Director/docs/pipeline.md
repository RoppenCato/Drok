# Pipeline: how a piece is made, rendered, checked and delivered

Sonic Pi 5.0.0 with its own Ruby, the engine at 48 kHz; Node 24 for the tools; ffmpeg for the encodes and the LUFS
measure. `tools\paths.json` says where they are on this PC; `tools\README.md` lists every tool with its command. Nothing
here touches `C:\dev\Drok\Game Developer`.

## The tools, in short

| Command | What it does |
| --- | --- |
| `tools\sonicpi-play.cmd FILE.rb [SECONDS] [--silent]` | boots a headless engine, plays the file **audibly** for N seconds (default 20), prints every log and error line; exit 1 on any error; `--silent` for an error check without sound. |
| `tools\sonicpi-gui.cmd FILE.rb` / `-e CODE` / `--stop` | sends code into Robin's **open Sonic Pi app**. Use it instead of the player while his app is open: two engines fight over the sound device. |
| `node tools\render-track.js FILE.rb [--quick] [--deliver] [--out DIR]` | the track renderer: records two passes, cuts the seamless loop, measures, prints every bar's loudness, writes `manifest.json`; `--quick` one pass and no seam; `--deliver` copies into `out\music\<name>\`. |
| `node tools\render-sfx.js FILE.rb [--deliver]` | records a sound file, splits it at the silences into its variations, trims and normalises each, writes `<name>_N.wav` and a manifest. |
| `node tools\wavtool.js info\|onset\|loopcut\|cut\|seam\|bars\|trim\|split\|diff\|sum ...` | the measurements and cuts (run it bare for the list). |
| `ffmpeg -i FILE -af ebur128 -f null -` | the LUFS of a file. |

`tools\record.rb` is the recorder behind the renderers. Sonic Pi's own `headless-record.rb` writes nothing on Windows (it
talks UDP to an engine that records over TCP), so ours asks the spider to record the way the app's Rec button does. The
sound starts about 0.9 s into the file (1.4 s with `set_sched_ahead_time! 1`, which the tracks set so a heavy first bar
is not late). After the stop the engine takes seconds to close a big take; the recorder waits and asks again until
the file is there. The boot gets 45 s; "the engine did not come up" means the audio device is busy or gone.

**Silence (Robin, 2026-10-14: no sound while the studio works).** `--silent` (the renderers pass it by default;
`--audible` to hear a render) mutes the engine's own Windows audio session right after boot (`tools\appmute.ps1`) and
unmutes it at the end; the record tap sits before the mute. Windows remembers an app's mute, so a run that died before
unmuting leaves the engine silent until `tools\unmute.cmd` is run with an engine running. Silent runs use the studio's
own Sonic Pi home (`work\sp-home`) so their logs stay apart from Robin's.

## A track

The source is `music\<place>\<name>.rb`, started from `music\_template.rb`. Its shape:

1. **A header** in comments: the place and what the piece is for, then the lines the renderer reads (`# name:`, `# bpm:`,
   `# bars:`, `# beats:`, `# stems: full`), then the form as a table of bars, the hook as note names, and what changed
   from any earlier version.
2. `eval File.read('C:\dev\Drok\Sound Director\music\_lib.rb')` loads the shared library (single quotes, so the
   backslashes stay): the instruments as lambdas `|note, beats, amp|`, the percussion, the notation (`parse_notes` for
   `F5:q. E5:e r:e Bb4+D5:h@70`, `sym_chord` for `Dm7`, `F/A`, `C7`), `hum` (seeded jitter), `shape` (phrase loudness),
   `play_line`, `stem_on?` and `marker`. `run_file` cannot do this: it starts the library as a separate run and the
   definitions are not there in time. A fight piece loads `music\_fight.rb` after it.
3. `STEM = :full` and `PASSES = 1`, exactly so: the renderer rewrites them. `SEED`, `MASTER` (the whole mix's level),
   `use_bpm`, `set_sched_ahead_time! 1`, `BARS`, `TOTAL`, the chord list, `section(b)`.
4. **The written lines** as strings in the notation, eight bars to a string, and `written STR, BARS, INST, AMP` which
   checks the length (a wrong bar count prints `LINE LENGTH` in the log and would drift every part after it).
5. **The parts**: `part_lead`, `part_bass` ... Each runs all the bars of one pass, computes everything and calls `hum`
   for every event it could play, and sounds only when `stem_on?(:tag)`. The bass part prints `bar N` to the log.
6. **The piece**: `marker` (a 6 ms click at beat one of pass one, outside every FX, the renderer's anchor), then threads
   that each open an FX room, start their parts inside it and sleep until the end (an FX block that returns tears its
   reverb down under the parts). Parts loop `PASSES.times`.

The conventions learnt the hard way are in `docs\sonic-pi-notes.md`.

## Rendering a loop

`node tools\render-track.js music\<place>\<name>.rb`: rewrites `PASSES = 2`, records `2L + 5` seconds to
`work\<name>\full_raw.wav`, finds the marker (the first sample above -40 dBFS) and cuts the second pass `[t0 + L, t0 + 2L)`
to `work\<name>\full.wav` as 16-bit, so the tails of the last bar lie under the first bar. It prints the peak, the RMS,
the seam step and the loudness of every bar. Two passes of a 90-second loop take about three and a half minutes, in real
time. Run it in the background and read `work\<name>\render.log`.

The numbers to pass (`docs\rules.md` section 2): peak under -1 dBFS, RMS -22 to -16 dBFS, the seam step under 0.5 %FS,
the bar table showing the form (intro quiet, A, A' louder, B loudest, the bridge quiet, A again). A section quieter than
its neighbour is a hole and goes back to the source. Then `ffmpeg -i work\<name>\full.wav -af ebur128 -f null -` for the
LUFS against the GD's number.

**The seam.** `loopcut` blends the loop's last 40 ms toward the end of pass one, which runs straight into the loop's
first sample, so the step is small whatever is sounding. Still, write the last bar so nothing with a strong fundamental
crosses the loop point (`docs\rules.md`). `--quick` renders one pass and cuts from the onset: for a first listen and
the levels, in half the time; not seamless.

**Many renders in a row.** Only one engine can run at a time. A small `work\queue.sh` runs the lines of
`work\queue.txt` one after another (each a render command) and stops at a line `END`; lines are added before `END` while
it runs. Start it in the background with its log: `bash work\queue.sh > work\queue.log 2>&1`. Read each finished job's
bar table before writing its notes.

**A ramp and a loop.** A boss or a fight that ramps up is two sources: `<name>-intro.rb` (rendered with
`--quick --out work\<name>-intro`) and `<name>.rb` (rendered with `--deliver`); the delivery holds both and a
`listen.mp3` (the ramp, then the loop twice) so Robin hears the join.

## A sound effect

**The library first.** `node tools\fetch-common-sounds.mjs --list`, then
`node tools\fetch-common-sounds.mjs <name> ... --to sfx\<category>\ref\library` copies the named sounds with their JSON
(`library\INDEX.md` has the names and Robin's picks). A copy is re-levelled with the set (below), renamed as this game
names it, and its origin, licence and Robin's verdict go in `NOTES.md`.

**A new sound.** The source is `sfx\<category>\<name>.rb` from `sfx\_template.rb`: `use_bpm 60` (times in seconds), a
`define` per sound taking a variation number, three layers at most (`sfx\_kit.rb` has the strike layers; load it with
`eval File.read('C:\dev\Drok\Sound Director\sfx\_kit.rb')`), and at the bottom the variations played in a row with
a second of silence between them. The header has `# name:`, `# seconds:` (the whole run) and `# count:`.
`node tools\render-sfx.js FILE.rb` records it once, splits at the silences (regions above -50 dBFS separated by at least
0.3 s), trims each to -60 dBFS with 2 ms before and 10 ms after, normalises the peak to -1 dBFS and writes
`work\sfx\<category>\<name>_N.wav` with a manifest; `--deliver` copies to `out\sfx\<category>\`. Then
`node tools\sfx-measure.js work\sfx\<category>\<name>_*.wav` and read the numbers against the brief. **Check every
sample path before a render**: Sonic Pi plays nothing and says little when a path is wrong.

**A set written from one spec.** `sfx\_make.py` is the pattern: one Python file holds every sound of a set (name,
description, gap, the layer calls) and writes `sfx\<category>\<name>.rb` for each, so every source has the same header,
kit and variation loop. `python -I sfx\<category>\_make.py`, then render each (the queue does all of them).

**Decoding recordings to measure them.** Sonic Pi plays WAV, FLAC and OGG (not MP3). Play the files one by one on a slot
grid in a small file under `work\decode\` (`load_sample` them first, `sleep 2`, then `at [k * slot]`, slots of 3 s or
more), render it with `render-sfx.js`, read piece N as recording N; cut the hits to layer into `ref\cut\`.

**A set levelled against itself.** Copy the masters to `out\sfx\<category>\`, write the spec
`sfx\<category>\_levels.json` (`{ "<name>": { "target": dB against the anchor, "max": seconds, "use": "..." } }`) and run
`node tools\sfx-level.js out\sfx\<category> sfx\<category>\_levels.json --weighted --anchor <anchor file>:<its gain>`.
It makes the files mono, holds each sound to its length, normalises every file to -1 dBFS and writes a gain per sound
into `out\sfx\<category>\<category>.json`. **The anchor is the first set delivered for this game** (write its path here
with the date: `out\sfx\<category>\<name>_1.wav:1.0`); when it moves to the archive, keep levelling against it there.
`--only a,b` processes only those sounds and leaves the rest of a set the game already plays untouched.

**A preview.** `node tools\sfx-preview.js out\sfx\<category> out\sfx\<category>\preview.wav sfx\<category>\_tour.json`
(the timeline: `[[seconds, "name", variation, extra gain], ...]`, in the order the game would play them), then
`node tools\mp3.js` on it.

**The sprite for the game.** `node tools\sprite.js sfx\<category>\_sprite.json out\sfx\<category>\game` packs the
levelled masters into one `<wave>.ogg` (48 kHz mono, quality 4, 50 ms gaps, the set's peak at -3 dBFS, 5 ms fades) with
`<wave>.json` in the spritemap form the game loads, and every sound as a loose OGG beside them. The spec lists name,
file, gain and loop per sound, the names as the game gives them. The sprite is scaled by a fixed -2 dB, never per
sprite, so the levels between sprites hold.

## Delivery

```
out\music\<name>\     full.mp3 (to listen), <name>.ogg (the game's file), manifest.json (bpm, bars, loop_seconds,
                      loop_frames, sample_rate, peak, rms), <name>.rb (the source), NOTES.md; intro.* for a ramp
out\sfx\<category>\   <name>_1.wav ... (the masters), <category>.json (every sound, its files, lengths, gain),
                      preview.mp3, NOTES.md, game\<wave>.ogg + <wave>.json (the sprite), ref\README.md (licences)
```

`NOTES.md` says what it is, what changed and why in Robin's words, the measurements (peak, RMS or LUFS, the seam, the
bar table or the band shares), every file's size, the loop length in samples, how the game plays it, what is for Robin's
ear, what he decided and when. Then: the files **into the chat** (SendUserFile), the phone page republished, a line in
`docs\log.md`, the rows in `docs\catalog.md` and `docs\feedback.md`, a message to Victor, GD with the paths and the
names. Victor, GD copies the folder whole into the game.

## The phone page and the viewer

**The phone page** is `viewer\listen.html`, published as a claude.ai artifact (the Artifact tool: this file as
`file_path`, the audio as `files`). Its JSON block lists the tabs and the rows; the comment at its top says how to publish
and update. Write the page's URL here once it exists: **(the URL)**. Republish the same file with the audio under
`files` to update it; files passed are added or replaced, files left out are kept, `null` removes one.

**The local viewer** (`tools\viewer.cmd`, http://localhost:8778/ or the port in `tools\paths.json`) serves
`viewer\index.html` with everything under `out\`: every track with a `manifest.json`, played as the game would, with the
bar count, the per-bar loudness, the notes and the source; every sound with a JSON, a button per variation; grouped by
`out\music\catalog.json` (group, title, status, verdict, a line per delivery; kept by hand). A delivery is complete when
it shows there and on the phone page.

## Studies of the inspiration tracks

`node tools\transcribe.js "Inspiration\<file>.mp3"` then `node tools\study.js work\study\<slug>` (the skill
`study-song`). Transcription runs on the CPU (about two minutes a song); not beside a render, which needs the CPU to
keep time. `npm install` in the studio folder once.

## Known faults

- **No playback device, no engine.** When the only output is the monitor's audio and the display sleeps, Windows has no
  playback device, the engine logs `Error opening Primary Sound Driver: "No driver"` and renders fail with "the engine
  did not come up". Keep the screen awake; check with `Get-PnpDevice -Class AudioEndpoint` (an output must show `OK`).
  Nothing in the studio can fix it.
- **Two engines.** Robin's open Sonic Pi app and a studio render fight over the device: use `sonicpi-gui.cmd` while his
  app is open, or wait.
- **Long tracks and the log.** Sonic Pi logs every synth call; a long track writes more than 1 MB, which was Node's
  default buffer; the renderers allow 1 GB. A render that dies with no error in the log: look here first.
- **A very long take may not save** (a 555 s recording ran to the end and then failed to save). Keep a take under about
  200 s; decode long sources in several takes.
- **A quick and a full render start from different onsets**, so quick files are not comparable sample for sample.
- **`work\` is scratch**: renders, takes and logs can always be made again from the sources. When it grows, gather what
  is finished into `work\_old-renders-<date>\` with a README for Robin to delete; keep `work\sp-home\` and the queue.
