# The screen, as it stands (the control test, 2026-11-20)

`client\` is a Phaser 4 page in TypeScript, built by Vite as an installable page. It draws what the rules say and
turns fingers into intents; it decides nothing about the game. All of it is Victor, GD's unless it says Robin.

## The files

| File | What it holds |
| --- | --- |
| `client\index.html` | the page: phone viewport, no zoom, the canvas fills the screen |
| `client\src\main.ts` | starts Phaser, loads or makes the game, the frame log, saves when the page is put away, `window.dev` |
| `client\src\layout.ts` | the name, the design size (412 by 915), `RES`, the stand-in colours, what is drawn over what |
| `client\src\local-game.ts` | the holder: the state and the dice, even steps from uneven frames, the save |
| `client\src\controls.ts` | the three ways to steer: fingers into intents |
| `client\src\scenes\BootScene.ts` | paints the sand's tile once; starts play |
| `client\src\scenes\PlayScene.ts` | the one screen: wires fingers, the holder and the two views; the camera |
| `client\src\view\world-view.ts` | the field: the ground, the hero, the crabs, the marks and the small effects |
| `client\src\view\hud.ts` | the glass: bars, the scheme switch, the target's name, the skill buttons, the stick, the menu |
| `client\src\game-log.ts` | the frame log and error log Robin can save from the menu |
| `client\src\settings.ts` | sound off, fewer effects, which hand; in localStorage under `drok.settings` |

## How a frame goes

`PlayScene.update`: the controls read the held finger and send the push; the holder turns the frame's time into
steps of 1/60 s (at most 6 a frame; a longer stall is dropped); the two views draw. The field is drawn between the
last two steps (`holder.prev`, `holder.alpha`), so walking is smooth on a 90 or 120 Hz screen. Everything that lasts
is drawn from the state (where things are, a wind-up, a stun, the target's ring); only one-shots come from events (a
number, a puff, the sword's arc, the Cleave's sweep, the Charge's streak).

## Sharp on a dense screen

The canvas is the design size times `RES` (the screen's pixel ratio, capped at 2: 824 by 1830). Two cameras draw it,
both zoomed by `RES`, so everything is placed in design units: the main one follows the hero over the field, the
second stands still and draws the glass. Each object belongs to one camera (`glass.ignore`, `field.ignore`, through
the `reg` function each view is given). The cap at 2 is a guess for 60 frames a second; the frame log on Robin's
phone says whether 2.6 fits.

## The three ways to steer (`controls.ts`; Robin, 2026-11-19)

1. **Tap**: a tap on the sand sends `moveTo`, with a ring where it landed; a tap within 26 units of a crab's body
   sends `target`, and he walks up to it.
2. **Hold**: while a finger is down he walks towards it (the push grows from 0.35 to full between 14 and 54 units
   from him) and stands when he is under it; the rules pick the nearest crab.
3. **Stick**: a ring appears where the thumb comes down; the push is how far the thumb is from its middle (reach
   46, a 7 unit dead middle); past its reach the ring comes along, so turning back is quick; the rules pick the
   nearest crab.

In all three: the glass's buttons get a press first; the steering finger lets go only when that finger lifts, or
when the page loses the screen; the push is sent the frame it changes; three fingers are tracked, so one can press a
skill while another steers. (Zite2's lesson 62.)

## The glass (`hud.ts`)

Top left: the menu button, health and rage. Top right: the switch 1 Tap, 2 Hold, 3 Stick. Under it: a line of help
for seven seconds, then the target's name and health. Bottom corner: Cleave and Charge in an arc (Robin, 2026-11-20:
skills in an arc in the bottom corner), Cleave where the thumb rests because it is pressed most; each shows its
cooldown as a dark wedge and a number; a refused press says why above them. The menu: crabs (1 to 8), which hand
(the arc mirrors), effects, save the log, start over, close. A tap beside the menu closes it and does not reach the
field.

## The save and the settings

The holder writes `drok.save` (the state and where the dice are) every five seconds and when the page is hidden or
put away; on load the thumb's push and the tap's place are let go. `drok.settings` holds sound off, fewer effects and
which hand. Neither is Robin's when made in the AI's pane: never reload his page, never touch his save.

## For scripts (`window.dev`)

`holder` (the state, `act(intent)`), `log`, `phaser`, `rules`, `res`, and `step(n)` with `?drive=1`. `docs\state\pages.md`
has the addresses.

## What it costs

The built page is 1.41 MB of script (372 kB gzipped), nearly all of it Phaser; no pictures, no sound. The first
load's budget is 3 MB with art and sound (`docs\platform.md`).
