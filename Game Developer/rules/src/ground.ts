// Where one can stand and walk in a place: on the land, out of the water, and round the things in the way. A
// place's shore, its inner waters and its solid things (circles for trunks and rocks, boxes for houses) come from
// the Art Director's layout of it (tools/place-from-art.mjs); a place without a shore is its whole box.

import { N, type Biome, type Place } from './data.ts';
import type { Vec } from './types.ts';

/** Is a point inside an outline? (A ray to the right crosses its edge an odd number of times.) */
function inside(outline: number[][], x: number, y: number): boolean {
  let within = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i]!;
    const b = outline[j]!;
    const ay = a[1]!;
    const by = b[1]!;
    if (ay > y !== by > y && x < ((b[0]! - a[0]!) * (y - ay)) / (by - ay) + a[0]!) within = !within;
  }
  return within;
}

/** Is this point in the place's town, where nothing comes for him? */
export function inHome(place: Place, p: Vec): boolean {
  return place.home !== null && inside(place.home.outline, p.x, p.y);
}

/** The ground a point lies on, if the place has grounds and the point is on one. */
export function biomeAt(place: Place, p: Vec): Biome | undefined {
  return place.biomes.find((b) => inside(b.outline, p.x, p.y));
}

/** Is this point ground to stand on: inside the place's box, on its land, and not in water? */
export function onLand(place: Place, x: number, y: number): boolean {
  if (x < N.margin || y < N.margin || x > place.width - N.margin || y > place.height - N.margin) return false;
  if (place.land && !inside(place.land, x, y)) return false;
  for (const water of place.water) if (inside(water, x, y)) return false;
  return true;
}

type Box = Place['boxes'][number];

/** How far a point is from a box: 0 inside it. */
function gap(b: Box, x: number, y: number): number {
  return Math.hypot(Math.max(b.x - x, 0, x - b.x - b.w), Math.max(b.y - y, 0, y - b.y - b.h));
}

/** Is this point ground a body of this size can stand on: land, and clear of every solid thing? */
export function clear(place: Place, x: number, y: number, radius: number): boolean {
  if (!onLand(place, x, y)) return false;
  for (const s of place.solids) if (Math.hypot(x - s.x, y - s.y) < s.r + radius) return false;
  for (const b of place.boxes) {
    // Inside a box the gap is 0 whatever the body's size: a point in a wall is never clear.
    const g = gap(b, x, y);
    if (g === 0 || g < radius) return false;
  }
  return true;
}

/** Push a point out of a box it is in or too near: straight out from the wall, or out through the nearest wall. */
function outOfBox(b: Box, p: Vec, radius: number): void {
  const nx = Math.min(b.x + b.w, Math.max(b.x, p.x));
  const ny = Math.min(b.y + b.h, Math.max(b.y, p.y));
  const d = Math.hypot(p.x - nx, p.y - ny);
  if (d >= radius) return;
  if (d > 0.001) {
    p.x = nx + ((p.x - nx) / d) * radius;
    p.y = ny + ((p.y - ny) / d) * radius;
    return;
  }
  const left = p.x - b.x;
  const right = b.x + b.w - p.x;
  const top = p.y - b.y;
  const bottom = b.y + b.h - p.y;
  const least = Math.min(left, right, top, bottom);
  if (least === left) p.x = b.x - radius;
  else if (least === right) p.x = b.x + b.w + radius;
  else if (least === top) p.y = b.y - radius;
  else p.y = b.y + b.h + radius;
}

/** Push a point out of every solid thing it is in. `from` says which side to come out on when it is dead centre. */
function outOfSolids(place: Place, p: Vec, from: Vec, radius: number): void {
  for (let pass = 0; pass < 2; pass++) {
    for (const b of place.boxes) outOfBox(b, p, radius);
    for (const s of place.solids) {
      const min = s.r + radius;
      let dx = p.x - s.x;
      let dy = p.y - s.y;
      let d = Math.hypot(dx, dy);
      if (d >= min) continue;
      if (d < 0.001) {
        dx = from.x - s.x;
        dy = from.y - s.y;
        d = Math.hypot(dx, dy) || 1;
      }
      p.x = s.x + (dx / d) * min;
      p.y = s.y + (dy / d) * min;
    }
  }
}

/** A point moved out of any solid thing it lies in: where a tap on a rock really sends him. */
export function besideSolids(place: Place, p: Vec, toward: Vec, radius: number): Vec {
  const out = { x: p.x, y: p.y };
  outOfSolids(place, out, toward, radius);
  return out;
}

/**
 * A body wants to step from `from` to `to`: where it really ends up. A solid thing pushes it out to its edge, so
 * it slides round; met head on, it steps aside. The shore lets it slide along but not cross. If no way is open it
 * stays where it was.
 */
export function walk(place: Place, from: Vec, to: Vec, radius: number): Vec {
  const want = Math.hypot(to.x - from.x, to.y - from.y);
  const p = { x: to.x, y: to.y };
  if (place.solids.length > 0 || place.boxes.length > 0) {
    outOfSolids(place, p, from, radius);
    // Head on into something, the push only sends it back the way it came: step aside instead, and slide from there.
    if (want > 0.001 && Math.hypot(p.x - from.x, p.y - from.y) < want * 0.2) {
      p.x = from.x - (to.y - from.y);
      p.y = from.y + (to.x - from.x);
      outOfSolids(place, p, from, radius);
    }
  }
  // The place's own edge is a wall to slide along, right up to it.
  p.x = Math.min(place.width - N.margin, Math.max(N.margin, p.x));
  p.y = Math.min(place.height - N.margin, Math.max(N.margin, p.y));
  if (onLand(place, p.x, p.y)) return p;
  if (onLand(place, p.x, from.y)) return { x: p.x, y: from.y };
  if (onLand(place, from.x, p.y)) return { x: from.x, y: p.y };
  return { x: from.x, y: from.y };
}
