// What hunting gives: a hurt monster, a fallen one, experience and levels, loot on the ground that flies to him
// when he walks close (Robin, 2026-11-20), and the chest. The rules roll everything; the screen only shows it.

import { clone, newItem, pick, putDrop, reject, roll, rollRarity, setTarget, nearestMonster } from './core.ts';
import { BASES, CHEST_WEIGHTS, N, RARITIES, chestFull, heroMaxHp, kindOf, placeOf, wearSlot, xpToNext } from './data.ts';
import { dist, stepToward } from './geometry.ts';
import type { Rng } from './rng.ts';
import type { ApplyResult, GameEvent, GameState, Monster, Prize, Rarity, Vec } from './types.ts';

const DROP_WEIGHTS: Record<Rarity, number> = { common: RARITIES.common.weight, uncommon: RARITIES.uncommon.weight, rare: RARITIES.rare.weight, epic: RARITIES.epic.weight };

export function hurtMonster(s: GameState, m: Monster, amount: number, crit: boolean, by: 'swing' | 'cleave', rng: Rng, ev: GameEvent[]): void {
  m.hp -= amount;
  ev.push({ type: 'hit', monster: m.id, amount, crit, by, x: m.x, y: m.y });
  // A hit monster comes for him, wherever it was going.
  if (m.mode === 'wander' || m.mode === 'return') {
    m.mode = 'chase';
    m.goal = null;
  }
  if (m.hp <= 0) killMonster(s, m, rng, ev);
}

function killMonster(s: GameState, m: Monster, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  const kind = kindOf(m);
  s.monsters = s.monsters.filter((other) => other.id !== m.id);
  s.kills += 1;
  s.book[m.kind] = (s.book[m.kind] ?? 0) + 1;
  s.respawns.push({ zone: m.zone, in: kind.respawnSeconds });
  ev.push({ type: 'monsterDied', monster: m.id, kind: m.kind, x: m.x, y: m.y });
  if (h.swing?.target === m.id) h.swing = null;
  if (h.charging?.target === m.id) h.charging = null;
  if (h.target === m.id) {
    // The target fell: whoever is after him is the next one, so he never stands idle while something bites him.
    const next = nearestMonster(s, Infinity, (o) => o.mode === 'chase' || o.mode === 'windup' || o.mode === 'rest' || o.mode === 'retreat');
    if (next) setTarget(s, next.id, 'next', ev);
    else setTarget(s, null, 'lost', ev);
  }
  gainXp(s, kind.xp, ev);
  dropLoot(s, m, rng, ev);
}

/** Experience, and every level it is enough for. A level fills his health. At the last level nothing more is gained. */
export function gainXp(s: GameState, amount: number, ev: GameEvent[]): void {
  const h = s.hero;
  if (h.level >= N.levels.max || amount <= 0) return;
  h.xp += amount;
  ev.push({ type: 'xp', amount });
  while (h.level < N.levels.max && h.xp >= xpToNext(h.level)) {
    h.xp -= xpToNext(h.level);
    h.level += 1;
    h.hp = heroMaxHp(h);
    ev.push({ type: 'levelUp', level: h.level });
  }
  if (h.level >= N.levels.max) h.xp = 0;
}

/** A gear base of this tier, by the dice. */
function baseOfTier(rng: Rng, tier: number, slot?: string): string {
  const ids = Object.keys(BASES).filter((id) => BASES[id]!.tier === tier && (slot === undefined || BASES[id]!.slot === slot));
  return pick(rng, ids);
}

/** What a fallen monster leaves: money, sometimes a potion, sometimes a piece of gear. Always rolled in this order. */
function dropLoot(s: GameState, m: Monster, rng: Rng, ev: GameEvent[]): void {
  const kind = kindOf(m);
  const spread = N.drops.scatter;
  if (rng.next() < kind.goldChance) putDrop(s, 'gold', roll(rng, kind.goldMin, kind.goldMax), null, m, spread, rng, ev);
  if (rng.next() < kind.potionChance) putDrop(s, 'potion', 1, null, m, spread, rng, ev);
  if (rng.next() < kind.itemChance) {
    const rarity = rollRarity(rng, DROP_WEIGHTS);
    putDrop(s, 'item', 1, newItem(s, baseOfTier(rng, kind.itemTier), rarity), m, spread, rng, ev);
  }
}

