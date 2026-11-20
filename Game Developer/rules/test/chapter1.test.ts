import { describe, expect, it } from 'vitest';
import {
  BASES,
  biomeAt,
  inHome,
  buyPrice,
  chestFull,
  clear,
  dist,
  onLand,
  heroArmour,
  heroBonusDamage,
  heroMaxHp,
  itemStats,
  migrate,
  fromBeforeTheHouse,
  MONSTERS,
  N,
  newGame,
  packSave,
  PLACES,
  RARITIES,
  RARITY_ORDER,
  sellPrice,
  SHOP,
  SLOTS,
  START_PLACE,
  STATE_VERSION,
  unpackSave,
  xpToNext,
  type Rarity,
} from '../src/index.ts';
import { DT, FIELD, NOON, Sim, WORLD } from './sim.ts';

// What the game holds (the same loop since chapter 1; since the house, Robin 2026-11-20, in one world with a home
// in it): three kinds of monster, levels 1 to 5, loot on the ground with rarities, a bag and gear, one chest,
// potions, death that costs money, the stall, and a save that can leave the phone.
const say = (text: string): void => console.log(`  [numbers] ${text}`);
const world = PLACES[WORLD]!;
/** The size of the hero where he meets the ground. */
const FEET = N.hero.radius * 0.5;

describe('the ground of the world', () => {
  // The stand-in layout is Victor, GD's; the Art Director's replaces it. These hold for either.
  const stays = (sim: Sim): void => expect(clear(world, sim.state.hero.x, sim.state.hero.y, FEET - 0.01), `in the way at ${sim.state.hero.x.toFixed(0)}, ${sim.state.hero.y.toFixed(0)}`).toBe(true);
  const alone = (): Sim => {
    const sim = Sim.started();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    return sim;
  };
  const walkTo = (sim: Sim, to: { x: number; y: number }, limit = 60): number => {
    sim.act({ type: 'moveTo', ...to });
    let steps = 0;
    while (sim.state.hero.dest && steps++ < 60 * limit) {
      sim.step();
      stays(sim);
    }
    return steps / 60;
  };

  it('the walls hold him: pushed at the wall from home, he stops at it and slides along it', () => {
    const sim = alone();
    sim.act({ type: 'steer', x: 0, y: 1 });
    sim.run(3);
    const wall = sim.state.hero.y;
    expect(wall).toBeCloseTo(world.height - N.margin, 0);
    sim.act({ type: 'steer', x: -0.7, y: 0.7 });
    sim.run(2);
    expect(sim.state.hero.y).toBeCloseTo(wall, 0);
    expect(sim.state.hero.x).toBeLessThan(world.arrive.x - 60);
  });

  it('has things to walk round, and the square ones are boxes', () => {
    expect(world.boxes.length).toBeGreaterThanOrEqual(4);
    expect(world.solids.length).toBeGreaterThanOrEqual(1);
    const house = world.boxes[0]!;
    expect(clear(world, house.x + house.w / 2, house.y + house.h / 2, FEET)).toBe(false);
    expect(clear(world, house.x - FEET + 1, house.y - FEET + 1, FEET)).toBe(true);
    expect(clear(world, house.x + house.w / 2, house.y + house.h + FEET - 1, FEET)).toBe(false);
    expect(clear(world, house.x + house.w / 2, house.y + house.h + FEET + 1, FEET)).toBe(true);
  });

  it('a tap far away finds the way round what stands between, and he never walks through a thing', () => {
    const sim = alone();
    const before = { x: world.chest!.x, y: world.chest!.y + 40 };
    const t0 = performance.now();
    sim.act({ type: 'moveTo', ...before });
    const search = performance.now() - t0;
    expect(sim.state.hero.dest).toEqual(before);
    const took = walkTo(sim, before);
    expect(Math.hypot(sim.state.hero.x - before.x, sim.state.hero.y - before.y)).toBeLessThan(1);
    const straight = Math.hypot(before.x - world.arrive.x, before.y - world.arrive.y) / N.hero.speed;
    expect(took).toBeGreaterThan(straight);
    // And home again, round the doll's house.
    walkTo(sim, world.wake);
    expect(Math.hypot(sim.state.hero.x - world.wake.x, sim.state.hero.y - world.wake.y)).toBeLessThan(1);
    say(`from home to the chest, the whole world's length: ${took.toFixed(1)} s on foot; a straight line would be ${straight.toFixed(1)} s; finding the way took ${search.toFixed(0)} ms the first time`);
  });

  it('a tap on a thing takes him as near as the ground goes', () => {
    const sim = alone();
    const marble = world.solids[0]!;
    sim.hero({ x: marble.x, y: marble.y + 300 });
    sim.act({ type: 'moveTo', x: marble.x, y: marble.y });
    const beside = sim.state.hero.dest!;
    expect(Math.hypot(beside.x - marble.x, beside.y - marble.y)).toBeGreaterThanOrEqual(marble.r + FEET);
    expect(Math.hypot(beside.x - marble.x, beside.y - marble.y)).toBeLessThan(marble.r + 40);
    sim.runUntil((s) => s.state.hero.dest === null, 10);
    expect(Math.hypot(sim.state.hero.x - beside.x, sim.state.hero.y - beside.y)).toBeLessThan(1);
  });

  it('pushed slantwise at a wall by the thumb, he slides along it', () => {
    const sim = alone();
    const house = world.boxes.reduce((a, b) => (b.w > a.w ? b : a));
    const foot = house.y + house.h + FEET;
    sim.hero({ x: house.x + 40, y: foot + 40 });
    sim.act({ type: 'steer', x: 0.7, y: -0.7 });
    sim.run(0.8);
    stays(sim);
    expect(sim.state.hero.y).toBeCloseTo(foot, 0);
    expect(sim.state.hero.x).toBeGreaterThan(house.x + 40 + 90);
  });

  it('a tap on the stall takes him before it, near enough to trade', () => {
    const sim = alone();
    const shop = world.shop!;
    expect(clear(world, shop.x, shop.y, FEET)).toBe(false);
    walkTo(sim, shop);
    expect(dist(sim.state.hero, shop)).toBeLessThanOrEqual(N.reach.shop);
    sim.hero({ gold: 500, potions: 0 });
    expect(sim.act({ type: 'buy', what: 'potion' }).some((e) => e.type === 'rejected')).toBe(false);
    expect(sim.state.hero.potions).toBe(1);
  });

  it('the world fills from its zones, nobody is born at home, and what walks stays on the floor', () => {
    const sim = Sim.started('reef');
    const wanted = world.zones.reduce((n, z) => n + z.count, 0);
    expect(sim.state.monsters).toHaveLength(wanted);
    for (const m of sim.state.monsters) {
      const zone = world.zones[m.zone]!;
      expect(m.kind).toBe(zone.kind);
      expect(m.homeY).toBeGreaterThanOrEqual(zone.y);
      expect(m.homeY).toBeLessThanOrEqual(zone.y + zone.h);
      expect(inHome(world, { x: m.homeX, y: m.homeY }), `${m.kind} born at home`).toBe(false);
      expect(Math.hypot(m.homeX - world.wake.x, m.homeY - world.wake.y), `${m.kind} where he wakes`).toBeGreaterThanOrEqual(N.spawn.landing);
    }
    sim.run(60);
    for (const m of sim.state.monsters) expect(onLand(world, m.x, m.y), `${m.kind} off the floor at ${m.x.toFixed(0)}, ${m.y.toFixed(0)}`).toBe(true);
    say(`the world holds ${world.zones.map((z) => `${z.count} ${MONSTERS[z.kind]!.name}`).join(', ')}: ${wanted} in all`);
  });
});

