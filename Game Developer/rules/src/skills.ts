// The Warrior's skills: which there are, when each is learnt, which two he carries, and what the newer ones do
// (Cleave and Charge, the first two, are in game.ts where the control test put them). No points and no talents
// (Robin, 2026-11-20): a skill is his the moment he reaches its level. Every strength is a share of his own numbers,
// so no skill grows old.

import skillsJson from '../data/skills.json';
import { clone, heroReach, monsterById, nearestMonster, reject, roll, setTarget } from './core.ts';
import { N, heroBonusDamage, heroMaxHp, kindOf } from './data.ts';
import { angleTo, dist } from './geometry.ts';
import { hurtMonster } from './loot.ts';
import type { Rng } from './rng.ts';
import { SKILLS as TABLE, SKILL_ORDER } from './skillset.ts';
import type { ApplyResult, GameEvent, GameState, Hero, SkillId } from './types.ts';

export interface Skill {
  name: string;
  /** The level he learns it at. */
  level: number;
  /** What the player reads; a word in braces is filled from the numbers. */
  text: string;
  rage?: number;
  cooldown?: number;
  power?: number;
  radius?: number;
  seconds?: number;
  share?: number;
}

export const SKILLS: Record<SkillId, Skill> = TABLE;
export { SKILL_ORDER };
export const SKILL_SLOTS: number = skillsJson.slots;
export const START_SKILLS = skillsJson.start as SkillId[];

/** What a skill costs in rage and how long it then rests, wherever its numbers are kept. */
export function skillCost(id: SkillId): { rage: number; cooldown: number } {
  if (id === 'cleave') return { rage: N.cleave.rageCost, cooldown: N.cleave.cooldownSeconds };
  if (id === 'charge') return { rage: 0, cooldown: N.charge.cooldownSeconds };
  return { rage: SKILLS[id].rage ?? 0, cooldown: SKILLS[id].cooldown ?? 0 };
}

/** Has he learnt it? */
export function knows(hero: Hero, id: SkillId): boolean {
  return SKILLS[id] !== undefined && hero.level >= SKILLS[id].level;
}

/** Seconds until it can be used again. */
export function cooldownLeft(hero: Hero, id: SkillId): number {
  if (id === 'cleave') return hero.cleaveCd;
  if (id === 'charge') return hero.chargeCd;
  return hero.skillCd[id] ?? 0;
}

/** What the player reads about a skill, with its numbers in it: shares as percents. */
export function skillText(id: SkillId): string {
  const s = SKILLS[id];
  const pct = (v: number): string => `${Math.round(v * 100)}`;
  const words: Record<string, string> = {
    power: pct(id === 'cleave' ? N.cleave.damageTimes : (s.power ?? 1)),
    share: pct(s.share ?? 0),
    seconds: `${s.seconds ?? 0}`,
    stun: `${N.charge.stunSeconds}`,
    gain: `${N.charge.rage}`,
  };
  return s.text.replace(/\{(\w+)\}/g, (_all, key: string) => words[key] ?? '');
}

/** One swing's worth, by the dice, with his level and his cutlass in it: what every `power` is a share of. */
function swingDamage(hero: Hero, rng: Rng): number {
  return roll(rng, N.hero.damageMin, N.hero.damageMax) + heroBonusDamage(hero);
}

/** May he use it now? The refusal, or null. Rage first: it is the reason he can do something about. */
function refusal(state: GameState, id: SkillId): ApplyResult | null {
  const h = state.hero;
  if (!knows(h, id)) return reject(state, 'skill', 'not learnt');
  if (!h.slots.includes(id)) return reject(state, 'skill', 'not equipped');
  const cost = skillCost(id);
  if (h.rage < cost.rage) return reject(state, 'skill', 'not enough rage');
  if (cooldownLeft(h, id) > 0) return reject(state, 'skill', 'on cooldown');
  return null;
}

/** The checks every skill shares, for the two old ones in game.ts: learnt, and carried. */
export function carried(state: GameState, id: SkillId): ApplyResult | null {
  if (!knows(state.hero, id)) return reject(state, 'skill', 'not learnt');
  if (!state.hero.slots.includes(id)) return reject(state, 'skill', 'not equipped');
  return null;
}

