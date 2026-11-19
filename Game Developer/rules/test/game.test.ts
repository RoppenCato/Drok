import { describe, expect, it } from 'vitest';
import { apply, dist, fieldCentre, heroReach, makeRng, migrate, N, newGame, resumeRng, STATE_VERSION, type Action } from '../src/index.ts';
import { DT, Sim } from './sim.ts';

// The numbers a person reads: every test that measures something prints it, so a green run can still be judged.
const say = (text: string): void => console.log(`  [numbers] ${text}`);

describe('a new game', () => {
  it('starts the hero whole in the middle of an empty field; the monsters arrive on the first step, away from him', () => {
    const sim = new Sim();
    expect(sim.state.version).toBe(STATE_VERSION);
    expect(sim.state.hero).toMatchObject({ ...fieldCentre(), hp: N.hero.maxHp, rage: 0, target: null });
    expect(sim.state.monsters).toHaveLength(0);
    sim.run(DT);
    expect(sim.state.monsters).toHaveLength(N.field.monsters);
    for (const m of sim.state.monsters) expect(dist(sim.state.hero, m)).toBeGreaterThanOrEqual(N.monster.spawnClearance);
    say(`monsters at ${sim.state.monsters.map((m) => `${m.x.toFixed(0)},${m.y.toFixed(0)}`).join(' | ')}; hero at ${sim.state.hero.x},${sim.state.hero.y}`);
  });
});

describe('the same seed gives the same game', () => {
  const play = (seed: string): string => {
    const sim = new Sim(seed);
    sim.run(1);
    sim.act({ type: 'target', monster: sim.state.monsters[0]!.id });
    sim.run(6);
    sim.act({ type: 'skill', skill: 'cleave' });
    sim.act({ type: 'moveTo', x: 300, y: 300 });
    sim.run(4);
    return JSON.stringify(sim.state);
  };

  it('plays out the same, step for step, and another seed plays out differently', () => {
    expect(play('tide')).toBe(play('tide'));
    expect(play('tide')).not.toBe(play('reef'));
  });

  it('never changes the state it was given', () => {
    const sim = new Sim();
    sim.run(1);
    const before = sim.state;
    const frozen = JSON.stringify(before);
    const actions: Action[] = [
      { type: 'tick', dt: DT },
      { type: 'moveTo', x: 10, y: 10 },
      { type: 'steer', x: 1, y: 0 },
      { type: 'target', monster: before.monsters[0]!.id },
      { type: 'skill', skill: 'charge' },
      { type: 'scheme', scheme: 2 },
      { type: 'monsters', count: 6 },
    ];
    for (const a of actions) apply(before, a, makeRng('tide'));
    expect(JSON.stringify(before)).toBe(frozen);
  });

  it('carries on with the same dice after a save: the stream is one number', () => {
    const rng = makeRng('tide');
    rng.int(6);
    const later = resumeRng(rng.state);
    expect([later.int(6), later.int(6)]).toEqual([rng.int(6), rng.int(6)]);
  });

  it('refuses a step that is no step: nothing, backwards, too long, not a number', () => {
    const sim = new Sim();
    for (const dt of [0, -0.1, 0.5, Number.NaN]) {
      const before = sim.state;
      expect(sim.act({ type: 'tick', dt })).toEqual([{ type: 'rejected', action: 'tick', reason: 'bad number' }]);
      expect(sim.state).toBe(before);
    }
  });
});