describe('the data is whole', () => {
  it('every place, monster and piece of gear has what the rules will ask of it', () => {
    expect(world.home).not.toBeNull();
    expect(world.shop).not.toBeNull();
    expect(inHome(world, world.wake)).toBe(true);
    expect(inHome(world, world.arrive)).toBe(true);
    expect(inHome(world, world.shop!)).toBe(true);
    expect(world.biomes.length).toBeGreaterThanOrEqual(3);
    for (const [id, place] of Object.entries(PLACES)) {
      expect(place.name, id).not.toBe('');
      for (const spot of [place.arrive, place.wake, place.shop, place.chest]) {
        if (!spot) continue;
        expect(spot.x, id).toBeGreaterThan(N.margin);
        expect(spot.x, id).toBeLessThan(place.width - N.margin);
        expect(spot.y, id).toBeGreaterThan(N.margin);
        expect(spot.y, id).toBeLessThan(place.height - N.margin);
      }
      for (const zone of place.zones) {
        expect(MONSTERS[zone.kind], `${id}: ${zone.kind}`).toBeDefined();
        expect(zone.x + zone.w, id).toBeLessThanOrEqual(place.width);
        expect(zone.y + zone.h, id).toBeLessThanOrEqual(place.height);
        // A zone lies on a floor, and its middle is not at home.
        const middle = { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
        if (place.biomes.length > 0) expect(biomeAt(place, middle), `${id}: a zone of ${zone.kind} on no floor`).toBeDefined();
        expect(inHome(place, middle), `${id}: a zone of ${zone.kind} at home`).toBe(false);
      }
      for (const b of place.biomes) {
        expect(b.name, id).not.toBe('');
        expect(b.x + b.w, id).toBeLessThanOrEqual(place.width);
        expect(b.y + b.h, id).toBeLessThanOrEqual(place.height);
      }
      // He can stand where he must: where he starts, where he wakes, before the chest, before the stall.
      for (const [what, spot] of [['arrive', place.arrive], ['wake', place.wake]] as const) expect(clear(place, spot.x, spot.y, FEET), `${id}: the ${what} is not ground`).toBe(true);
      if (place.chest) expect(clear(place, place.chest.x, place.chest.y + 40, FEET), `${id}: no ground before the chest`).toBe(true);
      for (const s of place.solids) expect(s.r, id).toBeGreaterThan(0);
      for (const b of place.boxes) expect(Math.min(b.w, b.h), id).toBeGreaterThan(0);
      if (place.shop) expect(clear(place, place.shop.x, place.shop.y + 50, FEET), `${id}: no ground before the stall`).toBe(true);
      if (place.chest) expect(Object.values(BASES).some((b) => b.tier === place.chest!.itemTier), id).toBe(true);
    }
    for (const [id, k] of Object.entries(MONSTERS)) {
      expect(k.name, id).not.toBe('');
      expect(k.damageMax, id).toBeGreaterThanOrEqual(k.damageMin);
      expect(k.chaseSpeed, `${id} must be outrun`).toBeLessThan(N.hero.speed);
      // Every tier a monster drops has a piece for every part of him.
      for (const slot of SLOTS) expect(Object.values(BASES).some((b) => b.tier === k.itemTier && b.slot === slot), `${id}: tier ${k.itemTier} ${slot}`).toBe(true);
      // A wind-up can be walked out of.
      const need = k.slamRadius > 0 ? k.slamRadius - (k.radius + N.hero.radius) : k.reachGrace + k.reach;
      expect(N.hero.speed * k.windupSeconds, `${id}: the wind-up is too short to step away`).toBeGreaterThan(need);
    }
    for (const [id, b] of Object.entries(BASES)) {
      expect(SLOTS, id).toContain(b.slot);
      expect(b.damage + b.hp + b.armour, id).toBeGreaterThan(0);
      expect(b.value, id).toBeGreaterThan(0);
    }
    expect(N.levels.xpToNext).toHaveLength(N.levels.max);
    for (let level = 0; level <= N.levels.max; level++) expect(SHOP.tierAtLevel[level], `the stall at level ${level}`).toBeGreaterThanOrEqual(1);
    say(
      Object.values(MONSTERS)
        .map((k) => `${k.name}: level ${k.level}, ${k.maxHp} hp, bites ${k.damageMin} to ${k.damageMax}, ${k.xp} xp`)
        .join(' | '),
    );
    say(`levels: ${N.levels.xpToNext.slice(1).join(', ')} xp for levels 2 to ${N.levels.max}; ${N.levels.xpToNext.reduce((a, b) => a + b, 0)} in all`);
  });

  it('a rarer piece is always the better piece of its kind', () => {
    for (const base of Object.keys(BASES)) {
      let last = -1;
      for (const rarity of RARITY_ORDER) {
        const s = itemStats({ id: 1, base, rarity });
        const sum = s.damage + s.hp + s.armour;
        expect(sum, `${base} ${rarity}`).toBeGreaterThan(last);
        last = sum;
      }
    }
    const pin = (rarity: Rarity): number => itemStats({ id: 1, base: 'sailors-cutlass', rarity }).damage;
    say(`a ${BASES['sailors-cutlass']!.name.toLowerCase()} adds ${RARITY_ORDER.map((r) => `${pin(r)} (${r})`).join(', ')} to a swing of ${N.hero.damageMin} to ${N.hero.damageMax}`);
  });
});

describe('a new hero', () => {
  it("stands before the doll's house: level 1, a pin, a button, a few potions, no money", () => {
    const s = newGame({ seed: 'tide' });
    expect(s.place).toBe(START_PLACE);
    expect(s.hero).toMatchObject({ ...world.arrive, level: 1, xp: 0, gold: 0, potions: N.potion.start, bag: [], home: true });
    expect(s.hero.worn.weapon?.base).toBe('rusty-cutlass');
    expect(s.hero.worn.shield?.base).toBe('plank-buckler');
    expect(s.hero.worn.hat).toBeNull();
    expect(s.hero.hp).toBe(heroMaxHp(s.hero));
    expect(heroArmour(s.hero)).toBe(1);
    expect(heroBonusDamage(s.hero)).toBe(2);
    expect(newGame({ seed: 'tide' })).toEqual(s);
  });
});

describe('home', () => {
  it('his health comes back fast there, and not so outside', () => {
    const sim = Sim.started();
    sim.hero({ hp: 10 });
    sim.run(3);
    expect(sim.state.hero.home).toBe(true);
    expect(sim.state.hero.hp).toBeGreaterThan(80);
    const out = Sim.empty();
    out.hero({ hp: 10, sinceHit: 0 });
    out.run(3);
    expect(out.state.hero.home).toBe(false);
    expect(out.state.hero.hp).toBe(10);
  });

  it('nothing comes for him there: one that is after him turns back, and one beside him leaves him be', () => {
    const sim = Sim.started();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    const hunter = sim.monster(60, 0, { mode: 'chase' });
    const idler = sim.monster(-60, 0);
    sim.run(2);
    expect(sim.count('heroHit')).toBe(0);
    expect(sim.count('monsterWindup')).toBe(0);
    expect(sim.find(hunter.id)!.mode).not.toBe('chase');
    expect(sim.find(idler.id)!.mode).toBe('wander');
  });

  it('he can still hunt from his doorstep: a monster he hits there is hit', () => {
    const sim = Sim.started();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    const m = sim.monster(40, 0, { stunned: 999 });
    sim.act({ type: 'target', monster: m.id, approach: false });
    sim.runUntil((s) => s.count('hit') > 0, 3);
    expect(sim.count('hit')).toBeGreaterThan(0);
  });

  it('walking out and coming home again puts new pieces on the stall, once', () => {
    const sim = Sim.started();
    sim.state = { ...sim.state, monsters: [], respawns: [] };
    const stock = sim.state.shop.map((i) => i!.id);
    sim.run(1);
    expect(sim.count('cameHome')).toBe(0);
    expect(sim.state.shop.map((i) => i!.id)).toEqual(stock);
    const home = world.home!;
    sim.hero({ x: home.x, y: home.y - home.r - 60 });
    sim.step();
    expect(sim.state.hero.home).toBe(false);
    expect(sim.count('cameHome')).toBe(0);
    sim.hero({ ...world.wake });
    sim.run(1);
    expect(sim.state.hero.home).toBe(true);
    expect(sim.count('cameHome')).toBe(1);
    expect(sim.state.shop.map((i) => i!.id)).not.toEqual(stock);
  });
});

describe('a big world', () => {
  it('far from him a strolling monster sleeps; it wakes when he comes near', () => {
    const sim = Sim.started();
    const far = sim.state.monsters.filter((m) => dist(m, sim.state.hero) > N.world.awake + 400);
    expect(far.length).toBeGreaterThan(10);
    const was = far.map((m) => ({ id: m.id, x: m.x, y: m.y }));
    sim.run(20);
    for (const w of was) expect(sim.find(w.id)).toMatchObject({ x: w.x, y: w.y });
    // He walks in among them, with nobody able to see him: they stroll again.
    const one = far[0]!;
    sim.hero({ x: one.x, y: one.y + 400, home: false });
    sim.state = { ...sim.state, monsters: sim.state.monsters.map((m) => ({ ...m, timer: Math.min(m.timer, 1) })) };
    const near = sim.state.monsters.filter((m) => dist(m, sim.state.hero) < N.world.awake - 200 && dist(m, sim.state.hero) > 300);
    const before = near.map((m) => ({ id: m.id, x: m.x, y: m.y }));
    sim.run(8);
    const moved = before.filter((b) => {
      const m = sim.find(b.id);
      return m !== undefined && (m.x !== b.x || m.y !== b.y);
    });
    expect(moved.length).toBeGreaterThan(0);
    say(`of ${sim.state.monsters.length} monsters, ${far.length} slept while he stood at home; ${moved.length} of the ${near.length} near him moved in 8 s when he came`);
  });

  it('a step of the whole world is quick', () => {
    const sim = Sim.started();
    sim.hero({ x: 2150, y: 3400, home: false });
    const t0 = performance.now();
    sim.run(20);
    const each = (performance.now() - t0) / (20 / DT);
    expect(each).toBeLessThan(2);
    say(`a step with ${sim.state.monsters.length} monsters in the world takes ${each.toFixed(3)} ms here (a frame has 16.7)`);
  });
});


describe('the three kinds of monster', () => {
  it('a reef gull bites and backs off, and comes again', () => {
    const sim = Sim.empty();
    const gull = sim.monster(40, 0, { kind: 'silverfish', mode: 'chase' });
    sim.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 3);
    expect(sim.find(gull.id)!.mode).toBe('retreat');
    sim.run(MONSTERS['silverfish']!.retreatSeconds - 0.2);
    const far = dist(sim.state.hero, sim.find(gull.id)!);
    expect(far).toBeGreaterThan(120);
    sim.runUntil((s) => s.find(gull.id)!.mode === 'windup', 5);
    expect(dist(sim.state.hero, sim.find(gull.id)!)).toBeLessThan(60);
    say(`a silverfish backs off to ${far.toFixed(0)} units between bites; he cannot follow at ${N.hero.speed} against its ${MONSTERS['silverfish']!.chaseSpeed}, so Charge or patience catches it`);
  });

  it("a coconut crab's slam hits everything near it, and its long wind-up is for getting clear", () => {
    const k = MONSTERS['cockroach']!;
    const still = Sim.empty();
    still.monster(50, 0, { kind: 'cockroach', mode: 'chase' });
    still.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(still.count('heroHit')).toBe(1);

    // Stepping only just out of its reach is not enough: the slam is wider than its bite.
    const near = Sim.empty();
    const m = near.monster(50, 0, { kind: 'cockroach', mode: 'chase' });
    near.runUntil((s) => s.count('monsterWindup') > 0, 4);
    near.hero({ x: near.find(m.id)!.x - (k.slamRadius - 6) });
    near.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(near.count('heroHit')).toBe(1);

    const clear = Sim.empty();
    clear.monster(50, 0, { kind: 'cockroach', mode: 'chase' });
    clear.runUntil((s) => s.count('monsterWindup') > 0, 4);
    clear.act({ type: 'steer', x: -1, y: 0 });
    clear.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(clear.count('heroHit')).toBe(0);
    say(`a cockroach winds up for ${k.windupSeconds} s and slams everything within ${k.slamRadius}; he walks ${(N.hero.speed * k.windupSeconds).toFixed(0)} units in that time`);
  });
});

