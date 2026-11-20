// Figures drawn from the Art Director's atlases: a body with named actions in five drawn facings (the game plays
// eight and mirrors three), and for the hero the cutlass, the buckler and the hat as small pictures riding on the
// points each body frame carries (Robin, 2026-11-20: "The big pieces"; the way agreed with Leonard, AD the same
// day). The atlas form is what his tools\pack.js writes: a Phaser JSON hash with frames named
// <thing>/<action>/<facing>/<nnnn>, and an `actions` block with each action's delay and loop and each frame's
// origin (the feet), delay and points. Files are at `filePx` pixels a design unit.

import Phaser from 'phaser';
import type { Item, Slot, Vec } from '../../../rules/src/index.ts';
import { GEAR_ART } from '../art.ts';

export interface FramePoint {
  x: number;
  y: number;
  /** The turn, in degrees. */
  r: number;
  /** Drawn in front of the body, or behind it. */
  front: boolean;
}

export interface AtlasFrame {
  name: string;
  w: number;
  h: number;
  origin: Vec;
  delay: number;
  facing: string;
  points?: Record<string, FramePoint>;
}

export interface AtlasAction {
  delay: number;
  loop: boolean;
  frames: AtlasFrame[];
}

export interface AtlasData {
  meta: { filePx: number; facings: string[] };
  actions: Record<string, AtlasAction>;
}

export interface GearData {
  meta: { filePx: number };
  items: Record<string, { w: number; h: number; origin: Vec }>;
}

/** The eight ways a figure can look, clockwise from east; and for each, the facing that is drawn and whether it is mirrored. */
const WAYS = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'] as const;
const DRAWN: Record<(typeof WAYS)[number], { facing: string; flip: boolean }> = {
  e: { facing: 'e', flip: false },
  se: { facing: 'se', flip: false },
  s: { facing: 's', flip: false },
  sw: { facing: 'se', flip: true },
  w: { facing: 'e', flip: true },
  nw: { facing: 'ne', flip: true },
  n: { facing: 'n', flip: false },
  ne: { facing: 'ne', flip: false },
};
const EIGHTH = Math.PI / 4;
/** When a facing is not drawn, the ones to take in its stead, nearest first. */
const NEAREST: Record<string, string[]> = { se: ['e', 's'], ne: ['e', 'n'], e: ['se', 's'], s: ['se', 'e'], n: ['ne', 'e'] };

/** A set of single pictures (gear, props, loot): each picture's size and the point it stands on, and its own data. */
export interface SetData {
  meta: { filePx: number };
  items: Record<
    string,
    {
      w: number;
      h: number;
      origin: Vec;
      colour?: string;
      light?: string;
      slice?: number[];
      inset?: number;
      /** How long a pill is meant to be drawn, in design units (his own bar's frame). */
      length?: number;
      /** Where each fill starts from a frame's top left corner and how tall it is, in design units (his own bar). */
      rooms?: Record<string, { x: number; y: number; h: number }>;
    }
  >;
}

/** One picture from a set, standing on its own origin, at design size. Null when the set or the picture is not there. */
export function picture(scene: Phaser.Scene, key: string, name: string): Phaser.GameObjects.Image | null {
  const data = scene.cache.json.get(`${key}:data`) as SetData | undefined;
  const info = data?.items?.[name];
  if (!data || !info || !scene.textures.exists(key)) return null;
  return scene.add
    .image(0, 0, key, name)
    .setOrigin(info.origin.x / info.w, info.origin.y / info.h)
    .setScale(1 / data.meta.filePx);
}

/** Change which picture of its set an image shows, standing on that picture's own origin. */
export function repicture(scene: Phaser.Scene, image: Phaser.GameObjects.Image, key: string, name: string): void {
  const info = (scene.cache.json.get(`${key}:data`) as SetData | undefined)?.items?.[name];
  if (!info || image.frame.name === name) return;
  image.setFrame(name, true, false).setOrigin(info.origin.x / info.w, info.origin.y / info.h);
}

