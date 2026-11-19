// The rules package: the game as a pure function. The client and the tests import from here, never from the files inside.
export * from './types.ts';
export { makeRng, resumeRng, hashSeed, type Rng } from './rng.ts';
export { newGame, apply, type NewGameOptions } from './game.ts';
export { N, MAX_DT, heroReach, monsterReach, fieldCentre } from './world.ts';
export { dist, angleTo, angleDiff } from './geometry.ts';
export { STATE_VERSION, migrate } from './save.ts';
