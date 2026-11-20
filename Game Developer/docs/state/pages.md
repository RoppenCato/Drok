# The pages, and how the pane tests them (2026-11-20)

One page so far: the game. The dev server is the entry `game` in `..\..\..\.claude\launch.json` (the root's, which the
Game Developer's chat uses): `npm --prefix "Game Developer" run dev`, on port 5178 (Zite holds 5173, MrDriver 5174).

| Address | What it is for |
| --- | --- |
| `http://192.168.0.43:5178/` | Robin's phone on the home Wi-Fi. His save lives there; never opened or reloaded by the AI. **A page that is open keeps the code it was opened with**: hot reload is off (`hmr: false` in `vite.config.ts`, since 2026-11-20), so a file saved here never restarts the game under him; he gets a change by reloading the page, and every message that has something new to try says so. Checked in the pane: a mark set on the page was still there after a source file was saved. **It answers only while the dev server runs**, and the app stops that server when this chat has been quiet for a while (on 2026-11-20 it was gone when he came to play). Before the link goes to Robin: start `game` and fetch the link from this PC; say in the message that it lives while the chat does. The lasting link is the public page |
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
3. A field point's place on the glass: `point - camera.midPoint + (206, 457.5)`; the camera's middle is 60 below
   the hero, so he is at about y 397. A tap is acted on at `mouseup`; a `mousedown`, a `mousemove` 10 or more
   away and steps in between make the stick.
4. For a picture: the stopped page draws only when it is stepped, and the screenshot waits for a frame, so keep
   it stepping while the picture is taken: `window.__iv = setInterval(() => dev.step(1), 150);
   setTimeout(() => clearInterval(window.__iv), 9000);` as the last line of the call before the screenshot (it
   worked every time on 2026-11-20, where a bare screenshot timed out four times in five). The world moves on a
   step each time, so set the scene up first. To get a scene that takes long to reach: play up to it, call
   `dev.holder.save()`, then open the drive address without `seed=` (it loads the pane's own save) and take the
   picture. If the canvas comes out bigger than the screen, set the pane's size again, open the page again and
   call `dev.phaser.scale.refresh()`. A wait on `requestAnimationFrame` can hang for good in a hidden pane: never
   await one.
5. A field point that lies under a skill button is the button's (the row is in the middle at the bottom, y 815 to
   887); the bars and the plate over it take no press. From where a new hero wakes, the harbour's dock is on the
   glass at 206, 700.
6. The console keeps errors from half-saved files during editing; `window.dev.log.errorCount` is the page's own count.
7. Set the pane back to its own size when done.

What cannot be judged this way: how it feels, and anything timed by the page's own clock. Say so in the report.
