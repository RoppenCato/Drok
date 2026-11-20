// The shapes of the game: the state, what the player can do (actions) and what the rules say happened (events).
// The state is plain data (JSON in, JSON out), so it saves as it is.
//
// Drok is solo for good (Robin, 2026-11-19: "Solo only. No server, no accounts, no co-op."), so an action carries no
// player and no id of its own (mine; the starter had both for play together).

import type { STATE_VERSION } from './save.ts';

export interface Vec {
  x: number;
  y: number;
}

// One way to steer, with two hands to it (Robin, 2026-11-20, after the control test: "click to move is good, but
// there needs to be a simple way to also move freely", "both available at the same time"): a tap sends him somewhere
// or at a monster (`moveTo`, `target`), and a thumb that drags pushes him about (`steer`). The push wins while it
// lasts. The control test's three schemes and their switch are gone.

/** The Warrior's skills (rules/data/skills.json). He carries two at a time. */
export type SkillId = 'cleave' | 'charge' | 'heavy' | 'whirlwind' | 'brace' | 'wind';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';

/**
 * The places on him to wear gear (Robin, 2026-11-20: "Head, chest, legs, boots, necklace, two trinkets", with the
 * cutlass and buckler he picked before). `hat` is his head and `coat` his chest: the ids are older than his words.
 */
export type Slot = 'weapon' | 'shield' | 'hat' | 'coat' | 'legs' | 'boots' | 'necklace' | 'trinket' | 'trinket2';

/** The kinds of gear: a place each, but for the trinket, which goes in either trinket place. */
export type GearKind = Exclude<Slot, 'trinket2'>;

/** One piece of gear: a base from the data and a rarity. Its numbers come from those two; nothing else is stored. */
export interface Item {
  id: number;
  base: string;
  rarity: Rarity;
}

/**
 * One thing out of a chest: money, potions or a piece of gear. `kept` says where a piece went: on him (that part of
 * him was bare), into his bag, or on the ground by the chest because the bag was full.
 */
export interface Prize {
  kind: 'gold' | 'potion' | 'item';
  amount: number;
  item: Item | null;
  kept?: 'worn' | 'bag' | 'ground';
}

/** Something lying on the ground: money, a potion or a piece of gear. */
export interface Drop {
  id: number;
  x: number;
  y: number;
  kind: 'gold' | 'potion' | 'item';
  /** How much money, or how many potions. */
  amount: number;
  item: Item | null;
  /** Seconds it has lain there. Below 0 it is still inside a chest that is charging: not to be seen or picked up. */
  age: number;
}

export interface Hero {
  x: number;
  y: number;
  /** Which way he looks, in radians: 0 is right, a quarter turn is down the screen. */
  facing: number;
  hp: number;
  rage: number;
  level: number;
  /** Experience towards the next level. */
  xp: number;
  gold: number;
  potions: number;
  /** Seconds until another potion may be drunk, and seconds a drunk one still mends. */
  potionCd: number;
  mending: number;
  /** What he carries, and what he wears. */
  bag: Item[];
  worn: Record<Slot, Item | null>;
  /** Where a tap sent him; null when he has arrived or was never sent. */
  dest: Vec | null;
  /**
   * The corners still to walk on the way there, round whatever stands between, the next one first; the last is
   * `dest`. Also used while he walks up to a target he cannot see a straight way to. Empty when the way is straight.
   */
  route: Vec[];
  /** The thumb's push: a direction whose length is 0 (let go) to 1 (full speed). It wins over `dest` and `chase`. */
  steer: Vec;
  /** The monster he fights, by id. */
  target: number | null;
  /**
   * The player picked this target himself (a tap, a skill): it stays his until it falls or is far behind. One the
   * rules picked for him (the nearest, the one that struck him) is changed for a nearer one as he moves about.
   */
  chosen: boolean;
  /** Walk after the target until it is in reach (a tapped monster, a Charge). The thumb's push ends it. */
  chase: boolean;
  /** Did he move this step? For the screen. */
  moving: boolean;
  /** Seconds until the next swing may start. */
  swingIn: number;
  /** A swing in the air: on whom, and the seconds until it lands. */
  swing: { target: number; landsIn: number } | null;
  /** A Charge under way: at whom, and the seconds it may still take. */
  charging: { target: number; left: number } | null;
  chargeCd: number;
  cleaveCd: number;
  /** Seconds until each of the newer skills can be used again; a skill not listed is ready. */
  skillCd: Partial<Record<SkillId, number>>;
  /** The skills he carries, one to a slot on the glass. */
  slots: SkillId[];
  /** Seconds Brace still holds: every bite does a share less. */
  braceFor: number;
  /** Seconds Second wind still mends. */
  windFor: number;
  /** Seconds since he was last hit; his health comes back after a quiet while. */
  sinceHit: number;
  /** Seconds until he stands up again; 0 while he stands. */
  downFor: number;
}

/** wander near home; chase the hero; windup before a strike; rest after one; retreat (back off); return home; rush (run through where he stood). */
export type MonsterMode = 'wander' | 'chase' | 'windup' | 'rest' | 'retreat' | 'return' | 'rush';

export interface Monster {
  id: number;
  kind: string;
  /** Which zone of the place it belongs to: a fallen one comes back there. */
  zone: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  facing: number;
  hp: number;
  mode: MonsterMode;
  /** Seconds left of what it is doing: the pause before the next stroll, the wind-up, the rest, the retreat. */
  timer: number;
  /** Where a stroll is going. */
  goal: Vec | null;
  /** Seconds it still cannot move or strike. */
  stunned: number;
}