/** One body from an atlas: it plays an action, looks one of eight ways, and stands on its feet at a point. */
export class Figure {
  readonly image: Phaser.GameObjects.Image;
  /** A one-shot action has played to its end. */
  done = true;
  /** Is the picture mirrored just now, and which facing is drawn? */
  flip = false;
  facing = 's';

  private readonly data: AtlasData;
  private readonly sets = new Map<string, AtlasFrame[]>();
  private action = '';
  private way = 2;
  private clock = 0;
  private index = 0;
  private frame: AtlasFrame | null = null;

  constructor(scene: Phaser.Scene, key: string, data: AtlasData) {
    this.data = data;
    for (const [action, a] of Object.entries(data.actions)) {
      for (const f of a.frames) {
        const set = this.sets.get(`${action}/${f.facing}`) ?? [];
        set.push(f);
        this.sets.set(`${action}/${f.facing}`, set);
      }
    }
    this.image = scene.add.image(0, 0, key).setScale(1 / data.meta.filePx);
    this.play('stand', true);
  }

  has(action: string): boolean {
    return this.data.actions[action] !== undefined;
  }

  /** How long an action takes, in ms. */
  length(action: string): number {
    const a = this.data.actions[action];
    const frames = this.sets.get(`${action}/s`) ?? [];
    return a ? frames.reduce((sum, f) => sum + (f.delay || a.delay), 0) : 0;
  }

  /** Start an action. The same looping action again changes nothing, so it can be asked for every frame. */
  play(action: string, restart = false): void {
    if (!this.has(action)) return;
    if (action === this.action && !restart) return;
    this.action = action;
    this.clock = 0;
    this.index = 0;
    this.done = false;
    this.show();
  }

  get playing(): string {
    return this.action;
  }

  /** Look this way (radians; 0 is east, a quarter turn is down the screen). It holds its way a little past the edge, so it does not flicker between two. */
  face(angle: number): void {
    let turn = angle - this.way * EIGHTH;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    if (Math.abs(turn) <= EIGHTH * 0.62) return;
    this.way = ((Math.round(angle / EIGHTH) % 8) + 8) % 8;
    this.show();
  }

  /** Time passes: the action moves on, loops, or stops on its last frame. */
  advance(ms: number): void {
    const a = this.data.actions[this.action];
    const frames = this.frames();
    if (!a || frames.length === 0) return;
    this.clock += ms;
    let delay = frames[this.index]?.delay || a.delay;
    let moved = false;
    while (this.clock >= delay) {
      this.clock -= delay;
      if (this.index + 1 < frames.length) this.index += 1;
      else if (a.loop) this.index = 0;
      else {
        this.done = true;
        this.clock = 0;
        break;
      }
      moved = true;
      delay = frames[this.index]?.delay || a.delay;
    }
    if (moved) this.show();
  }

  /** A point of the frame now shown, in design units from the feet, mirrored with the picture. Null when the frame has none. */
  point(name: string): FramePoint | null {
    const p = this.frame?.points?.[name];
    if (!p) return null;
    const k = 1 / this.data.meta.filePx;
    return this.flip ? { x: -p.x * k, y: p.y * k, r: -p.r, front: p.front } : { x: p.x * k, y: p.y * k, r: p.r, front: p.front };
  }

  /** Stand on a point of the place, at a size (1 is its own). */
  place(x: number, y: number, depth: number, size = 1): void {
    this.image.setPosition(x, y).setDepth(depth).setScale(size / this.data.meta.filePx);
  }

  /** White for a moment when struck, else its own colours. */
  flash(on: boolean): void {
    if (on) this.image.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    else this.image.clearTint().setTintMode(Phaser.TintModes.MULTIPLY);
  }

  destroy(): void {
    this.image.destroy();
  }

  /** How far the picture now shown reaches above the point it stands on, in design units. */
  height(): number {
    return this.frame ? this.frame.origin.y / this.data.meta.filePx : 0;
  }

  /**
   * How far its first standing picture reaches above its feet: one steady height for what floats over it. The
   * picture now shown is trimmed, so its own top jumps as a claw goes up (Leonard, AD, 2026-11-20).
   */
  standTop(): number {
    const f = this.sets.get('stand/s')?.[0] ?? this.frame;
    return f ? f.origin.y / this.data.meta.filePx : 0;
  }

