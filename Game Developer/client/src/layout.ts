// What every scene shares: the game's name, the design size, the colours and the text face.

/** The game's name as the player sees it (Robin, 2026-11-20: the real name). */
export const GAME_NAME = 'Drok';

// The design size: an Android phone, portrait (Robin judges at 412 by 915). Everything is placed in these units.
// Phaser scales the canvas to fit whatever screen it gets and centres it; a wider screen gets dark bands at the sides.
export const DESIGN_WIDTH = 412;
export const DESIGN_HEIGHT = 915;

/**
 * How many canvas pixels a design unit gets, so shapes and words are sharp on a phone's dense screen. The canvas is
 * the design size times this; both cameras zoom by it. Capped at 2: a phone at 2.6 still looks sharp, and it fills
 * 1.5 million pixels a frame instead of 2.6 (mine; the frame log on Robin's phone says whether there is room for more).
 */
export const RES = Math.min(2, Math.max(1, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1));

// Stand-in colours, in the direction Robin picked on 2026-11-20 (vibrant pirate; clean line, flat colour): warm
// sand, bright sea, strong clear figures. The Art Director's art replaces every shape these paint.
export const COLORS = {
  page: '#12202b',
  // The ground tiles (painted once in the boot scene): base, darker speck, lighter speck.
  sand: ['#ecd9a0', '#d9c283', '#f6e9bd'],
  grass: ['#8fd06a', '#72b955', '#a9e283'],
  rock: ['#b9a98e', '#a0907a', '#cdbfa6'],
  cobble: ['#c9b89a', '#b3a184', '#dccdb2'],
  foam: 0xfdfbf0,
  sea: 0x2bb3c9,
  seaDeep: 0x1f93ab,
  wood: 0xa9774a,
  woodDark: 0x7d5433,
  tuft: 0x5fb85a,
  tuftDark: 0x3f9a4c,
  palm: 0x2f9e5b,
  palmDark: 0x1f7a44,
  shell: 0xf2a7b5,
  stone: 0x8c8172,
  wall: 0xf6ead2,
  roofs: [0xe4572e, 0x2e86ab, 0xf2b134, 0x76b041, 0xa23b72],
  awning: 0xe4572e,
  awningStripe: 0xfdfbf0,
  shadow: 0x3b2a12,
  hero: 0x1f8fa6,
  heroDark: 0x12596b,
  bandana: 0xd9363e,
  skin: 0xf2c79a,
  blade: 0xf3f6f8,
  buckler: 0x9a6a3a,
  keeper: 0x7a4fa3,
  folk: [0x2e86ab, 0xf2b134],
  crab: 0xe8603c,
  crabDark: 0x9e3420,
  gull: 0xf7f7f2,
  gullDark: 0x7f8a94,
  beak: 0xf2b134,
  coconut: 0x8a5a3c,
  coconutDark: 0x4f3020,
  windup: 0xffe08a,
  stunned: 0x9aa3ad,
  slam: 0xe5484d,
  chest: 0x9a6a3a,
  chestDark: 0x5d3d1f,
  chestBand: 0xf2c94c,
  gold: 0xf2c94c,
  goldDark: 0xb8860b,
  potion: 0xe5484d,
  target: 0xffd23f,
  mark: 0xffffff,
  hp: 0xe5484d,
  rage: 0xf59e0b,
  xp: 0x7bd3ff,
  barBack: 0x10202a,
  panel: 0x16313f,
  panelLight: 0x1d4557,
  panelEdge: 0x2f6d86,
  button: 0x1d4557,
  buttonOn: 0xf0b429,
  buttonGo: 0x2f9e5b,
  chartSea: 0x2a9db5,
  chartLand: 0xe9d7a3,
  chartLandEdge: 0x7d5433,
  text: '#f6f2e6',
  textDark: '#16313f',
  dim: '#b9d3dc',
  goldText: '#f2c94c',
  good: '#7be08a',
  bad: '#ff8b8b',
  hit: '#ffffff',
  crit: '#ffd23f',
  hurt: '#ff6b6b',
  warn: '#ffd23f',
} as const;

/** A colour written '#rrggbb' as the number Phaser's shapes want. */
export function hex(color: string): number {
  return Number.parseInt(color.slice(1), 16);
}

/** What is drawn over what. Figures on the field sort by how far down the screen they stand, on top of `bodies`. */
export const DEPTH = {
  ground: 0,
  decor: 2,
  marks: 4,
  shadows: 6,
  bodies: 10,
  effects: 6000,
  hud: 10000,
  panel: 11000,
  banner: 12000,
} as const;

/** The text face: the phone's own, until the game chooses one. */
export const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';
