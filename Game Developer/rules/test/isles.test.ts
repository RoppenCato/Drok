import { describe, expect, it } from 'vitest';
import { MONSTERS, N, PLACES, START_PLACE, biomeAt, clear, dist, inHome, onLand } from '../src/index.ts';
import { Sim } from './sim.ts';

// Six new monsters and a second island (Robin, 2026-11-20: "I think the birds are weird starting mobs"; then: "Build
// all of them, and have the GD make a second island to go to with some of the new mobs. That island needs to look
// different and have its own theme. A swamp maybe.").
const say = (text: string): void => console.log(`  [numbers] ${text}`);
const cay = PLACES['crab-cay']!;
const mire = PLACES['mire-cay']!;

describe('who lives where', () => {
  it('Crab Cay has five kinds by level and no bird; the swamp has three, harder', () => {
    expect(MONSTERS['reef-gull']).toBeUndefined();
    expect([...new Set(cay.zones.map((z) => z.kind))].sort()).toEqual(['bristle-piglet', 'coconut-crab', 'palm-monkey', 'sand-crab', 'wharf-rat']);
    expect([...new Set(mire.zones.map((z) => z.kind))].sort()).toEqual(['frill-lizard', 'hop-toad', 'plum-viper']);
    for (const z of cay.zones) expect(MONSTERS[z.kind]!.level, z.kind).toBeLessThanOrEqual(5);
    for (const z of mire.zones) expect(MONSTERS[z.kind]!.level, z.kind).toBeGreaterThanOrEqual(6);
    for (const k of Object.values(MONSTERS)) expect(k.flies, k.name).toBe(false);
    say(`Crab Cay: ${cay.zones.map((z) => `${z.count} ${MONSTERS[z.kind]!.name}`).join(', ')}. Mire Cay: ${mire.zones.map((z) => `${z.count} ${MONSTERS[z.kind]!.name}`).join(', ')}`);
  });
});

describe('the bristle piglet', () => {
  const k = MONSTERS['bristle-piglet']!;

  it('winds up, then runs straight through where he stood: standing still he is hit once', () => {
    const sim = Sim.empty();
    const m = sim.monster(80, 0, { kind: 'bristle-piglet', mode: 'chase' });
    sim.runUntil((s) => s.find(m.id)!.mode === 'rush', 3);
    expect(sim.count('monsterWindup')).toBe(1);
    expect(sim.count('heroHit')).toBe(0);
    sim.runUntil((s) => s.find(m.id)!.mode === 'rest', 3);
    expect(sim.count('heroHit')).toBe(1);
    // It ran on past him and sits there.
    expect(sim.find(m.id)!.x).toBeLessThan(sim.state.hero.x - 20);
    say(`a piglet scrapes for ${k.windupSeconds} s, then runs ${k.rushLength} units at ${k.rushSpeed} a second: it bit for ${sim.of('heroHit')[0]!.amount}`);
  });

  it('a step aside while it scrapes, and it runs past and misses', () => {
    const sim = Sim.empty();
    const m = sim.monster(80, 0, { kind: 'bristle-piglet', mode: 'chase' });
    sim.runUntil((s) => s.find(m.id)!.mode === 'windup', 3);
    sim.act({ type: 'steer', x: 0, y: 1 });
    sim.runUntil((s) => s.find(m.id)!.mode === 'rest', 4);
    expect(sim.count('heroHit')).toBe(0);
    expect(sim.count('monsterMissed')).toBe(1);
    // He walked this far in the wind-up: more than its body and his are wide.
    expect(N.hero.speed * k.windupSeconds).toBeGreaterThan(k.radius + N.hero.radius + 4);
  });
});