describe('experience and levels', () => {
  it('a kill gives experience; enough of it is a level, which makes him tougher and fills his health', () => {
    const sim = Sim.empty();
    const need = xpToNext(1);
    sim.hero({ xp: need - 1, hp: 20 });
    const before = heroMaxHp(sim.state.hero);
    const m = sim.monster(40, 0, { hp: 1, stunned: 999 });
    sim.act({ type: 'target', monster: m.id });
    sim.runUntil((s) => s.count('monsterDied') > 0, 3);
    expect(sim.of('xp')).toEqual([{ type: 'xp', amount: MONSTERS['ant']!.xp }]);
    expect(sim.of('levelUp')).toEqual([{ type: 'levelUp', level: 2 }]);
    expect(sim.state.hero.level).toBe(2);
    expect(sim.state.hero.xp).toBe(MONSTERS['ant']!.xp - 1);
    expect(heroMaxHp(sim.state.hero)).toBe(before + N.levels.hpPerLevel);
    expect(sim.state.hero.hp).toBe(heroMaxHp(sim.state.hero));
    expect(sim.state.book['ant']).toBe(1);
  });

  it('stops at the last level of the chapter', () => {
    const sim = Sim.empty();
    sim.hero({ level: N.levels.max, xp: 0 });
    const m = sim.monster(40, 0, { hp: 1, stunned: 999 });
    sim.act({ type: 'target', monster: m.id });
    sim.runUntil((s) => s.count('monsterDied') > 0, 3);
    expect(sim.count('xp')).toBe(0);
    expect(sim.state.hero).toMatchObject({ level: N.levels.max, xp: 0 });
    expect(xpToNext(N.levels.max)).toBe(0);
  });

  it('his level and his cutlass add to every swing; his buckler takes from every bite, never below 1', () => {
    const sim = Sim.empty();
    expect(heroBonusDamage(sim.state.hero)).toBe(2);
    sim.hero({ level: 5 });
    expect(heroBonusDamage(sim.state.hero)).toBe(2 + Math.floor(4 * N.levels.damagePerLevel));
    const epic = sim.give('brass-buckler', 'epic');
    sim.act({ type: 'equip', item: epic.id });
    expect(heroArmour(sim.state.hero)).toBe(itemStats(epic).armour);
    sim.monster(40, 0, { mode: 'chase' });
    sim.runUntil((s) => s.count('heroHit') > 0, 3);
    expect(sim.of('heroHit')[0]!.amount).toBe(1);
  });
});

