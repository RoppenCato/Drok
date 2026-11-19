// A seeded random stream. The same seed always gives the same numbers, in Node and in the browser.
// mulberry32: one 32-bit number is the whole state, so a save keeps it as one integer and carries on with the same dice.

export interface Rng {
  /** A number in [0, 1). */
  next(): number;
  /** A die: a whole number from 1 to `sides`. */
  int(sides: number): number;
  /** Where the stream is. Store it; `resumeRng(state)` carries on from there. */
  readonly state: number;
}

class Mulberry32 implements Rng {
  private s: number;

  constructor(state: number) {
    this.s = state >>> 0;
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(sides: number): number {
    return 1 + Math.floor(this.next() * sides);
  }

  get state(): number {
    return this.s;
  }
}

/** FNV-1a, 32 bits: a seed string becomes a starting state. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A fresh stream. A string is hashed; a number is the state itself. */
export function makeRng(seed: string | number): Rng {
  return new Mulberry32(typeof seed === 'number' ? seed : hashSeed(seed));
}

/** The stream again, from a stored `state`. */
export function resumeRng(state: number): Rng {
  return new Mulberry32(state);
}
