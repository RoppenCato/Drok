import { describe, expect, it } from 'vitest';
import {
  BASES,
  buyPrice,
  chestFull,
  dist,
  heroArmour,
  heroBonusDamage,
  heroMaxHp,
  itemStats,
  migrate,
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
import { DT, ISLAND, NOON, Sim } from './sim.ts';

// What chapter 1 adds (Robin, 2026-11-20: "Harbour town plus island"): places and sailing, three kinds of monster,
// levels 1 to 5, loot on the ground with rarities, a bag and gear, one chest, potions, death that costs money, the
// harbour's stall, and a save that can leave the phone.
const say = (text: string): void => console.log(`  [numbers] ${text}`);
const island = PLACES[ISLAND]!;
const harbour = PLACES[START_PLACE]!;

describe('the data is whole', () => {
  it('every place, monster and piece of gear has what the rules will ask of it', () => {
    expect(harbour.town).toBe(true);
    expect(harbour.shop).not.toBeNull();
    for (const [id, place] of Object.entries(PLACES)) {
      expect(place.name, id).not.toBe('');
      for (const spot of [place.dock, place.wake, place.shop, place.chest]) {
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
        // A landing is safe: nothing lives where he steps off the boat.
        const nearestY = Math.max(zone.y, Math.min(place.dock.y, zone.y + zone.h));
        expect(Math.abs(place.dock.y - nearestY), `${id}: ${zone.kind} too near the dock`).toBeGreaterThan(MONSTERS[zone.kind]!.aggroRange);
      }
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
    const cutlass = (rarity: Rarity): number => itemStats({ id: 1, base: 'sailors-cutlass', rarity }).damage;
    say(`a sailor's cutlass adds ${RARITY_ORDER.map((r) => `${cutlass(r)} (${r})`).join(', ')} to a swing of ${N.hero.damageMin} to ${N.hero.damageMax}`);
  });
});

describe('a new hero', () => {
  it('is a nobody in the harbour: level 1, a rusty cutlass, a plank buckler, a few potions, no money', () => {
    const s = newGame({ seed: 'tide' });
    expect(s.place).toBe(START_PLACE);
    expect(s.hero).toMatchObject({ ...harbour.wake, level: 1, xp: 0, gold: 0, potions: N.potion.start, bag: [] });
    expect(s.hero.worn.weapon?.base).toBe('rusty-cutlass');
    expect(s.hero.worn.shield?.base).toBe('plank-buckler');
    expect(s.hero.worn.hat).toBeNull();
    expect(s.hero.hp).toBe(heroMaxHp(s.hero));
    expect(heroArmour(s.hero)).toBe(1);
    expect(heroBonusDamage(s.hero)).toBe(2);
    expect(newGame({ seed: 'tide' })).toEqual(s);
  });

  it('finds no monsters in town, and his health comes back fast there', () => {
    const sim = new Sim();
    sim.hero({ hp: 10 });
    sim.run(3);
    expect(sim.state.monsters).toHaveLength(0);
    expect(sim.state.hero.hp).toBeGreaterThan(80);
  });
});

describe('sailing', () => {
  it('goes from a dock only, lands him on the other dock, and fills the island from its zones', () => {
    const sim = new Sim();
    expect(sim.act({ type: 'sail', to: ISLAND })).toEqual([{ type: 'rejected', action: 'sail', reason: 'not at the dock' }]);
    expect(sim.act({ type: 'sail', to: 'atlantis' })).toEqual([{ type: 'rejected', action: 'sail', reason: 'no such place' }]);
    expect(sim.act({ type: 'sail', to: START_PLACE })).toEqual([{ type: 'rejected', action: 'sail', reason: 'already there' }]);
    sim.act({ type: 'moveTo', ...harbour.dock });
    const walk = sim.runUntil((s) => s.state.hero.dest === null);
    expect(sim.act({ type: 'sail', to: ISLAND }).at(-1)).toEqual({ type: 'sailed', from: START_PLACE, to: ISLAND });
    expect(sim.state.place).toBe(ISLAND);
    expect(sim.state.hero).toMatchObject(island.dock);
    sim.step();
    const wanted = island.zones.reduce((n, z) => n + z.count, 0);
    expect(sim.state.monsters).toHaveLength(wanted);
    for (const m of sim.state.monsters) {
      const zone = island.zones[m.zone]!;
      expect(m.kind).toBe(zone.kind);
      expect(m.y).toBeGreaterThanOrEqual(zone.y);
      expect(m.y).toBeLessThanOrEqual(zone.y + zone.h);
    }
    say(`the walk from where he wakes to the harbour's dock takes ${walk.toFixed(1)} s; the island holds ${island.zones.map((z) => `${z.count} ${MONSTERS[z.kind]!.name}s`).join(', ')}`);
  });

  it('leaves what lay on the ground behind', () => {
    const sim = Sim.landed();
    const m = sim.monster(40, 0, { hp: 1, stunned: 999, kind: 'coconut-crab' });
    sim.hero({ steer: { x: 0, y: 0 } });
    sim.act({ type: 'target', monster: m.id, approach: false });
    sim.runUntil((s) => s.count('monsterDied') > 0, 3);
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: START_PLACE });
    expect(sim.state.drops).toHaveLength(0);
    expect(sim.state.monsters).toHaveLength(0);
  });
});

