// The save's version, the way up from older saves, and the save as a file that can leave the phone. A state
// carries its version from day one. When the shape changes, STATE_VERSION goes up by one and a step is added here
// that brings the old shape to the new, so nobody loses a game to an update.

import { BASES, MONSTERS, PLACES, SLOTS, START_PLACE } from './data.ts';
import { newGame } from './game.ts';
import { clear } from './ground.ts';
import type { GameState, Item, Slot } from './types.ts';

/**
 * The shape of the state today.
 * 1: the control test's one field (2026-11-20).
 * 2: chapter 1: places, levels, money, a bag, gear, loot on the ground, the chest, the stall.
 * 3: the hero carries the way he is walking (`route`), now that there are things to walk round.
 * 4: one way to steer (Robin, 2026-11-20): the state no longer says which of three; the hero carries whether he
 *    picked his target himself (`chosen`).
 * 5: eight parts of him to wear gear on, where there were four (Robin, 2026-11-20: "more slots for items").
 */
export const STATE_VERSION = 5;

/**
 * Bring a stored state up to today's version, or null for anything that is not a state we know (a broken save, a
 * version from the future, nonsense), so the holder starts fresh instead of crashing on it. A step at a time: a
 * version 2 save goes to 3 and then to 4.
 */
export function migrate(raw: unknown): GameState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  let r: Record<string, unknown> | null = raw as Record<string, unknown>;
  if (r.version === 1) return fromVersion1(r);
  if (r.version === 2) r = fromVersion2(r);
  if (r?.version === 3) r = fromVersion3(r);
  if (r?.version === 4) r = fromVersion4(r);
  if (r?.version === STATE_VERSION) return checked(r);
  return null;
}

/** 4 → 5. He wears what he wore; the four new parts of him are bare. */
function fromVersion4(old: Record<string, unknown>): Record<string, unknown> | null {
  if (typeof old.hero !== 'object' || old.hero === null) return null;
  const hero = old.hero as Record<string, unknown>;
  const worn = typeof hero.worn === 'object' && hero.worn !== null ? (hero.worn as Record<string, unknown>) : {};
  return { ...old, version: 5, hero: { ...hero, worn: { ...worn, gloves: null, boots: null, ring: null, charm: null } } };
}

/** 3 → 4. The way of steering is no longer a choice; he did not pick his target himself, as far as we know. */
function fromVersion3(old: Record<string, unknown>): Record<string, unknown> | null {
  if (typeof old.hero !== 'object' || old.hero === null) return null;
  const next: Record<string, unknown> = { ...old, version: 4, hero: { ...(old.hero as Record<string, unknown>), chosen: false } };
  delete next.scheme;
  return next;
}

/** 2 → 3. He was walking in straight lines; he now carries his way, and starts with none. */
function fromVersion2(old: Record<string, unknown>): Record<string, unknown> | null {
  if (typeof old.hero !== 'object' || old.hero === null) return null;
  return { ...old, version: 3, hero: { ...(old.hero as Record<string, unknown>), route: [], dest: null } };
}

/**
 * 1 → today. The control test had a hero on one field and nothing to keep but the seed, and what he had felled and
 * how often he fell. He starts chapter 1 as a new hero in the harbour with those carried over.
 */
function fromVersion1(old: Record<string, unknown>): GameState | null {
  if (typeof old.seed !== 'string' || typeof old.hero !== 'object' || old.hero === null || !Array.isArray(old.monsters)) return null;
  const fresh = newGame({ seed: old.seed });
  return { ...fresh, kills: count(old.kills), deaths: count(old.deaths) };
}

