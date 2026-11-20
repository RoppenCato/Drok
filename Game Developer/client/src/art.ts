// Which of the Art Director's drops are in the game. A drop is his whole folder `Art Director\out\<name>\`, copied
// as it is into `client\public\art\<name>\`; the day it is copied, it is switched on here, and the stand-in shape
// it replaces is no longer drawn. Until then the game runs on stand-ins. `docs\state\art.md` says what each is.

export const ART = {
  /** `art/hero`: the Warrior's body, in five drawn facings, with the points his gear rides on. */
  hero: false,
  /** `art/gear`: cutlasses, bucklers and hats as small pictures for those points, and the bag's icons. */
  gear: false,
  /** `art/<kind>`: the kinds of monster that have their own atlas. */
  monsters: [] as string[],
};

/** The game's name for a piece of gear, and the Art Director's name for its picture. */
export const GEAR_ART: Record<string, string> = {
  'rusty-cutlass': 'cutlass-rusty',
  'sailors-cutlass': 'cutlass-sailor',
  'corsairs-cutlass': 'cutlass-corsair',
  'plank-buckler': 'buckler-plank',
  'iron-buckler': 'buckler-iron',
  'brass-buckler': 'buckler-brass',
  bandana: 'hat-bandana',
  tricorn: 'hat-tricorn',
  'feathered-hat': 'hat-feathered',
  'linen-shirt': 'coat-linen',
  'sailors-coat': 'coat-sailor',
  'corsairs-coat': 'coat-corsair',
};
