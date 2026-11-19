import { describe, expect, it } from 'vitest';
import { dist, heroReach, N, type Scheme } from '../src/index.ts';
import { DT, Sim } from './sim.ts';

// A bot plays each way of steering for a while, on several seeds, and prints what it got. It does what a sensible
// thumb would do: go for the nearest monster, Charge when it is far, Cleave when there is rage. The numbers are for a
// person to read; the test itself only asks that the game stays whole. When a number looks wrong, check the bot
// before the game.

const SECONDS = 90;
const SEEDS = ['tide', 'reef', 'gull'];

interface Tally {
  kills: number;
  deaths: number;
  hpLost: number;
  charges: number;
  cleaves: number;
  refused: number;
}

function play(scheme: Scheme, seed: string): Tally {
  const sim = new Sim(seed, { scheme });
  const steps = Math.round(SECONDS / DT);
  for (let i = 0; i < steps; i++) {
    const h = sim.state.hero;
    if (h.downFor <= 0) {
      let nearest = sim.state.monsters[0];
      for (const m of sim.state.monsters) if (nearest && dist(h, m) < dist(h, nearest)) nearest = m;
      if (nearest) {
        const d = dist(h, nearest);
        if (scheme === 1) {
          if (h.target === null) sim.act({ type: 'target', monster: nearest.id });
        } else {
          // A thumb pushing towards the nearest one until it is in reach, then lifting.
          const push = d > heroReach() - 6 ? { x: (nearest.x - h.x) / d, y: (nearest.y - h.y) / d } : { x: 0, y: 0 };
          if (push.x !== h.steer.x || push.y !== h.steer.y) sim.act({ type: 'steer', ...push });
        }
        if (h.chargeCd <= 0 && !h.charging && d > 120 && d <= N.charge.range) sim.act({ type: 'skill', skill: 'charge' });
        if (h.cleaveCd <= 0 && h.rage >= N.cleave.rageCost && d <= N.cleave.radius) sim.act({ type: 'skill', skill: 'cleave' });
      }
    }
    sim.act({ type: 'tick', dt: DT });
  }
  const s = sim.state;
  // The game stays whole: every number is a number, everyone is on the field.
  for (const v of [s.hero.x, s.hero.y, s.hero.hp, s.hero.rage, s.time]) expect(Number.isFinite(v)).toBe(true);
  for (const p of [s.hero, ...s.monsters]) {
    expect(p.x).toBeGreaterThanOrEqual(N.field.margin);
    expect(p.x).toBeLessThanOrEqual(N.field.width - N.field.margin);
    expect(p.y).toBeGreaterThanOrEqual(N.field.margin);
    expect(p.y).toBeLessThanOrEqual(N.field.height - N.field.margin);
  }
  expect(s.monsters.length + s.respawns.length).toBe(s.monstersWanted);
  return {
    kills: s.kills,
    deaths: s.deaths,
    hpLost: sim.of('heroHit').reduce((sum, e) => sum + e.amount, 0),
    charges: sim.count('charged'),
    cleaves: sim.count('cleaved'),
    refused: sim.count('rejected'),
  };
}

describe('a bot plays the control test', () => {
  for (const scheme of [1, 2, 3] as const) {
    it(`scheme ${scheme}: ${SECONDS} s on ${SEEDS.length} seeds`, () => {
      const runs = SEEDS.map((seed) => play(scheme, seed));
      const minutes = (SECONDS * SEEDS.length) / 60;
      const sum = (pick: (t: Tally) => number): number => runs.reduce((total, t) => total + pick(t), 0);
      console.log(
        `  [numbers] scheme ${scheme}: ${(sum((t) => t.kills) / minutes).toFixed(1)} kills a minute, ${(sum((t) => t.hpLost) / minutes).toFixed(0)} health lost a minute, ` +
          `${sum((t) => t.deaths)} deaths, ${(sum((t) => t.charges) / minutes).toFixed(1)} Charges and ${(sum((t) => t.cleaves) / minutes).toFixed(1)} Cleaves a minute, ${sum((t) => t.refused)} refused`,
      );
      expect(sum((t) => t.kills)).toBeGreaterThan(0);
      // The bot only presses a skill when it should work.
      expect(sum((t) => t.refused)).toBe(0);
    });
  }
});
