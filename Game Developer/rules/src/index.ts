// The rules package: the game as a pure function. The client and the tests import from here, never from the files inside.
export * from './types.ts';
export { makeRng, resumeRng, hashSeed, type Rng } from './rng.ts';
export { newGame, apply, type NewGameOptions } from './game.ts';
export { MAX_DT, heroReach, monsterReach } from './core.ts';
export {
  N,
  MONSTERS,
  PLACES,
  START_PLACE,
  SLOTS,
  KINDS,
  wearSlot,
  RARITIES,
  RARITY_ORDER,
  BASES,
  SHOP,
  kindOf,
  placeOf,
  baseOf,
  itemStats,
  itemName,
  buyPrice,
  sellPrice,
  heroMaxHp,
  heroArmour,
  heroBonusDamage,
  xpToNext,
  chestFull,
  type MonsterKind,
  type Place,
  type Biome,
  type Zone,
  type ItemBase,
  type RarityInfo,
} from './data.ts';
export { dist, angleTo, angleDiff } from './geometry.ts';
export { onLand, clear, walk, inHome, biomeAt } from './ground.ts';
export { SKILLS, SKILL_ORDER, SKILL_SLOTS, START_SKILLS, skillCost, skillText, knows, cooldownLeft, type Skill } from './skills.ts';
export { STATE_VERSION, migrate, packSave, unpackSave, type SaveFile } from './save.ts';