export interface GameState {
  version: typeof STATE_VERSION;
  seed: string;
  /** Seconds the world has run, and how many steps that was. */
  time: number;
  ticks: number;
  /** The real clock as the holder last told it, in milliseconds. The rules never read a clock themselves. */
  now: number;
  /** The place he is in. Only that place is alive. */
  place: string;
  hero: Hero;
  monsters: Monster[];
  /** A countdown, in seconds, for each monster on its way back, and the zone it comes back to. */
  respawns: { zone: number; in: number }[];
  drops: Drop[];
  /** When each place's chest was last opened, on the real clock (ms). A place not listed has a full chest. */
  chests: Record<string, number>;
  /** What the harbour's stall has for sale; a sold piece leaves an empty place until he comes to town again. */
  shop: (Item | null)[];
  /** How many of each kind he has felled: the start of the monster book. */
  book: Record<string, number>;
  nextId: number;
  kills: number;
  deaths: number;
}

/** What the player wants: an intent ("go there", "Charge"), never a result. The rules roll the dice and decide. */
export type Action =
  /** The world moves on by `dt` seconds; `now` is the holder's real clock in ms. The holder sends it in even steps. */
  | { type: 'tick'; dt: number; now?: number }
  /** A tap on the ground. */
  | { type: 'moveTo'; x: number; y: number }
  /** The thumb's push; 0, 0 lets go. */
  | { type: 'steer'; x: number; y: number }
  /** A tap on a monster, or null to let the target go. `approach` false targets without walking up to it. */
  | { type: 'target'; monster: number | null; approach?: boolean }
  | { type: 'skill'; skill: SkillId }
  /** Put a skill he has learnt into one of the slots he carries. */
  | { type: 'equipSkill'; slot: number; skill: SkillId }
  | { type: 'potion' }
  | { type: 'openChest' }
  /** Sail to another place on the chart; only from a dock. */
  | { type: 'sail'; to: string }
  | { type: 'equip'; item: number }
  | { type: 'unequip'; slot: Slot }
  | { type: 'discard'; item: number }
  /** Buy the piece at this place on the stall, or a potion. */
  | { type: 'buy'; what: number | 'potion' }
  | { type: 'sell'; item: number };

export type RejectReason =
  | 'down'
  | 'on cooldown'
  | 'not enough rage'
  | 'no target in range'
  | 'not learnt'
  | 'not equipped'
  | 'no such monster'
  | 'bad number'
  | 'no potions'
  | 'full health'
  | 'no chest here'
  | 'too far'
  | 'chest is empty'
  | 'no such place'
  | 'already there'
  | 'not at the dock'
  | 'no such item'
  | 'bag is full'
  | 'no shop here'
  | 'sold out'
  | 'not enough gold'
  | 'potions full';

/** Why the target changed: he tapped it; it was the nearest; it struck him; the last one fell; a skill picked it; it got away. */
export type TargetWhy = 'tap' | 'nearest' | 'struck' | 'next' | 'skill' | 'lost';

/** What happened. The screen draws from these and from the state, never from a guess. */
export type GameEvent =
  | { type: 'targeted'; monster: number | null; why: TargetWhy }
  /** His arm goes up; the hit lands a moment later, if the target is still in reach. */
  | { type: 'swing'; monster: number }
  | { type: 'hit'; monster: number; amount: number; crit: boolean; by: 'swing' | 'cleave'; x: number; y: number }
  | { type: 'monsterDied'; monster: number; kind: string; x: number; y: number }
  | { type: 'monsterSpawned'; monster: number }
  | { type: 'monsterWindup'; monster: number; seconds: number }
  | { type: 'monsterMissed'; monster: number }
  | { type: 'heroHit'; monster: number; amount: number }
  /** He falls; `lost` is the money it cost him. */
  | { type: 'heroDown'; lost: number }
  /** He wakes, whole, in the town. */
  | { type: 'heroUp'; place: string }
  | { type: 'chargeStarted'; monster: number }
  | { type: 'charged'; monster: number; x: number; y: number }
  | { type: 'cleaved'; hits: number; facing: number }
  /** One of the newer skills was used, at this spot. */
  | { type: 'skillUsed'; skill: SkillId; x: number; y: number }
  /** He reached the level of a skill: it is his. */
  | { type: 'skillLearnt'; skill: SkillId }
  | { type: 'skillEquipped'; slot: number; skill: SkillId }
  | { type: 'xp'; amount: number }
  | { type: 'levelUp'; level: number }
  | { type: 'dropped'; drop: Drop }
  | { type: 'picked'; drop: Drop }
  | { type: 'bagFull' }
  /** The chest is opened and its prizes are his. `rarity` is that of the best piece inside. */
  | { type: 'chestOpened'; x: number; y: number; rarity: Rarity; prizes: Prize[] }
  | { type: 'sailed'; from: string; to: string }
  | { type: 'potionUsed' }
  | { type: 'equipped'; item: Item }
  | { type: 'unequipped'; item: Item }
  | { type: 'discarded'; item: Item }
  | { type: 'bought'; what: 'potion' | 'item'; item: Item | null; price: number }
  | { type: 'sold'; item: Item; price: number }
  /** The action did nothing, and why. The state is as it was. */
  | { type: 'rejected'; action: Action['type']; reason: RejectReason };

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
}
