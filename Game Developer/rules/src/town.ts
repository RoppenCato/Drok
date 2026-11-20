// Coming and going, and what he does with what he found: arriving in a place, sailing from a dock, the harbour's
// stall, wearing and taking off gear, drinking a potion.

import { clampToPlace, clone, reject, rollRarity, newItem, pick, setTarget } from './core.ts';
import { BASES, N, PLACES, SHOP, SLOTS, baseOf, buyPrice, heroMaxHp, placeOf, sellPrice } from './data.ts';
import { dist } from './geometry.ts';
import type { Rng } from './rng.ts';
import type { ApplyResult, GameEvent, GameState, Rarity, Slot, Vec } from './types.ts';

/**
 * He is now in `id`, standing at `at`. The place he left is gone with everything on its ground; the new one fills
 * from its zones on the next step. A town puts new pieces on its stall.
 */
export function enterPlace(s: GameState, id: string, at: Vec, rng: Rng, ev: GameEvent[]): void {
  const h = s.hero;
  s.place = id;
  h.x = at.x;
  h.y = at.y;
  clampToPlace(s, h);
  h.dest = null;
  h.route = [];
  h.chase = false;
  h.swing = null;
  h.charging = null;
  h.moving = false;
  setTarget(s, null, 'lost', ev);
  s.monsters = [];
  s.drops = [];
  s.respawns = [];
  const place = placeOf(s);
  place.zones.forEach((zone, i) => {
    for (let n = 0; n < zone.count; n++) s.respawns.push({ zone: i, in: 0 });
  });
  if (place.shop) restock(s, rng);
}

/** New pieces on the stall: a few, each for another part of him, of the tier his level has earned. */
export function restock(s: GameState, rng: Rng): void {
  const tier = SHOP.tierAtLevel[s.hero.level] ?? 1;
  const slots = [...SLOTS];
  s.shop = [];
  for (let i = 0; i < SHOP.pieces && slots.length > 0; i++) {
    const slot = slots.splice(rng.int(slots.length) - 1, 1)[0]!;
    const ids = Object.keys(BASES).filter((id) => BASES[id]!.tier === tier && BASES[id]!.slot === slot);
    const rarity: Rarity = rollRarity(rng, SHOP.weights);
    s.shop.push(newItem(s, pick(rng, ids), rarity));
  }
}

/** Sail to another place: only from the dock, and he lands on the other place's dock. */
export function sail(state: GameState, to: string, rng: Rng): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'sail', 'down');
  const there = PLACES[to];
  if (!there) return reject(state, 'sail', 'no such place');
  if (to === state.place) return reject(state, 'sail', 'already there');
  if (dist(state.hero, placeOf(state).dock) > N.reach.dock) return reject(state, 'sail', 'not at the dock');
  const s = clone(state);
  const ev: GameEvent[] = [];
  const from = s.place;
  enterPlace(s, to, there.arrive, rng, ev);
  // He steps off the boat facing inland.
  s.hero.facing = -Math.PI / 2;
  ev.push({ type: 'sailed', from, to });
  return { state: s, events: ev };
}

function atShop(s: GameState): boolean {
  const shop = placeOf(s).shop;
  return shop !== null && dist(s.hero, shop) <= N.reach.shop;
}

export function buy(state: GameState, what: number | 'potion'): ApplyResult {
  if (!placeOf(state).shop) return reject(state, 'buy', 'no shop here');
  if (!atShop(state)) return reject(state, 'buy', 'too far');
  const h = state.hero;
  if (what === 'potion') {
    if (h.potions >= N.potion.carry) return reject(state, 'buy', 'potions full');
    if (h.gold < N.potion.price) return reject(state, 'buy', 'not enough gold');
    const s = clone(state);
    s.hero.gold -= N.potion.price;
    s.hero.potions += 1;
    return { state: s, events: [{ type: 'bought', what: 'potion', item: null, price: N.potion.price }] };
  }
  const item = state.shop[what];
  if (!item) return reject(state, 'buy', 'sold out');
  const price = buyPrice(item);
  if (h.gold < price) return reject(state, 'buy', 'not enough gold');
  if (h.bag.length >= N.bagSize) return reject(state, 'buy', 'bag is full');
  const s = clone(state);
  s.hero.gold -= price;
  s.hero.bag.push(item);
  s.shop[what] = null;
  return { state: s, events: [{ type: 'bought', what: 'item', item, price }] };
}

export function sell(state: GameState, id: number): ApplyResult {
  if (!placeOf(state).shop) return reject(state, 'sell', 'no shop here');
  if (!atShop(state)) return reject(state, 'sell', 'too far');
  const item = state.hero.bag.find((i) => i.id === id);
  if (!item) return reject(state, 'sell', 'no such item');
  const s = clone(state);
  const price = sellPrice(item);
  s.hero.bag = s.hero.bag.filter((i) => i.id !== id);
  s.hero.gold += price;
  return { state: s, events: [{ type: 'sold', item, price }] };
}

/** Wear a piece from the bag. What he wore in that place goes into the bag, in the worn piece's stead. */
export function equip(state: GameState, id: number): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'equip', 'down');
  const at = state.hero.bag.findIndex((i) => i.id === id);
  const item = state.hero.bag[at];
  if (!item) return reject(state, 'equip', 'no such item');
  const s = clone(state);
  const h = s.hero;
  const slot = baseOf(item).slot;
  const was = h.worn[slot];
  h.worn[slot] = item;
  if (was) h.bag[at] = was;
  else h.bag.splice(at, 1);
  h.hp = Math.min(h.hp, heroMaxHp(h));
  return { state: s, events: [{ type: 'equipped', item }] };
}

export function unequip(state: GameState, slot: Slot): ApplyResult {
  if (state.hero.downFor > 0) return reject(state, 'unequip', 'down');
  const item = SLOTS.includes(slot) ? state.hero.worn[slot] : null;
  if (!item) return reject(state, 'unequip', 'no such item');
  if (state.hero.bag.length >= N.bagSize) return reject(state, 'unequip', 'bag is full');
  const s = clone(state);
  s.hero.worn[slot] = null;
  s.hero.bag.push(item);
  s.hero.hp = Math.min(s.hero.hp, heroMaxHp(s.hero));
  return { state: s, events: [{ type: 'unequipped', item }] };
}

/** Throw a piece away for good, to make room. */
export function discard(state: GameState, id: number): ApplyResult {
  const item = state.hero.bag.find((i) => i.id === id);
  if (!item) return reject(state, 'discard', 'no such item');
  const s = clone(state);
  s.hero.bag = s.hero.bag.filter((i) => i.id !== id);
  return { state: s, events: [{ type: 'discarded', item }] };
}

/** Drink a potion: it mends over a few seconds, and then there is a wait before the next. */
export function drinkPotion(state: GameState): ApplyResult {
  const h = state.hero;
  if (h.downFor > 0) return reject(state, 'potion', 'down');
  if (h.potions <= 0) return reject(state, 'potion', 'no potions');
  if (h.potionCd > 0) return reject(state, 'potion', 'on cooldown');
  if (h.hp >= heroMaxHp(h)) return reject(state, 'potion', 'full health');
  const s = clone(state);
  s.hero.potions -= 1;
  s.hero.potionCd = N.potion.cooldownSeconds;
  s.hero.mending = N.potion.seconds;
  const ev: GameEvent[] = [{ type: 'potionUsed' }];
  return { state: s, events: ev };
}
