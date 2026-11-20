// The world moving on by one step: the hero walks and swings, the monsters stroll, chase and strike, the fallen come
// back, the loot flies to him. Pure: every die comes from `rng`, time only from the step's `dt`, the real clock only
// from the step's `now`. The state handed in is never changed; the step works on a copy and hands that back.

import { MAX_DT, clampToPlace, clone, heroReach, monsterById, monsterReach, nearestMonster, reject, roll, setTarget } from './core.ts';
import { N, START_PLACE, PLACES, heroArmour, heroBonusDamage, heroMaxHp, hopOf, kindOf, placeOf } from './data.ts';
import { angleTo, dist, stepToward } from './geometry.ts';
import { clear, inHome, onLand, walk } from './ground.ts';
import { hurtMonster, stepDrops } from './loot.ts';
import { reachable, route, sight } from './path.ts';
import type { Rng } from './rng.ts';
import { SKILLS } from './skillset.ts';
import { enterPlace, restock } from './town.ts';
import type { ApplyResult, GameEvent, GameState, Monster, Vec } from './types.ts';

/** The size of the hero where he meets the ground: what must fit past a rock. */
const FEET = N.hero.radius * 0.5;

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
  for (const id of Object.keys(h.skillCd) as (keyof typeof h.skillCd)[]) h.skillCd[id] = Math.max(0, (h.skillCd[id] ?? 0) - dt);
  h.braceFor = Math.max(0, h.braceFor - dt);
  h.potionCd = Math.max(0, h.potionCd - dt);
  h.swingIn = Math.max(0, h.swingIn - dt);
  h.sinceHit += dt;

  if (h.downFor > 0) {
    h.moving = false;
    h.downFor -= dt;
    if (h.downFor <= 0) standUp(s, rng, ev);
  } else {
    const wasHome = inHome(placeOf(s), h);
    moveHero(s, dt, ev);
    // Coming into the town from outside puts new pieces on the stall, as sailing in did.
    if (!wasHome && inHome(placeOf(s), h) && placeOf(s).shop) restock(s, rng);
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
  // Second wind: a share of his health over its seconds.
  if (h.windFor > 0) {
    h.hp += ((SKILLS.wind.share! * max) / SKILLS.wind.seconds!) * Math.min(dt, h.windFor);
    h.windFor = Math.max(0, h.windFor - dt);
  }
  if (inHome(placeOf(s), h)) h.hp += N.hero.townRegenPerSecond * dt;
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
      h.route = [];
      h.chase = false;
    } else if (h.dest) {
      // Corner by corner along the way that was found for the tap; the last corner is where he was sent.
      if (stepToward(h, h.route[0] ?? h.dest, N.hero.speed * dt)) {
        h.route.shift();
        if (h.route.length === 0) h.dest = null;
      }
    } else if (h.chase && h.target !== null) {
      const m = monsterById(s, h.target);
      if (m) {
        const stop = heroReach(m) - 4;
        const d = dist(h, m);
        if (d > stop) {
          // With a straight way to it he walks at it; with something between, he walks the way round, found
          // afresh twice a second because it moves.
          const place = placeOf(s);
          if (sight(place, h, m, FEET)) h.route = [];
          else if (h.route.length === 0 || s.ticks % 30 === 0) h.route = route(place, h, m, FEET);
          const corner = h.route.length > 1 ? h.route[0] : undefined;
          if (corner) {
            if (stepToward(h, corner, N.hero.speed * dt)) h.route.shift();
          } else {
            stepToward(h, m, Math.min(N.hero.speed * dt, d - stop));
          }
        } else {
          h.route = [];
        }
      }
    }
  }

  // The ground has the last word: he walks on land only, and round the things in the way.
  const wanted = Math.hypot(h.x - fromX, h.y - fromY);
  if (wanted > 0) {
    const at = walk(placeOf(s), { x: fromX, y: fromY }, h, FEET);
    h.x = at.x;
    h.y = at.y;
  }
  const moved = Math.hypot(h.x - fromX, h.y - fromY);
  // The way was found for him, so this is rare: if the ground will not let him on, he stops where he is.
  if (h.dest && wanted > 0.01 && moved < wanted * 0.05) {
    h.dest = null;
    h.route = [];
  }
  h.moving = moved > 0.01;
  if (h.moving) h.facing = Math.atan2(h.y - fromY, h.x - fromX);
}

/**
 * Who he fights when the player has not said. With no target he takes the nearest one near enough. A target far
 * behind is let go. One the player picked himself (a tap, a skill) is never changed for another; one the rules
 * picked is changed for a monster in reach, or for one clearly nearer, as he is steered about.
 */