describe('the swamp, Mire Cay', () => {
  it('is on the chart: he sails there from the dock, lands on its jetty, and it fills with its own kinds', () => {
    const sim = new Sim();
    expect(sim.act({ type: 'sail', to: 'mire-cay' })).toEqual([{ type: 'rejected', action: 'sail', reason: 'not at the dock' }]);
    sim.walkTo('dock');
    expect(sim.act({ type: 'sail', to: 'mire-cay' }).at(-1)).toEqual({ type: 'sailed', from: 'crab-cay', to: 'mire-cay' });
    expect(sim.state.place).toBe('mire-cay');
    expect(sim.state.hero).toMatchObject(mire.arrive);
    sim.step();
    expect(sim.state.monsters).toHaveLength(mire.zones.reduce((n, z) => n + z.count, 0));
    for (const m of sim.state.monsters) {
      expect(clear(mire, m.x, m.y, 0), `${m.kind} in a pool or a stone`).toBe(true);
      expect(inHome(mire, { x: m.homeX, y: m.homeY })).toBe(false);
    }
    expect(inHome(mire, mire.arrive)).toBe(true);
    // Its landing is a camp with a trader's stall, safe as the town is.
    expect(mire.shop).not.toBeNull();
    expect(inHome(mire, mire.shop!)).toBe(true);
    expect(inHome(mire, mire.wake)).toBe(true);
    // And home again.
    sim.walkTo('dock');
    expect(sim.act({ type: 'sail', to: START_PLACE }).at(-1)).toEqual({ type: 'sailed', from: 'mire-cay', to: 'crab-cay' });
    expect(sim.state.hero).toMatchObject(cay.arrive);
  });

  it('has pools he cannot stand in, bridges over them that he can, and three grounds', () => {
    expect(mire.water.length).toBeGreaterThanOrEqual(9);
    const pool = mire.water[0]!;
    const mid = { x: pool.reduce((s, p) => s + p[0]!, 0) / pool.length, y: pool.reduce((s, p) => s + p[1]!, 0) / pool.length };
    const bridged = mire.decks.some((d) => d.some((p) => Math.hypot(p[0]! - mid.x, p[1]! - mid.y) < 400));
    if (!bridged) expect(onLand(mire, mid.x, mid.y)).toBe(false);
    for (const deck of mire.decks) {
      const c = { x: deck.reduce((s, p) => s + p[0]!, 0) / deck.length, y: deck.reduce((s, p) => s + p[1]!, 0) / deck.length };
      expect(onLand(mire, c.x, c.y), `the middle of a bridge at ${c.x}, ${c.y}`).toBe(true);
    }
    expect(mire.biomes.map((b) => b.id).sort()).toEqual(['banks', 'stones', 'wood']);
    expect(biomeAt(mire, mire.chest!)).toBeDefined();
  });

  it('a tap from the jetty to the chest finds the way over the bridges', () => {
    const sim = new Sim();
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: 'mire-cay' });
    sim.step();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    const before = { x: mire.chest!.x, y: mire.chest!.y + 40 };
    sim.act({ type: 'moveTo', ...before });
    let steps = 0;
    while (sim.state.hero.dest && steps++ < 60 * 60) {
      sim.step();
      expect(clear(mire, sim.state.hero.x, sim.state.hero.y, N.hero.radius * 0.5 - 0.01)).toBe(true);
    }
    expect(dist(sim.state.hero, before)).toBeLessThan(1);
    say(`from Mire Cay's jetty to its chest: ${(steps / 60).toFixed(1)} s on foot`);
  });

  it('a fall there costs him as anywhere, and he wakes in the town on Crab Cay', () => {
    const sim = new Sim();
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: 'mire-cay' });
    sim.step();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    sim.hero({ x: 1200, y: 2500, hp: 3, gold: 100 });
    sim.monster(40, 0, { kind: 'frill-lizard', mode: 'chase' });
    sim.runUntil((s) => s.count('heroUp') > 0, 8);
    expect(sim.state.place).toBe(START_PLACE);
    expect(sim.state.hero).toMatchObject({ ...cay.wake, gold: 100 - Math.floor(100 * N.death.goldShare) });
  });
});

describe('levels', () => {
  it('go to 8: the swamp is worth it, and the stall knows what to sell at every level', () => {
    expect(N.levels.max).toBe(8);
    expect(N.levels.xpToNext).toHaveLength(8);
    for (let i = 2; i < N.levels.xpToNext.length; i++) expect(N.levels.xpToNext[i]!).toBeGreaterThan(N.levels.xpToNext[i - 1]!);
    const toad = MONSTERS['hop-toad']!;
    say(`level 6 needs ${N.levels.xpToNext[5]} more: ${Math.ceil(N.levels.xpToNext[5]! / toad.xp)} hop toads; level 8 needs ${N.levels.xpToNext[7]}: ${Math.ceil(N.levels.xpToNext[7]! / MONSTERS['frill-lizard']!.xp)} frill lizards`);
  });
});
