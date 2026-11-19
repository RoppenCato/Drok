// The game as a pure function: apply(state, action, rng) → { state, events }.
// The state passed in is never changed; a new one comes back. Every die comes from `rng` and time only from a tick's
// `dt`: the rules never touch the screen, a clock or a random number of their own (rules/test/purity.test.ts refuses
// it). That is what lets the same code run in the browser and headless in the tests, where a bot plays it.

import { angleDiff, angleTo, dist } from './geometry.ts';
import type { Rng } from './rng.ts';
import { STATE_VERSION } from './save.ts';
import type { Action, ApplyResult, GameEvent, GameState, Scheme, SkillId } from './types.ts';
import { N, clampToField, clone, fieldCentre, hurtMonster, monsterById, nearestMonster, reject, roll, setTarget, tick } from './world.ts';

export interface NewGameOptions {
  seed: string;
  scheme?: Scheme;
  /** How many monsters the field keeps. Left out, the number in the data. */
  monsters?: number;
}

/** The hero in the middle of an empty field; the monsters arrive on the first step, placed by the dice. */
export function newGame(o: NewGameOptions): GameState {
  const c = fieldCentre();
  const wanted = validCount(o.monsters) ? o.monsters : N.field.monsters;
  return {
    version: STATE_VERSION,
    seed: o.seed,
    time: 0,
    ticks: 0,
    scheme: o.scheme ?? 1,
    monstersWanted: wanted,
    hero: {
      x: c.x,
      y: c.y,
      facing: Math.PI / 2,
      hp: N.hero.maxHp,
      rage: 0,
      dest: null,
      steer: { x: 0, y: 0 },
      target: null,
      chase: false,
      moving: false,
      swingIn: 0,
      swing: null,
      charging: null,
      chargeCd: 0,
      cleaveCd: 0,
      sinceHit: N.hero.regenAfterSeconds,
      downFor: 0,
    },
    monsters: [],
    respawns: Array.from({ length: wanted }, () => 0),
    nextId: 1,
    kills: 0,
    deaths: 0,
  };
}

export function apply(state: GameState, action: Action, rng: Rng): ApplyResult {
  switch (action.type) {
    case 'tick':
      return tick(state, action.dt, rng);
    case 'scheme':
      return setScheme(state, action.scheme);
    case 'monsters':
      return setMonsters(state, action.count);
    case 'moveTo':
      return moveTo(state, action.x, action.y);
    case 'steer':
      return steer(state, action.x, action.y);
    case 'target':
      return target(state, action.monster, action.approach !== false);
    case 'skill':
      return skill(state, action.skill, rng);
  }
}

function validCount(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= N.field.maxMonsters;
}

/** Another way of steering: whatever the thumb was doing in the old one is let go. The target stays. */
function setScheme(state: GameState, scheme: Scheme): ApplyResult {
  if (scheme !== 1 && scheme !== 2 && scheme !== 3) return reject(state, 'scheme', 'bad number');
  const s = clone(state);
  s.scheme = scheme;
  s.hero.dest = null;
  s.hero.steer = { x: 0, y: 0 };
  s.hero.chase = false;
  return { state: s, events: [] };
}

/** More or fewer monsters on the field: the missing ones arrive in a moment, the extra ones furthest away leave. */
function setMonsters(state: GameState, count: number): ApplyResult {
  if (!validCount(count)) return reject(state, 'monsters', 'bad number');
  const s = clone(state);
  const ev: GameEvent[] = [];
  s.monstersWanted = count;
  while (s.monsters.length + s.respawns.length < count) s.respawns.push(0.3);
  while (s.monsters.length + s.respawns.length > count) {
    if (s.respawns.length > 0) {
      s.respawns.pop();
      continue;
    }
    let far = s.monsters[0]!;
    for (const m of s.monsters) if (dist(s.hero, m) > dist(s.hero, far)) far = m;
    s.monsters = s.monsters.filter((m) => m.id !== far.id);
    if (s.hero.target === far.id) setTarget(s, null, 'lost', ev);
    if (s.hero.swing?.target === far.id) s.hero.swing = null;
    if (s.hero.charging?.target === far.id) s.hero.charging = null;
  }
  return { state: s, events: ev };
}

/** A tap on the ground: he walks there in a straight line. The target stays; he swings again when it is in reach. */
function moveTo(state: GameState, x: number, y: number): ApplyResult {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return reject(state, 'moveTo', 'bad number');
  if (state.hero.downFor > 0) return reject(state, 'moveTo', 'down');
  const s = clone(state);
  const dest = { x, y };
  clampToField(dest);
  s.hero.dest = dest;
  s.hero.chase = false;
  return { state: s, events: [] };
}