function pickTarget(s: GameState, ev: GameEvent[]): void {
  const h = s.hero;
  const current = h.target !== null ? monsterById(s, h.target) : undefined;
  if (h.target !== null && !current) setTarget(s, null, 'lost', ev);

  const nearest = nearestMonster(s, N.autoTarget.pickRange);
  if (!current) {
    if (nearest) setTarget(s, nearest.id, 'nearest', ev);
    return;
  }
  const d = dist(h, current);
  // One he is walking up to is never too far: a tap may land on a monster at the far end of the screen.
  if (d > N.autoTarget.dropRange && !h.chase) {
    setTarget(s, nearest ? nearest.id : null, nearest ? 'nearest' : 'lost', ev);
    return;
  }
  if (h.chosen) return;
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
  const safe = inHome(placeOf(s), h);
  for (const m of [...s.monsters]) {
    const d = dist(m, h);
    // Far from him a monster that is only strolling sleeps: an island can be big without every step being long.
    if (d > N.world.awake && m.mode === 'wander') continue;
    if (m.stunned > 0) {
      m.stunned = Math.max(0, m.stunned - dt);
      continue;
    }
    const k = kindOf(m);
    // In the town nothing comes for him: to a monster he is as good as gone. But one he has hurt fights on, town
    // or not, as far as its leash goes: he cannot stand on the town's edge and fell them for nothing.
    const heroUp = h.downFor <= 0 && (!safe || m.hp < k.maxHp);
    const fromX = m.x;
    const fromY = m.y;
    // A hopper travels only while it is in the air, that much faster.
    const pace = hopOf(k, m.id, s.time).pace;
    switch (m.mode) {
      case 'wander': {
        if (heroUp && d <= k.aggroRange) {
          m.mode = 'chase';
          m.goal = null;
        } else if (m.goal) {
          m.facing = angleTo(m, m.goal);
          if (stepToward(m, m.goal, k.wanderSpeed * pace * dt)) {
            m.goal = null;
            m.timer = pause(m, rng);
          }
        } else {
          m.timer -= dt;
          if (m.timer <= 0) {
            // A stroll only goes where it can stand; if the dice point out to sea, it waits and tries again.
            const goal = strollGoal(s, m, rng);
            if (k.flies || onLand(placeOf(s), goal.x, goal.y)) m.goal = goal;
            else m.timer = 0.5;
          }
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
          stepToward(m, h, Math.min(k.chaseSpeed * pace * dt, d - (monsterReach(m) - 2)));
        }
        break;
      }
      case 'windup': {
        m.timer -= dt;
        if (m.timer <= 0) {
          if (k.rushSpeed > 0) {
            // The piglet's way: no bite where it stands. It runs straight through where he stands now, and on.
            const far = Math.max(k.rushLength, d + 80);
            m.mode = 'rush';
            m.goal = d > 0.001 ? { x: m.x + ((h.x - m.x) / d) * far, y: m.y + ((h.y - m.y) / d) * far } : { x: m.x + far, y: m.y };
            // 1 while it can still hit him on this run.
            m.timer = 1;
            m.facing = angleTo(m, m.goal);
            break;
          }
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
      case 'rush': {
        // Head down, straight on: it hits him once if it runs into him, and skids to a rest at the end of its run.
        const there = m.goal ? stepToward(m, m.goal, k.rushSpeed * dt) : true;
        if (m.timer > 0 && heroUp && dist(m, h) <= k.radius + N.hero.radius + 4) {
          hurtHero(s, m, rng, ev);
          m.timer = 0;
        }
        if (there) {
          if (m.timer > 0) ev.push({ type: 'monsterMissed', monster: m.id });
          m.goal = null;
          m.mode = 'rest';
          m.timer = k.restSeconds;
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
        if (stepToward(m, home, k.chaseSpeed * pace * dt)) {
          m.hp = k.maxHp;
          m.mode = 'wander';
          m.timer = pause(m, rng);
        }
        break;
      }
    }
    // What walks keeps to the land and goes round the things in the way; what flies does not care.
    if (!k.flies && (m.x !== fromX || m.y !== fromY)) {
      const at = walk(placeOf(s), { x: fromX, y: fromY }, m, k.radius * 0.5);
      m.x = at.x;
      m.y = at.y;
      // A stroll that runs into something ends there.
      if (m.mode === 'wander' && m.goal && Math.hypot(m.x - fromX, m.y - fromY) < 0.01) {
        m.goal = null;
        m.timer = pause(m, rng);
      }
      // So does a run: into a palm, and it sits down.
      if (m.mode === 'rush' && Math.hypot(m.x - fromX, m.y - fromY) < 0.5) {
        m.goal = null;
        m.mode = 'rest';
        m.timer = k.restSeconds;
      }
    }
  }
  separate(s.monsters);
  for (const m of s.monsters) clampToPlace(s, m);
}

function hurtHero(s: GameState, m: Monster, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  const k = kindOf(m);
  // Braced, a bite does a share less; never less than 1.
  const braced = h.braceFor > 0 ? 1 - SKILLS.brace.share! : 1;
  const amount = Math.max(1, Math.round((roll(rng, k.damageMin, k.damageMax) - heroArmour(h)) * braced));
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
    h.route = [];
    h.swing = null;
    h.charging = null;
    h.mending = 0;
    h.windFor = 0;
    h.braceFor = 0;
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
  const place = placeOf(s);
  const zone = place.zones[zoneIndex];
  if (!zone) return;
  const radius = kindOf(zone).radius;
  let at: Vec | null = null;
  let spare: Vec | null = null;
  for (let i = 0; i < 24 && !at; i++) {
    const p = { x: zone.x + rng.next() * zone.w, y: zone.y + rng.next() * zone.h };
    // A zone's box may reach over water or a rock: only ground it can stand on will do. And never where he steps
    // ashore: a landing is safe.
    if (!clear(place, p.x, p.y, radius) || inHome(place, p) || dist(p, place.arrive) < N.spawn.landing) continue;
    // And only where he can walk to: nothing is born in a pocket between stones.
    if (!reachable(place, p.x, p.y, FEET)) continue;
    spare = p;
    if (dist(p, s.hero) < N.spawn.clearance) continue;
    if (s.monsters.some((m) => dist(p, m) < N.spawn.apart)) continue;
    at = p;
  }
  // Unlucky: somewhere it can stand, even if near him; and if the dice found no ground at all, it tries again soon.
  at = at ?? spare;
  if (!at) {
    s.respawns.push({ zone: zoneIndex, in: 1 });
    return;
  }
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
