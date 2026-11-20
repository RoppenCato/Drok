import { describe, expect, it } from 'vitest';
import { MONSTERS, N, SKILLS, SKILL_ORDER, SKILL_SLOTS, START_SKILLS, STATE_VERSION, cooldownLeft, heroBonusDamage, heroMaxHp, knows, migrate, skillCost, skillText } from '../src/index.ts';
import { Sim } from './sim.ts';

// Skills to choose between (Robin, 2026-11-20: "choose between different skills to equip. New skills aquired as
// you level up and go deeper down the skill tree. Skills should be %-based so that they are always usable"; "we dont
// do talents, we just do different skills").
const say = (text: string): void => console.log(`  [numbers] ${text}`);

describe('the skills', () => {
  it('are a tree by level, each with a name, a text with its percent in it, and a strength that is a share of his own numbers', () => {
    expect(SKILL_ORDER.slice(0, 2).sort()).toEqual(['charge', 'cleave']);
    expect(SKILL_SLOTS).toBe(2);
    expect(START_SKILLS).toEqual(['cleave', 'charge']);
    let level = 0;
    for (const id of SKILL_ORDER) {
      const s = SKILLS[id];
      expect(s.name, id).not.toBe('');
      expect(s.level, id).toBeGreaterThanOrEqual(level);
      expect(s.level, id).toBeLessThanOrEqual(N.levels.max);
      level = s.level;
      const text = skillText(id);
      expect(text, id).not.toMatch(/[{}]/);
      expect(skillCost(id).cooldown, id).toBeGreaterThan(0);
      expect(skillCost(id).rage, id).toBeLessThanOrEqual(N.hero.maxRage);
    }
    // No flat numbers: every one that strikes or mends says a percent.
    for (const id of ['cleave', 'heavy', 'whirlwind', 'brace', 'wind'] as const) expect(skillText(id), id).toMatch(/\d+%/);
    say(SKILL_ORDER.map((id) => `level ${SKILLS[id].level} ${SKILLS[id].name}: ${skillText(id)}`).join(' | '));
  });

  it('a new hero knows the two of level 1 and carries them; the others come with their levels, and the rules say so', () => {
    const sim = Sim.empty();
    expect(sim.state.hero.slots).toEqual(['cleave', 'charge']);
    expect(knows(sim.state.hero, 'cleave')).toBe(true);
    expect(knows(sim.state.hero, 'heavy')).toBe(false);
    expect(sim.act({ type: 'skill', skill: 'heavy' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not learnt' }]);
    expect(sim.act({ type: 'equipSkill', slot: 0, skill: 'heavy' })).toEqual([{ type: 'rejected', action: 'equipSkill', reason: 'not learnt' }]);
    // One kill short of level 2, then the kill.
    sim.hero({ xp: N.levels.xpToNext[1]! - 1 });
    const m = sim.monster(40, 0, { hp: 1, stunned: 999 });
    sim.act({ type: 'target', monster: m.id });
    sim.runUntil((s) => s.count('levelUp') > 0, 3);
    expect(sim.of('skillLearnt')).toEqual([{ type: 'skillLearnt', skill: 'heavy' }]);
    expect(knows(sim.state.hero, 'heavy')).toBe(true);
  });

  it('he carries two: a learnt skill goes into a slot, one that sits in the other slot changes places, and only a carried one can be used', () => {
    const sim = Sim.empty();
    sim.hero({ level: 5, rage: 100 });
    sim.monster(40, 0, { stunned: 999 });
    expect(sim.act({ type: 'skill', skill: 'whirlwind' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not equipped' }]);
    expect(sim.act({ type: 'equipSkill', slot: 1, skill: 'whirlwind' })).toEqual([{ type: 'skillEquipped', slot: 1, skill: 'whirlwind' }]);
    expect(sim.state.hero.slots).toEqual(['cleave', 'whirlwind']);
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not equipped' }]);
    sim.act({ type: 'equipSkill', slot: 0, skill: 'whirlwind' });
    expect(sim.state.hero.slots).toEqual(['whirlwind', 'cleave']);
    expect(sim.act({ type: 'equipSkill', slot: 2, skill: 'cleave' })).toEqual([{ type: 'rejected', action: 'equipSkill', reason: 'bad number' }]);
    expect(sim.act({ type: 'skill', skill: 'whirlwind' }).some((e) => e.type === 'skillUsed')).toBe(true);
  });

  it('Heavy blow strikes one for its share of a swing; Whirlwind strikes all round him; both are paid in rage and rest', () => {
    const sim = Sim.empty();
    sim.hero({ level: 5, rage: 100, slots: ['heavy', 'whirlwind'] });
    const a = sim.monster(40, 0, { stunned: 999, kind: 'coconut-crab' });
    const behind = sim.monster(-44, 0, { stunned: 999, kind: 'coconut-crab' });
    const far = sim.monster(0, 400, { stunned: 999, kind: 'coconut-crab' });
    sim.act({ type: 'target', monster: a.id, approach: false });
    const bonus = heroBonusDamage(sim.state.hero);
    const heavyHits = sim.act({ type: 'skill', skill: 'heavy' }).filter((e) => e.type === 'hit');
    expect(heavyHits).toHaveLength(1);
    const blow = heavyHits[0]!.type === 'hit' ? heavyHits[0]!.amount : 0;
    expect(blow).toBeGreaterThanOrEqual(Math.round((N.hero.damageMin + bonus) * SKILLS.heavy.power!));
    expect(blow).toBeLessThanOrEqual(Math.round((N.hero.damageMax + bonus) * SKILLS.heavy.power!));
    expect(sim.state.hero.rage).toBe(100 - SKILLS.heavy.rage!);
    expect(cooldownLeft(sim.state.hero, 'heavy')).toBe(SKILLS.heavy.cooldown);
    expect(sim.act({ type: 'skill', skill: 'heavy' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'on cooldown' }]);
    const spun = sim.act({ type: 'skill', skill: 'whirlwind' }).filter((e) => e.type === 'hit');
    expect(spun.map((e) => (e.type === 'hit' ? e.monster : 0)).sort()).toEqual([a.id, behind.id].sort());
    expect(sim.find(far.id)!.hp).toBe(MONSTERS['coconut-crab']!.maxHp);
    sim.hero({ rage: 0 });
    sim.run(SKILLS.heavy.cooldown! + 0.1);
    sim.hero({ rage: SKILLS.heavy.rage! - 1 });
    expect(sim.act({ type: 'skill', skill: 'heavy' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'not enough rage' }]);
    say(`with a swing of ${N.hero.damageMin + bonus} to ${N.hero.damageMax + bonus} at level 5, Heavy blow did ${blow}`);
  });

  it('Brace halves every bite for its seconds; Second wind mends a share of his health, and is refused at full health', () => {
    const k = MONSTERS['coconut-crab']!;
    const bite = (braced: boolean): number => {
      const sim = Sim.empty('reef');
      sim.hero({ level: 5, hp: 100, slots: ['brace', 'wind'] });
      if (braced) expect(sim.act({ type: 'skill', skill: 'brace' })).toEqual([{ type: 'skillUsed', skill: 'brace', x: sim.state.hero.x, y: sim.state.hero.y }]);
      sim.monster(50, 0, { kind: 'coconut-crab', mode: 'chase' });
      sim.runUntil((s) => s.count('heroHit') > 0, 4);
      return sim.of('heroHit')[0]!.amount;
    };
    const plain = bite(false);
    const less = bite(true);
    expect(plain).toBeGreaterThanOrEqual(k.damageMin - 3);
    expect(less).toBe(Math.max(1, Math.round(plain * (1 - SKILLS.brace.share!))));

    const sim = Sim.empty();
    sim.hero({ level: 5, slots: ['brace', 'wind'] });
    sim.hero({ hp: heroMaxHp(sim.state.hero) });
    expect(sim.act({ type: 'skill', skill: 'wind' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'full health' }]);
    const max = heroMaxHp(sim.state.hero);
    sim.hero({ hp: 20, sinceHit: 0 });
    sim.act({ type: 'skill', skill: 'wind' });
    sim.run(SKILLS.wind.seconds! + 0.1);
    expect(sim.state.hero.hp).toBeCloseTo(20 + max * SKILLS.wind.share!, 0);
    say(`a coconut crab's slam of ${plain} is ${less} when braced; Second wind gave back ${(max * SKILLS.wind.share!).toFixed(0)} of ${max} health`);
  });

  it('a save from before the skills carries Cleave and Charge, as he always did', () => {
    const sim = Sim.landed();
    sim.run(1);
    const old = JSON.parse(JSON.stringify(sim.state));
    old.version = 7;
    for (const key of ['slots', 'skillCd', 'braceFor', 'windFor']) delete old.hero[key];
    const s = migrate(old)!;
    expect(s.version).toBe(STATE_VERSION);
    expect(s).toEqual(sim.state);
  });
});
