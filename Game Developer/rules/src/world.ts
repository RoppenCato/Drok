// The world moving on by one step: the hero walks and swings, the monsters stroll, chase and strike, the fallen come
// back, the loot flies to him. Pure: every die comes from `rng`, time only from the step's `dt`, the real clock only
// from the step's `now`. The state handed in is never changed; the step works on a copy and hands that back.

import { MAX_DT, clampToPlace, clone, heroReach, monsterById, monsterReach, nearestMonster, reject, roll, setTarget } from './core.ts';
import { N, START_PLACE, PLACES, heroArmour, heroBonusDamage, heroMaxHp, kindOf, placeOf } from './data.ts';
import { angleTo, dist, stepToward } from './geometry.ts';
import { hurtMonster, stepDrops } from './loot.ts';
import type { Rng } from './rng.ts';
import { enterPlace } from './town.ts';
import type { ApplyResult, GameEvent, GameState, Monster, Vec } from './types.ts';

/** The world moves on by `dt` seconds; `now` is the real clock the holder read, in ms. */
export function tick(state: GameState, dt: number, now: number | undefined, rng: Rng): ApplyResult {
  if (!(dt > 0 && dt <= MAX_DT)) return reject(state, 'tick', 'bad number');
  const s = clone(state);
  const ev: GameEvent[] = [];
  s.time += dt;
  s.ticks += 1;
  if (typeof now === 'number' && Number.isFinite(now)) s.now = now;

  const h = s.hero;
  h.chargeCd = Math.max(0, h.chargeCd - dt);
  h.cleaveCd = Math.max(0, h.cleaveCd - dt);
  h.potionCd = Math.max(0, h.potionCd - dt);
  h.swingIn = Math.max(0, h.swingIn - dt);
  h.sinceHit += dt;

  if (h.downFor > 0) {
    h.moving = false;
    h.downFor -= dt;
    if (h.downFor <= 0) standUp(s, rng, ev);
  } else {
    moveHero(s, dt, ev);
    pickTarget(s, ev);
    swing(s, dt, rng, ev);
    mend(s, dt);
  }

  stepMonsters(s, dt, rng, ev);
  stepRespawns(s, dt, rng, ev);
  stepDrops(s, dt, ev);
  return { state: s, events: ev };
}

/** His health coming back: a potion's work, a quiet while in the wild, or simply being in town. */
function mend(s: GameState, dt: number): void {
  const h = s.hero;
  const max = heroMaxHp(h);
  if (h.mending > 0) {
    h.hp += (N.potion.heal / N.potion.seconds) * Math.min(dt, h.mending);
    h.mending = Math.max(0, h.mending - dt);
  }
  if (placeOf(s).town) h.hp += N.hero.townRegenPerSecond * dt;
  else if (h.sinceHit >= N.hero.regenAfterSeconds) h.hp += N.hero.regenPerSecond * dt;
  if (h.hp > max) h.hp = max;
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
      const stop = heroReach(m) - 4;
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
        const stop = heroReach(m) - 4;
        const d = dist(h, m);
        if (d > stop) stepToward(h, m, Math.min(N.hero.speed * dt, d - stop));
      }
    }
  }

  clampToPlace(s, h);
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
  if (!nearest || nearest.id === current.id || d <= heroReach(current)) return;
  const dn = dist(h, nearest);
  if (dn <= heroReach(nearest) || dn + N.autoTarget.switchMargin < d) setTarget(s, nearest.id, 'nearest', ev);
}

