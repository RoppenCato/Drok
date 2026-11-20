// The save's version, the way up from older saves, and the save as a file that can leave the phone. A state
// carries its version from day one. When the shape changes, STATE_VERSION goes up by one and a step is added here
// that brings the old shape to the new, so nobody loses a game to an update.

import { BASES, MONSTERS, PLACES, START_PLACE } from './data.ts';
import { newGame } from './game.ts';
import { onLand } from './ground.ts';
import type { GameState, Item, Scheme } from './types.ts';

/**
 * The shape of the state today.
 * 1: the control test's one field (2026-11-20).
 * 2: chapter 1: places, levels, money, a bag, gear, loot on the ground, the chest, the stall.
 * 3: the hero carries the way he is walking (`route`), now that there are things to walk round.
 */
export const STATE_VERSION = 3;

/**
 * Bring a stored state up to today's version, or null for anything that is not a state we know (a broken save, a
 * version from the future, nonsense), so the holder starts fresh instead of crashing on it.
 */
export function migrate(raw: unknown): GameState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const version = (raw as { version?: unknown }).version;
  if (version === 1) return fromVersion1(raw as Record<string, unknown>);
  if (version === 2) return fromVersion2(raw as Record<string, unknown>);
  if (version === STATE_VERSION) return checked(raw as Record<string, unknown>);
  return null;
}

/** 2 → 3. He was walking in straight lines; he now carries his way, and starts with none. */
function fromVersion2(old: Record<string, unknown>): GameState | null {
  if (typeof old.hero !== 'object' || old.hero === null) return null;
  return checked({ ...old, version: STATE_VERSION, hero: { ...(old.hero as Record<string, unknown>), route: [], dest: null } });
}

/**
 * 1 → 2. The control test had a hero on one field and nothing to keep but the seed, the way of steering, and what
 * he had felled and how often he fell. He starts chapter 1 as a new hero in the harbour with those carried over.
 */
function fromVersion1(old: Record<string, unknown>): GameState | null {
  if (typeof old.seed !== 'string' || typeof old.hero !== 'object' || old.hero === null || !Array.isArray(old.monsters)) return null;
  const scheme: Scheme = old.scheme === 2 || old.scheme === 3 ? old.scheme : 1;
  const fresh = newGame({ seed: old.seed, scheme });
  return { ...fresh, kills: count(old.kills), deaths: count(old.deaths) };
}

function count(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

/**
 * A version 2 state, looked over: the fields that must be there are there, and nothing in it names a place, a
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
    Object.values(h.worn).every((item) => item === null || known(item)) &&
    s.shop.every((item) => item === null || known(item)) &&
    s.drops.every((d) => d.kind !== 'item' || known(d.item));
  // A place whose layout has changed since the save (the island got its shore) may have him standing in the sea.
  const here = PLACES[s.place];
  const afoot = here !== undefined && onLand(here, h.x, h.y);
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
      swing: null,
      charging: null,
      bag: h.bag.filter(known),
      worn: {
        weapon: known(h.worn.weapon) ? h.worn.weapon : null,
        shield: known(h.worn.shield) ? h.worn.shield : null,
        hat: known(h.worn.hat) ? h.worn.hat : null,
        coat: known(h.worn.coat) ? h.worn.coat : null,
      },
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
