// The shapes of the game: the state, what a player can do (actions) and what the rules say happened (events).
// Grow these with the game. Keep the state plain data (JSON in, JSON out), so it saves and travels as it is.

import type { STATE_VERSION } from './save.ts';

/** One place on the board. `links` are the spaces a player can step to from here. */
export interface Space {
  id: string;
  /** Where it is drawn, as a column and a row; the client turns that into pixels. */
  col: number;
  row: number;
  links: string[];
}

export interface Board {
  start: string;
  spaces: Record<string, Space>;
}

export interface Player {
  id: string;
  space: string;
  gold: number;
}

export interface GameState {
  version: typeof STATE_VERSION;
  seed: string;
  board: Board;
  players: Record<string, Player>;
  /** Whose turn it is. */
  turn: string;
  /** How often the world has ticked, and the holder's clock at the last tick (ms). */
  ticks: number;
  time: number;
}

/**
 * What a player wants: an intent ("move to b2"), never a result ("I rolled a 6"). The rules roll the dice and decide.
 * Every action carries the player it comes from and an id the client made, so a retry over a bad network can be told
 * from a second action.
 */
export type Action =
  /** The world moves. The holder sends it when the page opens, when it comes back to the front, and once a minute. */
  | { type: 'tick'; id: string; player: string }
  /** A step to a space next to the one you stand on. */
  | { type: 'move'; id: string; player: string; to: string };

export type RejectReason = 'unknown player' | 'not your turn' | 'no such space' | 'already there' | 'not next to you';

/** What happened. `action` is the id of the action that caused it. */
export type GameEvent =
  | { type: 'ticked'; action: string; player: string; ticks: number }
  | { type: 'moved'; action: string; player: string; from: string; to: string; found: number }
  /** The action did nothing, and why. The client shows the reason; the state is as it was. */
  | { type: 'rejected'; action: string; player: string; reason: RejectReason };

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
}
