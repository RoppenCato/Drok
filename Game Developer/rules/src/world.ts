// The world moving on by one step: the hero walks and swings, the monsters stroll, chase and bite, the fallen come
// back. Pure: every die comes from `rng`, time only from the step's `dt`. The state handed in is never changed; the
// step works on a copy and hands that back.

import numbers from '../data/numbers.json';
import { angleTo, clamp, dist, stepToward } from './geometry.ts';
import type { Rng } from './rng.ts';
import type { Action, ApplyResult, GameEvent, GameState, Monster, RejectReason, TargetWhy, Vec } from './types.ts';

/** The numbers of the game, from rules/data/numbers.json. */
export const N = numbers;

/** The longest step the world takes at once. A longer one is refused, so a stalled page cannot fling the hero. */
export const MAX_DT = 0.1;

/** How far apart the two middles may be for his swing to land. */
export function heroReach(): number {
  return N.hero.radius + N.monster.radius + N.hero.reach;
}

/** How far apart the two middles may be for a monster's bite to land. */
export function monsterReach(): number {
  return N.monster.radius + N.hero.radius + N.monster.reach;
}

export function fieldCentre(): Vec {
  return { x: N.field.width / 2, y: N.field.height / 2 };
}

export function clampToField(p: Vec): void {
  p.x = clamp(p.x, N.field.margin, N.field.width - N.field.margin);
  p.y = clamp(p.y, N.field.margin, N.field.height - N.field.margin);
}

/** A copy deep enough that changing it never touches the state it came from. */
export function clone(s: GameState): GameState {
  const h = s.hero;
  return {
    ...s,
    hero: {
      ...h,
      dest: h.dest ? { ...h.dest } : null,
      steer: { ...h.steer },
      swing: h.swing ? { ...h.swing } : null,
      charging: h.charging ? { ...h.charging } : null,
    },
    monsters: s.monsters.map((m) => ({ ...m, goal: m.goal ? { ...m.goal } : null })),
    respawns: [...s.respawns],
  };
}

/** The action did nothing: the same state back, and one event that says why. */
export function reject(state: GameState, action: Action['type'], reason: RejectReason): ApplyResult {
  return { state, events: [{ type: 'rejected', action, reason }] };
}

export function monsterById(s: GameState, id: number): Monster | undefined {
  return s.monsters.find((m) => m.id === id);
}

/** The nearest monster within `range` of the hero, if any. `only` narrows the choice. */
export function nearestMonster(s: GameState, range: number, only?: (m: Monster) => boolean): Monster | undefined {
  let best: Monster | undefined;
  let bestD = range;
  for (const m of s.monsters) {
    if (only && !only(m)) continue;
    const d = dist(s.hero, m);
    if (d <= bestD) {
      best = m;
      bestD = d;
    }
  }
  return best;
}

export function setTarget(s: GameState, id: number | null, why: TargetWhy, ev: GameEvent[]): void {
  if (s.hero.target === id) return;
  s.hero.target = id;
  if (id === null) s.hero.chase = false;
  ev.push({ type: 'targeted', monster: id, why });
}

/** A whole number from min to max, both included. */
export function roll(rng: Rng, min: number, max: number): number {
  return min + rng.int(max - min + 1) - 1;
}

export function hurtMonster(s: GameState, m: Monster, amount: number, crit: boolean, by: 'swing' | 'cleave', ev: GameEvent[]): void {
  m.hp -= amount;
  ev.push({ type: 'hit', monster: m.id, amount, crit, by, x: m.x, y: m.y });
  // A hit monster comes for him, wherever it was going.
  if (m.mode === 'wander' || m.mode === 'return') {
    m.mode = 'chase';
    m.goal = null;
  }
  if (m.hp <= 0) killMonster(s, m, ev);
}

function killMonster(s: GameState, m: Monster, ev: GameEvent[]): void {
  const h = s.hero;
  s.monsters = s.monsters.filter((other) => other.id !== m.id);
  s.kills += 1;
  s.respawns.push(N.monster.respawnSeconds);
  ev.push({ type: 'monsterDied', monster: m.id, x: m.x, y: m.y });
  if (h.swing?.target === m.id) h.swing = null;
  if (h.charging?.target === m.id) h.charging = null;
  if (h.target === m.id) {
    // The target fell: whoever is after him is the next one, so he never stands idle while something bites him.
    const next = nearestMonster(s, Infinity, (o) => o.mode === 'chase' || o.mode === 'windup' || o.mode === 'rest');
    if (next) setTarget(s, next.id, 'next', ev);
    else setTarget(s, null, 'lost', ev);
  }
}

