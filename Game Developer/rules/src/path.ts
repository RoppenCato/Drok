// Finding the way: a tap far across a place should walk him there round the rocks, the palms and the water, not
// into the first notch between two stones. The place is laid over with a coarse grid of squares he can or cannot
// stand in; the shortest way over open squares is found (A*), and then pulled straight wherever he can see from one
// corner to a later one. A tap on something he cannot reach (out at sea) takes him as near as the land goes.
//
// The grid of a place is worked out once and kept: it is made from the place's data alone, so keeping it changes
// nothing a seed or a save could notice.

import type { Place } from './data.ts';
import { clear } from './ground.ts';
import type { Vec } from './types.ts';

const CELL = 16;
/** How finely a straight line is checked for something in the way. */
const SIGHT_STEP = 6;

interface Grid {
  cols: number;
  rows: number;
  open: Uint8Array;
}

const grids = new Map<Place, Map<number, Grid>>();

function gridOf(place: Place, radius: number): Grid {
  let byRadius = grids.get(place);
  if (!byRadius) {
    byRadius = new Map();
    grids.set(place, byRadius);
  }
  let grid = byRadius.get(radius);
  if (!grid) {
    const cols = Math.ceil(place.width / CELL);
    const rows = Math.ceil(place.height / CELL);
    const open = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) open[r * cols + c] = clear(place, (c + 0.5) * CELL, (r + 0.5) * CELL, radius) ? 1 : 0;
    }
    grid = { cols, rows, open };
    byRadius.set(radius, grid);
  }
  return grid;
}

const reached = new Map<Place, Uint8Array>();

/**
 * Can he walk to this point from where he wakes? A big island has pockets between stones that nothing leads into;
 * a monster born in one could never be fought. Worked out once for a place, from its data alone: the squares he can
 * stand in, flooded from where he wakes.
 */
export function reachable(place: Place, x: number, y: number, radius: number): boolean {
  const g = gridOf(place, radius);
  let seen = reached.get(place);
  if (!seen) {
    seen = new Uint8Array(g.cols * g.rows);
    const start = nearestOpen(g, place.wake.x, place.wake.y, 3);
    const todo = start >= 0 ? [start] : [];
    if (start >= 0) seen[start] = 1;
    while (todo.length > 0) {
      const cell = todo.pop()!;
      const c = cell % g.cols;
      const r = Math.floor(cell / g.cols);
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= g.cols || nr >= g.rows) continue;
        const next = nr * g.cols + nc;
        if (!g.open[next] || seen[next]) continue;
        seen[next] = 1;
        todo.push(next);
      }
    }
    reached.set(place, seen);
  }
  const c = Math.min(g.cols - 1, Math.max(0, Math.floor(x / CELL)));
  const r = Math.min(g.rows - 1, Math.max(0, Math.floor(y / CELL)));
  return seen[r * g.cols + c] === 1;
}

/** Can a body of this size go straight from a to b? */
export function sight(place: Place, a: Vec, b: Vec, radius: number): boolean {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(1, Math.ceil(d / SIGHT_STEP));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (!clear(place, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, radius)) return false;
  }
  return true;
}

/** The open square nearest to a point, looking a few squares round it; -1 if there is none near. */
function nearestOpen(g: Grid, x: number, y: number, reach: number): number {
  const c0 = Math.min(g.cols - 1, Math.max(0, Math.floor(x / CELL)));
  const r0 = Math.min(g.rows - 1, Math.max(0, Math.floor(y / CELL)));
  let best = -1;
  let bestD = Infinity;
  for (let r = Math.max(0, r0 - reach); r <= Math.min(g.rows - 1, r0 + reach); r++) {
    for (let c = Math.max(0, c0 - reach); c <= Math.min(g.cols - 1, c0 + reach); c++) {
      if (!g.open[r * g.cols + c]) continue;
      const d = Math.hypot((c + 0.5) * CELL - x, (r + 0.5) * CELL - y);
      if (d < bestD) {
        bestD = d;
        best = r * g.cols + c;
      }
    }
  }
  return best;
}

/**
 * The way from `from` to `to` for a body of this size: the corners to walk to, one after the other, the last being
 * where he ends up (which is `to` when it can be reached, else the nearest ground to it). Empty when he cannot move
 * from where he stands.
 */
