// The rules package: the game as a pure function. The client and the tests import from here, never from the files inside.
export * from './types.ts';
export { makeRng, resumeRng, hashSeed, type Rng } from './rng.ts';
export { newGame, apply, makeBoard, reject, type NewGameOptions } from './game.ts';
export { STATE_VERSION, migrate } from './save.ts';
