---
name: make-sfx
description: Make a sound effect for Drok (a tap, a step, a hit, a swing, a spell, a monster's cry, a pickup, a chest, a fanfare, a menu sound): the common library first, then from recordings, layered and rendered in Sonic Pi. Use when Robin or Victor, GD says "make a sound for X", "the hit needs more weight", "we need a dragon roar", "the tap is too sharp", or a wave of the game's sound-demands.md is due. Writes the source under sfx/<category>/, renders variations to out/sfx/<category>/ with gains, a sprite, notes and a preview.
---

# A sound effect

Never touch `C:\dev\Drok\Game Developer`. Read section 6 of `docs\direction.md`, `docs\sfx-notes.md` and
`docs\pipeline.md` first. The names, the count and the length come from the game's `docs\sound-demands.md`.

## 0. The common library first (Robin, 2026-11-01)

Before anything is made, look in `library\INDEX.md` (`node tools\fetch-common-sounds.mjs --list`): the recordings and the
sounds Robin picked by ear in his other games. A sound that fits is **fetched, not remade**:
`node tools\fetch-common-sounds.mjs <name> --to sfx\<category>\ref\library`, then copied into `out\sfx\<category>\`
under this game's name, re-levelled with the set (step 5), with its origin, Robin's verdict on it and its licence in
`NOTES.md`. Say in the notes which sounds came from the library and which were made new. Only what the library lacks goes
on to step 1. Measure a library sound's band shares before it ships for a phone (`docs\sfx-notes.md` section 8).

## 1. What the sound must do, and its reference

- Write in the source's header what happens on screen, when the game plays it (at the blow, at a landing), how long it
  may be, what must be heard first. If the game has its own version, say why it misses.
- **From a reference, always** (Robin, 2026-10-15): a recording Robin likes, or candidates for him to pick from.
  Synthesis from Sonic Pi's built-ins alone missed every time it had no reference. He picks the plain recording nearly
  every time: lead with the best single recording, layer only to fix it.
- If nothing on disk fits, look online for free recordings (CC0 first: Kenney, OpenGameArt, BigSoundBank, qubodup; the
  itch.io packs that allow use in games). **List each download for Robin (name, source, licence, size) and wait for his
  yes.** Each pack goes into its own new folder under `sfx\<category>\ref\`, unchanged, with a credits README. Never a
  site that needs a sign-in or a terms click.

## 2. Get the recordings ready

- **Sonic Pi plays WAV, FLAC and OGG** as samples; **not MP3** on this machine. Windows' own `tar` opens `.7z`.
- **Decode to measure:** play the files one by one on a slot grid in a small file under `work\decode\` (`load_sample`
  them first, `sleep 2`, then `at [k * slot]`, slots of 3 s or more), render it with `render-sfx.js`, read piece N as
  recording N, measure each with `sfx-measure.js`.
- **Cut the hits you will layer** from that decode into `ref\cut\` (each piece starts at its own sound and is
  peak-normalised). Do not use Sonic Pi's `onset:` to pick a hit; do not trust a file's head (some start with 20 to 70 ms
  of silence). Recorded levels differ by 30 dB between packs: layer from normalised pieces.

## 3. Build it in layers

- One `define :one do |v|` per sound, variations by seed (`use_random_seed`, a small `rate:` nudge). Three variations for
  every-turn sounds, one for rare ones (`docs\game-notes.md`).
- Layers each with one job, attacks in the same millisecond: the **front** (the crack, the slap, the knock: under 10 ms,
  above 1 kHz) is the loudest moment; the **body** under it; **weight** only on heavy ones and never leading; a tiny
  **tail**. High-pass the low layers (150 to 200 Hz) on light sounds; a plain low-pass at 6 to 9 kHz keeps it from hiss.
- Short and dry; reverb only where the place has it. No limiter. Tonal sounds (bells, chimes, fanfares) are written in
  the game's key family with the studio's voices from `music\_lib.rb`.
- A set of many sounds is written from one spec with `sfx\_make.py` as the pattern.

## 4. Render, measure, fix

- `node tools\render-sfx.js sfx\<category>\<name>.rb` (silent), then `node tools\sfx-measure.js work\sfx\<category>\<name>_*.wav`:
  length, attack, -30 dB time, centre, the four bands, weighted loudness. Read them against the brief (a slap: attack
  under 5 ms, centre 1 to 2.5 kHz, under a fifth below 250 Hz, under 300 ms; a phone: not 90 % under 250 Hz).
- A slow attack with a fast front means a low layer's peak is louder than the knock: turn it down, do not shift starts.
  A second peak 10 ms later is a flam: one layer starts late (its file's head, or a late-peaking splat).
- Times that matter to the game are checked on the delivered file by its loudest 10 ms, not its peak sample.

## 5. Deliver

- **Sizes are Victor, GD's** (Robin, 2026-11-01): the format, a sprite's size and the first load's weight come from
  the game's `docs\sound-demands.md`, confirmed in `docs\game-notes.md`; ask before any delivery that would not fit.
- Copy to `out\sfx\<category>\`, write the level spec (`sfx\<category>\_levels.json`: targets in dB against the anchor)
  and run `node tools\sfx-level.js out\sfx\<category> sfx\<category>\_levels.json --weighted --anchor <file>:<gain>`
  (the first set delivered for this game is the anchor; `docs\pipeline.md` names it).
- Pack the wave: `node tools\sprite.js sfx\<category>\_sprite.json out\sfx\<category>\game` (one growing sprite per
  wave; a new sound is added to the same spec and the pair rebuilt, so the game's names never move).
- A preview on a timeline (`sfx\<category>\_tour.json`, `tools\sfx-preview.js`, `tools\mp3.js`) in the order the game
  would play them; `NOTES.md` with why, the layers or the recording, the measurements, the gains, the game's use, the
  licences, what is for Robin's ear.
- Send the preview and notes into the chat; put the sounds on Robin's phone page (`viewer\listen.html`); tell
  Victor, GD the paths and the names; log, catalog, feedback.
- **Tell Robin how to test it** (his rule, 2026-10-23): the phone page's tab and row; then the game's screen and moment
  once Victor, GD has wired it. Candidates by letter: his pick becomes the game's.
- **Clear what he turns down:** the unpicked candidates move to `out\_archive\` and off the phone page once his pick is
  in. Never move or rename a file the game plays without telling Victor, GD first.
