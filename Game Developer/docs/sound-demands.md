# What sound the game needs, in what order, for Hugh, SD

The Game Developer's list of what to make, in waves, each wave tagged with its chapter; the budgets at the top are the
Game Developer's to set and confirm (Robin, 2026-11-01 in Zite: "the GD needs to confirm what sizes sounds and music
can be"). How the game plays them is in `docs\state\sound.md` once it exists. The studio looks in the common library
first (`..\..\Sound Director\library\INDEX.md`) and makes new only what it lacks.

## The budgets (GD, 2026-11-19; mine until felt)

- **Format**: _OGG Vorbis 48 kHz (effects mono, music stereo) for the phone; WAV bundled as JS for a page played from
  disk (the browser starter's `tools\pack.js`)_.
- **Effects**: _short sounds as one audio sprite per wave with a map; a sound under N KB; two to four variations_.
- **Music**: _a loop of whole bars, seamless; the title loop under N MB; a place's theme N to N seconds and under N MB_.
- **The first load**: _under N MB with art_. **Levels**: peak under -1 dBFS, the mix around -18 to -24 dBFS RMS.
- **The speaker**: _a phone's (the tune in the middle register) or a computer's_.

## Wave 1 (chapter 1): the first taps and the first place

| Sound | Plays when | Kind | Three versions? |
| --- | --- | --- | --- |
| The tap | any button | UI, from the library | no |
| The hit | the core verb lands | effect, library first | no |
| The first place | on the first screen, looped | music | yes: three one-minute pieces, Robin picks |
| The win and the loss | the loop's end | stings | no |

## Wave 2 (chapter 2): _headline_

_…_

## Rules for every piece

Delivered whole into `out\<name>\` with the WAV or OGG, the gains, the loop points, a NOTES.md and an MP3 into the
chat; on Robin's sound board page; inside the budgets or asked first; any song as three versions first.
