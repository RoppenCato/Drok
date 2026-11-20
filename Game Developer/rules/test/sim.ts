// A small holder for the tests: a state, its dice, and every event so far. The tests place things by hand (the state
// is plain data) and let the world run in the same even steps the game uses.

import { apply, kindOf, makeRng, newGame, placeOf, type Action, type GameEvent, type GameState, type Item, type Monster, type NewGameOptions, type Rarity, type Rng } from '../src/index.ts';

export const DT = 1 / 60;
/** A real clock for the tests: it starts here and moves with the world. */
export const NOON = 1_800_000_000_000;
/** The hunting ground the tests use, and a quiet spot in the middle of it. */
export const ISLAND = 'crab-cay';
export const MIDDLE = { x: 700, y: 1200 };

export class Sim {
  state: GameState;
  readonly rng: Rng;
  events: GameEvent[] = [];

  /** A new hero in the harbour, as a player starts. */
  constructor(seed = 'tide', options: Omit<NewGameOptions, 'seed'> = {}) {
    this.state = { ...newGame({ seed, ...options }), now: NOON };
    this.rng = makeRng(seed);
  }

  /** The hero alone in the middle of the island: nobody there, and nobody on the way. */
  static empty(seed = 'tide', options: Omit<NewGameOptions, 'seed'> = {}): Sim {
    const sim = new Sim(seed, options);
    sim.state = { ...sim.state, place: ISLAND, monsters: [], respawns: [], drops: [], hero: { ...sim.state.hero, ...MIDDLE } };
    return sim;
  }

  /** The hero just landed on the island's dock, the island filling up as it does after a sail. */
  static landed(seed = 'tide', options: Omit<NewGameOptions, 'seed'> = {}): Sim {
    const sim = new Sim(seed, options);
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: ISLAND });
    return sim;
  }

  act(action: Action): GameEvent[] {
    const result = apply(this.state, action, this.rng);
    this.state = result.state;
    this.events.push(...result.events);
    return result.events;
  }

  /** One step of the world, with the clock moving along. */
  step(): void {
    this.act({ type: 'tick', dt: DT, now: NOON + this.state.time * 1000 });
  }

  /** Let the world run for this many seconds. */
  run(seconds: number): void {
    const steps = Math.round(seconds / DT);
    for (let i = 0; i < steps; i++) this.step();
  }

  /** Run until `done` says so, or `limit` seconds have gone. Back comes the time it took. */
  runUntil(done: (sim: Sim) => boolean, limit = 30): number {
    const start = this.state.time;
    while (!done(this) && this.state.time - start < limit) this.step();
    return this.state.time - start;
  }

  /** Put him on a spot of the place he is in, by hand. */
  walkTo(where: 'dock' | 'shop' | 'chest'): void {
    const place = placeOf(this.state);
    const at = where === 'dock' ? place.dock : where === 'shop' ? place.shop : place.chest;
    if (!at) throw new Error(`no ${where} in ${this.state.place}`);
    this.hero({ x: at.x, y: at.y + (where === 'dock' ? 0 : 40), dest: null });
  }

  /** Put a monster on the field. It stands still until something wakes it, unless the patch says otherwise. */
  monster(dx: number, dy: number, patch: Partial<Monster> = {}): Monster {
    const h = this.state.hero;
    const kind = patch.kind ?? 'sand-crab';
    const m: Monster = {
      id: this.state.nextId,
      kind,
      zone: 0,
      x: h.x + dx,
      y: h.y + dy,
      homeX: h.x + dx,
      homeY: h.y + dy,
      facing: 0,
      hp: kindOf({ kind }).maxHp,
      mode: 'wander',
      timer: 999,
      goal: null,
      stunned: 0,
      ...patch,
    };
    this.state = { ...this.state, monsters: [...this.state.monsters, m], nextId: this.state.nextId + 1 };
    return m;
  }

  /** A piece of gear made by hand, into his bag. */
  give(base: string, rarity: Rarity = 'common'): Item {
    const item: Item = { id: this.state.nextId, base, rarity };
    this.state = { ...this.state, nextId: this.state.nextId + 1, hero: { ...this.state.hero, bag: [...this.state.hero.bag, item] } };
    return item;
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
