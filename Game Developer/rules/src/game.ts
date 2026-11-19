// The game as a pure function: apply(state, action, rng, now) → { state, events }.
// The state passed in is never changed; a new one comes back. Every die comes from `rng` and the clock from `now`:
// the rules never touch the screen, a socket, a clock or a random number of their own (rules/test/purity.test.ts
// refuses it). That is what lets the same code run in the browser for solo play, on a server for play together, and
// headless in the tests.

import type { Rng } from './rng.ts';
import { STATE_VERSION } from './save.ts';
import type { Action, ApplyResult, Board, GameState, Player, RejectReason, Space } from './types.ts';

export interface NewGameOptions {
  seed: string;
  /** The first player's id. */
  player: string;
  /** The board to play on. Left out, the small example board. */
  board?: Board;
}

/** The example board: three by three squares, a1 to c3, each linked to its neighbours up, down, left and right. */
export function makeBoard(size = 3): Board {
  const spaces: Record<string, Space> = {};
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const links: string[] = [];
      if (col > 0) links.push(spaceId(col - 1, row));
      if (col < size - 1) links.push(spaceId(col + 1, row));
      if (row > 0) links.push(spaceId(col, row - 1));
      if (row < size - 1) links.push(spaceId(col, row + 1));
      const id = spaceId(col, row);
      spaces[id] = { id, col, row, links };
    }
  }
  return { start: spaceId(0, 0), spaces };
}

/** Column letter and row number: a1 is the top left. */
function spaceId(col: number, row: number): string {
  return `${String.fromCharCode(97 + col)}${row + 1}`;
}

export function newGame(o: NewGameOptions): GameState {
  const board = o.board ?? makeBoard();
  return {
    version: STATE_VERSION,
    seed: o.seed,
    board,
    players: { [o.player]: { id: o.player, space: board.start, gold: 0 } },
    turn: o.player,
    ticks: 0,
    time: 0,
  };
}

export function apply(state: GameState, action: Action, rng: Rng, now = 0): ApplyResult {
  switch (action.type) {
    case 'tick':
      return tick(state, action, now);
    case 'move':
      return move(state, action, rng);
  }
}

function tick(state: GameState, action: Action, now: number): ApplyResult {
  const next: GameState = { ...state, ticks: state.ticks + 1, time: now };
  return { state: next, events: [{ type: 'ticked', action: action.id, player: action.player, ticks: next.ticks }] };
}

function move(state: GameState, action: Extract<Action, { type: 'move' }>, rng: Rng): ApplyResult {
  const player = state.players[action.player];
  if (!player) return reject(state, action, 'unknown player');
  if (state.turn !== player.id) return reject(state, action, 'not your turn');
  const to = state.board.spaces[action.to];
  if (!to) return reject(state, action, 'no such space');
  if (to.id === player.space) return reject(state, action, 'already there');
  const here = state.board.spaces[player.space];
  if (!here || !here.links.includes(to.id)) return reject(state, action, 'not next to you');
  // The example's one die: what you find on arrival. The rules roll it, never the client.
  const found = rng.int(6);
  const moved: Player = { ...player, space: to.id, gold: player.gold + found };
  const next: GameState = { ...state, players: { ...state.players, [player.id]: moved }, turn: nextTurn(state) };
  return { state: next, events: [{ type: 'moved', action: action.id, player: player.id, from: here.id, to: to.id, found }] };
}

/** The turn goes round the players in the order they came; alone, it comes straight back to you. */
function nextTurn(state: GameState): string {
  const ids = Object.keys(state.players);
  const i = ids.indexOf(state.turn);
  return ids[(i + 1) % ids.length] ?? state.turn;
}

/** The action did nothing: the same state back, and one event that says why. */
export function reject(state: GameState, action: Action, reason: RejectReason): ApplyResult {
  return { state, events: [{ type: 'rejected', action: action.id, player: action.player, reason }] };
}
