// The shapes of the game: the state, what the player can do (actions) and what the rules say happened (events).
// The state is plain data (JSON in, JSON out), so it saves as it is. This is the control test's state: one field, one
// hero, a few monsters of one kind. Chapter 1 grows it.
//
// Drok is solo for good (Robin, 2026-11-19: "Solo only. No server, no accounts, no co-op."), so an action carries no
// player and no id of its own (mine; the starter had both for play together).

import type { STATE_VERSION } from './save.ts';

export interface Vec {
  x: number;
  y: number;
}

/**
 * The three ways to steer that Robin tries (Robin, 2026-11-19):
 * 1 tap to move, tap a monster to target it; 2 hold and drag to steer, auto-attack the nearest; 3 a floating stick.
 * The rules need to know because 2 and 3 pick the target by themselves.
 */
export type Scheme = 1 | 2 | 3;

export type SkillId = 'charge' | 'cleave';

export interface Hero {
  x: number;
  y: number;
  /** Which way he looks, in radians: 0 is right, a quarter turn is down the screen. */
  facing: number;
  hp: number;
  rage: number;
  /** Where a tap sent him; null when he has arrived or was never sent. */
  dest: Vec | null;
  /** The thumb's push: a direction whose length is 0 (let go) to 1 (full speed). It wins over `dest` and `chase`. */
  steer: Vec;
  /** The monster he fights, by id. */
  target: number | null;
  /** Walk after the target until it is in reach (a tapped monster, a Charge in scheme 1). */
  chase: boolean;
  /** Did he move this step? For the screen. */
  moving: boolean;
  /** Seconds until the next swing may start. */
  swingIn: number;
  /** A swing in the air: on whom, and the seconds until it lands. */
  swing: { target: number; landsIn: number } | null;
  /** A Charge under way: at whom, and the seconds it may still take. */
  charging: { target: number; left: number } | null;
  chargeCd: number;
  cleaveCd: number;
  /** Seconds since he was last hit; his health comes back after a quiet while. */
  sinceHit: number;
  /** Seconds until he stands up again; 0 while he stands. */
  downFor: number;
}

/** wander near home; chase the hero; windup before a bite; rest after one; return home. */
export type MonsterMode = 'wander' | 'chase' | 'windup' | 'rest' | 'return';

export interface Monster {
  id: number;
  kind: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  facing: number;
  hp: number;
  mode: MonsterMode;
  /** Seconds left of what it is doing: the pause before the next stroll, the wind-up, the rest. */
  timer: number;
  /** Where a stroll is going. */
  goal: Vec | null;
  /** Seconds it still cannot move or bite. */
  stunned: number;
}

export interface GameState {
  version: typeof STATE_VERSION;
  seed: string;
  /** Seconds the world has run, and how many steps that was. */
  time: number;
  ticks: number;
  scheme: Scheme;
  /** How many monsters the field keeps alive. */
  monstersWanted: number;
  hero: Hero;
  monsters: Monster[];
  /** A countdown, in seconds, for each monster on its way back. */
  respawns: number[];
  nextId: number;
  kills: number;
  deaths: number;
}

/** What the player wants: an intent ("go there", "Charge"), never a result. The rules roll the dice and decide. */
export type Action =
  /** The world moves on by `dt` seconds. The holder sends it in even steps. */
  | { type: 'tick'; dt: number }
  | { type: 'scheme'; scheme: Scheme }
  | { type: 'monsters'; count: number }
  /** A tap on the ground. */
  | { type: 'moveTo'; x: number; y: number }
  /** The thumb's push; 0, 0 lets go. */
  | { type: 'steer'; x: number; y: number }
  /** A tap on a monster, or null to let the target go. `approach` false targets without walking up to it. */
  | { type: 'target'; monster: number | null; approach?: boolean }
  | { type: 'skill'; skill: SkillId };

export type RejectReason = 'down' | 'on cooldown' | 'not enough rage' | 'no target in range' | 'no such monster' | 'bad number';

/** Why the target changed: he tapped it; it was the nearest; it struck him; the last one fell; a skill picked it; it got away. */
export type TargetWhy = 'tap' | 'nearest' | 'struck' | 'next' | 'skill' | 'lost';

/** What happened. The screen draws from these and from the state, never from a guess. */
export type GameEvent =
  | { type: 'targeted'; monster: number | null; why: TargetWhy }
  /** His arm goes up; the hit lands a moment later, if the target is still in reach. */
  | { type: 'swing'; monster: number }
  | { type: 'hit'; monster: number; amount: number; crit: boolean; by: 'swing' | 'cleave'; x: number; y: number }
  | { type: 'monsterDied'; monster: number; x: number; y: number }
  | { type: 'monsterSpawned'; monster: number }
  | { type: 'monsterWindup'; monster: number; seconds: number }
  | { type: 'monsterMissed'; monster: number }
  | { type: 'heroHit'; monster: number; amount: number }
  | { type: 'heroDown' }
  | { type: 'heroUp' }
  | { type: 'chargeStarted'; monster: number }
  | { type: 'charged'; monster: number; x: number; y: number }
  | { type: 'cleaved'; hits: number; facing: number }
  /** The action did nothing, and why. The state is as it was. */
  | { type: 'rejected'; action: Action['type']; reason: RejectReason };

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
}