describe('loot on the ground', () => {
  it('falls where the monster fell, by the chances in the data', () => {
    const sim = Sim.empty('gull');
    const kills = 600;
    const k = MONSTERS['ant']!;
    for (let i = 0; i < kills; i++) {
      const m = sim.monster(40, 0, { hp: 1, stunned: 999 });
      sim.act({ type: 'target', monster: m.id, approach: false });
      sim.runUntil((s) => s.state.kills > i, 3);
      // Sweep the ground and empty the bag, so nothing is picked up or left lying between kills.
      sim.state = { ...sim.state, drops: [], respawns: [], hero: { ...sim.state.hero, bag: [], potions: 0, level: 1, xp: 0 } };
    }
    const dropped = sim.of('dropped').map((e) => e.drop);
    const share = (n: number): number => n / kills;
    const gold = dropped.filter((d) => d.kind === 'gold');
    const items = dropped.filter((d) => d.kind === 'item');
    const potions = dropped.filter((d) => d.kind === 'potion');
    expect(share(gold.length)).toBeGreaterThan(k.goldChance - 0.07);
    expect(share(gold.length)).toBeLessThan(k.goldChance + 0.07);
    expect(share(items.length)).toBeGreaterThan(k.itemChance - 0.05);
    expect(share(items.length)).toBeLessThan(k.itemChance + 0.05);
    for (const d of gold) {
      expect(d.amount).toBeGreaterThanOrEqual(k.goldMin);
      expect(d.amount).toBeLessThanOrEqual(k.goldMax);
    }
    for (const d of items) expect(BASES[d.item!.base]!.tier).toBe(k.itemTier);
    const byRarity = RARITY_ORDER.map((r) => `${items.filter((d) => d.item!.rarity === r).length} ${r}`).join(', ');
    say(`${kills} sand crabs: money from ${(share(gold.length) * 100).toFixed(0)}% (${(gold.reduce((n, d) => n + d.amount, 0) / kills).toFixed(1)} a kill), a potion from ${(share(potions.length) * 100).toFixed(1)}%, gear from ${(share(items.length) * 100).toFixed(1)}%: ${byRarity}`);
  });

  it('flies to him when he walks close and is his; far away it stays', () => {
    const sim = Sim.empty();
    const h = sim.state.hero;
    sim.state = {
      ...sim.state,
      drops: [
        { id: 900, x: h.x + N.drops.magnetRange - 5, y: h.y, kind: 'gold', amount: 7, item: null, age: 0 },
        { id: 901, x: h.x + N.drops.magnetRange + 40, y: h.y, kind: 'gold', amount: 9, item: null, age: 0 },
        { id: 902, x: h.x, y: h.y + 50, kind: 'item', amount: 1, item: { id: 903, base: 'tricorn', rarity: 'rare' }, age: 0 },
        { id: 904, x: h.x, y: h.y - 50, kind: 'potion', amount: 1, item: null, age: 0 },
      ],
    };
    const took = sim.runUntil((s) => s.count('picked') === 3, 3);
    expect(took).toBeLessThan(0.3);
    expect(sim.state.hero.gold).toBe(7);
    expect(sim.state.hero.potions).toBe(N.potion.start + 1);
    expect(sim.state.hero.bag).toEqual([{ id: 903, base: 'tricorn', rarity: 'rare' }]);
    expect(sim.state.drops.map((d) => d.id)).toEqual([901]);
    sim.run(N.drops.lifeSeconds);
    expect(sim.state.drops).toHaveLength(0);
  });

  it('a full bag leaves gear on the ground, and says so; money is still picked up', () => {
    const sim = Sim.empty();
    for (let i = 0; i < N.bagSize; i++) sim.give('bandana');
    const h = sim.state.hero;
    sim.state = {
      ...sim.state,
      drops: [
        { id: 900, x: h.x + 10, y: h.y, kind: 'item', amount: 1, item: { id: 901, base: 'tricorn', rarity: 'epic' }, age: 0 },
        { id: 902, x: h.x - 10, y: h.y, kind: 'gold', amount: 5, item: null, age: 0 },
      ],
    };
    sim.run(2);
    expect(sim.state.hero.bag).toHaveLength(N.bagSize);
    expect(sim.state.hero.gold).toBe(5);
    expect(sim.state.drops.map((d) => d.id)).toEqual([900]);
    expect(sim.count('bagFull')).toBeGreaterThan(0);
  });
});

