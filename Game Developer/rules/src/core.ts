// What every part of the rules leans on: a copy of the state to work on, the refusal, finding and targeting
// monsters, a roll of the dice, a new piece of gear, a thing put on the ground.

import { N, RARITY_ORDER, kindOf, placeOf } from './data.ts';
import { clamp, dist } from './geometry.ts';
import { onLand } from './ground.ts';
import type { Rng } from './rng.ts';
import type { Action, ApplyResult, Drop, GameEvent, GameState, Item, Monster, Rarity, RejectReason, TargetWhy, Vec } from './types.ts';

/** The longest step the world takes at once. A longer one is refused, so a stalled page cannot fling the hero. */
export const MAX_DT = 0.1;

/** How far apart the two middles may be for his swing to land on this monster. */
export function heroReach(m: { kind: string }): number {
  return N.hero.radius + kindOf(m).radius + N.hero.reach;
}

/** How far apart the two middles may be for this monster's bite to land. */
export function monsterReach(m: { kind: string }): number {
  const k = kindOf(m);
  return k.radius + N.hero.radius + k.reach;
}

/** Keep a point inside the place he is in. */
export function clampToPlace(s: GameState, p: Vec): void {
  const place = placeOf(s);
  p.x = clamp(p.x, N.margin, place.width - N.margin);
  p.y = clamp(p.y, N.margin, place.height - N.margin);
}

/** A copy deep enough that changing it never touches the state it came from. Gear is never changed, only moved. */
export function clone(s: GameState): GameState {
  const h = s.hero;
  return {
    ...s,
    hero: {
      ...h,
      bag: [...h.bag],
      worn: { ...h.worn },
      dest: h.dest ? { ...h.dest } : null,
      route: [...h.route],
      steer: { ...h.steer },
      swing: h.swing ? { ...h.swing } : null,
      charging: h.charging ? { ...h.charging } : null,
      skillCd: { ...h.skillCd },
      slots: [...h.slots],
    },
    monsters: s.monsters.map((m) => ({ ...m, goal: m.goal ? { ...m.goal } : null })),
    respawns: s.respawns.map((r) => ({ ...r })),
    drops: s.drops.map((d) => ({ ...d })),
    chests: { ...s.chests },
    shop: [...s.shop],
    book: { ...s.book },
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
  // One he picked himself (a tap, a skill) is his to keep; one the rules picked may be changed for a nearer one.
  if (id === null) s.hero.chosen = false;
  else if (why === 'tap' || why === 'skill') s.hero.chosen = true;
  else if (s.hero.target !== id) s.hero.chosen = false;
  if (s.hero.target === id) return;
  s.hero.target = id;
  if (id === null) s.hero.chase = false;
  ev.push({ type: 'targeted', monster: id, why });
}

/** A whole number from min to max, both included. */
export function roll(rng: Rng, min: number, max: number): number {
  return min + rng.int(max - min + 1) - 1;
}

/** One of a list, by the dice. */
export function pick<T>(rng: Rng, list: T[]): T {
  return list[rng.int(list.length) - 1]!;
}

/** A rarity by its weight. */
export function rollRarity(rng: Rng, weights: Record<Rarity, number>): Rarity {
  let total = 0;
  for (const r of RARITY_ORDER) total += weights[r];
  let at = rng.next() * total;
  for (const r of RARITY_ORDER) {
    at -= weights[r];
    if (at < 0) return r;
  }
  return 'common';
}

export function newItem(s: GameState, base: string, rarity: Rarity): Item {
  const item: Item = { id: s.nextId, base, rarity };
  s.nextId += 1;
  return item;
}

/** Put something on the ground near `at`, a little scattered so two things do not lie in one another. */
export function putDrop(s: GameState, kind: Drop['kind'], amount: number, item: Item | null, at: Vec, spread: number, rng: Rng, ev: GameEvent[], age = 0): void {
  const a = rng.next() * Math.PI * 2;
  const r = spread * (0.4 + 0.6 * rng.next());
  const drop: Drop = { id: s.nextId, x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r, kind, amount, item, age };
  s.nextId += 1;
  // Nothing falls into the sea: what would, lies where the thing it came from stood.
  if (!onLand(placeOf(s), drop.x, drop.y)) {
    drop.x = at.x;
    drop.y = at.y;
  }
  clampToPlace(s, drop);
  s.drops.push(drop);
  ev.push({ type: 'dropped', drop: { ...drop } });
}
