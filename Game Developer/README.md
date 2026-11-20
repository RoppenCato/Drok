# Drok: the game's folder

The game itself: the rules as a pure function tested headless in Node, a Phaser 4 screen in TypeScript built with
Vite, installable on a phone. It began as the template's phone starter (2026-11-19). Today it holds chapter 1: a
harbour town, an island, three kinds of monster, loot, a chest and a stall, drawn with the Art Director's art.

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
npm run balance    # the long balance run: the bot on ten seeds, careful and clumsy (40 s; read the [numbers] lines)
```

## On Robin's phone

On the home Wi-Fi: `http://192.168.0.43:5178/` while `npm run dev` runs on this PC. Installing ("Add to Home
screen") and playing offline need a real web address: the public page on Cloudflare Pages (Robin, 2026-11-20),
`https://drok-game.pages.dev/`, anywhere and always up. `npm run deploy` puts the newest build there.

## What it does today

Chapter 1, with Leonard, AD's art and in silence. A new hero wakes in the harbour town, Marlow's Landing, with a
rusty cutlass, a plank buckler and three potions. A tap walks him somewhere; a thumb that drags steers him like a
stick; both work at once (Robin, 2026-11-20). He walks to the pier, opens the sea chart and sails to Crab Cay: sand
crabs on the beach, reef gulls on the grass, coconut crabs in the rocky cove, and a chest up a side path. He swings
by himself at the monster he tapped, or at the nearest; hitting builds rage; **Charge** dashes and stuns; **Cleave**
spends rage on a wide swing; they sit with the potion in the middle at the bottom, his health over them. Kills give experience (levels 1 to 5), and money, potions and gear that lie on the ground with the glow of
their rarity and fly to him when he walks close. **Bag**, **Chart** and **Hero** at the top open their windows; a
button appears by the chest, the stall and the pier. Falling costs a tenth of his money and wakes him in the harbour,
where Old Marlow's stall sells a few pieces and potions and buys what he found. The **≡** settings hold which
hand, fewer effects, export and import of the save, the log, and "start over".

## Where things live

```
rules/data/               numbers, monsters, places, items: every number of the game; balancing is editing these
rules/src/                types, data, core, game, world (the step), loot, town, save, geometry, rng, index
rules/test/               game, chapter1, bot (a bot plays chapter 1 through), purity; sim.ts is their holder
client/index.html         the page: phone viewport, no zoom, the canvas fills the screen
client/src/main.ts        Phaser, the holder, the frame log, window.dev
client/src/layout.ts      the name, the design size, RES, the stand-in colours
client/src/local-game.ts  holds the state, steps the rules evenly, saves to localStorage (drok.save)
client/src/controls.ts    steering: a tap and a dragged thumb into intents
client/src/scenes/        BootScene (paints the sand once), PlayScene (the one screen)
client/src/view/          world-view.ts (the place), hud.ts (the glass), panels.ts (bag, hero, chart, stall, settings)
client/src/game-log.ts    the frame log and the error log, saved from the menu
client/src/settings.ts    sound off, fewer effects, which hand, in localStorage (drok.settings)
client/public/            the two placeholder icons; files here are served from /
tools/make-icons.mjs      made the stand-in icons; the icons are the Art Director's now, so it refuses to run
tools/place-from-art.mjs  writes a place's layout from the Art Director's place.json into the rules' data
tools/balance.mjs         the long balance run (npm run balance)
vite.config.ts            Vite with the PWA plugin, the manifest, port 5178; vitest.config.ts: the tests
.claude/launch.json       entry "game" for a chat whose folder is this one; the root's ..\.claude\launch.json is
                          the one the Game Developer's chat uses
```

## For a script in the browser pane

`window.dev`: `holder` (the state; `holder.act({ type: 'moveTo', x: 300, y: 300 })`), `log`, `phaser`, `rules`,
`res`, and with `?drive=1` in the address `step(n)`, which moves the stopped page n frames. `docs\state\pages.md`
has the addresses and the way a test is run.