/** The world moves on by `dt` seconds. */
export function tick(state: GameState, dt: number, rng: Rng): ApplyResult {
  if (!(dt > 0 && dt <= MAX_DT)) return reject(state, 'tick', 'bad number');
  const s = clone(state);
  const ev: GameEvent[] = [];
  s.time += dt;
  s.ticks += 1;

  const h = s.hero;
  h.chargeCd = Math.max(0, h.chargeCd - dt);
  h.cleaveCd = Math.max(0, h.cleaveCd - dt);
  h.swingIn = Math.max(0, h.swingIn - dt);
  h.sinceHit += dt;

  if (h.downFor > 0) {
    h.moving = false;
    h.downFor -= dt;
    if (h.downFor <= 0) standUp(s, ev);
  } else {
    moveHero(s, dt, ev);
    pickTarget(s, ev);
    swing(s, dt, rng, ev);
    if (h.sinceHit >= N.hero.regenAfterSeconds && h.hp < N.hero.maxHp) h.hp = Math.min(N.hero.maxHp, h.hp + N.hero.regenPerSecond * dt);
  }

  stepMonsters(s, dt, rng, ev);
  stepRespawns(s, dt, rng, ev);
  return { state: s, events: ev };
}

function moveHero(s: GameState, dt: number, ev: GameEvent[]): void {
  const h = s.hero;
  const fromX = h.x;
  const fromY = h.y;

  if (h.charging) {
    const m = monsterById(s, h.charging.target);
    h.charging.left -= dt;
    if (!m) {
      h.charging = null;
    } else {
      const stop = heroReach() - 4;
      const d = dist(h, m);
      const step = N.charge.speed * dt;
      if (d - step <= stop) {
        // He arrives this step: stand just inside reach, stun it, take the rage, and swing at once.
        if (d > stop) stepToward(h, m, d - stop);
        m.stunned = Math.max(m.stunned, N.charge.stunSeconds);
        if (m.mode === 'wander' || m.mode === 'return') {
          m.mode = 'chase';
          m.goal = null;
        }
        h.rage = Math.min(N.hero.maxRage, h.rage + N.charge.rage);
        h.swingIn = 0;
        h.charging = null;
        ev.push({ type: 'charged', monster: m.id, x: h.x, y: h.y });
      } else if (h.charging.left <= 0) {
        h.charging = null;
      } else {
        stepToward(h, m, step);
      }
    }
  } else {
    const push = Math.hypot(h.steer.x, h.steer.y);
    if (push > 0.001) {
      // The thumb wins over everything else, at once.
      const speed = N.hero.speed * Math.min(1, push);
      h.x += (h.steer.x / push) * speed * dt;
      h.y += (h.steer.y / push) * speed * dt;
      h.dest = null;
      h.chase = false;
    } else if (h.dest) {
      if (stepToward(h, h.dest, N.hero.speed * dt)) h.dest = null;
    } else if (h.chase && h.target !== null) {
      const m = monsterById(s, h.target);
      if (m) {
        const stop = heroReach() - 4;
        const d = dist(h, m);
        if (d > stop) stepToward(h, m, Math.min(N.hero.speed * dt, d - stop));
      }
    }
  }

  clampToField(h);
  const moved = Math.hypot(h.x - fromX, h.y - fromY);
  h.moving = moved > 0.01;
  if (h.moving) h.facing = Math.atan2(h.y - fromY, h.x - fromX);
}

/** Schemes 2 and 3: he picks the target himself. Scheme 1: only a tap picks, so this only tidies up. */
function pickTarget(s: GameState, ev: GameEvent[]): void {
  const h = s.hero;
  const current = h.target !== null ? monsterById(s, h.target) : undefined;
  if (h.target !== null && !current) setTarget(s, null, 'lost', ev);
  if (s.scheme === 1) return;

  const nearest = nearestMonster(s, N.autoTarget.pickRange);
  if (!current) {
    if (nearest) setTarget(s, nearest.id, 'nearest', ev);
    return;
  }
  const d = dist(h, current);
  if (d > N.autoTarget.dropRange) {
    setTarget(s, nearest ? nearest.id : null, nearest ? 'nearest' : 'lost', ev);
    return;
  }
  // He never leaves a target he can hit. Otherwise he turns to one in reach, or to one clearly nearer.
  if (!nearest || nearest.id === current.id || d <= heroReach()) return;
  const dn = dist(h, nearest);
  if (dn <= heroReach() || dn + N.autoTarget.switchMargin < d) setTarget(s, nearest.id, 'nearest', ev);
}

