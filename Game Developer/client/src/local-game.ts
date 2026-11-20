// The holder: the state and the random stream live here, in the browser, saved to localStorage. The one place in the
// client that calls the rules. It turns the screen's uneven frames into the even steps the rules want, reads the
// real clock for them, and keeps the state from one step back so the screen can draw between two steps (smooth on a
// 90 or 120 Hz phone).

import { apply, makeRng, newGame, packSave, resumeRng, unpackSave, type Action, type GameEvent, type GameState, type Rng } from '../../rules/src/index.ts';

export const SAVE_KEY = 'drok.save';

/** The world's step: sixty a second, whatever the screen does. */
export const STEP_SECONDS = 1 / 60;
const STEP_MS = STEP_SECONDS * 1000;
/** A frame may catch up this many steps; a longer stall is dropped, so a page coming back does not fast-forward. */
const MAX_STEPS_A_FRAME = 6;
/** The save is written this often, and when the page is put away. Not every step: sixty writes a second is a waste. */
const SAVE_EVERY_MS = 5000;

/** What a scene may ask for: everything but the step, which is the holder's own. */
export type Intent = Exclude<Action, { type: 'tick' }>;

export class LocalGame {
  state: GameState;
  /** The state one step back, and how far the screen is between the two (0 to 1). */
  prev: GameState;
  alpha = 1;
  /** Set by ?drive=1: time only moves when a script steps it, so a test in the pane is exact. */
  drive = false;
  private rng: Rng;
  private readonly storage: Storage | null;
  private pending = 0;
  private sinceSave = 0;
  private queue: GameEvent[] = [];

  private constructor(state: GameState, rng: Rng, storage: Storage | null) {
    this.state = state;
    this.prev = state;
    this.rng = rng;
    this.storage = storage;
  }

  /** The saved game, brought up to today's version; null when there is none or it is broken, so a new one starts. */
  static load(storage: Storage | null): LocalGame | null {
    try {
      const raw = storage?.getItem(SAVE_KEY);
      const save = raw ? unpackSave(raw) : null;
      if (save) return new LocalGame(rested(save.state), resumeRng(save.rng), storage);
    } catch {
      // A broken save: start fresh.
    }
    return null;
  }

  /** A fresh game, saved at once. The seed is new each time unless one is given (a script in the pane gives one). */
  static create(storage: Storage | null, seed = newSeed()): LocalGame {
    const game = new LocalGame(newGame({ seed }), makeRng(seed), storage);
    game.save();
    return game;
  }

  /** Do what the player wants, now. What the rules answered is returned, and also kept for the screen to draw. */
  act(intent: Intent): GameEvent[] {
    const result = apply(this.state, intent, this.rng);
    this.state = result.state;
    this.queue.push(...result.events);
    return result.events;
  }

  /** A frame of `ms` has passed: take as many even steps as fit. Does nothing in drive mode. */
  advance(ms: number): void {
    if (this.drive) return;
    this.pending += Math.min(ms, 250);
    let steps = 0;
    while (this.pending >= STEP_MS && steps < MAX_STEPS_A_FRAME) {
      this.stepOnce();
      this.pending -= STEP_MS;
      steps += 1;
    }
    if (steps === MAX_STEPS_A_FRAME) this.pending = 0;
    this.alpha = this.pending / STEP_MS;
    this.sinceSave += ms;
    if (this.sinceSave >= SAVE_EVERY_MS) this.save();
  }

  /** Exactly `n` steps, whatever the clock says: for scripts in the pane. */
  step(n = 1): void {
    for (let i = 0; i < n; i++) this.stepOnce();
    this.alpha = 1;
  }

  /** What happened since the screen last asked. */
  takeEvents(): GameEvent[] {
    const events = this.queue;
    this.queue = [];
    return events;
  }

  /** The save as text: what is written to the phone, and what "export save" hands the player as a file. */
  pack(): string {
    return packSave(this.state, this.rng.state);
  }

  /** Take a save read from a file in the place of this game. False, and nothing changed, when it is not a save. */
  unpack(text: string): boolean {
    const save = unpackSave(text);
    if (!save) return false;
    this.state = rested(save.state);
    this.prev = this.state;
    this.rng = resumeRng(save.rng);
    this.queue = [];
    this.pending = 0;
    this.save();
    return true;
  }

  save(): void {
    this.sinceSave = 0;
    try {
      this.storage?.setItem(SAVE_KEY, this.pack());
    } catch {
      // Storage full or blocked: the game goes on, unsaved.
    }
  }

  /** Throw the save away: the next load starts a new game. */
  reset(): void {
    try {
      this.storage?.removeItem(SAVE_KEY);
    } catch {
      // Storage blocked: nothing to throw away.
    }
  }

  private stepOnce(): void {
    this.prev = this.state;
    // The real clock is read here and handed to the rules, which never read one themselves.
    const result = apply(this.state, { type: 'tick', dt: STEP_SECONDS, now: Date.now() }, this.rng);
    this.state = result.state;
    this.queue.push(...result.events);
  }
}

/** Nobody's thumb is on the screen when a save is opened: let go of whatever was held when it was written. */
function rested(state: GameState): GameState {
  return { ...state, hero: { ...state.hero, steer: { x: 0, y: 0 }, dest: null } };
}

/** A fresh seed: the browser's UUID, or a stamp and some noise where there is none (plain http on the LAN). */
function newSeed(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