function count(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

/**
 * A state of today's version, looked over: the fields that must be there are there, and nothing in it names a place, a
 * monster or a piece of gear the data does not know (an older build's save after a rename), since the rules would
 * trip on those. Unknown gear and monsters are dropped; an unknown place sends him to the harbour.
 */
function checked(raw: Record<string, unknown>): GameState | null {
  const s = raw as unknown as GameState;
  const h = s.hero as GameState['hero'] | undefined;
  const ok =
    typeof s.seed === 'string' &&
    typeof s.time === 'number' &&
    typeof s.place === 'string' &&
    typeof h === 'object' &&
    h !== null &&
    typeof h.x === 'number' &&
    typeof h.y === 'number' &&
    typeof h.hp === 'number' &&
    typeof h.level === 'number' &&
    typeof h.gold === 'number' &&
    Array.isArray(h.bag) &&
    Array.isArray(h.route) &&
    typeof h.chosen === 'boolean' &&
    typeof h.worn === 'object' &&
    h.worn !== null &&
    Array.isArray(s.monsters) &&
    Array.isArray(s.respawns) &&
    Array.isArray(s.drops) &&
    Array.isArray(s.shop) &&
    typeof s.chests === 'object' &&
    s.chests !== null &&
    typeof s.book === 'object' &&
    s.book !== null;
  if (!ok) return null;

  const known = (item: Item | null | undefined): item is Item => !!item && typeof item.base === 'string' && BASES[item.base] !== undefined;
  const clean =
    PLACES[s.place] !== undefined &&
    s.monsters.every((m) => MONSTERS[m.kind] !== undefined) &&
    h.bag.every(known) &&
    SLOTS.every((slot) => h.worn[slot] === null || known(h.worn[slot])) &&
    s.shop.every((item) => item === null || known(item)) &&
    s.drops.every((d) => d.kind !== 'item' || known(d.item));
  // A place whose layout has changed since the save (the island got its shore, the town its houses) may have him
  // standing in the sea or inside a wall. Only a point right inside a thing counts: beside one he is where he slid.
  const here = PLACES[s.place];
  const afoot = here !== undefined && clear(here, h.x, h.y, 0);
  if (clean && afoot) return s;

  const place = here !== undefined ? s.place : START_PLACE;
  const there = PLACES[place]!;
  // In a place he did not save in, or on ground that is gone, he is put where one arrives, and the place starts over.
  const moved = place !== s.place || !afoot;
  const spot = place !== s.place ? there.wake : there.arrive;
  return {
    ...s,
    place,
    monsters: moved ? [] : s.monsters.filter((m) => MONSTERS[m.kind] !== undefined),
    respawns: moved ? there.zones.flatMap((zone, i) => Array.from({ length: zone.count }, () => ({ zone: i, in: 0 }))) : s.respawns,
    drops: moved ? [] : s.drops.filter((d) => d.kind !== 'item' || known(d.item)),
    shop: s.shop.map((item) => (known(item) ? item : null)),
    hero: {
      ...h,
      x: moved ? spot.x : h.x,
      y: moved ? spot.y : h.y,
      dest: null,
      route: [],
      chase: false,
      target: null,
      chosen: false,
      swing: null,
      charging: null,
      bag: h.bag.filter(known),
      worn: Object.fromEntries(SLOTS.map((slot) => [slot, known(h.worn[slot]) ? h.worn[slot] : null])) as Record<Slot, Item | null>,
    },
  };
}

/** What is written to the phone and into an exported file: the state, which carries its version, and where the dice are. */
export interface SaveFile {
  game: 'drok';
  state: GameState;
  rng: number;
}

/** The save as text, for the phone's storage and for "export save" (Robin, 2026-11-20: from day one). */
export function packSave(state: GameState, rng: number): string {
  const file: SaveFile = { game: 'drok', state, rng };
  return JSON.stringify(file);
}

/** A save read back: the state brought up to today's version and the dice, or null for anything that is not one. */
export function unpackSave(text: string): { state: GameState; rng: number } | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const file = raw as Partial<SaveFile>;
  if (typeof file.rng !== 'number' || !Number.isFinite(file.rng)) return null;
  const state = migrate(file.state);
  return state ? { state, rng: file.rng } : null;
}