function swing(s: GameState, dt: number, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  if (h.swing) {
    h.swing.landsIn -= dt;
    if (h.swing.landsIn <= 0) {
      const m = monsterById(s, h.swing.target);
      h.swing = null;
      if (m && dist(h, m) <= heroReach() + N.hero.reachGrace) {
        const crit = rng.next() < N.hero.critChance;
        const base = roll(rng, N.hero.damageMin, N.hero.damageMax);
        h.rage = Math.min(N.hero.maxRage, h.rage + N.hero.ragePerHit);
        hurtMonster(s, m, crit ? base * N.hero.critTimes : base, crit, 'swing', ev);
      }
    }
  }
  if (h.charging || h.target === null) return;
  const m = monsterById(s, h.target);
  if (!m) return;
  const inReach = dist(h, m) <= heroReach();
  // Standing in reach he turns to it; walking, he keeps looking where he goes and swings all the same.
  if (inReach && !h.moving) h.facing = angleTo(h, m);
  if (inReach && !h.swing && h.swingIn <= 0) {
    h.swing = { target: m.id, landsIn: N.hero.windupSeconds };
    h.swingIn = N.hero.swingSeconds;
    ev.push({ type: 'swing', monster: m.id });
  }
}

function stepMonsters(s: GameState, dt: number, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  for (const m of [...s.monsters]) {
    if (m.stunned > 0) {
      m.stunned = Math.max(0, m.stunned - dt);
      continue;
    }
    const heroUp = h.downFor <= 0;
    const d = dist(m, h);
    switch (m.mode) {
      case 'wander': {
        if (heroUp && d <= N.monster.aggroRange) {
          m.mode = 'chase';
          m.goal = null;
        } else if (m.goal) {
          m.facing = angleTo(m, m.goal);
          if (stepToward(m, m.goal, N.monster.wanderSpeed * dt)) {
            m.goal = null;
            m.timer = pause(rng);
          }
        } else {
          m.timer -= dt;
          if (m.timer <= 0) m.goal = strollGoal(m, rng);
        }
        break;
      }
      case 'chase': {
        if (!heroUp || Math.hypot(m.x - m.homeX, m.y - m.homeY) > N.monster.leashRange) {
          m.mode = 'return';
        } else if (d <= monsterReach()) {
          m.mode = 'windup';
          m.timer = N.monster.windupSeconds;
          m.facing = angleTo(m, h);
          ev.push({ type: 'monsterWindup', monster: m.id, seconds: N.monster.windupSeconds });
        } else {
          m.facing = angleTo(m, h);
          stepToward(m, h, Math.min(N.monster.chaseSpeed * dt, d - (monsterReach() - 2)));
        }
        break;
      }
      case 'windup': {
        m.timer -= dt;
        if (m.timer <= 0) {
          m.mode = 'rest';
          m.timer = N.monster.restSeconds;
          // He had the wind-up's time to step away: a bite only lands if he is still close.
          if (heroUp && d <= monsterReach() + N.monster.reachGrace) hurtHero(s, m, rng, ev);
          else ev.push({ type: 'monsterMissed', monster: m.id });
        }
        break;
      }
      case 'rest': {
        m.timer -= dt;
        if (m.timer <= 0) m.mode = heroUp ? 'chase' : 'return';
        break;
      }
      case 'return': {
        // Going home it mends, is whole when it gets there, and takes no notice of him unless he hits it.
        m.hp = Math.min(N.monster.maxHp, m.hp + N.monster.maxHp * dt);
        const home = { x: m.homeX, y: m.homeY };
        m.facing = angleTo(m, home);
        if (stepToward(m, home, N.monster.chaseSpeed * dt)) {
          m.hp = N.monster.maxHp;
          m.mode = 'wander';
          m.timer = pause(rng);
        }
        break;
      }
    }
  }
  separate(s.monsters);
  for (const m of s.monsters) clampToField(m);
}

