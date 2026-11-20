// The data files, with their shapes, and the sums made from them: what a piece of gear gives, what it is worth, how
// much health the hero has. Every number of the game is in rules/data; nothing here is a number of its own.

import itemsJson from '../data/items.json';
import monstersJson from '../data/monsters.json';
import numbers from '../data/numbers.json';
import placesJson from '../data/places.json';
import type { GameState, Hero, Item, Rarity, Slot, Vec } from './types.ts';

/** The hero's numbers and the ones every place shares, from rules/data/numbers.json. */
export const N = numbers;

export interface MonsterKind {
  name: string;
  level: number;
  radius: number;
  maxHp: number;
  wanderSpeed: number;
  wanderRange: number;
  wanderPauseMin: number;
  wanderPauseMax: number;
  chaseSpeed: number;
  aggroRange: number;
  leashRange: number;
  reach: number;
  reachGrace: number;
  windupSeconds: number;
  restSeconds: number;
  /** After a strike it backs off for this long instead of resting. 0: it rests. */
  retreatSeconds: number;
  /** Its strike hits everything within this of it. 0: only what is in reach. */
  slamRadius: number;
  /** It flies: the shore and the things in the way do not stop it. */
  flies: boolean;
  damageMin: number;
  damageMax: number;
  respawnSeconds: number;
  xp: number;
  goldChance: number;
  goldMin: number;
  goldMax: number;
  potionChance: number;
  itemChance: number;
  itemTier: number;
}

export interface Zone {
  kind: string;
  count: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChestSpot extends Vec {
  refillMinutes: number;
  goldMin: number;
  goldMax: number;
  itemTier: number;
  potions: number;
}

export interface Place {
  name: string;
  town: boolean;
  levels: string;
  width: number;
  height: number;
  /** Where he must stand to sail, and where he steps ashore when he sails in. */
  dock: Vec;
  arrive: Vec;
  /** Where he stands when he wakes here after a fall. */
  wake: Vec;
  /** The shore, as the corners of an outline: outside it is sea. Null: the place is its whole box. */
  land: number[][] | null;
  /** Water inside the land, each as an outline. */
  water: number[][][];
  /** Things to walk round: trunks, rocks, barrels, the chest. */
  solids: { x: number; y: number; r: number }[];
  /** Things to walk round that are boxes (a house, a stall), each by its top left corner and its size. */
  boxes: { x: number; y: number; w: number; h: number }[];
  shop: (Vec & { keeper: string }) | null;
  chest: ChestSpot | null;
  zones: Zone[];
  /** Where it sits on the sea chart, as shares of the chart's width and height. */
  chart: Vec;
}

export interface ItemBase {
  slot: Slot;
  tier: number;
  name: string;
  damage: number;
  hp: number;
  armour: number;
  value: number;
}

export interface RarityInfo {
  name: string;
  times: number;
  weight: number;
  color: string;
}

function withoutAbout<T extends object>(raw: T): Omit<T, '_about'> {
  const copy = { ...raw } as Record<string, unknown>;
  delete copy._about;
  return copy as Omit<T, '_about'>;
}

export const MONSTERS = withoutAbout(monstersJson) as Record<string, MonsterKind>;
export const PLACES = placesJson.places as Record<string, Place>;
export const START_PLACE: string = placesJson.start;
export const SLOTS = itemsJson.slots as Slot[];
export const RARITIES = withoutAbout(itemsJson.rarities) as Record<Rarity, RarityInfo>;
export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic'];
export const BASES = itemsJson.bases as Record<string, ItemBase>;
export const SHOP = itemsJson.shop;
export const CHEST_WEIGHTS = itemsJson.chestWeights as Record<Rarity, number>;
export const START_GEAR = itemsJson.start as Partial<Record<Slot, string>>;

/** The kind of a monster. A kind the data does not know is a broken save; the save's check keeps those out. */
export function kindOf(m: { kind: string }): MonsterKind {
  const kind = MONSTERS[m.kind];
  if (!kind) throw new Error(`no such monster kind: ${m.kind}`);
  return kind;
}

export function placeOf(s: { place: string }): Place {
  const place = PLACES[s.place];
  if (!place) throw new Error(`no such place: ${s.place}`);
  return place;
}

export function baseOf(item: Item): ItemBase {
  const base = BASES[item.base];
  if (!base) throw new Error(`no such gear: ${item.base}`);
  return base;
}

/** A base's number at a rarity: times the rarity, and never less than one more for each step of rarity. */
function atRarity(base: number, rarity: Rarity): number {
  if (base <= 0) return 0;
  return Math.max(Math.round(base * RARITIES[rarity].times), base + RARITY_ORDER.indexOf(rarity));
}

/** What a piece gives when worn. */
export function itemStats(item: Item): { damage: number; hp: number; armour: number } {
  const b = baseOf(item);
  return { damage: atRarity(b.damage, item.rarity), hp: atRarity(b.hp, item.rarity), armour: atRarity(b.armour, item.rarity) };
}

export function itemName(item: Item): string {
  return baseOf(item).name;
}

function worth(item: Item): number {
  return baseOf(item).value * RARITIES[item.rarity].times;
}

/** What the stall asks for a piece, and what it gives for one. */
export function buyPrice(item: Item): number {
  return Math.ceil(worth(item) * SHOP.buyTimes);
}

export function sellPrice(item: Item): number {
  return Math.max(1, Math.floor(worth(item) * SHOP.sellShare));
}

function wornSum(hero: Hero, pick: (stats: ReturnType<typeof itemStats>) => number): number {
  let sum = 0;
  for (const slot of SLOTS) {
    const item = hero.worn[slot];
    if (item) sum += pick(itemStats(item));
  }
  return sum;
}

export function heroMaxHp(hero: Hero): number {
  return N.hero.maxHp + (hero.level - 1) * N.levels.hpPerLevel + wornSum(hero, (s) => s.hp);
}

/** What every bite is lessened by; a bite never does less than 1. */
export function heroArmour(hero: Hero): number {
  return wornSum(hero, (s) => s.armour);
}

/** What his level and his cutlass add to every swing. */
export function heroBonusDamage(hero: Hero): number {
  return Math.floor((hero.level - 1) * N.levels.damagePerLevel) + wornSum(hero, (s) => s.damage);
}

/** What his level needs to become the next; 0 at the last level. */
export function xpToNext(level: number): number {
  return level >= N.levels.max ? 0 : (N.levels.xpToNext[level] ?? 0);
}

/** Is the chest of the place he is in full, on the clock the state last heard? */
export function chestFull(s: GameState): boolean {
  const chest = placeOf(s).chest;
  if (!chest) return false;
  const opened = s.chests[s.place];
  return opened === undefined || s.now - opened >= chest.refillMinutes * 60_000;
}
