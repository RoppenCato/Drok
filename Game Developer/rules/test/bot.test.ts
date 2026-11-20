import { describe, expect, it } from 'vitest';
import { BASES, chestFull, dist, heroMaxHp, heroReach, itemStats, kindOf, MONSTERS, N, onLand, PLACES, RARITY_ORDER, START_PLACE, buyPrice, type Item, type Monster, type Scheme, type Vec } from '../src/index.ts';
import { DT, ISLAND, Sim } from './sim.ts';

// Bots that play the game and print what they got. The numbers are for a person to read: the tests themselves only
// ask that the game stays whole and that chapter 1 can be played through. When a number looks wrong, check the bot
// before the game.

const island = PLACES[ISLAND]!;
const harbour = PLACES[START_PLACE]!;

function whole(sim: Sim): void {
  const s = sim.state;
  const place = PLACES[s.place]!;
  for (const v of [s.hero.x, s.hero.y, s.hero.hp, s.hero.rage, s.hero.gold, s.hero.xp, s.time]) expect(Number.isFinite(v)).toBe(true);
  for (const p of [s.hero, ...s.monsters, ...s.drops]) {
    expect(p.x).toBeGreaterThanOrEqual(N.margin);
    expect(p.x).toBeLessThanOrEqual(place.width - N.margin);
    expect(p.y).toBeGreaterThanOrEqual(N.margin);
    expect(p.y).toBeLessThanOrEqual(place.height - N.margin);
  }
  // Nobody who walks is in the sea, and nothing lies in it.
  expect(onLand(place, s.hero.x, s.hero.y)).toBe(true);
  for (const m of s.monsters) if (!kindOf(m).flies) expect(onLand(place, m.x, m.y), `${m.kind} at ${m.x.toFixed(0)}, ${m.y.toFixed(0)}`).toBe(true);
  for (const d of s.drops) expect(onLand(place, d.x, d.y)).toBe(true);
  expect(s.hero.hp).toBeLessThanOrEqual(heroMaxHp(s.hero));
  expect(s.hero.gold).toBeGreaterThanOrEqual(0);
  expect(s.hero.bag.length).toBeLessThanOrEqual(N.bagSize);
  expect(s.monsters.length + s.respawns.length).toBe(place.zones.reduce((n, z) => n + z.count, 0));
}

// ---- the three ways to steer, each fighting crabs for a while ---------------------------------------------------

function fight(scheme: Scheme, seed: string, seconds: number): { kills: number; deaths: number; hpLost: number; refused: number } {
  const sim = Sim.landed(seed, { scheme });
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) {
    const h = sim.state.hero;
    if (sim.state.place === ISLAND && h.downFor <= 0) {
      const crabs = sim.state.monsters.filter((m) => m.kind === 'sand-crab');
      let nearest = crabs[0];
      for (const m of crabs) if (nearest && dist(h, m) < dist(h, nearest)) nearest = m;
      if (nearest) {
        const d = dist(h, nearest);
        if (scheme === 1) {
          if (h.target === null) sim.act({ type: 'target', monster: nearest.id });
        } else {
          // A thumb pushing towards the nearest one until it is in reach, then lifting.
          const push = d > heroReach(nearest) - 6 ? { x: (nearest.x - h.x) / d, y: (nearest.y - h.y) / d } : { x: 0, y: 0 };
          if (push.x !== h.steer.x || push.y !== h.steer.y) sim.act({ type: 'steer', ...push });
        }
        if (h.chargeCd <= 0 && !h.charging && d > 120 && d <= N.charge.range) sim.act({ type: 'skill', skill: 'charge' });
        if (h.cleaveCd <= 0 && h.rage >= N.cleave.rageCost && d <= N.cleave.radius) sim.act({ type: 'skill', skill: 'cleave' });
      }
    }
    sim.step();
  }
  whole(sim);
  return { kills: sim.state.kills, deaths: sim.state.deaths, hpLost: sim.of('heroHit').reduce((sum, e) => sum + e.amount, 0), refused: sim.count('rejected') };
}

describe('a bot fights crabs with each way of steering', () => {
  const seconds = 90;
  const seeds = ['tide', 'reef', 'gull'];
  for (const scheme of [1, 2, 3] as const) {
    it(`scheme ${scheme}: ${seconds} s on ${seeds.length} seeds`, () => {
      const runs = seeds.map((seed) => fight(scheme, seed, seconds));
      const minutes = (seconds * seeds.length) / 60;
      const sum = (of: (t: (typeof runs)[number]) => number): number => runs.reduce((total, t) => total + of(t), 0);
      console.log(`  [numbers] scheme ${scheme}: ${(sum((t) => t.kills) / minutes).toFixed(1)} crabs a minute, ${(sum((t) => t.hpLost) / minutes).toFixed(0)} health lost a minute, ${sum((t) => t.deaths)} falls, ${sum((t) => t.refused)} refused`);
      expect(sum((t) => t.kills)).toBeGreaterThan(0);
      // The bot only presses a skill when it should work.
      expect(sum((t) => t.refused)).toBe(0);
    });
  }
});

