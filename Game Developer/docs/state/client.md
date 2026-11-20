# The screen, as it stands (chapter 1 with the first art drop, 2026-11-20)

`client\` is a Phaser 4 page in TypeScript, built by Vite as an installable page. It draws what the rules say and
turns fingers into intents; it decides nothing about the game. All of it is Victor, GD's unless it says Robin.
Since 2026-11-20 it is drawn with Leonard, AD's pieces: `client\src\art.ts` holds one switch a drop,
`view\figures.ts` draws his figures and single pictures, `view\glass.ts` his bars, buttons and panels, and
`docs\state\art.md` says what is drawn from his art and the few small things that are still plain shapes. Every
view keeps its plain stand-in drawing for when a switch is off. There is no sound yet. Where this file below
describes a box, a disc or a colour, it describes the stand-in; the places and what can be pressed are the same,
but for the sea chart, which with his art fills the whole screen.

## The files

| File | What it holds |
| --- | --- |
| `client\index.html` | the page: phone viewport, no zoom, the canvas fills the screen |
| `client\src\main.ts` | starts Phaser, loads or makes the game, the frame log, saves when the page is put away, `window.dev` |
| `client\src\layout.ts` | the name, the design size (412 by 915), `RES`, the stand-in colours, what is drawn over what |
| `client\src\local-game.ts` | the holder: the state and the dice, even steps from uneven frames, the real clock for the rules, the save in and out |
| `client\src\controls.ts` | steering: a tap and a dragged thumb into intents; a tap on a thing walks him there to use it |
| `client\src\art.ts` | one switch for each of the Art Director's drops, and which picture belongs to which piece of gear |
| `client\src\scenes\BootScene.ts` | paints the four stand-in grounds once (sand, grass, rock, cobble); loads the art that is switched on, each picture with its data; starts play |
| `client\src\scenes\PlayScene.ts` | the one screen: wires fingers, the holder, the views and the windows; the camera; export and import |
| `client\src\view\world-view.ts` | the place: ground, props, dock, chest, stall, the people who stand about, the hero, the monsters, the loot, the small effects |
| `client\src\view\figures.ts` | a figure from an atlas: its action, its facing (eight, three of them mirrored), its frames by time; the hero with his gear on his hand, arm and head; a single picture from a set |
| `client\src\view\glass.ts` | the Art Director's pieces for the glass: a piece, a piece stretched without bending its corners, a bar, the ink colours for words on his panels |
| `client\src\view\hud.ts` | the glass: level and money and the top buttons; at the bottom the skills and the potion, his health and rage, who he fights, the button for the thing he stands by |
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

**Steering** (`controls.ts`; Robin, 2026-11-20, after playing: tap to move is good, and a simple way to move freely
must be there at the same time). One way, no switch:

- **A tap** on the ground walks him there; on a monster (within 26 of its body) makes it his target and he walks up
  to it; on the chest, the stall or the dock walks him there and uses it on arrival.
- **A drag** anywhere on the field is a stick: once the thumb has slid 10 units, a ring appears where it came down
  and the push is how far the thumb is from it (reach 46, a dead middle of 7; past its reach the ring comes along).
- A touch is a tap until it has slid, and **a tap is acted on when the thumb lifts** (mine): acted on the moment it
  comes down, every drag would first send him a step towards the thumb. A second finger on the field is always a
  tap, so one thumb can steer while the other picks who he fights.
- A button appears while he stands by a thing: "Open chest", "Trade", "Sea chart".

## The glass (`hud.ts`)

Robin, 2026-11-20: bag, chart and character as small buttons at the top; and after playing: "the buttons should be
in the middle at the bottom", and health, his and the monsters', easier to glance at, "maybe at the bottom". How
the bottom is stacked is mine.

Top left: the settings button, his level, a coin and his money. Top right: Bag (turns orange when full), Chart,
Hero. Under them a line of help for seven seconds. In the middle at the bottom, from the floor up:

| What | Where (the middle of each, of 412 by 915) |
| --- | --- |
| experience | a bar 200 long at y 901, drawn at 0.72 of the Art Director's size |
| Charge, Cleave, the potion with its count | discs at x 122, 206, 284, y 851 (the potion 859); the "left hand" switch turns the row round; each shows its wait as a dark wedge and a number |
| rage | a bar 184 long from x 122, at y 800, at 0.8 of his size |
| health, with its numbers and a heart on its left end | a bar 200 long at y 775, at 1.3 of his size: the biggest thing in the pile; pale what a blow just took |
| who he fights: name, level, health | a plate 200 long at y 733; on its foot, at y 748, the monster's own dark bar with the gold rim (its fill 172 long as drawn, the whole bar 184, inside the plate); only while he has a target |
| the button for the thing he stands by | at y 683; only while he stands by one |
| a refusal ("Not enough rage") | words at y 645 |

Where things stand is mine; how big each is drawn is Leonard, AD's (2026-11-20): two red bars of one length, one
over the other, were his health and the monster's, and could be taken for each other. Now the dark bar is always
the monster's, on the plate as over its head.

None of it but the discs and the button takes a press: a tap on a bar goes through to the field. Because the pile
covers the bottom, **the camera looks 60 below him** (`LOOK_BELOW` in `PlayScene.ts`), so he is drawn at about y
397, in the middle of what is left to see; and it may look 110 below a place's foot (`FOOT` in `world-view.ts`,
where the ground picture's last row of sea is drawn out), so on a dock he stands above the pile, not under it.
A banner for a new place or level and "Down! Lost N gold" are in the upper half as before.

Over a monster's head: its health, 44 or more long, when it is hurt or is the one he fights: Leonard, AD's dark
well, the red inside, pale what a blow just took. The one he fights has the gold rim, a fifth bigger, and an arrow
that bobs once a second (not with "fewer effects"). The bar hangs at one height for the kind, 12 above the top of
its standing picture (14 for the one he fights), so it does not jump when a claw goes up. A blow's number rises
beside the bar, not over it. The stick is his ring and knob, drawn at full strength.

## The windows (`panels.ts`)

One at a time, rebuilt whole from the state whenever something in it changes. The world goes on behind them; a bite
closes the open window so he can answer it.

- **Bag**: 20 places in rows of five, each piece edged in its rarity's colour, a green mark on a piece better than
  what he wears. A tap shows its name, what it gives, what he wears now, what the stall gives; then Wear, Sell
  (at the stall only), Drop.
- **Hero**: level and experience, health, a swing's damage, armour, money and potions, the four things he wears
  with "Take off", what he has felled, how often he fell.
- **Sea chart**: with Leonard, AD's chart it fills the screen: a pin on each place, a ring and "You are here" on
  the one he is in, the dotted way between, and a yellow button "Sail to …" at the foot (dim, and it says "Sail
  from the dock", when he does not stand on one). A tap on the other place's pin sails too. The cross at the top
  right closes it; there is no "beside it" to tap. The stand-in chart is a window like the others.
- **Stall**: the three pieces with what he wears beside them and a price, the potion, "Sell from your bag".
- **Settings**: steering, which hand, effects, export save, import save, save the log, start over (asks twice).

## The save and the settings

The holder writes `drok.save` every five seconds and when the page is hidden or put away; on load the thumb's push
and the tap's place are let go. "Export save" hands the same text to the player as a file; "Import save" reads one
and, if it is a save, puts it in this game's place without reloading the page. Neither is Robin's when made in the
AI's pane: never reload his page, never touch his save.

## For scripts (`window.dev`)

`holder` (the state, `act(intent)`, `pack()`, `unpack(text)`), `log`, `phaser`, `rules`, `res`, `ready()` (true once
the play screen stands, which with art to load is not at once), and `step(n)` with `?drive=1`. `docs\state\pages.md`
has the addresses and the way a test is run.

## What it costs

The built page is 1.47 MB of script (396 kB over the wire), nearly all of it Phaser, and 1.5 MB of the Art
Director's pictures with their data; no sound yet. The service worker caches all of it, 3.0 MB in 39 files
(pictures and their data; his notes are left out): with the server gone the page still opens. The first load is
1.9 MB over the wire, of the 3 MB set for art and sound together (`docs\art-demands.md`), so the sound has about
1 MB. All the pictures are loaded when the game starts, about 62 MB once decoded; by place it would be 46 at most
(`docs\state\art.md`, "What it costs").