export function route(place: Place, from: Vec, to: Vec, radius: number): Vec[] {
  if (clear(place, to.x, to.y, radius) && sight(place, from, to, radius)) return [{ x: to.x, y: to.y }];
  const g = gridOf(place, radius);
  const start = nearestOpen(g, from.x, from.y, 3);
  if (start < 0) return [];
  const goalCell = Math.min(g.rows - 1, Math.max(0, Math.floor(to.y / CELL))) * g.cols + Math.min(g.cols - 1, Math.max(0, Math.floor(to.x / CELL)));
  const reachable = clear(place, to.x, to.y, radius) && g.open[goalCell] === 1;

  // A*: the cost so far, where each square was come from, and a heap of squares to look at, cheapest guess first.
  const size = g.cols * g.rows;
  const cost = new Float32Array(size).fill(Infinity);
  const came = new Int32Array(size).fill(-1);
  const done = new Uint8Array(size);
  const heap: number[] = [];
  const guess = new Float32Array(size);
  const toGoal = (cell: number): number => {
    const dx = Math.abs(((cell % g.cols) + 0.5) * CELL - to.x);
    const dy = Math.abs((Math.floor(cell / g.cols) + 0.5) * CELL - to.y);
    return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy);
  };
  const push = (cell: number): void => {
    heap.push(cell);
    let i = heap.length - 1;
    while (i > 0) {
      const up = (i - 1) >> 1;
      if (guess[heap[up]!]! <= guess[heap[i]!]!) break;
      [heap[up], heap[i]] = [heap[i]!, heap[up]!];
      i = up;
    }
  };
  const pop = (): number => {
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let least = i;
        if (l < heap.length && guess[heap[l]!]! < guess[heap[least]!]!) least = l;
        if (r < heap.length && guess[heap[r]!]! < guess[heap[least]!]!) least = r;
        if (least === i) break;
        [heap[least], heap[i]] = [heap[i]!, heap[least]!];
        i = least;
      }
    }
    return top;
  };

  cost[start] = 0;
  guess[start] = toGoal(start);
  push(start);
  let nearest = start;
  let nearestD = toGoal(start);
  let found = -1;
  while (heap.length > 0) {
    const cell = pop();
    if (done[cell]) continue;
    done[cell] = 1;
    const d = toGoal(cell);
    if (d < nearestD) {
      nearestD = d;
      nearest = cell;
    }
    if (reachable && cell === goalCell) {
      found = cell;
      break;
    }
    const c = cell % g.cols;
    const r = Math.floor(cell / g.cols);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= g.cols || nr >= g.rows) continue;
        const next = nr * g.cols + nc;
        if (!g.open[next] || done[next]) continue;
        // No cutting a corner between two closed squares.
        if (dr !== 0 && dc !== 0 && (!g.open[r * g.cols + nc] || !g.open[nr * g.cols + c])) continue;
        const step = cost[cell]! + (dr !== 0 && dc !== 0 ? 1.4142 : 1) * CELL;
        if (step >= cost[next]!) continue;
        cost[next] = step;
        came[next] = cell;
        guess[next] = step + toGoal(next);
        push(next);
      }
    }
  }

  // Back along the way it came, from the goal or from the nearest ground to it.
  const end = found >= 0 ? found : nearest;
  const cells: number[] = [];
  for (let cell = end; cell >= 0; cell = came[cell]!) cells.push(cell);
  cells.reverse();
  const points: Vec[] = cells.map((cell) => ({ x: ((cell % g.cols) + 0.5) * CELL, y: (Math.floor(cell / g.cols) + 0.5) * CELL }));
  if (found >= 0) points.push({ x: to.x, y: to.y });

  // Pull it straight: from where he stands, walk to the furthest corner he can see, and so on.
  const pulled: Vec[] = [];
  let at: Vec = from;
  let i = 0;
  while (i < points.length) {
    let far = i;
    for (let j = points.length - 1; j > i; j--) {
      if (sight(place, at, points[j]!, radius)) {
        far = j;
        break;
      }
    }
    pulled.push(points[far]!);
    at = points[far]!;
    i = far + 1;
  }
  return pulled;
}