describe('the chest', () => {
  it('opens when he stands by it, spills money, potions and a piece better than common, and is then empty until it fills again on the real clock', () => {
    const sim = Sim.empty();
    const chest = PLACES[FIELD]!.chest!;
    expect(sim.act({ type: 'openChest' })).toEqual([{ type: 'rejected', action: 'openChest', reason: 'too far' }]);
    sim.walkTo('chest');
    expect(chestFull(sim.state)).toBe(true);
    const events = sim.act({ type: 'openChest' });
    expect(events[0]).toEqual({ type: 'chestOpened', x: chest.x, y: chest.y });
    const dropped = sim.of('dropped').map((e) => e.drop);
    expect(dropped.map((d) => d.kind).sort()).toEqual(['gold', 'item', 'potion']);
    const gear = dropped.find((d) => d.kind === 'item')!.item!;
    expect(gear.rarity).not.toBe('common');
    expect(BASES[gear.base]!.tier).toBe(chest.itemTier);
    sim.run(1);
    expect(sim.state.hero.gold).toBeGreaterThanOrEqual(chest.goldMin);
    expect(sim.state.hero.bag).toEqual([gear]);
    expect(chestFull(sim.state)).toBe(false);
    expect(sim.act({ type: 'openChest' })).toEqual([{ type: 'rejected', action: 'openChest', reason: 'chest is empty' }]);
    // The real clock moves on while the game is closed: one step that carries a later time is enough.
    sim.act({ type: 'tick', dt: DT, now: NOON + chest.refillMinutes * 60_000 + 5000 });
    expect(chestFull(sim.state)).toBe(true);
    expect(sim.act({ type: 'openChest' })[0]).toMatchObject({ type: 'chestOpened' });
    say(`the chest gave ${sim.state.hero.gold} money, ${chest.potions} potions and a ${gear.rarity} ${BASES[gear.base]!.name}; it fills again ${chest.refillMinutes} minutes later by the clock`);
  });

  it('is not to be had from far away', () => {
    const sim = new Sim();
    expect(sim.act({ type: 'openChest' })).toEqual([{ type: 'rejected', action: 'openChest', reason: 'too far' }]);
  });
});