function hurtHero(s: GameState, m: Monster, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  const amount = roll(rng, N.monster.damageMin, N.monster.damageMax);
  h.hp -= amount;
  h.sinceHit = 0;
  h.rage = Math.min(N.hero.maxRage, h.rage + N.hero.ragePerHitTaken);
  ev.push({ type: 'heroHit', monster: m.id, amount });
  // Struck with nothing targeted, he turns on whoever struck him.
  if (h.target === null) setTarget(s, m.id, 'struck', ev);
  if (h.hp <= 0) {
    h.hp = 0;
    h.downFor = N.hero.reviveSeconds;
    h.dest = null;
    h.swing = null;
    h.charging = null;
    h.moving = false;
    s.deaths += 1;
    setTarget(s, null, 'lost', ev);
    ev.push({ type: 'heroDown' });
  }
}

/** He stands up in the middle of the field, whole again. (Chapter 1: in the harbour town, lighter of purse.) */
function standUp(s: GameState, ev: GameEvent[]): void {
  const h = s.hero;
  const c = fieldCentre();
  h.downFor = 0;
  h.x = c.x;
  h.y = c.y;
  h.hp = N.hero.maxHp;
  h.rage = 0;
  h.sinceHit = N.hero.regenAfterSeconds;
  ev.push({ type: 'heroUp' });
}

function stepRespawns(s: GameState, dt: number, rng: Rng, ev: GameEvent[]): void {
  for (let i = s.respawns.length - 1; i >= 0; i--) {
    const left = (s.respawns[i] ?? 0) - dt;
    if (left > 0) {
      s.respawns[i] = left;
    } else {
      s.respawns.splice(i, 1);
      spawn(s, rng, ev);
    }
  }
}

/** A new monster, away from the hero and from the others. */
function spawn(s: GameState, rng: Rng, ev: GameEvent[]): void {
  const f = N.field;
  let at: Vec | null = null;
  for (let i = 0; i < 12 && !at; i++) {
    const p = { x: f.margin + rng.next() * (f.width - 2 * f.margin), y: f.margin + rng.next() * (f.height - 2 * f.margin) };
    if (dist(p, s.hero) < N.monster.spawnClearance) continue;
    if (s.monsters.some((m) => dist(p, m) < N.monster.spawnApart)) continue;
    at = p;
  }
  // Twelve unlucky tries: the corner furthest from him.
  if (!at) at = { x: s.hero.x < f.width / 2 ? f.width - f.margin : f.margin, y: s.hero.y < f.height / 2 ? f.height - f.margin : f.margin };
  const m: Monster = {
    id: s.nextId,
    kind: N.monster.kind,
    x: at.x,
    y: at.y,
    homeX: at.x,
    homeY: at.y,
    facing: rng.next() * Math.PI * 2,
    hp: N.monster.maxHp,
    mode: 'wander',
    timer: pause(rng),
    goal: null,
    stunned: 0,
  };
  s.nextId += 1;
  s.monsters.push(m);
  ev.push({ type: 'monsterSpawned', monster: m.id });
}

function pause(rng: Rng): number {
  return N.monster.wanderPauseMin + rng.next() * (N.monster.wanderPauseMax - N.monster.wanderPauseMin);
}

function strollGoal(m: Monster, rng: Rng): Vec {
  const a = rng.next() * Math.PI * 2;
  const r = rng.next() * N.monster.wanderRange;
  const goal = { x: m.homeX + Math.cos(a) * r, y: m.homeY + Math.sin(a) * r };
  clampToField(goal);
  return goal;
}

/** Two monsters never stand in one another: each is pushed half the overlap away. */
function separate(ms: Monster[]): void {
  const min = N.monster.radius * 2;
  for (let i = 0; i < ms.length; i++) {
    for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i]!;
      const b = ms[j]!;
      const d = dist(a, b);
      if (d >= min) continue;
      const half = (min - d) / 2;
      // On the very same spot there is no direction between them: each pair gets its own.
      const ang = d > 0.001 ? angleTo(a, b) : i * 2.4 + j;
      a.x -= Math.cos(ang) * half;
      a.y -= Math.sin(ang) * half;
      b.x += Math.cos(ang) * half;
      b.y += Math.sin(ang) * half;
    }
  }
}
