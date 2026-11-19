// Solo play: the state and the random stream live here, in the browser, saved to localStorage. The one place in the
// client that calls the rules. When friends play together, a holder that talks to a server takes this one's place:
// the scenes send the same intents and get the same events back, so they need not change.

import { apply, makeRng, migrate, newGame, resumeRng, type Action, type GameEvent, type GameState, type Player, type Rng } from '../../rules/src/index.ts';

export const SAVE_KEY = 'drok.save';
/** The one local player. Accounts come with a server. */
export const PLAYER = 'local';
/** How often the world ticks while the page is open. */
export const TICK_MS = 60_000;

/** An action before the holder gives it its id: what a scene sends. */
export type Intent = { [T in Action['type']]: Omit<Extract<Action, { type: T }>, 'id'> }[Action['type']];

/** What is written to localStorage: the state, which carries its version, and where the dice are. */
interface Save {
  state: GameState;
  rng: number;
}

export class LocalGame {
  state: GameState;
  readonly player = PLAYER;
  private rng: Rng;
  private readonly storage: Storage | null;

  private constructor(state: GameState, rng: Rng, storage: Storage | null) {
    this.state = state;
    this.rng = rng;
    this.storage = storage;
  }

  /** The saved game, brought up to today's version; null when there is none or it is broken, so a new one starts. */
  static load(storage: Storage | null): LocalGame | null {
    try {
      const raw = storage?.getItem(SAVE_KEY);
      if (raw) {
        const save = JSON.parse(raw) as Partial<Save>;
        const state = migrate(save.state);
        if (state && typeof save.rng === 'number') return new LocalGame(state, resumeRng(save.rng), storage);
      }
    } catch {
      // A broken save: start fresh.
    }
    return null;
  }

  /** A fresh game, saved at once. The seed is new each time unless one is given (a script in the pane gives one). */
  static create(storage: Storage | null, seed = newId()): LocalGame {
    const game = new LocalGame(newGame({ seed, player: PLAYER }), makeRng(seed), storage);
    game.save();
    return game;
  }

  get me(): Player {
    return this.state.players[PLAYER]!;
  }

  /** The holder's clock: the rules never read one themselves. */
  now(): number {
    return Date.now();
  }

  /** Do what the player wants and save. The answer comes as a promise, so a server can take this holder's place. */
  act(intent: Intent): Promise<GameEvent[]> {
    return Promise.resolve(this.actNow(intent));
  }

  /** The same without the wait: for the tick, and for scripts in the pane. */
  actNow(intent: Intent): GameEvent[] {
    const action = { ...intent, id: newId() } as Action;
    const result = apply(this.state, action, this.rng, this.now());
    this.state = result.state;
    this.save();
    return result.events;
  }

  /** The world moves. The page sends it on load, when it comes back to the front, and once a minute. */
  tick(): GameEvent[] {
    return this.actNow({ type: 'tick', player: 'world' });
  }

  /** Throw the save away: the next load starts a new game. */
  reset(): void {
    try {
      this.storage?.removeItem(SAVE_KEY);
    } catch {
      // Storage blocked: nothing to throw away.
    }
  }

  private save(): void {
    try {
      const save: Save = { state: this.state, rng: this.rng.state };
      this.storage?.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      // Storage full or blocked: the game goes on, unsaved.
    }
  }
}

/** A fresh id for an action or a seed: the browser's UUID, or a stamp and some noise where there is none (plain http on the LAN). */
function newId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
