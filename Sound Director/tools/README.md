# The tools

One line and the command for each. `tools\paths.json` says where Sonic Pi and ffmpeg are on this PC and which port the viewer uses; the `.cmd` files carry the Sonic Pi folder in a line at their top. Everything else is relative to the studio folder. `docs\pipeline.md` says how they fit together.

| Tool | What it does | Command |
| --- | --- | --- |
| `sonicpi-play.cmd` (+ `.rb`) | plays a Sonic Pi file through a headless engine, audibly, for N seconds; prints every log and error line; exit 1 on an error. `--silent` to check for errors without sound. | `tools\sonicpi-play.cmd FILE.rb [SECONDS] [--silent]`, `-e "play 60"`, `-` for stdin |
| `sonicpi-gui.cmd` (+ `.rb`) | sends code into Robin's open Sonic Pi app (ports and token from its `gui.log`); use it while his app is open, since two engines fight over the sound device | `tools\sonicpi-gui.cmd FILE.rb`, `-e CODE`, `--stop` |
| `sonicpi-record.cmd` | records a file to a 48 kHz 24-bit WAV in real time through `record.rb` | `tools\sonicpi-record.cmd OUT.wav SECONDS FILE.rb [SEED]` |
| `record.rb` | the studio's recorder: asks the spider to record the way the app's Rec button does (Sonic Pi's own `headless-record.rb` writes nothing); `--silent` mutes the engine's audio session while it records | `ruby.exe tools\record.rb -o OUT.wav -d SECONDS -f FILE.rb [-s SEED] [--silent]` |
| `appmute.ps1` | mutes or unmutes one program's Windows audio session (the per-app volume), nothing else | `powershell -ExecutionPolicy Bypass -File tools\appmute.ps1 mute\|unmute\|list "Sonic Pi - SuperSonic"` |
| `unmute.cmd` | unmutes the engine after a silent run that died before unmuting (an engine must be running) | `tools\unmute.cmd` |
| `render-track.js` | the track renderer: records two passes, cuts the seamless loop at the marker, measures, prints the loudness of every bar, writes `manifest.json`; `--quick` one pass, no seam; `--deliver` copies to `out\music\<name>\` | `node tools\render-track.js music\<place>\<name>.rb [--quick] [--deliver] [--out DIR] [--audible]` |
| `render-sfx.js` | records a sound source once, splits it at the silences into its variations, trims and normalises each, writes a manifest; `--deliver` copies to `out\sfx\<category>\` | `node tools\render-sfx.js sfx\<category>\<name>.rb [--deliver]` |
| `wavtool.js` | the measurements and cuts: info, onset, loopcut, cut, seam, bars, trim, split, diff, sum (run it bare for the list) | `node tools\wavtool.js info FILE.wav` |
| `sfx-level.js` | levels a set against itself: mono, held to length, peak -1 dBFS, a gain per sound from a spec of targets; `--weighted` as the ear hears, `--anchor FILE:GAIN` against a sound the game already plays | `node tools\sfx-level.js out\sfx\<set> sfx\<set>\_levels.json --weighted --anchor out\sfx\<first>\<name>_1.wav:1.0` |
| `sfx-measure.js` | the numbers a strike is judged by: length, attack, decay, centre, the four band shares, weighted loudness | `node tools\sfx-measure.js work\sfx\<set>\<name>_*.wav` |
| `sfx-preview.js` | lays a set's sounds on a timeline at their gains, for listening | `node tools\sfx-preview.js out\sfx\<set> out\sfx\<set>\preview.wav sfx\<set>\_tour.json` |
| `mp3.js` | WAV to MP3 for listening (ffmpeg when lamejs is not installed) | `node tools\mp3.js IN.wav [OUT.mp3] [KBPS=160]` |
| `sprite.js` | packs a wave's levelled sounds into one OGG audio sprite with a spritemap JSON, plus every sound as a loose OGG | `node tools\sprite.js sfx\<set>\_sprite.json out\sfx\<set>\game` |
| `serve.js`, `viewer.cmd` | the local viewer on http://localhost:<port>/ (serves `viewer\index.html` and `out\`) | `tools\viewer.cmd` or `node tools\serve.js [PORT]` |
| `transcribe.js` | an inspiration track to notes (Basic Pitch on the CPU, about two minutes a song; needs `npm install`) | `node tools\transcribe.js "Inspiration\<file>.mp3"` |
| `study.js` | the notes to the piece's structure: tempo, key, chords, bass, lead, phrases, as Sonic Pi code and a report | `node tools\study.js work\study\<slug> [--bpm N]` |
| `recreate.js` | a study's notes played with the studio's own voices, to hear a transcription | `node tools\recreate.js work\study\<slug>` |
| `transcribe-all.cmd` | transcribes and studies every track in `Inspiration\` not yet done | `tools\transcribe-all.cmd` |
| `test-hello.rb` | four bell notes: the smallest test that the engine works | `tools\sonicpi-play.cmd tools\test-hello.rb 3` |
| `fetch-common-sounds.mjs` | fetches sounds from the common library (`library\INDEX.md`); written by Clive, GD | see its header |

Not in this folder: `work\queue.sh` (made per game, `docs\pipeline.md`) runs renders one after another, since only one engine can run at a time.