describe('falling', () => {
  it('costs him a share of the money he carries, and he wakes whole at home with his bag; the world goes on', () => {
    const sim = Sim.started();
    const kept = sim.give('tricorn', 'rare');
    // Out among the ants, far from home.
    sim.hero({ x: 700, y: 5400, hp: 3, gold: 87, home: false });
    const all = sim.state.monsters.length;
    sim.monster(40, 0, { mode: 'chase', kind: 'cockroach' });
    sim.runUntil((s) => s.count('heroDown') > 0, 4);
    const lost = Math.floor(87 * N.death.goldShare);
    expect(sim.of('heroDown')).toEqual([{ type: 'heroDown', lost }]);
    expect(sim.state.deaths).toBe(1);
    expect(sim.state.hero).toMatchObject({ hp: 0, target: null, dest: null, gold: 87 - lost });
    expect(sim.act({ type: 'moveTo', x: 500, y: 500 })).toEqual([{ type: 'rejected', action: 'moveTo', reason: 'down' }]);
    expect(sim.act({ type: 'skill', skill: 'charge' })).toEqual([{ type: 'rejected', action: 'skill', reason: 'down' }]);
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'rejected', action: 'potion', reason: 'down' }]);
    const took = sim.runUntil((s) => s.count('heroUp') > 0, 5);
    expect(took).toBeCloseTo(N.hero.reviveSeconds, 1);
    expect(sim.state.place).toBe(START_PLACE);
    expect(sim.state.hero).toMatchObject({ ...world.wake, hp: heroMaxHp(sim.state.hero), rage: 0, downFor: 0 });
    expect(sim.state.hero.bag).toEqual([kept]);
    expect(sim.state.monsters).toHaveLength(all + 1);
    sim.step();
    expect(sim.state.hero.home).toBe(true);
    expect(sim.count('cameHome')).toBe(1);
    say(`falling with 87 money cost ${lost}; he was down for ${took.toFixed(1)} s`);
  });
});

describe('potions', () => {
  it('mend over a few seconds, then make him wait', () => {
    const sim = Sim.empty();
    sim.hero({ hp: 30, sinceHit: 0 });
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'potionUsed' }]);
    expect(sim.state.hero.potions).toBe(N.potion.start - 1);
    sim.run(N.potion.seconds + 0.1);
    expect(sim.state.hero.hp).toBeCloseTo(30 + N.potion.heal, 0);
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'rejected', action: 'potion', reason: 'on cooldown' }]);
    sim.run(N.potion.cooldownSeconds);
    sim.hero({ sinceHit: 0, hp: 40 });
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'potionUsed' }]);
  });

  it('are refused at full health and when he has none', () => {
    const sim = Sim.empty();
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'rejected', action: 'potion', reason: 'full health' }]);
    sim.hero({ hp: 30, potions: 0 });
    expect(sim.act({ type: 'potion' })).toEqual([{ type: 'rejected', action: 'potion', reason: 'no potions' }]);
  });
});

