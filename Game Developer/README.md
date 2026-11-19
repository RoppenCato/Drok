# Drok: the game's folder

The game itself: the rules as a pure function tested headless in Node, a Phaser 4 screen in TypeScript built with
Vite, installable on a phone. It began as the template's phone starter (2026-11-19). Today it holds the control
test: one field, sand crabs, the Warrior, and three ways to steer for Robin to pick from by feel.

How each system stands is in `docs\state\` (`rules.md`, `client.md`, `pages.md`); how a change is checked is in
`docs\tests.md`; the plan is `docs\chapters.md` and `docs\plan-chapter-1.md`.

**The one idea: the game is a pure function.** `rules/` has no rendering and no network:
`apply(state, action, rng) → { state, events }` over a seeded random stream. The screen sends **intents** ("walk
there", "Charge"), never results; the rules roll the dice and decide. Nothing in `rules/` touches the screen,
`Math.random` or a clock; a test (`rules/test/purity.test.ts`) refuses it.

## Run it

Needs Node 22.12 or newer. From this folder:

```bash
npm install        # the dependencies
npm test           # the rules, headless in Node; prints the numbers it measured
npm run typecheck  # TypeScript strict: rules/tsconfig.json (no DOM), then tsconfig.json (everything)
npm run dev        # Vite at http://localhost:5178/, and on the home Wi-Fi (5178 is Drok's own port)
npm run build      # the installable page into dist/: manifest, icons, service worker
npm run preview    # serves dist/ at http://localhost:4178/
npm run icons      # remakes the placeholder icons (tools/make-icons.mjs)
```

## On Robin's phone

On the home Wi-Fi: `http://192.168.0.43:5178/` while `npm run dev` runs on this PC. Installing ("Add to Home
screen") and playing offline need a real web address: the public page on Cloudflare Pages, from chapter 1 (Robin,
2026-11-20).

## What it does today

One screen. The Warrior stands on a field of sand with three sand crabs. At the top, a switch between three ways
to steer: **1 Tap** (tap the sand to walk, tap a crab to fight it), **2 Hold** (he walks towards a held finger and
fights the nearest crab), **3 Stick** (a stick where the thumb comes down; he fights the nearest crab). He swings by
himself at his target; hitting builds rage; **Charge** dashes to a crab and stuns it; **Cleave** spends rage on a
wide swing. A crab winds up before it bites, and a step away makes it miss. At no health he is down for two seconds
and stands up in the middle. The **≡** menu sets the number of crabs, which hand the buttons sit under, fewer
effects, saves the log as a file, and starts over.

## Where things live

```
rules/data/numbers.json   every number of the game; balancing is editing this file
rules/src/                types, game (the actions), world (the step), geometry, rng, save, index (the exports)
rules/test/               game.test.ts, bot.test.ts (a bot plays each scheme), purity.test.ts, sim.ts (their holder)
client/index.html         the page: phone viewport, no zoom, the canvas fills the screen
client/src/main.ts        Phaser, the holder, the frame log, window.dev
client/src/layout.ts      the name, the design size, RES, the stand-in colours
client/src/local-game.ts  holds the state, steps the rules evenly, saves to localStorage (drok.save)
client/src/controls.ts    the three ways to steer: fingers into intents
client/src/scenes/        BootScene (paints the sand once), PlayScene (the one screen)
client/src/view/          world-view.ts (the field), hud.ts (the glass: bars, switch, skill buttons, menu)
client/src/game-log.ts    the frame log and the error log, saved from the menu
client/src/settings.ts    sound off, fewer effects, which hand, in localStorage (drok.settings)
client/public/            the two placeholder icons; files here are served from /
tools/make-icons.mjs      makes the icons with no image package
vite.config.ts            Vite with the PWA plugin, the manifest, port 5178; vitest.config.ts: the tests
.claude/launch.json       entry "game" for a chat whose folder is this one; the root's ..\.claude\launch.json is
                          the one the Game Developer's chat uses
```

## For a script in the browser pane

`window.dev`: `holder` (the state; `holder.act({ type: 'moveTo', x: 300, y: 300 })`), `log`, `phaser`, `rules`,
`res`, and with `?drive=1` in the address `step(n)`, which moves the stopped page n frames. `docs\state\pages.md`
has the addresses and the way a test is run.