function swing(s: GameState, dt: number, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  if (h.swing) {
    h.swing.landsIn -= dt;
    if (h.swing.landsIn <= 0) {
      const m = monsterById(s, h.swing.target);
      h.swing = null;
      if (m && dist(h, m) <= heroReach(m) + N.hero.reachGrace) {
        const crit = rng.next() < N.hero.critChance;
        const base = roll(rng, N.hero.damageMin, N.hero.damageMax) + heroBonusDamage(h);
        h.rage = Math.min(N.hero.maxRage, h.rage + N.hero.ragePerHit);
        hurtMonster(s, m, crit ? base * N.hero.critTimes : base, crit, 'swing', rng, ev);
      }
    }
  }
  if (h.charging || h.target === null) return;
  const m = monsterById(s, h.target);
  if (!m) return;
  const inReach = dist(h, m) <= heroReach(m);
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
    const k = kindOf(m);
    const heroUp = h.downFor <= 0;
    const d = dist(m, h);
    switch (m.mode) {
      case 'wander': {
        if (heroUp && d <= k.aggroRange) {
          m.mode = 'chase';
          m.goal = null;
        } else if (m.goal) {
          m.facing = angleTo(m, m.goal);
          if (stepToward(m, m.goal, k.wanderSpeed * dt)) {
            m.goal = null;
            m.timer = pause(m, rng);
          }
        } else {
          m.timer -= dt;
          if (m.timer <= 0) m.goal = strollGoal(s, m, rng);
        }
        break;
      }
      case 'chase': {
        if (!heroUp || Math.hypot(m.x - m.homeX, m.y - m.homeY) > k.leashRange) {
          m.mode = 'return';
        } else if (d <= monsterReach(m)) {
          m.mode = 'windup';
          m.timer = k.windupSeconds;
          m.facing = angleTo(m, h);
          ev.push({ type: 'monsterWindup', monster: m.id, seconds: k.windupSeconds });
        } else {
          m.facing = angleTo(m, h);
          stepToward(m, h, Math.min(k.chaseSpeed * dt, d - (monsterReach(m) - 2)));
        }
        break;
      }
      case 'windup': {
        m.timer -= dt;
        if (m.timer <= 0) {
          // He had the wind-up's time to get away: a bite lands only if he is still close, a slam on all within it.
          const struck = k.slamRadius > 0 ? d <= k.slamRadius : d <= monsterReach(m) + k.reachGrace;
          if (heroUp && struck) hurtHero(s, m, rng, ev);
          else ev.push({ type: 'monsterMissed', monster: m.id });
          if (k.retreatSeconds > 0) {
            m.mode = 'retreat';
            m.timer = k.retreatSeconds;
          } else {
            m.mode = 'rest';
            m.timer = k.restSeconds;
          }
        }
        break;
      }
      case 'rest': {
        m.timer -= dt;
        if (m.timer <= 0) m.mode = heroUp ? 'chase' : 'return';
        break;
      }
      case 'retreat': {
        // It backs off the way it came, then turns and comes again: it has to be caught, or met as it lands.
        m.timer -= dt;
        if (d > 0.001) {
          const away = { x: m.x + ((m.x - h.x) / d) * 100, y: m.y + ((m.y - h.y) / d) * 100 };
          stepToward(m, away, k.chaseSpeed * dt);
          m.facing = angleTo(m, away);
        }
        if (m.timer <= 0) m.mode = heroUp ? 'chase' : 'return';
        break;
      }
      case 'return': {
        // Going home it mends, is whole when it gets there, and takes no notice of him unless he hits it.
        m.hp = Math.min(k.maxHp, m.hp + k.maxHp * dt);
        const home = { x: m.homeX, y: m.homeY };
        m.facing = angleTo(m, home);
        if (stepToward(m, home, k.chaseSpeed * dt)) {
          m.hp = k.maxHp;
          m.mode = 'wander';
          m.timer = pause(m, rng);
        }
        break;
      }
    }
  }
  separate(s.monsters);
  for (const m of s.monsters) clampToPlace(s, m);
}