describe('gear', () => {
  it('is worn from the bag; what he wore goes into the bag in its stead', () => {
    const sim = Sim.empty();
    const hat = sim.give('tricorn', 'uncommon');
    const blade = sim.give('sailors-cutlass');
    const old = sim.state.hero.worn.weapon!;
    const hp = heroMaxHp(sim.state.hero);
    expect(sim.act({ type: 'equip', item: hat.id })).toEqual([{ type: 'equipped', item: hat }]);
    expect(sim.state.hero.worn.hat).toEqual(hat);
    expect(heroMaxHp(sim.state.hero)).toBe(hp + itemStats(hat).hp);
    sim.act({ type: 'equip', item: blade.id });
    expect(sim.state.hero.worn.weapon).toEqual(blade);
    expect(sim.state.hero.bag).toEqual([old]);
    expect(heroBonusDamage(sim.state.hero)).toBe(itemStats(blade).damage);
    expect(sim.act({ type: 'equip', item: 9999 })).toEqual([{ type: 'rejected', action: 'equip', reason: 'no such item' }]);
  });

  it('taken off goes into the bag, and his health never stays above what he can now hold', () => {
    const sim = Sim.empty();
    const hat = sim.give('feathered-hat', 'epic');
    sim.act({ type: 'equip', item: hat.id });
    sim.hero({ hp: heroMaxHp(sim.state.hero) });
    expect(sim.act({ type: 'unequip', slot: 'hat' })).toEqual([{ type: 'unequipped', item: hat }]);
    expect(sim.state.hero.worn.hat).toBeNull();
    expect(sim.state.hero.bag).toEqual([hat]);
    expect(sim.state.hero.hp).toBe(heroMaxHp(sim.state.hero));
    expect(sim.act({ type: 'unequip', slot: 'hat' })).toEqual([{ type: 'rejected', action: 'unequip', reason: 'no such item' }]);
    expect(sim.act({ type: 'discard', item: hat.id })).toEqual([{ type: 'discarded', item: hat }]);
    expect(sim.state.hero.bag).toEqual([]);
    for (let i = 0; i < N.bagSize; i++) sim.give('bandana');
    expect(sim.act({ type: 'unequip', slot: 'weapon' })).toEqual([{ type: 'rejected', action: 'unequip', reason: 'bag is full' }]);
  });
});

describe('the stall', () => {
  it('shows a few pieces, each for another part of him, of the tier his level has earned, and new ones each time he comes home', () => {
    const sim = new Sim();
    const stock = sim.state.shop;
    expect(stock).toHaveLength(SHOP.pieces);
    expect(new Set(stock.map((i) => BASES[i!.base]!.slot)).size).toBe(SHOP.pieces);
    for (const item of stock) expect(BASES[item!.base]!.tier).toBe(SHOP.tierAtLevel[1]);
    sim.hero({ level: 5, x: 700, y: 5400 });
    sim.step();
    sim.hero({ ...world.wake });
    sim.step();
    expect(sim.state.shop.map((i) => i!.id)).not.toEqual(stock.map((i) => i!.id));
    for (const item of sim.state.shop) expect(BASES[item!.base]!.tier).toBe(SHOP.tierAtLevel[5]);
  });

  it('sells potions and pieces to a hero who stands at it and can pay', () => {
    const sim = new Sim();
    expect(sim.act({ type: 'buy', what: 'potion' })).toEqual([{ type: 'rejected', action: 'buy', reason: 'too far' }]);
    sim.walkTo('shop');
    expect(sim.act({ type: 'buy', what: 'potion' })).toEqual([{ type: 'rejected', action: 'buy', reason: 'not enough gold' }]);
    sim.hero({ gold: 500 });
    expect(sim.act({ type: 'buy', what: 'potion' })).toEqual([{ type: 'bought', what: 'potion', item: null, price: N.potion.price }]);
    expect(sim.state.hero).toMatchObject({ gold: 500 - N.potion.price, potions: N.potion.start + 1 });
    sim.hero({ potions: N.potion.carry });
    expect(sim.act({ type: 'buy', what: 'potion' })).toEqual([{ type: 'rejected', action: 'buy', reason: 'potions full' }]);

    const piece = sim.state.shop[0]!;
    const gold = sim.state.hero.gold;
    expect(sim.act({ type: 'buy', what: 0 })).toEqual([{ type: 'bought', what: 'item', item: piece, price: buyPrice(piece) }]);
    expect(sim.state.hero.gold).toBe(gold - buyPrice(piece));
    expect(sim.state.hero.bag).toEqual([piece]);
    expect(sim.state.shop[0]).toBeNull();
    expect(sim.act({ type: 'buy', what: 0 })).toEqual([{ type: 'rejected', action: 'buy', reason: 'sold out' }]);
    sim.hero({ gold: 0 });
    expect(sim.act({ type: 'buy', what: 1 })).toEqual([{ type: 'rejected', action: 'buy', reason: 'not enough gold' }]);
    say(`at the stall: a potion ${N.potion.price}, a ${RARITIES[piece.rarity].name.toLowerCase()} ${BASES[piece.base]!.name} ${buyPrice(piece)} (it buys one back for ${sellPrice(piece)})`);
  });

  it('buys what he found, for less than it sells it', () => {
    const sim = new Sim();
    const junk = sim.give('linen-shirt');
    expect(sim.act({ type: 'sell', item: junk.id })).toEqual([{ type: 'rejected', action: 'sell', reason: 'too far' }]);
    sim.walkTo('shop');
    expect(sim.act({ type: 'sell', item: junk.id })).toEqual([{ type: 'sold', item: junk, price: sellPrice(junk) }]);
    expect(sim.state.hero.gold).toBe(sellPrice(junk));
    expect(sim.state.hero.bag).toEqual([]);
    expect(sellPrice(junk)).toBeLessThan(buyPrice(junk));
    expect(sim.act({ type: 'sell', item: junk.id })).toEqual([{ type: 'rejected', action: 'sell', reason: 'no such item' }]);
    const island = Sim.empty();
    expect(island.act({ type: 'buy', what: 'potion' })).toEqual([{ type: 'rejected', action: 'buy', reason: 'no shop here' }]);
    expect(island.act({ type: 'sell', item: 1 })).toEqual([{ type: 'rejected', action: 'sell', reason: 'no shop here' }]);
  });
});

