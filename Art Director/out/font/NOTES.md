# font  (Leonard, AD, 2026-11-20)

**What it is:** the game's font: Nunito, one file that holds every weight from 200 to 1000.

**Why.** Robin, 2026-11-20, in my chat: "Choose a good font for the game thats clear and easy to read". I chose Nunito
and asked before fetching it; he answered the same day by choice box: "Yes, download it".

Why this one (mine): its letters are round and open, so they stay apart at 13 on a phone; it is friendly without being
a toy; and its bold is as wide as what the phone shows now, so every line that fits today still fits. Measured at 14:
"Health 1420 of 1600" is 133 wide in the font of my earlier pictures, 136 in Nunito bold and 137 in extra bold.

**The numbers:** `Nunito.ttf`, 277 KB. It is the file `Nunito[wght].ttf` from Google's fonts repository, unchanged, only
renamed (square brackets are awkward in an address). `OFL.txt` is its licence and must travel with it.

**How the game uses it:** copy the folder. Declare it once in the page's style, with the whole range of weights, and
name it first in the game's font list:

```
@font-face { font-family: "Nunito"; src: url("art/font/Nunito.ttf") format("truetype"); font-weight: 200 1000; font-display: swap; }
```

`FONT = 'Nunito, system-ui, "Segoe UI", Roboto, sans-serif'`. The game writes everything bold, which is weight 700 in
this file. **I would write at 800** (a text's style `'800'` in place of `'bold'`): at 13 the extra weight helps on the
dark wood of the windows. Phaser measures a text when it is made, so the font must be loaded before the first scene
draws words (`document.fonts.load('800 16px Nunito')` and wait for it), or the first words are measured in the
fallback and sit wrong.

**Open:**
- 277 KB is the whole font: every weight and many alphabets. Cut down to Latin letters at one or two weights it would
  be about 30 KB. The tool for that (fonttools) is not on this PC; installing it is Robin's to allow.
- A second, showier face for titles only ("Hero", a place's name as he walks in). Not chosen; Nunito carries them.

**Not tested:** not in the game, not on a phone. `look.jpg` is drawn by my own tool, which had to be told the weight by
hand; a browser takes it from `font-weight`.

**Origin and licence:** Nunito, copyright 2014 The Nunito Project Authors (https://github.com/googlefonts/nunito), under
the SIL Open Font License, Version 1.1: free to use, bundle and pass on, also in a game that is sold, as long as the
licence goes with it and the font itself is not sold alone. Fetched on 2026-11-20 from
https://github.com/google/fonts/tree/main/ofl/nunito , the licence read there first.

**Where to see it:** `look.jpg`: the hero's window in today's kind of font, in Nunito bold and in Nunito extra bold.