describe('the three kinds of monster', () => {
  it('a reef gull bites and backs off, and comes again', () => {
    const sim = Sim.empty();
    const gull = sim.monster(40, 0, { kind: 'reef-gull', mode: 'chase' });
    sim.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 3);
    expect(sim.find(gull.id)!.mode).toBe('retreat');
    sim.run(MONSTERS['reef-gull']!.retreatSeconds - 0.2);
    const far = dist(sim.state.hero, sim.find(gull.id)!);
    expect(far).toBeGreaterThan(120);
    sim.runUntil((s) => s.find(gull.id)!.mode === 'windup', 5);
    expect(dist(sim.state.hero, sim.find(gull.id)!)).toBeLessThan(60);
    say(`a gull backs off to ${far.toFixed(0)} units between bites; he cannot follow at ${N.hero.speed} against its ${MONSTERS['reef-gull']!.chaseSpeed}, so Charge or patience catches it`);
  });

  it("a coconut crab's slam hits everything near it, and its long wind-up is for getting clear", () => {
    const k = MONSTERS['coconut-crab']!;
    const still = Sim.empty();
    still.monster(50, 0, { kind: 'coconut-crab', mode: 'chase' });
    still.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(still.count('heroHit')).toBe(1);

    // Stepping only just out of its reach is not enough: the slam is wider than its bite.
    const near = Sim.empty();
    const m = near.monster(50, 0, { kind: 'coconut-crab', mode: 'chase' });
    near.runUntil((s) => s.count('monsterWindup') > 0, 4);
    near.hero({ x: near.find(m.id)!.x - (k.slamRadius - 6) });
    near.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(near.count('heroHit')).toBe(1);

    const clear = Sim.empty();
    clear.monster(50, 0, { kind: 'coconut-crab', mode: 'chase' });
    clear.runUntil((s) => s.count('monsterWindup') > 0, 4);
    clear.act({ type: 'steer', x: -1, y: 0 });
    clear.runUntil((s) => s.count('heroHit') + s.count('monsterMissed') > 0, 4);
    expect(clear.count('heroHit')).toBe(0);
    say(`a coconut crab winds up for ${k.windupSeconds} s and slams everything within ${k.slamRadius}; he walks ${(N.hero.speed * k.windupSeconds).toFixed(0)} units in that time`);
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
    expect(sim.of('xp')).toEqual([{ type: 'xp', amount: MONSTERS['sand-crab']!.xp }]);
    expect(sim.of('levelUp')).toEqual([{ type: 'levelUp', level: 2 }]);
    expect(sim.state.hero.level).toBe(2);
    expect(sim.state.hero.xp).toBe(MONSTERS['sand-crab']!.xp - 1);
    expect(heroMaxHp(sim.state.hero)).toBe(before + N.levels.hpPerLevel);
    expect(sim.state.hero.hp).toBe(heroMaxHp(sim.state.hero));
    expect(sim.state.book['sand-crab']).toBe(1);
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
    const k = MONSTERS['sand-crab']!;
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
    const chest = island.chest!;
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

  it('is not to be had in a place without one', () => {
    const sim = new Sim();
    expect(sim.act({ type: 'openChest' })).toEqual([{ type: 'rejected', action: 'openChest', reason: 'no chest here' }]);
  });
});

describe('falling', () => {
  it('costs him a share of the money he carries, and he wakes whole in the harbour with his bag', () => {
    const sim = Sim.empty();
    const kept = sim.give('tricorn', 'rare');
    sim.hero({ hp: 3, gold: 87 });
    sim.monster(40, 0, { mode: 'chase', kind: 'coconut-crab' });
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
    expect(sim.state.hero).toMatchObject({ ...harbour.wake, hp: heroMaxHp(sim.state.hero), rage: 0, downFor: 0 });
    expect(sim.state.hero.bag).toEqual([kept]);
    expect(sim.state.monsters).toHaveLength(0);
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

describe("the harbour's stall", () => {
  it('shows a few pieces, each for another part of him, of the tier his level has earned, and new ones each time he comes to town', () => {
    const sim = new Sim();
    const stock = sim.state.shop;
    expect(stock).toHaveLength(SHOP.pieces);
    expect(new Set(stock.map((i) => BASES[i!.base]!.slot)).size).toBe(SHOP.pieces);
    for (const item of stock) expect(BASES[item!.base]!.tier).toBe(SHOP.tierAtLevel[1]);
    sim.hero({ level: 5 });
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: ISLAND });
    sim.walkTo('dock');
    sim.act({ type: 'sail', to: START_PLACE });
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
    const sim = Sim.landed();
    sim.run(5);
    sim.give('tricorn', 'rare');
    const text = packSave(sim.state, sim.rng.state);
    const back = unpackSave(text);
    expect(back).toEqual({ state: sim.state, rng: sim.rng.state });
    expect(migrate(JSON.parse(JSON.stringify(sim.state)))).toEqual(sim.state);
    say(`a save after five seconds on the island is ${text.length} characters`);
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
  });

  it("is brought up from the control test's save: a new hero in the harbour who keeps his seed, his way of steering and his tallies", () => {
    const old = { version: 1, seed: 'tide', time: 300, ticks: 18000, scheme: 3, monstersWanted: 3, hero: { x: 600, y: 750, hp: 80, rage: 40 }, monsters: [], respawns: [4], nextId: 30, kills: 41, deaths: 2 };
    const s = migrate(old)!;
    expect(s).toEqual({ ...newGame({ seed: 'tide', scheme: 3 }), kills: 41, deaths: 2 });
    expect(s.version).toBe(STATE_VERSION);
    expect(migrate({ version: 1, seed: 'tide' })).toBeNull();
  });

  it('drops what today\'s data no longer knows, and keeps the rest', () => {
    const sim = Sim.landed();
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
    lost.place = 'an-island-that-sank';
    expect(migrate(lost)).toMatchObject({ place: START_PLACE, monsters: [], hero: harbour.wake });
  });
});