describe('moving: smooth and snappy', () => {
  it('a tap on the ground walks him there in a straight line, at full speed from the first step, and stops him on the spot', () => {
    const sim = Sim.empty();
    const start = { ...sim.state.hero };
    sim.act({ type: 'moveTo', x: start.x + 300, y: start.y });
    sim.run(DT);
    expect(sim.state.hero.x - start.x).toBeCloseTo(N.hero.speed * DT, 6);
    const took = DT + sim.runUntil((s) => s.state.hero.dest === null);
    expect(sim.state.hero.x).toBeCloseTo(start.x + 300, 6);
    expect(sim.state.hero.y).toBeCloseTo(start.y, 6);
    expect(took).toBeGreaterThan(300 / N.hero.speed - DT);
    expect(took).toBeLessThan(300 / N.hero.speed + 2 * DT);
    sim.run(0.5);
    expect(sim.state.hero.x).toBeCloseTo(start.x + 300, 6);
    expect(sim.state.hero.moving).toBe(false);
    say(`300 units in ${took.toFixed(2)} s at ${N.hero.speed} units a second; the screen is 412 wide: ${(412 / N.hero.speed).toFixed(2)} s to cross`);
  });

  it('the thumb steers at once and he stops the step it lifts; a half push is half speed', () => {
    const sim = Sim.empty();
    const x0 = sim.state.hero.x;
    sim.act({ type: 'steer', x: 1, y: 0 });
    sim.run(1);
    expect(sim.state.hero.x - x0).toBeCloseTo(N.hero.speed, 3);
    sim.act({ type: 'steer', x: 0, y: 0 });
    const xStop = sim.state.hero.x;
    sim.run(0.5);
    expect(sim.state.hero.x).toBe(xStop);
    sim.act({ type: 'steer', x: 0, y: 0.5 });
    const y0 = sim.state.hero.y;
    sim.run(1);
    expect(sim.state.hero.y - y0).toBeCloseTo(N.hero.speed / 2, 3);
    // A push longer than 1 is cut to 1.
    sim.act({ type: 'steer', x: 3, y: 4 });
    expect(Math.hypot(sim.state.hero.steer.x, sim.state.hero.steer.y)).toBeCloseTo(1, 9);
  });

  it('the thumb wins over a tap: steering drops the place he was sent to', () => {
    const sim = Sim.empty();
    sim.act({ type: 'moveTo', x: 100, y: 100 });
    sim.act({ type: 'steer', x: 1, y: 0 });
    sim.run(DT);
    expect(sim.state.hero.dest).toBeNull();
  });

  it('the field holds him: pushed against each edge for longer than the field is wide, he stands at the edge', () => {
    const sim = Sim.empty();
    const far = (Math.max(N.field.width, N.field.height) / N.hero.speed) * 1.5;
    sim.act({ type: 'steer', x: -1, y: 0 });
    sim.run(far);
    expect(sim.state.hero.x).toBe(N.field.margin);
    sim.act({ type: 'steer', x: 1, y: 1 });
    sim.run(far);
    expect(sim.state.hero.x).toBe(N.field.width - N.field.margin);
    expect(sim.state.hero.y).toBe(N.field.height - N.field.margin);
    sim.act({ type: 'moveTo', x: -500, y: -500 });
    expect(sim.state.hero.dest).toEqual({ x: N.field.margin, y: N.field.margin });
  });

  it('changing the way of steering lets go of what the thumb was doing', () => {
    const sim = Sim.empty();
    sim.act({ type: 'steer', x: 1, y: 0 });
    sim.act({ type: 'scheme', scheme: 3 });
    expect(sim.state.scheme).toBe(3);
    expect(sim.state.hero.steer).toEqual({ x: 0, y: 0 });
    expect(sim.act({ type: 'scheme', scheme: 4 as 1 })).toEqual([{ type: 'rejected', action: 'scheme', reason: 'bad number' }]);
  });
});