  /** The frames of the action for the facing; a figure drawn in fewer facings (the coconut crab) gives the nearest. */
  private frames(): AtlasFrame[] {
    for (const facing of [this.facing, ...(NEAREST[this.facing] ?? [])]) {
      const set = this.sets.get(`${this.action}/${facing}`);
      if (set) return set;
    }
    return [];
  }

  /** Put the frame of the moment on the picture, standing on its feet. */
  private show(): void {
    const drawn = DRAWN[WAYS[this.way]!];
    this.facing = drawn.facing;
    this.flip = drawn.flip;
    const frames = this.frames();
    const f = frames[Math.min(this.index, frames.length - 1)];
    if (!f) return;
    this.frame = f;
    this.image.setFrame(f.name, true, false);
    this.image.setFlipX(this.flip);
    this.image.setOrigin(this.flip ? 1 - f.origin.x / f.w : f.origin.x / f.w, f.origin.y / f.h);
  }
}

const GEAR_POINTS: [Slot, string][] = [
  ['weapon', 'hand'],
  ['shield', 'off'],
  ['hat', 'head'],
];

/** The hero: his body, and what he wears on his hand, his other arm and his head. */
export class HeroFigure {
  readonly body: Figure;
  private readonly gear: GearData | null;
  private readonly pieces = new Map<Slot, Phaser.GameObjects.Image>();
  /** A one-shot action (a swing, a Cleave, a flinch) that plays over standing and walking until it ends. */
  private once: string | null = null;

  constructor(scene: Phaser.Scene, add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, data: AtlasData, gear: GearData | null) {
    this.body = new Figure(scene, 'hero', data);
    add(this.body.image);
    this.gear = gear;
    if (gear) {
      for (const [slot] of GEAR_POINTS) this.pieces.set(slot, add(scene.add.image(0, 0, 'gear').setScale(1 / gear.meta.filePx).setVisible(false)));
    }
  }

  /** A swing, a Cleave, a flinch: played once from its start. A flinch never cuts a blow short. */
  play(action: string): void {
    if (action === 'hit1' && this.once && this.once !== 'hit1' && !this.body.done) return;
    this.once = action;
    this.body.play(action, true);
  }

  sync(o: { x: number; y: number; depth: number; facing: number; moving: boolean; charging: boolean; down: boolean; worn: Record<Slot, Item | null>; delta: number; flash: boolean }): void {
    const b = this.body;
    if (this.once && (b.done || b.playing !== this.once)) this.once = null;
    if (o.down) {
      this.once = null;
      b.play('die1');
    } else if (o.charging && b.has('charge')) {
      this.once = null;
      b.play('charge');
    } else if (!this.once) {
      b.play(o.moving ? 'move' : 'stand');
    }
    // Down, he lies as he fell; otherwise he looks where the rules say.
    if (!o.down) b.face(o.facing);
    b.advance(o.delta);
    b.image.setPosition(o.x, o.y).setDepth(o.depth).setAlpha(o.down ? 0.75 : 1);
    b.flash(o.flash);

    for (const [slot, pointName] of GEAR_POINTS) {
      const image = this.pieces.get(slot);
      if (!image || !this.gear) continue;
      const item = o.worn[slot];
      const art = item ? GEAR_ART[item.base] : undefined;
      const p = b.point(pointName);
      // A cutlass is one picture, turned by the hand; a buckler and a hat have a picture for each facing.
      const name = art ? (this.gear.items[`${art}/${b.facing}`] ? `${art}/${b.facing}` : art) : '';
      const info = this.gear.items[name];
      if (!art || !p || !info || o.down) {
        image.setVisible(false);
        continue;
      }
      image.setVisible(true).setFrame(name, true, false).setFlipX(b.flip);
      image.setOrigin(b.flip ? 1 - info.origin.x / info.w : info.origin.x / info.w, info.origin.y / info.h);
      image.setPosition(o.x + p.x, o.y + p.y).setRotation((p.r * Math.PI) / 180);
      image.setDepth(o.depth + (p.front ? 0.5 : -0.5));
    }
  }
}
