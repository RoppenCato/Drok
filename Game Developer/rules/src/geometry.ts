// The little geometry the rules need: distances, angles, a step towards a point.

import type { Vec } from './types.ts';

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** The direction from a to b, in radians. */
export function angleTo(a: Vec, b: Vec): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** The smallest turn from one direction to another, from minus half a turn to half a turn. */
export function angleDiff(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Step `who` towards `to` by at most `step`. True when it has arrived. */
export function stepToward(who: Vec, to: Vec, step: number): boolean {
  const d = dist(who, to);
  if (d <= step || d === 0) {
    who.x = to.x;
    who.y = to.y;
    return true;
  }
  who.x += ((to.x - who.x) / d) * step;
  who.y += ((to.y - who.y) / d) * step;
  return false;
}
