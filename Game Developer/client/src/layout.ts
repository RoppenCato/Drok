// What every scene shares: the game's name, the design size, the colours and the text face.

/** The game's name as the player sees it. Drok is a placeholder: the setup replaces it here, in client/index.html and in vite.config.ts. */
export const GAME_NAME = 'Drok';

// The design size: an Android phone, portrait (Robin judges at 412 by 915). Phaser scales it to fit whatever screen it
// gets and centres it; a wider screen gets dark bands at the sides.
export const DESIGN_WIDTH = 412;
export const DESIGN_HEIGHT = 915;

export const COLORS = {
  background: '#1b1f2a',
  square: 0x2b3245,
  /** A square you can step to. */
  squareNear: 0x3d4d6b,
  border: 0x4a5470,
  player: 0x4fb06d,
  text: '#f6f2e6',
  dim: '#c9d0de',
  gold: '#e8b84a',
  warn: '#ffb347',
  button: '#2b3245',
} as const;

/** The text face: the phone's own, until the game chooses one. */
export const FONT = 'system-ui, "Segoe UI", Roboto, sans-serif';
