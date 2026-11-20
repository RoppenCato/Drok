// Which of the Art Director's drops are in the game. A drop is his folder `Art Director\out\<name>\`, copied into
// `client\public\art\<name>\` (without the loose frames and look pictures it was made from); the day it is copied
// and the game can draw it, it is switched on here, and the stand-in shape it replaces is no longer drawn. A place
// or a thing with no switch still runs on stand-ins. `docs\state\art.md` says what each is and how it is drawn.
// Every look is Leonard, AD's own choice until Robin has judged it (Robin, 2026-11-20: "Let AD handle the art you
// need. I approve.").

export const ART = {
  /** `art/hero`: the Warrior's body, in five drawn facings, with the points his gear rides on. */
  hero: true,
  /** `art/gear`: cutlasses, bucklers and hats as small pictures for those points, and the bag's icons. */
  gear: true,
  /** `art/<kind>`: the kinds of monster that have their own atlas. */
  monsters: ['sand-crab', 'reef-gull', 'coconut-crab'] as string[],
  /** `art/loot`: coins, a potion, a bundle of gear, a ring for each rarity, a spark. */
  loot: true,
  /** The places whose ground and props are drawn from a drop: the game's place, and the drop's folder. */
  places: { 'crab-cay': 'crab-cay' } as Record<string, string>,
  /** The name of the props' atlas in a place's folder, where it is not the folder's own name. */
  sets: { 'crab-cay': 'island' } as Record<string, string>,
  /** The people who stand about in a place: the drop's folder, and the atlas in it (its actions are who they are). */
  folk: { 'crab-cay': 'folk' } as Record<string, string>,
  /** `art/glass`: bars, discs, buttons, panels, slots and marks for the glass and the windows. */
  glass: true,
  /** `art/chart`: the sea chart as one picture that fills the screen, its pins and marks, and where each place is on it. */
  chart: true,
};

/** The game's name for a place, and the Art Director's name for it on his chart. */
export const CHART_ART: Record<string, string> = { 'crab-cay': 'island-1' };

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
  'canvas-breeches': 'breeches-canvas',
  'sailors-breeches': 'breeches-sailor',
  'corsairs-breeches': 'breeches-corsair',
  'worn-boots': 'boots-worn',
  'sea-boots': 'boots-sea',
  'captains-boots': 'boots-captain',
  'shark-tooth-necklace': 'necklace-tooth',
  'coral-necklace': 'necklace-coral',
  'black-pearl-necklace': 'necklace-pearl',
  'lucky-doubloon': 'trinket-doubloon',
  'brass-compass': 'trinket-compass',
  'golden-spyglass': 'trinket-spyglass',
};