describe('the save', () => {
  it('goes out as a file and comes back as it was', () => {
    const sim = Sim.started();
    sim.run(5);
    sim.give('tricorn', 'rare');
    const text = packSave(sim.state, sim.rng.state);
    const back = unpackSave(text);
    expect(back).toEqual({ state: sim.state, rng: sim.rng.state, fresh: false });
    expect(migrate(JSON.parse(JSON.stringify(sim.state)))).toEqual(sim.state);
    say(`a save after five seconds in the world is ${text.length} characters, with ${sim.state.monsters.length} monsters in it`);
  });

  it('is nothing when it is broken, not ours, or from a newer game, so a new hero starts instead of a crash', () => {
    const sim = new Sim();
    expect(unpackSave('')).toBeNull();
    expect(unpackSave('not a save')).toBeNull();
    expect(unpackSave('{"game":"drok"}')).toBeNull();
    expect(unpackSave(JSON.stringify({ game: 'drok', state: { ...sim.state, version: 99 }, rng: 1 }))).toBeNull();
    expect(unpackSave(JSON.stringify({ game: 'drok', state: sim.state, rng: 'x' }))).toBeNull();
    expect(migrate(null)).toBeNull();
    expect(migrate('nonsense')).toBeNull();
    expect(migrate({ version: STATE_VERSION, seed: 'x' })).toBeNull();
    // The template starter's save (a board of squares) under the same key: not ours.
    expect(migrate({ version: 3, seed: 'x', board: { start: 'a1', spaces: {} }, players: {}, turn: 'local', ticks: 0, time: 0 })).toBeNull();
    // A state from before the hero knew whether he was at home, wearing today's number: no state of today's.
    const half = JSON.parse(JSON.stringify(sim.state));
    delete half.hero.home;
    expect(migrate(half)).toBeNull();
  });

  it('a save from the pirate game, whatever its version, is a new hero at home who keeps his seed and his tallies', () => {
    for (const version of [2, 3, 4]) {
      const old = { version, seed: 'tide', time: 900, ticks: 54000, place: 'crab-cay', hero: { x: 700, y: 2120, hp: 80, level: 4, gold: 300, bag: [], worn: {} }, monsters: [{ id: 3, kind: 'sand-crab' }], respawns: [], drops: [], chests: {}, shop: [], book: { 'sand-crab': 90 }, nextId: 400, kills: 120, deaths: 3 };
      expect(migrate(old), `version ${version}`).toEqual({ ...newGame({ seed: 'tide' }), kills: 120, deaths: 3 });
      expect(fromBeforeTheHouse(old)).toBe(true);
      expect(unpackSave(JSON.stringify({ game: 'drok', state: old, rng: 7 }))).toMatchObject({ fresh: true, rng: 7 });
    }
    expect(fromBeforeTheHouse(newGame({ seed: 'tide' }))).toBe(false);
  });

  it("is brought up from the control test's save: a new hero at home who keeps his seed and his tallies", () => {
    const old = { version: 1, seed: 'tide', time: 300, ticks: 18000, scheme: 3, monstersWanted: 3, hero: { x: 600, y: 750, hp: 80, rage: 40 }, monsters: [], respawns: [4], nextId: 30, kills: 41, deaths: 2 };
    const s = migrate(old)!;
    expect(s).toEqual({ ...newGame({ seed: 'tide' }), kills: 41, deaths: 2 });
    expect(s.version).toBe(STATE_VERSION);
    expect(migrate({ version: 1, seed: 'tide' })).toBeNull();
  });

  it('puts him where one arrives if a thing now stands where he saved, and leaves him be when he stands beside one', () => {
    const sim = Sim.started();
    sim.run(1);
    const house = world.boxes[0]!;
    const inside = JSON.parse(JSON.stringify(sim.state));
    inside.hero.x = house.x + house.w / 2;
    inside.hero.y = house.y + house.h / 2;
    const s = migrate(inside)!;
    expect(s.hero).toMatchObject({ ...world.arrive, home: true });
    expect(s.monsters).toHaveLength(0);
    expect(s.respawns).toHaveLength(world.zones.reduce((n, z) => n + z.count, 0));
    expect(s.hero.gold).toBe(sim.state.hero.gold);
    const beside = JSON.parse(JSON.stringify(sim.state));
    beside.hero.x = house.x + house.w / 2;
    beside.hero.y = house.y + house.h + FEET;
    expect(migrate(beside)!.hero).toMatchObject({ x: beside.hero.x, y: beside.hero.y });
  });

  it('drops what today\'s data no longer knows, and keeps the rest', () => {
    const sim = Sim.started();
    sim.run(1);
    const hat = sim.give('tricorn');
    const state = JSON.parse(JSON.stringify(sim.state));
    state.hero.bag.push({ id: 5000, base: 'a-hat-from-an-older-build', rarity: 'common' });
    state.hero.worn.coat = { id: 5001, base: 'gone', rarity: 'rare' };
    state.monsters[0].kind = 'a-monster-that-was-renamed';
    const s = migrate(state)!;
    expect(s.hero.bag).toEqual([hat]);
    expect(s.hero.worn.coat).toBeNull();
    expect(s.hero.worn.weapon).toEqual(sim.state.hero.worn.weapon);
    expect(s.monsters).toHaveLength(sim.state.monsters.length - 1);
    const lost = JSON.parse(JSON.stringify(sim.state));
    lost.place = 'a-room-that-is-gone';
    expect(migrate(lost)).toMatchObject({ place: START_PLACE, monsters: [], hero: world.wake });
  });
});
