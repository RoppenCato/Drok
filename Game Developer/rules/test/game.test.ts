import { describe, expect, it } from 'vitest';
import { apply, makeRng, migrate, newGame, resumeRng, STATE_VERSION, type Action, type GameState } from '../src/index.ts';

const P = 'p1';
const NOW = 1_000_000;

const fresh = (seed = 'spring'): GameState => newGame({ seed, player: P });
const move = (to: string, id = 'm1', player = P): Action => ({ type: 'move', id, player, to });
const tick = (id = 't1'): Action => ({ type: 'tick', id, player: 'world' });

/** Walk a path from a fresh game with its own dice; back come the last state and what was found on the way. */
function walk(seed: string, path: string[]): { state: GameState; found: number[] } {
  const rng = makeRng(seed);
  let state = fresh(seed);
  const found: number[] = [];
  for (const [i, to] of path.entries()) {
    const result = apply(state, move(to, `m${i}`), rng, NOW);
    state = result.state;
    for (const e of result.events) if (e.type === 'moved') found.push(e.found);
  }
  return { state, found };
}

describe('a new game', () => {
  it('starts one player on the start of the board, with the turn and no gold', () => {
    const s = fresh();
    expect(s.version).toBe(STATE_VERSION);
    expect(s.seed).toBe('spring');
    expect(Object.keys(s.board.spaces)).toHaveLength(9);
    expect(s.board.spaces.a1?.links.sort()).toEqual(['a2', 'b1']);
    expect(s.board.spaces.b2?.links.sort()).toEqual(['a2', 'b1', 'b3', 'c2']);
    expect(s.players[P]).toEqual({ id: P, space: 'a1', gold: 0 });
    expect(s.turn).toBe(P);
    expect(s.ticks).toBe(0);
  });
});

describe('the same seed gives the same game', () => {
  it('walks the same path and finds the same gold, every time', () => {
    const path = ['b1', 'b2', 'c2', 'c3'];
    const a = walk('spring', path);
    const b = walk('spring', path);
    expect(a).toEqual(b);
    // Pinned: a change to the dice would change every saved game.
    expect(a.found).toEqual([1, 4, 2, 5]);
    expect(a.state.players[P]).toEqual({ id: P, space: 'c3', gold: 12 });
  });

  it('never changes the state it was given', () => {
    const before = fresh();
    const frozen = JSON.stringify(before);
    apply(before, move('b1'), makeRng('spring'), NOW);
    apply(before, tick(), makeRng('spring'), NOW);
    expect(JSON.stringify(before)).toBe(frozen);
  });

  it('carries on with the same dice after a save: the stream is one number', () => {
    const rng = makeRng('spring');
    rng.int(6);
    const later = resumeRng(rng.state);
    expect([later.int(6), later.int(6)]).toEqual([rng.int(6), rng.int(6)]);
  });
});

describe('a move', () => {
  it('steps to a space next to you and pays what the die found; alone, the turn comes back to you', () => {
    const r = apply(fresh(), move('b1'), makeRng('spring'), NOW);
    expect(r.events).toEqual([{ type: 'moved', action: 'm1', player: P, from: 'a1', to: 'b1', found: 1 }]);
    expect(r.state.players[P]).toEqual({ id: P, space: 'b1', gold: 1 });
    expect(r.state.turn).toBe(P);
  });

  it('is rejected with the reason when it cannot be done, and the state stays as it was', () => {
    const s = fresh();
    const rng = makeRng('spring');
    const refuse = (action: Action): unknown => {
      const r = apply(s, action, rng, NOW);
      expect(r.state).toBe(s);
      return r.events;
    };
    expect(refuse(move('c3'))).toEqual([{ type: 'rejected', action: 'm1', player: P, reason: 'not next to you' }]);
    expect(refuse(move('a1'))).toEqual([{ type: 'rejected', action: 'm1', player: P, reason: 'already there' }]);
    expect(refuse(move('z9'))).toEqual([{ type: 'rejected', action: 'm1', player: P, reason: 'no such space' }]);
    expect(refuse(move('b1', 'm1', 'nobody'))).toEqual([{ type: 'rejected', action: 'm1', player: 'nobody', reason: 'unknown player' }]);
  });

  it('is rejected out of turn', () => {
    // A second player, as a server would add one; the turn is p1's.
    const s = fresh();
    const two: GameState = { ...s, players: { ...s.players, p2: { id: 'p2', space: 'a1', gold: 0 } } };
    expect(apply(two, move('b1', 'm1', 'p2'), makeRng('spring'), NOW).events).toEqual([{ type: 'rejected', action: 'm1', player: 'p2', reason: 'not your turn' }]);
    // After p1's move it is p2's, and p1 must wait.
    const after = apply(two, move('b1'), makeRng('spring'), NOW).state;
    expect(after.turn).toBe('p2');
    expect(apply(after, move('b2', 'm2'), makeRng('spring'), NOW).events).toEqual([{ type: 'rejected', action: 'm2', player: P, reason: 'not your turn' }]);
  });
});

describe('a tick', () => {
  it('counts, and keeps the holder\'s clock', () => {
    const r = apply(fresh(), tick(), makeRng('spring'), NOW);
    expect(r.state.ticks).toBe(1);
    expect(r.state.time).toBe(NOW);
    expect(r.events).toEqual([{ type: 'ticked', action: 't1', player: 'world', ticks: 1 }]);
  });
});

describe('a save', () => {
  it('comes back as it was, at today\'s version', () => {
    const s = walk('spring', ['b1']).state;
    expect(migrate(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it('is brought up from an old version: version 1 had no gold', () => {
    const { version: _today, ...rest } = fresh();
    const old = { ...rest, version: 1, players: { [P]: { id: P, space: 'b2' } } };
    expect(migrate(old)).toEqual({ ...rest, version: STATE_VERSION, players: { [P]: { id: P, space: 'b2', gold: 0 } } });
  });

  it('is null when broken, so the holder starts fresh instead of crashing', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate('nonsense')).toBeNull();
    expect(migrate({ version: 99 })).toBeNull();
    expect(migrate({ ...fresh(), version: 99 })).toBeNull();
    expect(migrate({ version: STATE_VERSION, seed: 'x' })).toBeNull();
    expect(migrate({ version: 1, players: {} })).toBeNull();
  });
});
