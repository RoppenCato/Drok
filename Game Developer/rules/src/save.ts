// The save's version, and the way up from older saves. A state carries its version from day one. When the shape
// changes, STATE_VERSION goes up by one and a step is added here that brings the old shape to the new, so nobody
// loses a game to an update.

import type { GameState } from './types.ts';

/**
 * The shape of the state today. 1 is the control test's field. There is no older shape of Drok yet, so there is no
 * step yet; the first one is written the day the shape changes, in the form
 * `if (raw.version === 1) return fromVersion1(raw)`.
 */
export const STATE_VERSION = 1;

/**
 * Bring a stored state up to today's version, or null for anything that is not a state we know (a broken save, a
 * version from the future, nonsense), so the holder starts fresh instead of crashing on it.
 */
export function migrate(raw: unknown): GameState | null {
  if (!looksLikeState(raw)) return null;
  if (raw.version === STATE_VERSION) return raw as unknown as GameState;
  return null;
}

/** The fields every version has had, with the right kind of value in each. Cheap, and it catches most broken saves. */
function looksLikeState(raw: unknown): raw is { version: unknown } & Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null) return false;
  const s = raw as Partial<GameState>;
  return (
    typeof s.version === 'number' &&
    typeof s.seed === 'string' &&
    typeof s.time === 'number' &&
    typeof s.hero === 'object' &&
    s.hero !== null &&
    typeof s.hero.x === 'number' &&
    typeof s.hero.y === 'number' &&
    typeof s.hero.hp === 'number' &&
    Array.isArray(s.monsters) &&
    Array.isArray(s.respawns)
  );
}
