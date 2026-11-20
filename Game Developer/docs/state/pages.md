# The pages, and how the pane tests them (2026-11-20)

One page so far: the game. The dev server is the entry `game` in `..\..\..\.claude\launch.json` (the root's, which the
Game Developer's chat uses): `npm --prefix "Game Developer" run dev`, on port 5178 (Zite holds 5173, MrDriver 5174).

| Address | What it is for |
| --- | --- |
| `http://192.168.0.43:5178/` | Robin's phone on the home Wi-Fi. His save lives there; never opened or reloaded by the AI |
| `http://localhost:5178/?mute=1` | the AI's pane, on the page's own clock |
| `http://localhost:5178/?mute=1&drive=1&seed=tide` | the AI's pane for a test: a fresh game on a known seed, the clock stopped, moved by `window.dev.step(n)` |
| `http://localhost:4178/` | the built page, the one that installs (from this PC only; a phone needs the public page). The entry `built` in the root's `launch.json` serves it after `npm run build`. To check offline: open it, wait for the service worker, stop the server, open it again |

`?seed=NAME` starts a new game on that seed and overwrites the pane's save. `?drive=1` stops the page's clock once
the play screen stands; `window.dev.step(n)` then takes n world steps and draws each. With art to load the play
screen does not stand at once: `window.dev.ready()` says when it does.

## A test in the pane, the way that worked

The pane is usually hidden while the AI works: its own clock barely runs and a screenshot can time out. So:

1. Set the pane to 412 by 915 and open the drive address. Wait for the art: in a hidden pane the page's own clock
   barely runs and the loader works on that clock, so push it by hand until the play screen stands:
   `for (let i = 0; i < 400 && !dev.ready(); i++) { dev.phaser.step(performance.now(), 16.7); await new Promise(r => setTimeout(r, 15)); }`.
   Then send a `resize` event and `window.dev.step(5)`.
2. In one call (under 45 seconds), make the fingers and step the page:
   - a tap: `mousemove`, `mousedown`, `mouseup` on the canvas at the design point (the canvas fills the pane, so
     a design point is a client point);
   - a hold: a `touchstart` with a `Touch` of its own identifier, `touchmove`, then `touchend` with empty `touches`;
   - `window.dev.step(n)` between them; then read `window.dev.holder.state` and compare with what the rules give.
3. A field point's place on the glass: `point - camera.midPoint + (206, 457.5)`.
4. For a picture: step once, then take the screenshot; if it times out, step again and retry. If it keeps timing
   out (it did after another tab was closed), load the page afresh and take the picture in the same call as the
   steps. A wait on `requestAnimationFrame` can hang for good in a hidden pane: never await one.
5. A field point that lies under a skill button is the button's: in the harbour the dock's lower half is under
   them, so tap the dock's top (its place on the glass at about y 700).
6. The console keeps errors from half-saved files during editing; `window.dev.log.errorCount` is the page's own count.
7. Set the pane back to its own size when done.

What cannot be judged this way: how it feels, and anything timed by the page's own clock. Say so in the report.