function hurtHero(s: GameState, m: Monster, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  const k = kindOf(m);
  const amount = Math.max(1, roll(rng, k.damageMin, k.damageMax) - heroArmour(h));
  h.hp -= amount;
  h.sinceHit = 0;
  h.rage = Math.min(N.hero.maxRage, h.rage + N.hero.ragePerHitTaken);
  ev.push({ type: 'heroHit', monster: m.id, amount });
  // Struck with nothing targeted, he turns on whoever struck him.
  if (h.target === null) setTarget(s, m.id, 'struck', ev);
  if (h.hp <= 0) {
    // He falls, and it costs him a share of the money he carries (Robin, 2026-11-19 and 2026-11-20).
    const lost = Math.floor(h.gold * N.death.goldShare);
    h.gold -= lost;
    h.hp = 0;
    h.downFor = N.hero.reviveSeconds;
    h.dest = null;
    h.swing = null;
    h.charging = null;
    h.mending = 0;
    h.moving = false;
    s.deaths += 1;
    setTarget(s, null, 'lost', ev);
    ev.push({ type: 'heroDown', lost });
  }
}

/** He wakes in the harbour town, whole again (Robin, 2026-11-20). */
function standUp(s: GameState, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  const town = PLACES[START_PLACE]!;
  h.downFor = 0;
  enterPlace(s, START_PLACE, town.wake, rng, ev);
  h.hp = heroMaxHp(h);
  h.rage = 0;
  h.facing = Math.PI / 2;
  h.sinceHit = N.hero.regenAfterSeconds;
  ev.push({ type: 'heroUp', place: START_PLACE });
}

function stepRespawns(s: GameState, dt: number, rng: Rng, ev: GameEvent[]): void {
  for (let i = s.respawns.length - 1; i >= 0; i--) {
    const r = s.respawns[i]!;
    r.in -= dt;
    if (r.in <= 0) {
      s.respawns.splice(i, 1);
      spawn(s, r.zone, rng, ev);
    }
  }
}

/** A new monster somewhere in its zone, away from the hero and from the others. */
function spawn(s: GameState, zoneIndex: number, rng: Rng, ev: GameEvent[]): void {
  const zone = placeOf(s).zones[zoneIndex];
  if (!zone) return;
  let at: Vec | null = null;
  for (let i = 0; i < 12 && !at; i++) {
    const p = { x: zone.x + rng.next() * zone.w, y: zone.y + rng.next() * zone.h };
    if (dist(p, s.hero) < N.spawn.clearance) continue;
    if (s.monsters.some((m) => dist(p, m) < N.spawn.apart)) continue;
    at = p;
  }
  // Twelve unlucky tries: the corner of its zone furthest from him.
  if (!at) at = { x: s.hero.x < zone.x + zone.w / 2 ? zone.x + zone.w : zone.x, y: s.hero.y < zone.y + zone.h / 2 ? zone.y + zone.h : zone.y };
  const m: Monster = {
    id: s.nextId,
    kind: zone.kind,
    zone: zoneIndex,
    x: at.x,
    y: at.y,
    homeX: at.x,
    homeY: at.y,
    facing: rng.next() * Math.PI * 2,
    hp: 0,
    mode: 'wander',
    timer: 0,
    goal: null,
    stunned: 0,
  };
  m.hp = kindOf(m).maxHp;
  m.timer = pause(m, rng);
  clampToPlace(s, m);
  m.homeX = m.x;
  m.homeY = m.y;
  s.nextId += 1;
  s.monsters.push(m);
  ev.push({ type: 'monsterSpawned', monster: m.id });
}

function pause(m: Monster, rng: Rng): number {
  const k = kindOf(m);
  return k.wanderPauseMin + rng.next() * (k.wanderPauseMax - k.wanderPauseMin);
}

function strollGoal(s: GameState, m: Monster, rng: Rng): Vec {
  const a = rng.next() * Math.PI * 2;
  const r = rng.next() * kindOf(m).wanderRange;
  const goal = { x: m.homeX + Math.cos(a) * r, y: m.homeY + Math.sin(a) * r };
  clampToPlace(s, goal);
  return goal;
}

/** Two monsters never stand in one another: each is pushed half the overlap away. */
function separate(ms: Monster[]): void {
  for (let i = 0; i < ms.length; i++) {
    for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i]!;
      const b = ms[j]!;
      const min = kindOf(a).radius + kindOf(b).radius;
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