// ---- chapter 1, played through: from a nobody in the harbour to level 5 and the chest ---------------------------

const power = (item: Item | null): number => (item ? itemStats(item).damage * 3 + itemStats(item).hp * 0.5 + itemStats(item).armour * 6 : 0);

interface Journey {
  /** Minutes of play at which each level was reached; [2] is level 2. */
  levelAt: number[];
  minutes: number;
  chestAt: number | null;
  deaths: number;
  trips: number;
  potions: number;
  goldEarned: number;
  goldAtEnd: number;
  found: Record<string, number>;
  kills: Record<string, number>;
  worn: string;
  refused: string[];
}

/** A sensible player: hunts what his level can take, drinks when hurt, steps out of slams, sells and restocks in town. */
function journey(seed: string, limitMinutes: number): Journey {
  const sim = new Sim(seed);
  const levelAt: number[] = [];
  let chestAt: number | null = null;
  let trips = 0;
  let potions = 0;
  let goldEarned = 0;
  let seen = 0;
  let homeward = false;
  let lingered = 0;
  const found: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0 };
  const refused: string[] = [];

  // A tap where he wants to go, once: the rules find the way. Tapped again only when he has stopped short of it.
  let tapped: Vec | null = null;
  const go = (to: Vec): boolean => {
    const h = sim.state.hero;
    if (dist(h, to) < 12) return true;
    if (!h.dest || !tapped || dist(tapped, to) > 4) {
      sim.act({ type: 'moveTo', x: to.x, y: to.y });
      tapped = { x: to.x, y: to.y };
    }
    return false;
  };

  const wearBetter = (): void => {
    for (const item of [...sim.state.hero.bag]) {
      const slot = BASES[item.base]!.slot;
      if (power(item) > power(sim.state.hero.worn[slot])) sim.act({ type: 'equip', item: item.id });
    }
  };

  const steps = Math.round((limitMinutes * 60) / DT);
  for (let i = 0; i < steps; i++) {
    const s = sim.state;
    const h = s.hero;
    const minute = s.time / 60;

    // What happened since the last step.
    for (; seen < sim.events.length; seen++) {
      const e = sim.events[seen]!;
      if (e.type === 'levelUp') levelAt[e.level] = minute;
      else if (e.type === 'picked' && e.drop.kind === 'gold') goldEarned += e.drop.amount;
      else if (e.type === 'picked' && e.drop.item) found[e.drop.item.rarity] = (found[e.drop.item.rarity] ?? 0) + 1;
      else if (e.type === 'sold') goldEarned += e.price;
      else if (e.type === 'potionUsed') potions += 1;
      else if (e.type === 'chestOpened') chestAt = minute;
      else if (e.type === 'heroUp') homeward = true;
      else if (e.type === 'rejected' && e.reason !== 'down') refused.push(`${e.action}: ${e.reason}`);
    }

    if (h.downFor > 0) {
      sim.step();
      continue;
    }
    if (h.level >= N.levels.max && chestAt !== null && h.bag.length === 0 && s.place === START_PLACE) break;
    wearBetter();

    if (s.place === START_PLACE) {
      // In town: sell, restock, and sail out again.
      const junk = h.bag.length > 0;
      const wantPotions = h.potions < 8 && h.gold >= N.potion.price;
      const better = s.shop.findIndex((item) => item !== null && power(item) > power(h.worn[BASES[item.base]!.slot]) && buyPrice(item) + 3 * N.potion.price <= h.gold);
      if (junk || wantPotions || better >= 0) {
        if (go({ x: harbour.shop!.x, y: harbour.shop!.y + 50 })) {
          for (const item of [...sim.state.hero.bag]) sim.act({ type: 'sell', item: item.id });
          if (better >= 0 && sim.state.shop[better]) {
            sim.act({ type: 'buy', what: better });
            wearBetter();
            for (const item of [...sim.state.hero.bag]) sim.act({ type: 'sell', item: item.id });
          }
          while (sim.state.hero.potions < 8 && sim.state.hero.gold >= N.potion.price) sim.act({ type: 'buy', what: 'potion' });
        }
      } else if (h.level >= N.levels.max && chestAt !== null) {
        break;
      } else if (go(harbour.dock)) {
        sim.act({ type: 'sail', to: ISLAND });
        homeward = false;
      }
      sim.step();
      continue;
    }

    // On the island.
    const max = heroMaxHp(h);
    if (h.hp < max * 0.5 && h.potions > 0 && h.potionCd <= 0) sim.act({ type: 'potion' });
    const after = s.monsters.filter((m) => m.mode !== 'wander' && m.mode !== 'return');
    const done = h.level >= N.levels.max && chestAt !== null;
    if (!homeward && (done || h.bag.length >= N.bagSize - 1 || (h.potions === 0 && h.hp < max * 0.45) || (h.potions === 0 && h.gold >= 60 && after.length === 0))) {
      homeward = true;
      trips += 1;
    }
    if (homeward) {
      if (go(island.dock)) sim.act({ type: 'sail', to: START_PLACE });
      sim.step();
      continue;
    }

    // The chest, once he is strong enough to stand where it stands.
    if (h.level >= N.levels.max && chestFull(s) && after.length === 0 && h.hp > max * 0.7) {
      if (go({ x: island.chest!.x, y: island.chest!.y + 40 })) sim.act({ type: 'openChest' });
      sim.step();
      continue;
    }
    // Loot left lying is walked over before the next fight.
    if (after.length === 0 && s.drops.length > 0 && h.bag.length < N.bagSize) {
      const drop = s.drops.find((d) => dist(d, h) < 260 && (d.kind !== 'potion' || h.potions < N.potion.carry));
      if (drop && lingered < 240) {
        lingered += 1;
        go(drop);
        sim.step();
        continue;
      }
    }
    lingered = 0;

    const preyKind = h.level < 3 ? 'sand-crab' : h.level < 4 ? 'reef-gull' : 'coconut-crab';
    let prey: Monster | undefined;
    // Whatever is biting him comes first; then the nearest of what his level hunts.
    for (const m of after) if (!prey || dist(h, m) < dist(h, prey)) prey = m;
    if (!prey) for (const m of s.monsters) if (m.kind === preyKind && (!prey || dist(h, m) < dist(h, prey))) prey = m;
    if (!prey) {
      const zone = island.zones.find((z) => z.kind === preyKind)!;
      go({ x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 });
      sim.step();
      continue;
    }
    const k = kindOf(prey);
    const d = dist(h, prey);
    if (k.slamRadius > 0 && prey.mode === 'windup' && d < k.slamRadius + 30) {
      // Out of the slam, straight away from it.
      const away = { x: prey.x + ((h.x - prey.x) / d) * (k.slamRadius + 45), y: prey.y + ((h.y - prey.y) / d) * (k.slamRadius + 45) };
      go(away);
    } else {
      if (h.target !== prey.id || (!h.chase && d > heroReach(prey))) sim.act({ type: 'target', monster: prey.id });
      if (h.chargeCd <= 0 && !h.charging && d > 110 && d <= N.charge.range) sim.act({ type: 'skill', skill: 'charge' });
      if (h.cleaveCd <= 0 && h.rage >= N.cleave.rageCost && d <= N.cleave.radius + k.radius) sim.act({ type: 'skill', skill: 'cleave' });
    }
    sim.step();
  }

  whole(sim);
  const h = sim.state.hero;
  return {
    levelAt,
    minutes: sim.state.time / 60,
    chestAt,
    deaths: sim.state.deaths,
    trips,
    potions,
    goldEarned,
    goldAtEnd: h.gold,
    found,
    kills: sim.state.book,
    worn: Object.values(h.worn)
      .map((item) => (item ? `${item.rarity} ${BASES[item.base]!.name}` : 'nothing'))
      .join(', '),
    refused: [...new Set(refused)],
  };
}