/** A piece for the stall or the chest. */
export function rollGear(s: GameState, rng: Rng, tier: number, weights: Record<Rarity, number>, slot?: string): ReturnType<typeof newItem> {
  const rarity = rollRarity(rng, weights);
  return newItem(s, baseOfTier(rng, tier, slot), rarity);
}

/** The things on the ground: they grow old and vanish; close to him they fly to him and are his. */
export function stepDrops(s: GameState, dt: number, ev: GameEvent[]): void {
  const h = s.hero;
  const up = h.downFor <= 0;
  const kept: typeof s.drops = [];
  for (const d of s.drops) {
    d.age += dt;
    if (d.age > N.drops.lifeSeconds) continue;
    const far = dist(d, h);
    // It has just popped out: it lands and lies a moment first, so it is seen.
    if (!up || d.age < N.drops.settleSeconds || far > N.drops.magnetRange) {
      kept.push(d);
      continue;
    }
    // What he cannot carry stays where it lies; a piece for a bare part of him is put on, so it needs no room.
    const place = d.kind === 'item' && d.item !== null ? wearSlot(h, d.item) : null;
    const bare = place !== null && h.worn[place] === null;
    if (d.kind === 'item' && !bare && h.bag.length >= N.bagSize) {
      if (far <= N.drops.pickRange * 2 && s.ticks % 90 === 0) ev.push({ type: 'bagFull' });
      kept.push(d);
      continue;
    }
    if (d.kind === 'potion' && h.potions >= N.potion.carry) {
      kept.push(d);
      continue;
    }
    if (far > N.drops.pickRange) stepToward(d, h, Math.min(N.drops.magnetSpeed * dt, far - N.drops.pickRange * 0.5));
    if (dist(d, h) > N.drops.pickRange) {
      kept.push(d);
      continue;
    }
    if (d.kind === 'gold') h.gold += d.amount;
    else if (d.kind === 'potion') h.potions = Math.min(N.potion.carry, h.potions + d.amount);
    else if (d.item && place && bare) h.worn[place] = d.item;
    else if (d.item) h.bag.push(d.item);
    ev.push({ type: 'picked', drop: { ...d } });
    if (d.item && bare) ev.push({ type: 'equipped', item: d.item });
  }
  s.drops = kept;
}

/** Open the chest of the place he is in: he must stand by it, and it must have filled again (on the real clock). */
export function openChest(state: GameState, rng: Rng): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'openChest', 'down');
  const chest = placeOf(state).chest;
  if (!chest) return reject(state, 'openChest', 'no chest here');
  if (dist(state.hero, chest) > N.reach.chest) return reject(state, 'openChest', 'too far');
  if (!chestFull(state)) return reject(state, 'openChest', 'chest is empty');
  const s = clone(state);
  const ev: GameEvent[] = [];
  s.chests[s.place] = s.now;
  // What is inside is rolled and handed to him at once (Robin, 2026-11-20: a pop-up screen, and the game pauses):
  // the screen shows the prizes one by one while the world stands still. Only what he cannot carry lies on the
  // ground by the chest.
  const h = s.hero;
  const side: Vec = { x: chest.x + (h.x - chest.x) * 0.5, y: chest.y + (h.y - chest.y) * 0.5 };
  const gold = roll(rng, chest.goldMin, chest.goldMax);
  const piece = rollGear(s, rng, chest.itemTier, CHEST_WEIGHTS);
  const prizes: Prize[] = [{ kind: 'gold', amount: gold, item: null }];
  h.gold += gold;
  if (chest.potions > 0) {
    const room = Math.max(0, N.potion.carry - h.potions);
    const taken = Math.min(room, chest.potions);
    h.potions += taken;
    prizes.push({ kind: 'potion', amount: chest.potions, item: null });
    if (taken < chest.potions) putDrop(s, 'potion', chest.potions - taken, null, side, 30, rng, ev);
  }
  const place = wearSlot(h, piece);
  let kept: Prize['kept'] = 'bag';
  if (h.worn[place] === null) {
    h.worn[place] = piece;
    kept = 'worn';
  } else if (h.bag.length < N.bagSize) {
    h.bag.push(piece);
  } else {
    kept = 'ground';
    putDrop(s, 'item', 1, piece, side, 30, rng, ev);
  }
  prizes.push({ kind: 'item', amount: 1, item: piece, kept });
  ev.unshift({ type: 'chestOpened', x: chest.x, y: chest.y, rarity: piece.rarity, prizes });
  return { state: s, events: ev };
}
