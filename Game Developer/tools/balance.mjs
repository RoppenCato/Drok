#!/usr/bin/env node
// The long balance run: the play-through bot on ten seeds, as a sensible player and as a clumsy one, printing when
// each level comes, how often he falls and what money is left. It takes a few minutes, so it is not part of
// `npm test`. Run from the Game Developer folder: `npm run balance`. Read the lines marked [numbers].
import { spawnSync } from 'node:child_process';

const run = spawnSync('npx', ['vitest', 'run', 'rules/test/bot.test.ts', '-t', 'the long balance run'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BALANCE: '1' },
});
process.exit(run.status ?? 1);