describe('fighting: a target and auto-attack', () => {
  it('scheme 1: a tapped monster is the target; he walks up, swings by himself and it falls', () => {
    const sim = Sim.empty();
    const m = sim.monster(200, 0, { stunned: 999 });
    expect(sim.act({ type: 'target', monster: m.id })).toEqual([{ type: 'targeted', monster: m.id, why: 'tap' }]);
    const walk = sim.runUntil((s) => s.count('swing') > 0);
    expect(dist(sim.state.hero, sim.find(m.id)!)).toBeLessThanOrEqual(heroReach());
    const fight = sim.runUntil((s) => s.count('monsterDied') > 0);
    expect(sim.state.kills).toBe(1);
    expect(sim.state.hero.target).toBeNull();
    expect(sim.state.respawns).toHaveLength(1);
    const hits = sim.of('hit');
    say(`walked up in ${walk.toFixed(2)} s; ${N.monster.name} (${N.monster.maxHp} hp) fell in ${fight.toFixed(2)} s to ${hits.length} hits of ${hits.map((h) => h.amount + (h.crit ? '!' : '')).join(' ')}; rage ${sim.state.hero.rage}`);
    expect(hits.length).toBeGreaterThanOrEqual(3);
    expect(hits.length).toBeLessThanOrEqual(7);
  });

  it('scheme 1 picks nothing by itself; schemes 2 and 3 pick the nearest', () => {
    for (const scheme of [1, 2, 3] as const) {
      const sim = Sim.empty('tide', { scheme });
      sim.monster(190, 0, { stunned: 999 });
      const near = sim.monster(0, 160, { stunned: 999 });
      sim.run(0.5);
      expect(sim.state.hero.target).toBe(scheme === 1 ? null : near.id);
    }
  });

  it('schemes 2 and 3: he turns to a monster in reach when his target is not, and never leaves one he can hit', () => {
    const sim = Sim.empty('tide', { scheme: 2 });
    const far = sim.monster(180, 0, { stunned: 999 });
    sim.run(DT);
    expect(sim.state.hero.target).toBe(far.id);
    const close = sim.monster(0, heroReach() - 5, { stunned: 999 });
    sim.run(DT);
    expect(sim.state.hero.target).toBe(close.id);
    // Something nearer still appears: he stays on the one he is hitting.
    sim.monster(0, -(heroReach() - 20), { stunned: 999 });
    sim.run(0.5);
    expect(sim.state.hero.target).toBe(close.id);
  });

  it('a target that gets far away is let go (schemes 2 and 3)', () => {
    const sim = Sim.empty('tide', { scheme: 3 });
    const m = sim.monster(150, 0, { stunned: 999 });
    sim.run(DT);
    expect(sim.state.hero.target).toBe(m.id);
    sim.act({ type: 'steer', x: -1, y: 0 });
    sim.runUntil((s) => s.state.hero.target === null, 5);
    expect(dist(sim.state.hero, sim.find(m.id)!)).toBeGreaterThan(N.autoTarget.dropRange);
  });

  it('struck with nothing targeted, he turns on whoever struck him and swings back without being told', () => {
    const sim = Sim.empty();
    const m = sim.monster(40, 0, { mode: 'chase' });
    sim.runUntil((s) => s.count('heroHit') > 0, 3);
    expect(sim.of('targeted').at(-1)).toEqual({ type: 'targeted', monster: m.id, why: 'struck' });
    sim.run(1);
    expect(sim.count('swing')).toBeGreaterThan(0);
  });

  it('when the target falls, the next one that is after him becomes the target', () => {
    const sim = Sim.empty();
    const a = sim.monster(40, 0, { mode: 'chase', hp: 1 });
    const b = sim.monster(-40, 0, { mode: 'chase' });
    sim.monster(0, 400, { stunned: 999 });
    sim.act({ type: 'target', monster: a.id });
    sim.runUntil((s) => s.count('monsterDied') > 0, 3);
    expect(sim.state.hero.target).toBe(b.id);
    expect(sim.of('targeted').at(-1)).toEqual({ type: 'targeted', monster: b.id, why: 'next' });
  });

  it('he swings while walking past, and the swing lands if the target is still close', () => {
    const sim = Sim.empty('tide', { scheme: 2 });
    sim.monster(heroReach() - 10, 0, { stunned: 999 });
    sim.act({ type: 'steer', x: 0, y: 0.2 });
    sim.run(0.3);
    expect(sim.state.hero.moving).toBe(true);
    expect(sim.count('swing')).toBe(1);
    expect(sim.count('hit')).toBe(1);
  });

  it("a monster's wind-up gives him time to step away: standing still he is bitten, walking off he is missed", () => {
    const still = Sim.empty();
    still.monster(40, 0, { mode: 'chase' });
    still.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 3);
    expect(still.count('heroHit')).toBe(1);
    expect(still.state.hero.hp).toBeLessThan(N.hero.maxHp);

    const away = Sim.empty();
    away.monster(40, 0, { mode: 'chase' });
    away.runUntil((s) => s.count('monsterWindup') > 0, 3);
    away.act({ type: 'steer', x: -1, y: 0 });
    away.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 3);
    expect(away.count('heroHit')).toBe(0);
    expect(away.count('monsterMissed')).toBe(1);
    say(`wind-up ${N.monster.windupSeconds} s; he covers ${(N.hero.speed * N.monster.windupSeconds).toFixed(0)} units in it and needs ${N.monster.reachGrace} to be missed`);
  });
});