/** The thumb's push. Longer than 1 is cut to 1. Kept while he is down, so he walks on the moment he stands. */
function steer(state: GameState, x: number, y: number): ApplyResult {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return reject(state, 'steer', 'bad number');
  const s = clone(state);
  const len = Math.hypot(x, y);
  s.hero.steer = len > 1 ? { x: x / len, y: y / len } : { x, y };
  return { state: s, events: [] };
}

/** A tap on a monster: it is the target, and he walks up to it unless told not to. Null lets the target go. */
function target(state: GameState, id: number | null, approach: boolean): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'target', 'down');
  if (id !== null && !monsterById(state, id)) return reject(state, 'target', 'no such monster');
  const s = clone(state);
  const ev: GameEvent[] = [];
  setTarget(s, id, 'tap', ev);
  if (id !== null) {
    s.hero.chase = approach;
    s.hero.dest = null;
  }
  return { state: s, events: ev };
}

function skill(state: GameState, id: SkillId, rng: Rng): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'skill', 'down');
  switch (id) {
    case 'charge':
      return charge(state);
    case 'cleave':
      return cleave(state, rng);
    default:
      return reject(state, 'skill', 'bad number');
  }
}

/** Charge: a dash to the target, or to the nearest monster in range when there is none. It lands in the world step. */
function charge(state: GameState): ApplyResult {
  if (state.hero.chargeCd > 0 || state.hero.charging) return reject(state, 'skill', 'on cooldown');
  const s = clone(state);
  const h = s.hero;
  const ev: GameEvent[] = [];
  let m = h.target !== null ? monsterById(s, h.target) : undefined;
  if (!m || dist(h, m) > N.charge.range) m = nearestMonster(s, N.charge.range);
  if (!m) return reject(state, 'skill', 'no target in range');
  setTarget(s, m.id, 'skill', ev);
  h.charging = { target: m.id, left: N.charge.maxSeconds };
  h.chargeCd = N.charge.cooldownSeconds;
  h.dest = null;
  h.swing = null;
  // In scheme 1 he stays on it after landing, as after a tap; in 2 and 3 the thumb decides where he goes next.
  h.chase = s.scheme === 1;
  h.facing = angleTo(h, m);
  // It holds still for the dash, so he does not run after a moving thing.
  m.stunned = Math.max(m.stunned, N.charge.holdSeconds);
  ev.push({ type: 'chargeStarted', monster: m.id });
  return { state: s, events: ev };
}

/** Cleave: one wide swing that hits everything in the arc before him. Paid in rage. */
function cleave(state: GameState, rng: Rng): ApplyResult {
  // Rage first: without it the cooldown does not matter, and it is the reason the player can do something about.
  if (state.hero.rage < N.cleave.rageCost) return reject(state, 'skill', 'not enough rage');
  if (state.hero.cleaveCd > 0) return reject(state, 'skill', 'on cooldown');
  const s = clone(state);
  const h = s.hero;
  const near = s.monsters.filter((m) => dist(h, m) <= N.cleave.radius + N.monster.radius);
  // Nothing near: refused and not paid for, so a slip of the thumb costs nothing.
  if (near.length === 0) return reject(state, 'skill', 'no target in range');
  const ev: GameEvent[] = [];
  // He turns to his target if it is near, else to the nearest, so the arc never misses the one he is fighting.
  let nearest = near[0]!;
  for (const m of near) if (dist(h, m) < dist(h, nearest)) nearest = m;
  const aim = near.find((m) => m.id === h.target) ?? nearest;
  h.facing = angleTo(h, aim);
  const half = ((N.cleave.arcDegrees / 2) * Math.PI) / 180;
  const struck = near.filter((m) => m.id === aim.id || Math.abs(angleDiff(angleTo(h, m), h.facing)) <= half);
  h.rage -= N.cleave.rageCost;
  h.cleaveCd = N.cleave.cooldownSeconds;
  if (h.target === null) setTarget(s, aim.id, 'skill', ev);
  ev.push({ type: 'cleaved', hits: struck.length, facing: h.facing });
  for (const m of struck) hurtMonster(s, m, Math.round(roll(rng, N.hero.damageMin, N.hero.damageMax) * N.cleave.damageTimes), false, 'cleave', ev);
  return { state: s, events: ev };
}
