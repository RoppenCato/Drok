---
name: study-song
description: Take an inspiration track (an MP3 Robin drops into C:\dev\Drok\Sound Director\Inspiration) apart to learn how it is built: transcribe it with Basic Pitch, analyse tempo, key, chords, bass, lead and phrases into Sonic Pi code and a report, and write what it teaches. Use when Robin says "study X", "convert X to Sonic Pi", "how is X built", "listen to this and learn from it", or names a track in the Inspiration folder. Never for the game.
---

# Study a song

Never put any of it in the game: these are other people's pieces, taken apart to learn from. The tools need
`npm install` in the studio folder once (Basic Pitch and TensorFlow.js, about 300 MB).

1. `node tools\transcribe.js "Inspiration\<file>.mp3"` (about two minutes on the CPU; no Sonic Pi engine needed; not
   beside a render), then `node tools\study.js work\study\<slug>`. Read the printed tempo and key; if the tempo is a half
   or double of what the track plainly is, rerun with `--bpm`.
2. Read `STUDY.md` and the lines in `<slug>.rb`: where the bass enters, the chord loop and what degree bar one sits on,
   the lead's rhythm and range, the density arc, which phrases return and when, what the cadences do. The model hears
   pitches, not instruments: the voicing is a guess, the tune, chords and form are trustworthy.
3. Write **What it teaches** under the report: five or six numbered points, each a thing the piece does and what it
   means for this game's themes. Say what is a guess (instruments always are).
4. Copy the folder to `docs\studies\<slug>\` (make `docs\studies\README.md` with a table of the studies on the first
   one), add a line to `docs\log.md`. A rule that holds across studies goes into `docs\direction.md` as a proposal for
   Robin.
5. If Robin wants to hear the transcription: `tools\sonicpi-play.cmd` the `.rb` (audible), or
   `node tools\recreate.js work\study\<slug>` for a version with the studio's own voices, recorded with
   `tools\record.rb --silent`, encoded with `tools\mp3.js` and sent into the chat.