describe('Charge', () => {
  it('dashes to the target, stuns it, gives rage, and then waits out its cooldown', () => {
    const sim = Sim.empty();
    const m = sim.monster(300, 0);
    expect(sim.act({ type: 'skill', skill: 'charge' }).map((e) => e.type)).toEqual(['targeted', 'chargeStarted']);
    const took = sim.runUntil((s) => s.count('charged') > 0, 2);
    expect(took).toBeLessThan(0.4);
    expect(dist(sim.state.hero, sim.find(m.id)!)).toBeLessThanOrEqual(heroReach());
    expect(sim.find(m.id)!.stunned).toBeGreaterThan(N.charge.stunSeconds - 2 * DT);
    expect(sim.state.hero.rage).toBe(N.charge.rage);
    expect(sim.state.hero.target).toBe(m.id);
    // He swings the moment he lands.
    sim.run(2 * DT);
    expect(sim.count('swing')).toBe(1);
    const before = sim.state;
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'on cooldown' }]);
    expect(sim.state).toBe(before);
    say(`Charge over 300 units took ${took.toFixed(2)} s; stun ${N.charge.stunSeconds} s; cooldown ${N.charge.cooldownSeconds} s`);
  });

  it('with no target it takes the nearest in range, and is refused when nothing is in range', () => {
    const sim = Sim.empty();
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'no target in range' }]);
    expect(sim.state.hero.chargeCd).toBe(0);
    sim.monster(N.charge.range + 60, 0);
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'no target in range' }]);
    const near = sim.monster(0, 200);
    sim.act({ type: 'skill', skill: 'charge' });
    expect(sim.state.hero.target).toBe(near.id);
  });
});

