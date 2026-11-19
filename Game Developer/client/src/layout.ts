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

// Stand-in colours for the control test, in the direction Robin picked on 2026-11-20 (vibrant pirate): warm sand,
// bright sea, strong clear figures. The Art Director's look replaces all of them.
export const COLORS = {
  page: '#12202b',
  sand: '#ecd9a0',
  sandSpeck: '#d9c283',
  sandLight: '#f6e9bd',
  foam: 0xfdfbf0,
  sea: 0x2bb3c9,
  tuft: 0x5fb85a,
  tuftDark: 0x3f9a4c,
  shell: 0xf2a7b5,
  rock: 0x9c8f7a,
  shadow: 0x3b2a12,
  hero: 0x1f8fa6,
  heroDark: 0x12596b,
  bandana: 0xd9363e,
  skin: 0xf2c79a,
  blade: 0xf3f6f8,
  buckler: 0x9a6a3a,
  monster: 0xe8603c,
  monsterDark: 0x9e3420,
  monsterWindup: 0xffe08a,
  monsterStunned: 0x9aa3ad,
  target: 0xffd23f,
  mark: 0xffffff,
  hp: 0xe5484d,
  rage: 0xf59e0b,
  barBack: 0x10202a,
  panel: 0x16313f,
  panelEdge: 0x2f6d86,
  button: 0x1d4557,
  buttonOn: 0xf0b429,
  text: '#f6f2e6',
  textDark: '#16313f',
  dim: '#b9d3dc',
  hit: '#ffffff',
  crit: '#ffd23f',
  hurt: '#ff6b6b',
  warn: '#ffd23f',
} as const;

/** What is drawn over what. Figures on the field sort by how far down the screen they stand, on top of `bodies`. */
export const DEPTH = {
  ground: 0,
  decor: 2,
  marks: 4,
  shadows: 6,
  bodies: 10,
  effects: 4000,
  hud: 10000,
  panel: 11000,
} as const;

/** The text face: the phone's own, until the game chooses one. */
export const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';
