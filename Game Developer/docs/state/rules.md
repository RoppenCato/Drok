# The rules, as they stand (the control test, 2026-11-20)

`rules\` is the game as a pure function: `apply(state, action, rng) → { state, events }`. It never touches the
screen, a clock or a random number of its own; every die comes from the seeded `rng`, time only from a tick's `dt`.
The state handed in is never changed. All of it is Victor, GD's unless it says Robin.

## The files

| File | What it holds |
| --- | --- |
| `rules\data\numbers.json` | every number: the field, the hero, auto-targeting, Charge, Cleave, the crab. `_about` notes say why. Balancing is editing this file |
| `rules\src\types.ts` | the state, the actions (intents), the events |
| `rules\src\game.ts` | `newGame`, `apply`, and every action but the step: the scheme, the crab count, a tap on the ground, the thumb's push, a tap on a monster, Charge, Cleave |
| `rules\src\world.ts` | the step (`tick`): the hero walks and swings, targets are picked, the monsters stroll, chase, wind up, bite, rest and go home, the fallen come back |
| `rules\src\geometry.ts` | distance, angle, a step towards a point |
| `rules\src\rng.ts` | the seeded stream (one number is its whole state) |
| `rules\src\save.ts` | `STATE_VERSION` (1) and `migrate`: null for anything that is not a state we know |
| `rules\src\index.ts` | what the rules export; the client and the tests import from here only |

## The state

`seed`, `time` (seconds run), `ticks`, `scheme` (1, 2 or 3), `monstersWanted`, the `hero`, the `monsters`, the
`respawns` (a countdown each), `nextId`, `kills`, `deaths`. Solo for good (Robin, 2026-11-19), so an action carries no
player and no id (mine; the starter had both).

The hero: where he is and looks, health, rage, `dest` (where a tap sent him), `steer` (the thumb's push, length 0 to
1), `target`, `chase` (walk after the target), the swing in the air, a Charge under way, the two cooldowns, seconds
since he was hit, seconds until he stands up.

A monster: where it is and its home, health, `mode` (wander, chase, windup, rest, return), a timer, a stroll's goal,
seconds stunned.

## What the player can do (the actions)

| Action | What it does | Refused when |
| --- | --- | --- |
| `tick { dt }` | the world moves on; the holder sends 1/60 s | `dt` is not between 0 and 0.1 |
| `scheme { scheme }` | changes the way of steering; lets go of `dest`, `steer` and `chase`; the target stays | not 1, 2 or 3 |
| `monsters { count }` | how many crabs the field keeps | not a whole number from 1 to 8 |
| `moveTo { x, y }` | he walks there in a straight line; the target stays | he is down |
| `steer { x, y }` | the thumb's push; wins over `dest` and `chase` at once; 0, 0 stops him on that step | not numbers |
| `target { monster, approach? }` | a tapped monster is the target and he walks up to it; null lets it go | he is down; no such monster |
| `skill { skill }` | Charge or Cleave | he is down; on cooldown; not enough rage; nothing in range |

## How it plays

- **Walking**: 215 units a second, full speed on the first step, a dead stop on the step the thumb lifts. No
  acceleration: "smooth and snappy" (Robin, 2026-11-19). A push of half length is half speed. The field's edge holds him.
- **Fighting** (Robin, 2026-11-20: a target with auto-attack): with a target in reach he swings every 0.8 s by
  himself, walking or standing; the swing lands 0.12 s later if the target is still close. 9 to 13 a hit, one in ten
  doubles. Each hit gives 12 rage, each bite taken 6; rage tops out at 100.
- **Who the target is**: in scheme 1 only a tap picks. In schemes 2 and 3 the rules pick the nearest crab within 210,
  never leave one that is in reach, turn to one in reach when the target is not, and let go beyond 300. In every
  scheme: struck with no target, he turns on the striker; when the target falls, the nearest crab that is after him
  is next (Zite2's lesson 60).
- **Charge**: a dash at 950 units a second to the target, or to the nearest crab within 340 when there is none. It
  stuns for 1.2 s, gives 20 rage, and he swings as he lands. 8 s cooldown.
- **Cleave**: one swing that hits every crab within the arc before him (170 degrees, 62 units to a crab's edge) for
  one and a half times a hit. 30 rage, 3 s cooldown. With nothing near it is refused and not paid for.
- **The sand crab**: 55 health. It strolls within 130 of its home; comes for him within 140 or when hit, at 120 a
  second (he outruns it); winds up for 0.5 s, during which he can step away and be missed; bites for 4 to 7; rests
  1.6 s. It goes home and mends when he is down or it is 520 from home. A fallen one comes back after 4 s, at least
  260 from him.
- **Falling**: at no health he is down for 2 s, lets go of everything, and stands up whole in the middle of the
  field. Chapter 1 makes it cost money and wake him in the harbour (Robin, 2026-11-20). Health comes back at 4 a
  second after 5 quiet seconds.

## The save

`STATE_VERSION` is 1: the control test's state. No older shape of Drok exists, so there is no migration step yet; the
first one is written the day the shape changes. `migrate` gives null for a broken save, a newer version, or the
template starter's old board save, and the holder then starts a new game.

## Its tests

`rules\test\`: `game.test.ts`, `bot.test.ts`, `purity.test.ts`, with `sim.ts` as their small holder. `docs\tests.md`
lists what each covers and the numbers they print.