describe('Cleave', () => {
  it('hits everything in the arc before him, costs rage, and leaves what stands behind him alone', () => {
    const sim = Sim.empty();
    const front = sim.monster(45, 0, { stunned: 999 });
    const left = sim.monster(35, -35, { stunned: 999 });
    const right = sim.monster(35, 35, { stunned: 999 });
    const behind = sim.monster(-45, 0, { stunned: 999 });
    sim.hero({ rage: N.cleave.rageCost, target: front.id });
    const events = sim.act({ type: 'skill', skill: 'cleave' });
    expect(events[0]).toMatchObject({ type: 'cleaved', hits: 3 });
    const struck = sim.of('hit').map((h) => h.monster).sort();
    expect(struck).toEqual([front.id, left.id, right.id].sort());
    expect(sim.find(behind.id)!.hp).toBe(N.monster.maxHp);
    expect(sim.state.hero.rage).toBe(0);
    expect(sim.act({ type: 'skill', skill: 'cleave' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not enough rage' }]);
    say(`Cleave hit ${struck.length} for ${sim.of('hit').map((h) => h.amount).join(' ')} (a swing is ${N.hero.damageMin} to ${N.hero.damageMax})`);
  });

  it('is refused, and not paid for, with too little rage, with nothing near, or on cooldown', () => {
    const sim = Sim.empty();
    // Tough enough to outlast the cooldown: he keeps swinging at it meanwhile.
    sim.monster(45, 0, { stunned: 999, hp: 9999 });
    sim.hero({ rage: N.cleave.rageCost - 1 });
    expect(sim.act({ type: 'skill', skill: 'cleave' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not enough rage' }]);

    const alone = Sim.empty();
    alone.monster(300, 0, { stunned: 999 });
    alone.hero({ rage: 100 });
    expect(alone.act({ type: 'skill', skill: 'cleave' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'no target in range' }]);
    expect(alone.state.hero.rage).toBe(100);

    sim.hero({ rage: 100 });
    sim.act({ type: 'skill', skill: 'cleave' });
    expect(sim.act({ type: 'skill', skill: 'cleave' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'on cooldown' }]);
    sim.run(N.cleave.cooldownSeconds + DT);
    expect(sim.act({ type: 'skill', skill: 'cleave' })[0]).toMatchObject({ type: 'cleaved' });
  });
});

describe('falling and standing up', () => {
  it('at no health he goes down, lets go of everything, and stands up whole in the middle; the monster goes home and mends', () => {
    const sim = Sim.empty();
    sim.hero({ x: 200, y: 200, hp: 3 });
    const m = sim.monster(40, 0, { mode: 'chase', hp: 20 });
    sim.runUntil((s) => s.count('heroDown') > 0, 3);
    expect(sim.state.deaths).toBe(1);
    expect(sim.state.hero).toMatchObject({ hp: 0, target: null, dest: null });
    expect(sim.act({ type: 'moveTo', x: 500, y: 500 })).toEqual([{ type: 'rejected', action: 'moveTo', reason: 'down' }]);
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'down' }]);
    const took = sim.runUntil((s) => s.count('heroUp') > 0, 5);
    expect(took).toBeCloseTo(N.hero.reviveSeconds, 1);
    expect(sim.state.hero).toMatchObject({ ...fieldCentre(), hp: N.hero.maxHp, rage: 0, downFor: 0 });
    sim.run(3);
    expect(sim.find(m.id)).toMatchObject({ hp: N.monster.maxHp });
  });

  it('his health comes back after a quiet while, and not before', () => {
    const sim = Sim.empty();
    sim.hero({ hp: 50, sinceHit: 0 });
    sim.run(N.hero.regenAfterSeconds - 0.5);
    expect(sim.state.hero.hp).toBe(50);
    sim.run(3);
    expect(sim.state.hero.hp).toBeGreaterThan(55);
    sim.run(60);
    expect(sim.state.hero.hp).toBe(N.hero.maxHp);
  });
});

describe('the monsters on the field', () => {
  it('a fallen one comes back after a while, away from him', () => {
    const sim = Sim.empty();
    const m = sim.monster(40, 0, { hp: 1, stunned: 999 });
    sim.act({ type: 'target', monster: m.id });
    sim.runUntil((s) => s.count('monsterDied') > 0, 3);
    expect(sim.state.monsters).toHaveLength(0);
    const took = sim.runUntil((s) => s.state.monsters.length > 0, 10);
    expect(took).toBeCloseTo(N.monster.respawnSeconds, 1);
    expect(dist(sim.state.hero, sim.state.monsters[0]!)).toBeGreaterThanOrEqual(N.monster.spawnClearance);
  });

  it('the switch sets how many there are, from 1 to the most the field takes', () => {
    const sim = new Sim();
    sim.run(1);
    sim.act({ type: 'monsters', count: 6 });
    sim.run(1);
    expect(sim.state.monsters).toHaveLength(6);
    sim.act({ type: 'monsters', count: 1 });
    expect(sim.state.monsters).toHaveLength(1);
    for (const count of [0, N.field.maxMonsters + 1, 2.5, Number.NaN]) expect(sim.act({ type: 'monsters', count })).toEqual([{ type: 'rejected', action: 'monsters', reason: 'bad number' }]);
  });

  it('strolls near its home when left alone, comes for him when he is close, and never leaves the field', () => {
    const sim = new Sim('reef', { monsters: 6 });
    sim.run(40);
    for (const m of sim.state.monsters) {
      expect(m.x).toBeGreaterThanOrEqual(N.field.margin);
      expect(m.x).toBeLessThanOrEqual(N.field.width - N.field.margin);
      expect(m.y).toBeGreaterThanOrEqual(N.field.margin);
      expect(m.y).toBeLessThanOrEqual(N.field.height - N.field.margin);
    }
    const quiet = Sim.empty();
    const m = quiet.monster(N.monster.aggroRange - 10, 0);
    quiet.run(0.2);
    expect(quiet.find(m.id)!.mode).toBe('chase');
  });

  it('a target that does not exist is refused', () => {
    const sim = Sim.empty();
    expect(sim.act({ type: 'target', monster: 77 })).toEqual([{ type: 'rejected', action: 'target', reason: 'no such monster' }]);
  });
});

describe('a save', () => {
  it("comes back as it was, at today's version", () => {
    const sim = new Sim();
    sim.run(3);
    expect(migrate(JSON.parse(JSON.stringify(sim.state)))).toEqual(sim.state);
  });

  it('is null when broken or not ours, so the holder starts fresh instead of crashing', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate('nonsense')).toBeNull();
    expect(migrate({ version: 99 })).toBeNull();
    expect(migrate({ ...newGame({ seed: 'x' }), version: 99 })).toBeNull();
    expect(migrate({ version: STATE_VERSION, seed: 'x' })).toBeNull();
    // The template starter's save (a board of squares) under the same key: not ours.
    expect(migrate({ version: 2, seed: 'x', board: { start: 'a1', spaces: {} }, players: {}, turn: 'local', ticks: 0, time: 0 })).toBeNull();
  });
});
