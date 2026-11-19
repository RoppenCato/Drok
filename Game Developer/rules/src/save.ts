// The save's version, and the way up from older saves. A state carries its version from day one. When the shape
// changes, STATE_VERSION goes up by one and a step is added here that brings the old shape to the new, so nobody
// loses a game to an update.

import type { GameState, Player } from './types.ts';

/**
 * The shape of the state today. It is 2 because version 1 is kept here as the worked example of a step (a player
 * had no gold). A new game may start again at 1 and drop the step.
 */
export const STATE_VERSION = 2;

/** A version-1 state, as far as the step needs it. */
interface StateV1 {
  version: 1;
  seed: string;
  board: GameState['board'];
  players: Record<string, Omit<Player, 'gold'>>;
  turn: string;
  ticks: number;
  time: number;
}

/**
 * Bring a stored state up to today's version, or null for anything that is not a state we know (a broken save, a
 * version from the future, nonsense), so the holder starts fresh instead of crashing on it.
 */
export function migrate(raw: unknown): GameState | null {
  if (!looksLikeState(raw)) return null;
  if (raw.version === 1) return fromVersion1(raw as unknown as StateV1);
  if (raw.version === STATE_VERSION) return raw as unknown as GameState;
  return null;
}

/** 1 → 2: every player gets their gold, none yet. */
function fromVersion1(old: StateV1): GameState {
  const players = Object.fromEntries(Object.entries(old.players).map(([id, p]) => [id, { ...p, gold: 0 }]));
  return { ...old, version: STATE_VERSION, players };
}

/** The fields every version has had, with the right kind of value in each. Cheap, and it catches most broken saves. */
function looksLikeState(raw: unknown): raw is { version: unknown } & Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null) return false;
  const s = raw as Partial<GameState>;
  return (
    typeof s.version === 'number' &&
    typeof s.seed === 'string' &&
    typeof s.turn === 'string' &&
    typeof s.players === 'object' &&
    s.players !== null &&
    typeof s.board === 'object' &&
    s.board !== null &&
    typeof s.board.spaces === 'object' &&
    typeof s.board.start === 'string'
  );
}
