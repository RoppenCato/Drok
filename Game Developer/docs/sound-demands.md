# What sound the game needs, in what order, for Hugh, SD

The Game Developer's list of what to make, in waves, each wave tagged with its chapter; the budgets at the top are the
Game Developer's to set and confirm (Robin, 2026-11-01 in Zite: "the GD needs to confirm what sizes sounds and music
can be"). How the game plays them will be in `docs\state\sound.md` once the audio layer exists. The studio looks in
the common library first (`..\..\Sound Director\library\INDEX.md`) and makes new only what it lacks.

The control test (before chapter 1) is silent. Hugh, SD's chat starts when chapter 1 is planned (Robin, 2026-11-20).

## What Robin decided (2026-11-20; the brief has his words)

- **Music**: no reference. Three different one-minute pieces for the title in a vibrant pirate mood; Robin picks.
- **Effects**: the common library of recorded sounds from his other games first; new ones only for what it lacks.
- The game is vibrant pirate: bright seas, green islands, colourful crews and beasts.

## The budgets (Victor, GD, 2026-11-20; mine until confirmed with Hugh, SD)

- **Format**: OGG Vorbis 48 kHz; effects mono, music stereo.
- **Effects**: one audio sprite per wave with a JSON map; a sound under 40 KB; two to four variations of anything
  heard often (the swing, the hit, a step), so the grind does not sound like one sample.
- **Music**: a loop of whole bars, seamless; the title loop under 1 MB; a place's theme 60 to 120 seconds and under
  2.5 MB.
- **The first load**: under 3 MB with the art; music for a place loads when he sails there, not before.
- **Levels**: peak under -1 dBFS, the mix around -18 to -24 dBFS RMS.
- **The speaker**: a phone's. The tune in the middle register; nothing that lives under 250 Hz.
- **How often**: this is a grinder. The swing is heard every 0.8 seconds and the hit as often; they must stay
  pleasant for an hour.

## Wave 1 (chapter 1): the harbour and the first island

| Sound | Plays when | Kind | Three versions? |
| --- | --- | --- | --- |
| The title | on the title screen, looped | music | yes: three one-minute pieces, Robin picks |
| The swing and the hit | every auto-attack, every 0.8 s | effect, library first, 3 or 4 variations | no |
| Cleave and Charge | the two skills | effect | no |
| A step on sand | walking | effect, quiet, variations | no |
| The crab | its wind-up, its bite, its fall | effect | no |
| The pickup | loot flies to him; brighter by rarity | effect, one per rarity | no |
| The chest | opening | effect | no |
| The level-up | a level gained | sting | no |
| Falling | he goes down | sting | no |
| The tap | a button on the glass | UI, from the library | no |
| The island and the harbour | in each place, looped | music | yes, when the title's direction is picked |

## Hugh, SD's first session (Victor, GD, 2026-11-20)

Your chat could not be started from Robin's phone session, so this stands in for the brief I would have sent.

Robin is away and has asked not to be asked anything until chapter 1 is done. His words to me on 2026-11-20: "Make a
list of things to do to finish chapter 1. Then work through the list until you are done. Including tests. I dont need
to approve or answer any questions until you are done. Let AD handle the art you need. I approve." He spoke of the
art, not the sound, so for sound his picks above stand: decide what is yours to decide, mark it "mine", deliver, and
leave his pick of the three title pieces waiting for him. Ask him nothing.

In this order:

1. Your setup as your `CLAUDE.md` describes it: `tools\paths.json`, the library index, the budgets above copied into
   `docs\game-notes.md`; `docs\direction.md` filled from the brief with your own choices marked "mine".
2. Wave 1's effects as one audio sprite (OGG, mono, 48 kHz) with its map and gains, in `out\sfx\wave1\`, with a
   NOTES.md and a preview MP3. The names the game will play: `swing` and `hit` (three or four variations each),
   `cleave`, `charge`, `hero_hurt`, `hero_down`, `monster_windup`, `monster_bite`, `monster_die`, `gull_cry`, `slam`,
   `pickup_gold`, `pickup_item`, a brighter `pickup_rare`, `chest_open`, `level_up`, `potion`, `buy`, `sell`,
   `equip`, `sail`, `tap`, `refuse`. Message me when it is in `out\`; tell me the map's form and I wire to it.
3. Three different one-minute pieces for the title (skill `three-songs`), on the phone page for Robin. Do not finish
   one; the pick is his.
4. If time remains: a quiet loop each for the harbour town and the island, as candidates.

The game today: `..\Game Developer\docs\chapters.md` and `docs\state\rules.md`. The monsters are a sand crab, a reef
gull that bites and backs off, and a big coconut crab with a slow slam. The game has no audio layer yet; I build it
when your first sprite lands.

## Wave 2 (chapter 2): gear worth hunting for

The sound of a rare drop landing on the ground (the moment the grind is for); equipping; the first uniques' skills.

## Rules for every piece

Delivered whole into `out\<name>\` with the WAV or OGG, the gains, the loop points, a NOTES.md and an MP3 into the
chat; on Robin's sound board page; inside the budgets or asked first; any song as three versions first.
