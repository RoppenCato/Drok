# A 2D game on a phone, in the browser, installable (Miles, GD, 2026-11-04)

Zite's platform: Chrome on Android first (Robin, 2026-10-31: "if it's easier we can do Android only to start"), a
Progressive Web App built with Vite, Phaser 4 for the drawing, the rules in TypeScript tested in Node. The starter is
`starters\phone-pwa\`.

## When this platform fits

Short sessions, one thumb, play anywhere, friends by a link, nothing to install from a store. A board game, a card
game, a puzzle or arcade game of short rounds, an idle game, a fight-by-taps game. Not for a game that needs a keyboard,
a big view or a long sitting; that is `browser-desktop.md`.

## The stack

| Piece | Choice | Why |
| --- | --- | --- |
| Drawing | Phaser 4 (4.2.1 in Zite): WebGL, scenes, input, tweens, audio, sprite batching | One codebase for phone and browser; PixiJS is the lighter alternative (a renderer only) if Phaser's weight ever shows |
| Language | TypeScript, strict | The rules and the client share types; the typecheck catches what tests do not |
| Build | Vite with `vite-plugin-pwa` | A dev server a phone on the LAN can open; an installable build with a manifest and a service worker |
| Rules | `rules\`: `apply(state, action, rng, now) → { state, events }` | Pure; tested headless with Vitest; the client draws from events |
| Save | `localStorage` under one key with `STATE_VERSION` and a migration a step | Solo play; the account is the save once there is a server |
| Hosting | Cloudflare Pages, free, static | `npm run build && npx wrangler@4 pages deploy dist --project-name <name> --branch main --commit-dirty=true`, run by Robin (the login is his) |
| Server, later | One Node process on Robin's PC: `ws` for sockets, SQLite (`better-sqlite3`), a Cloudflare Tunnel for HTTPS | The same `rules\` package; one actor per region of the world; the shape of a Durable Object, so it can move later |

## How it is run

- `npm run dev`: Vite at `http://localhost:5178/`, and on the LAN for a phone (Robin's PC: `http://192.168.0.43:5178/`;
  find it with `ipconfig`). In the browser pane through `.claude\launch.json` (entry `game`), or start it in the
  background and open the URL. Drok has its own port, 5178, set in `vite.config.ts` and both `launch.json` files, because
  Zite's dev server holds 5173 on this PC (Victor, GD, 2026-11-19).
- Every page the AI opens gets `?mute=1`.
- `npm run build` into `dist\`; `npm run preview` serves the built app at `http://localhost:4178/`, the one that installs.
- `window.dev` (the starter) or `window.boardWorld` (Zite) exposes the game holder, the log, Phaser and the rules to
  the pane, so a test can act on the game without clicking.

## How it is tested

1. `npm test`: Vitest over `rules\test` (and `server\test` when there is a server). The purity test keeps the rules away
   from `Math.random`, `Date`, timers, the DOM and the network.
2. `npm run typecheck`: strict, `rules\tsconfig.json` (no DOM) then the whole.
3. The bots (`tools\sim-*.ts` in Zite): a sensible player through the whole game with many seeds, printing walls and
   numbers a person reads. Every balance change runs them.
4. The browser pane at 412 by 915 (the mobile preset): show the pane first, a screenshot cropped at full size, the
   console read for errors. A tool call into the page stays under about 45 seconds.
5. Robin's phone: the LAN link while he is home, the public site otherwise; the frame log and the error log the player
   can download (a button in the settings). Every message tells him exactly what to tap.

## How Robin plays, and his size

Portrait, 412 by 915 design pixels (his phone's CSS size), scaled with `Scale.FIT`. Taps and holds; nothing smaller than
a thumb (44 px). A tap answered within a frame (Robin, 2026-11-01: a press squashes and pops with a tick). He installs
from Chrome's prompt (`beforeinstallprompt`); after a deploy the service worker can serve the old build for a load or
two: close and reopen the page.

## How it is published

Cloudflare Pages: `https://<project>.pages.dev`. Robin runs the deploy command above; the AI then checks the live
`index-*.js` hash against `dist\index.html` and tests the live site in the pane (with `registration.update()` and a
reload when the service worker lags). A Play Store listing later is a Trusted Web Activity round the same PWA
(Bubblewrap), or Capacitor. iOS brings its own rules (no `BarcodeDetector`, storage dropped after 7 days unused, manual
install, sockets dropped silently): keep them in mind, build for Android first.

## What it costs on a phone

Phaser's bundle is about 1.4 MB (360 kB gzipped); the first load should stay under 3 MB with art and sound (Zite's
budget). 60 fps on a middling phone: few texture atlases, every frame trimmed, no canvas read-back in the loop, no
per-frame blur or filter, bake what can be baked, a "fewer effects" switch, memory counted in decoded pixels. Sound as
OGG sprites per wave with a JSON map, music loops under 2.5 MB each.

## Co-op, if the game wants it

Keep the rules pure and the client sending intents from day one, and co-op is a later chapter, not a rewrite: one owner
per piece of state; every action carries a client-made id and a repeat gets the stored answer; the server rolls every
die that matters; deadlines (timestamps), never countdowns; a full snapshot with a version on join, then deltas;
out-of-turn and duplicate actions rejected; a timed-out turn auto-played; the world keeps moving when a player drops.
The research with sources is Zite's `C:\dev\Zite\Game Developer\docs\coop-research.md` and its skill `shared-world`.

## Questions this platform adds to the questionnaire

Portrait or landscape; taps only or swipes too; install from the first build or later; the LAN link or the public
site for friends; a server from chapter 1 or later; whether iOS matters at all.
