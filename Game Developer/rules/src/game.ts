// The game as a pure function: apply(state, action, rng) → { state, events }.
// The state passed in is never changed; a new one comes back. Every die comes from `rng`, time only from a tick's
// `dt`, the real clock only from a tick's `now`: the rules never touch the screen, a clock or a random number of
// their own (rules/test/purity.test.ts refuses it). That is what lets the same code run in the browser and headless
// in the tests, where a bot plays it.

import { clampToPlace, clone, monsterById, nearestMonster, newItem, reject, roll, setTarget } from './core.ts';
import { N, PLACES, SLOTS, START_GEAR, START_PLACE, heroBonusDamage, heroMaxHp, kindOf, placeOf } from './data.ts';
import { angleDiff, angleTo, dist } from './geometry.ts';
import { route } from './path.ts';
import { hurtMonster, openChest } from './loot.ts';
import { makeRng, type Rng } from './rng.ts';
import { STATE_VERSION } from './save.ts';
import { buy, discard, drinkPotion, enterPlace, equip, sail, sell, unequip } from './town.ts';
import type { Action, ApplyResult, GameEvent, GameState, Item, Scheme, SkillId, Slot } from './types.ts';
import { tick } from './world.ts';

export interface NewGameOptions {
  seed: string;
  scheme?: Scheme;
}

/**
 * A new hero: a nobody in the harbour town (Robin, 2026-11-20: "Make a name"), level 1, with a rusty cutlass, a
 * plank buckler, a few potions and no money. The stall's first pieces come from the seed, so the same seed gives
 * the same start.
 */
export function newGame(o: NewGameOptions): GameState {
  const town = PLACES[START_PLACE]!;
  const worn: Record<Slot, Item | null> = { weapon: null, shield: null, hat: null, coat: null };
  const s: GameState = {
    version: STATE_VERSION,
    seed: o.seed,
    time: 0,
    ticks: 0,
    now: 0,
    scheme: o.scheme ?? 1,
    place: START_PLACE,
    hero: {
      x: town.wake.x,
      y: town.wake.y,
      facing: Math.PI / 2,
      hp: N.hero.maxHp,
      rage: 0,
      level: 1,
      xp: 0,
      gold: 0,
      potions: N.potion.start,
      potionCd: 0,
      mending: 0,
      bag: [],
      worn,
      dest: null,
      route: [],
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
    respawns: [],
    drops: [],
    chests: {},
    shop: [],
    book: {},
    nextId: 1,
    kills: 0,
    deaths: 0,
  };
  for (const slot of SLOTS) {
    const base = START_GEAR[slot];
    if (base) worn[slot] = newItem(s, base, 'common');
  }
  enterPlace(s, START_PLACE, town.wake, makeRng(`${o.seed}:stall`), []);
  s.hero.hp = heroMaxHp(s.hero);
  return s;
}

export function apply(state: GameState, action: Action, rng: Rng): ApplyResult {
  switch (action.type) {
    case 'tick':
      return tick(state, action.dt, action.now, rng);
    case 'scheme':
      return setScheme(state, action.scheme);
    case 'moveTo':
      return moveTo(state, action.x, action.y);
    case 'steer':
      return steer(state, action.x, action.y);
    case 'target':
      return target(state, action.monster, action.approach !== false);
    case 'skill':
      return skill(state, action.skill, rng);
    case 'potion':
      return drinkPotion(state);
    case 'openChest':
      return openChest(state, rng);
    case 'sail':
      return sail(state, action.to, rng);
    case 'equip':
      return equip(state, action.item);
    case 'unequip':
      return unequip(state, action.slot);
    case 'discard':
      return discard(state, action.item);
    case 'buy':
      return buy(state, action.what);
    case 'sell':
      return sell(state, action.item);
  }
}

/** Another way of steering: whatever the thumb was doing in the old one is let go. The target stays. */
function setScheme(state: GameState, scheme: Scheme): ApplyResult {
  if (scheme !== 1 && scheme !== 2 && scheme !== 3) return reject(state, 'scheme', 'bad number');
  const s = clone(state);
  s.scheme = scheme;
  s.hero.dest = null;
  s.hero.route = [];
  s.hero.steer = { x: 0, y: 0 };
  s.hero.chase = false;
  return { state: s, events: [] };
}

/**
 * A tap on the ground: he walks there, straight if nothing stands between, else round it. A tap on what he cannot
 * reach (a rock, the sea) takes him as near as the ground goes. The target stays; he swings again when it is in reach.
 */
function moveTo(state: GameState, x: number, y: number): ApplyResult {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return reject(state, 'moveTo', 'bad number');
  if (state.hero.downFor > 0) return reject(state, 'moveTo', 'down');
  const s = clone(state);
  const dest = { x, y };
  clampToPlace(s, dest);
  const way = route(placeOf(s), s.hero, dest, N.hero.radius * 0.5);
  const end = way[way.length - 1];
  s.hero.route = way;
  s.hero.dest = end ? { x: end.x, y: end.y } : null;
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
    s.hero.route = [];
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
  h.route = [];
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
  const near = s.monsters.filter((m) => dist(h, m) <= N.cleave.radius + kindOf(m).radius);
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
  const bonus = heroBonusDamage(h);
  for (const m of struck) hurtMonster(s, m, Math.round((roll(rng, N.hero.damageMin, N.hero.damageMax) + bonus) * N.cleave.damageTimes), false, 'cleave', rng, ev);
  return { state: s, events: ev };
}