function pay(h: Hero, id: SkillId): void {
  const cost = skillCost(id);
  h.rage -= cost.rage;
  h.skillCd = { ...h.skillCd, [id]: cost.cooldown };
}

/** Heavy blow: one blow on the one he fights, or on the nearest in reach. */
export function heavy(state: GameState, rng: Rng): ApplyResult {
  const no = refusal(state, 'heavy');
  if (no) return no;
  const s = clone(state);
  const h = s.hero;
  const inReach = (m: { kind: string; x: number; y: number }): boolean => dist(h, m) <= heroReach(m) + N.hero.reachGrace;
  let m = h.target !== null ? monsterById(s, h.target) : undefined;
  if (!m || !inReach(m)) m = nearestMonster(s, Infinity, inReach);
  if (!m) return reject(state, 'skill', 'no target in range');
  const ev: GameEvent[] = [];
  pay(h, 'heavy');
  h.facing = angleTo(h, m);
  if (h.target !== m.id) setTarget(s, m.id, 'skill', ev);
  ev.push({ type: 'skillUsed', skill: 'heavy', x: m.x, y: m.y });
  hurtMonster(s, m, Math.round(swingDamage(h, rng) * SKILLS.heavy.power!), false, 'cleave', rng, ev);
  return { state: s, events: ev };
}

/** Whirlwind: everything round him is struck. */
export function whirlwind(state: GameState, rng: Rng): ApplyResult {
  const no = refusal(state, 'whirlwind');
  if (no) return no;
  const s = clone(state);
  const h = s.hero;
  const near = s.monsters.filter((m) => dist(h, m) <= SKILLS.whirlwind.radius! + kindOf(m).radius);
  // Nothing near: refused and not paid for, so a slip of the thumb costs nothing.
  if (near.length === 0) return reject(state, 'skill', 'no target in range');
  const ev: GameEvent[] = [];
  pay(h, 'whirlwind');
  let nearest = near[0]!;
  for (const m of near) if (dist(h, m) < dist(h, nearest)) nearest = m;
  if (h.target === null) setTarget(s, nearest.id, 'skill', ev);
  ev.push({ type: 'skillUsed', skill: 'whirlwind', x: h.x, y: h.y });
  for (const m of near) hurtMonster(s, m, Math.round(swingDamage(h, rng) * SKILLS.whirlwind.power!), false, 'cleave', rng, ev);
  return { state: s, events: ev };
}

/** Brace: for a few seconds every bite does a share less. */
export function brace(state: GameState): ApplyResult {
  const no = refusal(state, 'brace');
  if (no) return no;
  const s = clone(state);
  pay(s.hero, 'brace');
  s.hero.braceFor = SKILLS.brace.seconds!;
  return { state: s, events: [{ type: 'skillUsed', skill: 'brace', x: s.hero.x, y: s.hero.y }] };
}

/** Second wind: a share of his health comes back over a few seconds. */
export function wind(state: GameState): ApplyResult {
  const no = refusal(state, 'wind');
  if (no) return no;
  if (state.hero.hp >= heroMaxHp(state.hero)) return reject(state, 'skill', 'full health');
  const s = clone(state);
  pay(s.hero, 'wind');
  s.hero.windFor = SKILLS.wind.seconds!;
  return { state: s, events: [{ type: 'skillUsed', skill: 'wind', x: s.hero.x, y: s.hero.y }] };
}

/** Put a skill he has learnt into one of the slots he carries. One that sits in the other slot changes places. */
export function equipSkill(state: GameState, slot: number, id: SkillId): ApplyResult {
  if (!Number.isInteger(slot) || slot < 0 || slot >= SKILL_SLOTS) return reject(state, 'equipSkill', 'bad number');
  if (SKILLS[id] === undefined) return reject(state, 'equipSkill', 'bad number');
  if (!knows(state.hero, id)) return reject(state, 'equipSkill', 'not learnt');
  const s = clone(state);
  const slots = [...s.hero.slots];
  const was = slots[slot]!;
  const other = slots.indexOf(id);
  if (other >= 0) slots[other] = was;
  slots[slot] = id;
  s.hero.slots = slots;
  return { state: s, events: [{ type: 'skillEquipped', slot, skill: id }] };
}
