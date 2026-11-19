// A small holder for the tests: a state, its dice, and every event so far. The tests place things by hand (the state
// is plain data) and let the world run in the same even steps the game uses.

import { apply, makeRng, N, newGame, type Action, type GameEvent, type GameState, type Monster, type NewGameOptions, type Rng } from '../src/index.ts';

export const DT = 1 / 60;

export class Sim {
  state: GameState;
  readonly rng: Rng;
  events: GameEvent[] = [];

  constructor(seed = 'tide', options: Omit<NewGameOptions, 'seed'> = {}) {
    this.state = newGame({ seed, ...options });
    this.rng = makeRng(seed);
  }

  /** A field with nobody on it but the hero, and nobody on the way. */
  static empty(seed = 'tide', options: Omit<NewGameOptions, 'seed'> = {}): Sim {
    const sim = new Sim(seed, options);
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    return sim;
  }

  act(action: Action): GameEvent[] {
    const result = apply(this.state, action, this.rng);
    this.state = result.state;
    this.events.push(...result.events);
    return result.events;
  }

  /** Let the world run for this many seconds. */
  run(seconds: number): void {
    const steps = Math.round(seconds / DT);
    for (let i = 0; i < steps; i++) this.act({ type: 'tick', dt: DT });
  }

  /** Run until `done` says so, or `limit` seconds have gone. Back comes the time it took. */
  runUntil(done: (sim: Sim) => boolean, limit = 30): number {
    const start = this.state.time;
    while (!done(this) && this.state.time - start < limit) this.act({ type: 'tick', dt: DT });
    return this.state.time - start;
  }

  /** Put a monster on the field. It stands still until something wakes it, unless the patch says otherwise. */
  monster(dx: number, dy: number, patch: Partial<Monster> = {}): Monster {
    const h = this.state.hero;
    const m: Monster = {
      id: this.state.nextId,
      kind: N.monster.kind,
      x: h.x + dx,
      y: h.y + dy,
      homeX: h.x + dx,
      homeY: h.y + dy,
      facing: 0,
      hp: N.monster.maxHp,
      mode: 'wander',
      timer: 999,
      goal: null,
      stunned: 0,
      ...patch,
    };
    this.state = { ...this.state, monsters: [...this.state.monsters, m], nextId: this.state.nextId + 1 };
    return m;
  }

  /** Change the hero by hand. */
  hero(patch: Partial<GameState['hero']>): void {
    this.state = { ...this.state, hero: { ...this.state.hero, ...patch } };
  }

  find(id: number): Monster | undefined {
    return this.state.monsters.find((m) => m.id === id);
  }

  count(type: GameEvent['type']): number {
    return this.events.filter((e) => e.type === type).length;
  }

  of<T extends GameEvent['type']>(type: T): Extract<GameEvent, { type: T }>[] {
    return this.events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
  }
}
