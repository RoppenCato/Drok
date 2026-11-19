# phone-pwa: the starter for a 2D game in a phone's browser

A small working game in the shape Robin's game Zite uses: the rules as a pure function tested headless in Node, a
Phaser 4 client in TypeScript built with Vite, installable on a phone as a PWA. Copy it in, run it, then grow it.

**The one idea: the game is a pure function.** `rules/` has no rendering and no network: `apply(state, action, rng, now)
→ { state, events }` over a seeded random stream. The client sends **intents** ("move to b2"), never results ("I rolled
a 6"): whatever holds the state rolls the dice and decides. Solo play holds the state in the browser (`client/src/local-game.ts`);
play together holds it on a server with the same `rules/`. Nothing in `rules/` touches the screen, a socket, `Math.random`
or `Date`; a test (`rules/test/purity.test.ts`) refuses it.

## Run it

Needs Node 22.12 or newer.

```bash
npm install        # the dependencies
npm test           # the rules, headless in Node (npm run test:watch keeps it running)
npm run typecheck  # TypeScript strict: rules/tsconfig.json (no DOM), then tsconfig.json (everything)
npm run dev        # Vite at http://localhost:5178/, and on the LAN (5178 is Drok's own port: Robin's other games hold 5173 and 5174)
npm run build      # the PWA into dist/: manifest, icons, service worker
npm run preview    # serves dist/ at http://localhost:4178/, the build that installs on a phone
npm run icons      # remakes the placeholder icons (tools/make-icons.mjs)
```

## On a phone

`npm run dev` prints a second address, `http://192.168.x.x:5178/`: a phone on the same Wi-Fi opens it. Installing
("Add to Home screen", with Chrome on Android asking on its own) needs the real build and HTTPS or localhost:
`npm run build && npm run preview` on the PC, or the `dist/` folder on a static host (Cloudflare Pages is free).

## Judge it at phone size

The design size is 412 by 915, an Android phone in portrait (`client/src/layout.ts`); Phaser fits it into any screen
and centres it. In the Claude desktop app the browser pane opens the game through `.claude/launch.json` (entry `game`)
when the session's folder is this one; otherwise start `npm run dev` yourself and open the address in the pane. Use the
pane's mobile preset or 412 by 915; crop screenshots at full size. Robin's own phone is the final judge: every build he
can try is a link.

From the pane or a script, `window.dev` drives the game: `window.dev.holder.actNow({ type: 'move', player: 'local', to: 'b1' })`
sends an intent and returns the events; `window.dev.log.text()` is the log; `window.dev.rules` is the rules package.

## What it does today

One screen. Three by three squares; you stand on a1. Tap a square next to you: the rules move you there and roll a die
for the gold you find. Tap any other square: the rules reject it and the hint line says why. The game saves to
localStorage after every action and comes back on reload. **Log** downloads the frame log and the error log as a text
file (a phone has no console: this is how Robin tells us what his phone saw). **Effects** and **Sound** are the two
settings, kept in localStorage. **New game** throws the save away.

## Where things live

```
rules/src/types.ts      the state, the actions (intents) and the events
rules/src/rng.ts        the seeded random stream: makeRng(seed), next(), int(n), a state of one number
rules/src/game.ts       newGame({ seed, player }) and apply(state, action, rng, now): the board, tick, move, reject
rules/src/save.ts       STATE_VERSION and migrate(raw): the way up from older saves, null for a broken one
rules/src/index.ts      what the rules export; import from here, never from the files inside
rules/test/             game.test.ts (same seed, rejections, saves), purity.test.ts (the rules stay pure)
client/index.html       the page: phone viewport, no zoom, the canvas fills the screen
client/src/main.ts      Phaser at the design size, the two scenes, the frame log, the tick, window.dev
client/src/layout.ts    the game's name, the design size, the colours, the font
client/src/local-game.ts  holds the state, applies actions through the rules, saves to localStorage (drok.save)
client/src/game-log.ts  the frame log and the error log, downloadable
client/src/settings.ts  mute and fewer effects, in localStorage (drok.settings)
client/src/scenes/      BootScene (loads, then starts play), PlayScene (the screen)
client/public/          the two placeholder icons; files here are served from /
tools/make-icons.mjs    makes the icons with no image package
vite.config.ts          Vite with the PWA plugin and the manifest; vitest.config.ts: the tests' folder
.claude/launch.json     entry "game": npm run dev on port 5178, for the browser pane (the root's ..\.claude\launch.json is the one the Game Developer's chat uses)
```

## Making it yours

1. Done at the setup (2026-11-19): the name `Drok` in `vite.config.ts`, `client/index.html` and
   `client/src/layout.ts`, the package `drok`, the keys `drok.save` and `drok.settings`.
2. Replace the board, the actions and the events in `rules/`; keep every action carrying an `id` and a `player`, keep
   `rejected` with a reason, and keep the tests passing. Numbers go in data, not code: balancing is editing numbers.
3. When the state's shape changes, raise `STATE_VERSION` and add the step in `rules/src/save.ts`, so nobody loses a game.
4. Draw the screens in `client/src/scenes/`; the scenes ask the holder and draw from the events. Never read the canvas
   back, never a filter per frame; "fewer effects" must make things jump instead of glide.
5. The Art Director's icon replaces the two PNGs in `client/public/`; nothing else changes.
