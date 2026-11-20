# The screen, as it stands (chapter 1's game side, 2026-11-20)

`client\` is a Phaser 4 page in TypeScript, built by Vite as an installable page. It draws what the rules say and
turns fingers into intents; it decides nothing about the game. All of it is Victor, GD's unless it says Robin.
Every shape on it is a stand-in until the Art Director's pieces land, and there is no sound yet.

## The files

| File | What it holds |
| --- | --- |
| `client\index.html` | the page: phone viewport, no zoom, the canvas fills the screen |
| `client\src\main.ts` | starts Phaser, loads or makes the game, the frame log, saves when the page is put away, `window.dev` |
| `client\src\layout.ts` | the name, the design size (412 by 915), `RES`, the stand-in colours, what is drawn over what |
| `client\src\local-game.ts` | the holder: the state and the dice, even steps from uneven frames, the real clock for the rules, the save in and out |
| `client\src\controls.ts` | the three ways to steer: fingers into intents; a tap on a thing walks him there to use it |
| `client\src\scenes\BootScene.ts` | paints the four grounds once (sand, grass, rock, cobble); starts play |
| `client\src\scenes\PlayScene.ts` | the one screen: wires fingers, the holder, the views and the windows; the camera; export and import |
| `client\src\view\world-view.ts` | the place: ground, pier, chest, stall, the hero, the monsters, the loot, the small effects |
| `client\src\view\hud.ts` | the glass: bars, level and money, the top buttons, the skills and the potion, the button for the thing he stands by |
| `client\src\view\panels.ts` | the windows: bag, hero, sea chart, stall, settings |
| `client\src\game-log.ts` | the frame log and error log Robin can save from the settings |
| `client\src\settings.ts` | sound off, fewer effects, which hand; in localStorage under `drok.settings` |

## How a frame goes

`PlayScene.update`: the controls read the held finger and send the push; the holder turns the frame's time into
steps of 1/60 s (at most 6 a frame; a longer stall is dropped) and hands each the real clock; the views draw. The
place is drawn between the last two steps (`holder.prev`, `holder.alpha`), so walking is smooth on a 90 or 120 Hz
screen. Everything that lasts is drawn from the state (where things are, a wind-up, a slam's ground, a stun, the
target's ring, what he wears, whether the chest is full); only one-shots come from events (a number, a puff, the
sword's arc, the Cleave's sweep, the Charge's streak, "+gear"). When the state's place changes, the field view takes
the old place down and puts the new one up, and the camera gets the new edges.

## Sharp on a dense screen

The canvas is the design size times `RES` (the screen's pixel ratio, capped at 2: 824 by 1830). Two cameras draw
it, both zoomed by `RES`, so everything is placed in design units: the main one follows the hero, the second stands
still and draws the glass and the windows. Each object belongs to one camera, through the `reg` function each view
is given. The cap at 2 is a guess for 60 frames a second; the frame log on Robin's phone says whether 2.6 fits.

## Fingers

An open window gets them first; then the glass; then the field. The glass's buttons act on the press (a skill must
answer at once); a window's buttons act when the finger lifts on them, because saving and choosing a file need that
from a phone's browser; a tap beside a window closes it. The steering finger lets go only when that finger lifts,
or when the page loses the screen or a window opens. Three fingers are tracked.

The three ways to steer are the control test's (Robin, 2026-11-19): 1 Tap, 2 Hold, 3 Stick, now on a switch in the
settings because he has not picked one; tap is the default, as his brief says. In scheme 1 a tap on the chest, the
stall or the pier walks him there and uses it on arrival. In every scheme a button appears while he stands by a
thing: "Open chest", "Trade", "Sea chart".

## The glass (`hud.ts`; Robin, 2026-11-20: skills in an arc in the bottom corner; bag, chart and character at the top)

Top left: the settings button, then health (with numbers), rage and experience, his level and his money. Top right:
Bag (turns orange when full), Chart, Hero. Under them: a line of help for seven seconds, then the target's name,
level and health. Bottom corner: Cleave where the thumb rests, Charge above it, the potion (with its count) beside
them; each shows its wait as a dark wedge and a number. The button for the thing he stands by sits on the other
side. Words that come and go: a refusal ("Not enough rage", "The bag is full"), a banner for a new place or level,
"Down! Lost N gold".

## The windows (`panels.ts`)

One at a time, rebuilt whole from the state whenever something in it changes. The world goes on behind them; a bite
closes the open window so he can answer it.

- **Bag**: 20 places in rows of five, each piece edged in its rarity's colour, a green mark on a piece better than
  what he wears. A tap shows its name, what it gives, what he wears now, what the stall gives; then Wear, Sell
  (at the stall only), Drop.
- **Hero**: level and experience, health, a swing's damage, armour, money and potions, the four things he wears
  with "Take off", what he has felled, how often he fell.
- **Sea chart**: the places on a sea, "You are here", "Tap to sail" when he stands on a dock.
- **Stall**: the three pieces with what he wears beside them and a price, the potion, "Sell from your bag".
- **Settings**: steering, which hand, effects, export save, import save, save the log, start over (asks twice).

## The save and the settings

The holder writes `drok.save` every five seconds and when the page is hidden or put away; on load the thumb's push
and the tap's place are let go. "Export save" hands the same text to the player as a file; "Import save" reads one
and, if it is a save, puts it in this game's place without reloading the page. Neither is Robin's when made in the
AI's pane: never reload his page, never touch his save.

## For scripts (`window.dev`)

`holder` (the state, `act(intent)`, `pack()`, `unpack(text)`), `log`, `phaser`, `rules`, `res`, and `step(n)` with
`?drive=1`. `docs\state\pages.md` has the addresses and the way a test is run.

## What it costs

The built page is 1.45 MB of script (385 kB gzipped), nearly all of it Phaser; no pictures, no sound. The service
worker caches all of it: with the server gone the page still opens. The first load's budget is 3 MB with art and
sound (`docs\platform.md`).