describe('a bot plays chapter 1 through', () => {
  const seeds = ['tide', 'reef', 'gull'];
  const limit = 90;
  it(
    `from a nobody in the harbour to level ${N.levels.max} and the chest, on ${seeds.length} seeds`,
    () => {
      for (const seed of seeds) {
        const j = journey(seed, limit);
        const levels = [2, 3, 4, 5].map((l) => (j.levelAt[l] === undefined ? `${l}: never` : `${l} at ${j.levelAt[l]!.toFixed(1)}`)).join(', ');
        const kills = Object.entries(j.kills)
          .map(([kind, n]) => `${n} ${MONSTERS[kind]!.name.toLowerCase()}s`)
          .join(', ');
        console.log(
          `  [numbers] ${seed}: levels (minutes) ${levels}; the chest at ${j.chestAt === null ? 'never' : j.chestAt.toFixed(1)}; done in ${j.minutes.toFixed(1)} min\n` +
            `  [numbers] ${seed}: ${kills}; ${j.deaths} falls, ${j.trips} trips home, ${j.potions} potions drunk; ${j.goldEarned} money earned, ${j.goldAtEnd} left; gear found: ${RARITY_ORDER.map((r) => `${j.found[r]} ${r}`).join(', ')}\n` +
            `  [numbers] ${seed}: wears ${j.worn}${j.refused.length ? `; refused: ${j.refused.join('; ')}` : ''}`,
        );
        expect(j.levelAt[N.levels.max], `${seed} never reached level ${N.levels.max}`).toBeDefined();
        expect(j.chestAt, `${seed} never opened the chest`).not.toBeNull();
        expect(j.minutes).toBeLessThan(limit);
      }
    },
    120_000,
  );
});
