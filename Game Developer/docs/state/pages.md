# The pages, and how the pane tests them (2026-11-20)

One page so far: the game. The dev server is the entry `game` in `..\..\..\.claude\launch.json` (the root's, which the
Game Developer's chat uses): `npm --prefix "Game Developer" run dev`, on port 5178 (Zite holds 5173, MrDriver 5174).

| Address | What it is for |
| --- | --- |
| `http://192.168.0.43:5178/` | Robin's phone on the home Wi-Fi. His save lives there; never opened or reloaded by the AI |
| `http://localhost:5178/?mute=1` | the AI's pane, on the page's own clock |
| `http://localhost:5178/?mute=1&drive=1&seed=tide` | the AI's pane for a test: a fresh game on a known seed, the clock stopped, moved by `window.dev.step(n)` |
| `http://localhost:4178/` | `npm run preview`: the built page, the one that installs (from this PC only; a phone needs the public page) |

`?seed=NAME` starts a new game on that seed and overwrites the pane's save. `?drive=1` stops the page's clock after
its first frame; `window.dev.step(n)` then takes n world steps and draws each.

## A test in the pane, the way that worked

The pane is usually hidden while the AI works: its own clock barely runs and a screenshot can time out. So:

1. Set the pane to 412 by 915, open the drive address, send a `resize` event, `window.dev.step(5)`.
2. In one call (under 45 seconds), make the fingers and step the page:
   - a tap: `mousemove`, `mousedown`, `mouseup` on the canvas at the design point (the canvas fills the pane, so
     a design point is a client point);
   - a hold: a `touchstart` with a `Touch` of its own identifier, `touchmove`, then `touchend` with empty `touches`;
   - `window.dev.step(n)` between them; then read `window.dev.holder.state` and compare with what the rules give.
3. A field point's place on the glass: `point - camera.midPoint + (206, 457.5)`.
4. For a picture: step once, then take the screenshot; if it times out, step again and retry. A wait on
   `requestAnimationFrame` can hang for good in a hidden pane: never await one.
5. The console keeps errors from half-saved files during editing; `window.dev.log.errorCount` is the page's own count.
6. Set the pane back to its own size when done.

What cannot be judged this way: how it feels, and anything timed by the page's own clock. Say so in the report.
