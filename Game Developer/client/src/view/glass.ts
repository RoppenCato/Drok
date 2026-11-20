// The Art Director's pieces for the glass and the windows (his `glass` drop: bars, discs, buttons, a panel, slots,
// marks), and what to draw in their stead while that drop is switched off. A piece is either one picture, or a
// picture cut in three or nine so it can be stretched without its corners stretching (his `slice`: left, top, right,
// bottom, in file pixels). Everything here is placed in design units; his files are two pixels a unit.

import Phaser from 'phaser';
import { ART } from '../art.ts';
import { COLORS, hex } from '../layout.ts';
import { picture, type SetData } from './figures.ts';

type Obj = Phaser.GameObjects.GameObject;

/** Is the Art Director's glass in the game and loaded? */
export function hasGlass(scene: Phaser.Scene): boolean {
  return ART.glass && scene.textures.exists('glass');
}

/** The words' colours on his glass, which is cream where the stand-in was dark. */
export const INK = {
  dark: '#33203a',
  dim: '#7a6a80',
  light: '#fff8ea',
  good: '#22884a',
  bad: '#cf3f38',
  gold: '#a86f00',
} as const;

function info(scene: Phaser.Scene, name: string): SetData['items'][string] | undefined {
  return (scene.cache.json.get('glass:data') as SetData | undefined)?.items?.[name];
}

/** One of his pictures, as it is: a disc, a round button, a slot, a mark. */
export function piece(scene: Phaser.Scene, name: string): Phaser.GameObjects.Image | null {
  return picture(scene, 'glass', name);
}

/**
 * One of his stretchable pieces at a size in design units. A piece cut only left and right (a pill: a bar's well,
 * the plate, the title) keeps its own height, whatever `h` says.
 */
export function stretch(scene: Phaser.Scene, name: string, w: number, h: number): Phaser.GameObjects.NineSlice | null {
  const data = scene.cache.json.get('glass:data') as SetData | undefined;
  const it = data?.items?.[name];
  if (!data || !it?.slice) return null;
  const px = data.meta.filePx;
  const [left = 0, top = 0, right = 0, bottom = 0] = it.slice;
  if (top === 0 && bottom === 0) {
    // A pill: it can only grow sideways. Asked for another height, the whole pill is drawn that much bigger or
    // smaller, and its length made up for it, so its ends stay round.
    const k = h / (it.h / px);
    return scene.add.nineslice(0, 0, 'glass', name, (w / k) * px, it.h, left, right, 0, 0).setScale(k / px);
  }
  return scene.add.nineslice(0, 0, 'glass', name, w * px, h * px, left, right, top, bottom).setScale(1 / px);
}

/** How tall one of his pieces is, in design units. */
export function tall(scene: Phaser.Scene, name: string): number {
  const data = scene.cache.json.get('glass:data') as SetData | undefined;
  const it = info(scene, name);
  return it && data ? it.h / data.meta.filePx : 0;
}

/**
 * One of his pills (a piece cut left and right only) whose length is set again and again: a bar's fill, a
 * monster's well. It is put together at the length asked for, so its ends stay round whatever the length (Leonard,
 * AD: "a fill is a pill, made as long as the bar's part, not a picture scaled"). Its left end is at the point it is
 * put at, its middle on that point's height. `size` draws the whole pill that much bigger, ends and all.
 */
export class Pill {
  readonly image: Phaser.GameObjects.NineSlice;
  /** Its two ends together, in design units at its own size: it is never drawn shorter while there is any of it. */
  private readonly ends: number;
  private readonly px: number;
  private readonly tall: number;
  private size = 1;
  private x = 0;
  private long = 0;
  private on = true;

  private constructor(image: Phaser.GameObjects.NineSlice, ends: number, px: number, tall: number) {
    this.image = image;
    this.ends = ends;
    this.px = px;
    this.tall = tall;
  }

  /** Null when the glass is not in the game or has no such pill. */
  static make(scene: Phaser.Scene, name: string, size = 1): Pill | null {
    const data = scene.cache.json.get('glass:data') as SetData | undefined;
    const it = data?.items?.[name];
    if (!data || !it?.slice || !hasGlass(scene)) return null;
    const [left = 0, , right = 0] = it.slice;
    const image = scene.add.nineslice(0, 0, 'glass', name, it.w, it.h, left, right, 0, 0);
    return new Pill(image, (left + right) / data.meta.filePx, data.meta.filePx, it.h).resize(size);
  }

  resize(size: number): this {
    this.size = size;
    this.image.setScale(size / this.px);
    return this;
  }

  /** Its left end and its middle's height. */
  at(x: number, y: number): this {
    this.x = x;
    this.image.setPosition(x + this.long / 2, y);
    return this;
  }

  /** As long as this, in design units. At nothing it is hidden. */
  length(length: number): this {
    this.long = length > 0.01 ? Math.max(this.ends * this.size, length) : 0;
    this.image.setVisible(this.on && this.long > 0);
    if (this.long > 0) {
      this.image.setSize((this.long / this.size) * this.px, this.tall);
      this.image.x = this.x + this.long / 2;
    }
    return this;
  }

  setVisible(on: boolean): this {
    this.on = on;
    this.image.setVisible(on && this.long > 0);
    return this;
  }

  destroy(): void {
    this.image.destroy();
  }
}

/**
 * What a blow just took, drawn pale under the red (Leonard, AD: it stays as long as the health was, holds 200 ms,
 * then shrinks to the health over 300; how that feels is Robin's to say).
 */
export class Trail {
  private shown = -1;
  private last = -1;
  private wait = 0;
  private rate = 0;

  /** Forget what was: the bar now shows someone else. */
  reset(): void {
    this.shown = -1;
    this.last = -1;
    this.wait = 0;
    this.rate = 0;
  }

  /** The health now (0 to 1) and the ms gone by; back comes how long the pale part is (never less than the health). */
  step(part: number, delta: number): number {
    if (this.shown < 0 || part >= this.shown) {
      this.shown = part;
      this.wait = 0;
      this.rate = 0;
    } else {
      if (part < this.last) {
        this.wait = 200;
        this.rate = 0;
      }
      if (this.wait > 0) this.wait -= delta;
      else {
        if (this.rate === 0) this.rate = (this.shown - part) / 300;
        this.shown = Math.max(part, this.shown - this.rate * delta);
      }
    }
    this.last = part;
    return this.shown;
  }
}

const unit = (part: number): number => Math.max(0, Math.min(1, part));

/**
 * A bar that fills from the left: health, rage, experience. On his glass it is a well with a round-ended fill
 * inside it; without, two plain boxes. `size` draws the whole bar that much bigger than his own (his well is 18
 * tall); `trail` shows what a blow just took.
 */
export class Bar {
  private readonly fill: Pill | Phaser.GameObjects.Rectangle;
  private readonly lost: Pill | null = null;
  private readonly back: Phaser.GameObjects.NineSlice | Phaser.GameObjects.Rectangle;
  private readonly full: number;
  private readonly trail = new Trail();

  constructor(
    scene: Phaser.Scene,
    reg: <T extends Obj>(o: T) => T,
    o: { x: number; y: number; w: number; kind: 'hp' | 'rage' | 'xp'; depth: number; plain: number; size?: number; trail?: boolean },
  ) {
    const size = o.size ?? 1;
    const well = hasGlass(scene) ? stretch(scene, 'bar/well', o.w, 18 * size) : null;
    const fill = well ? Pill.make(scene, `fill/${o.kind}`, size) : null;
    if (well && fill) {
      // His fill starts 3 units in from the well's left end, and its middle is 1 above the well's (the well's
      // picture has room for a shadow under it); whole, it is the well's length less 6. All of it grows with `size`.
      this.back = reg(well.setPosition(o.x + o.w / 2, o.y).setDepth(o.depth));
      this.full = o.w - 6 * size;
      if (o.trail) {
        this.lost = Pill.make(scene, 'fill/lost', size);
        if (this.lost) reg(this.lost.image.setDepth(o.depth + 1));
        this.lost?.at(o.x + 3 * size, o.y - size).length(0);
      }
      reg(fill.image.setDepth(o.depth + 2));
      this.fill = fill.at(o.x + 3 * size, o.y - size);
    } else {
      well?.destroy();
      const plain = { hp: COLORS.hp, rage: COLORS.rage, xp: COLORS.xp }[o.kind];
      this.back = reg(scene.add.rectangle(o.x - 2, o.y, o.w + 4, o.plain + 4, COLORS.barBack, 0.9).setOrigin(0, 0.5).setDepth(o.depth));
      this.fill = reg(scene.add.rectangle(o.x, o.y, o.w, o.plain, plain).setOrigin(0, 0.5).setDepth(o.depth + 2));
      this.full = 1;
    }
  }

  /** How full, from 0 to 1; and the ms gone by, for the part a blow just took. */
  set(part: number, delta = 0): void {
    const p = unit(part);
    if (this.fill instanceof Pill) {
      this.fill.length(this.full * p);
      if (this.lost) {
        const pale = this.trail.step(p, delta);
        this.lost.length(pale > p ? this.full * pale : 0);
      }
    } else {
      this.fill.scaleX = p;
    }
  }

  setVisible(on: boolean): void {
    this.fill.setVisible(on);
    this.lost?.setVisible(on);
    this.back.setVisible(on);
  }
}

/** The one he fights has its whole bar drawn this much bigger (Leonard, AD: "a fifth bigger"). */
const MINE = 1.2;

/**
 * A monster's health as the Art Director draws it: a dark well that reads on sand, grass, rock and sea, the red
 * inside it, and pale what a blow just took. The one he fights has the gold-rimmed well, a fifth bigger, and an
 * arrow over it. Without his glass: a dark box with a red one in it, edged in gold on the one he fights. Its
 * length `w` is the fill's when whole.
 */
export class MobBar {
  private readonly w: number;
  private readonly pills: { well: Pill; mine: Pill; lost: Pill; hp: Pill; inset: number; insetMine: number } | null = null;
  private readonly arrow: Phaser.GameObjects.Image | null = null;
  private readonly back: Phaser.GameObjects.Rectangle | null = null;
  private readonly fill: Phaser.GameObjects.Rectangle | null = null;
  private readonly trail = new Trail();

  constructor(scene: Phaser.Scene, reg: <T extends Obj>(o: T) => T, o: { w: number; depth: number; arrow: boolean }) {
    this.w = o.w;
    const well = Pill.make(scene, 'mob/well');
    const mine = Pill.make(scene, 'mob/well-mine', MINE);
    const lost = Pill.make(scene, 'mob/lost');
    const hp = Pill.make(scene, 'mob/hp');
    if (well && mine && lost && hp) {
      reg(well.image.setDepth(o.depth));
      reg(mine.image.setDepth(o.depth));
      reg(lost.image.setDepth(o.depth + 1));
      reg(hp.image.setDepth(o.depth + 2));
      this.pills = { well, mine, lost, hp, inset: info(scene, 'mob/well')?.inset ?? 3, insetMine: info(scene, 'mob/well-mine')?.inset ?? 5 };
      const arrow = o.arrow ? piece(scene, 'mark/mine') : null;
      if (arrow) this.arrow = reg(arrow.setDepth(o.depth + 3));
    } else {
      for (const p of [well, mine, lost, hp]) p?.destroy();
      this.back = reg(scene.add.rectangle(0, 0, o.w + 4, 11, COLORS.barBack, 0.9).setOrigin(0, 0.5).setDepth(o.depth));
      this.fill = reg(scene.add.rectangle(0, 0, o.w, 7, COLORS.hp).setOrigin(0, 0.5).setDepth(o.depth + 1));
    }
    this.hide();
  }

  /** Its middle at x, y; how full (0 to 1); whether it is the one he fights; the ms gone by; how far the arrow has bobbed. */
  draw(x: number, y: number, part: number, fought: boolean, delta: number, bob = 0): void {
    const p = unit(part);
    const pale = this.trail.step(p, delta);
    if (this.pills) {
      const { well, mine, lost, hp } = this.pills;
      const k = fought ? MINE : 1;
      const inset = (fought ? this.pills.insetMine : this.pills.inset) * k;
      const full = this.w * k;
      const x0 = x - full / 2;
      (fought ? well : mine).setVisible(false);
      (fought ? mine : well).setVisible(true).at(x0 - inset, y).length(full + inset * 2);
      lost.resize(k).setVisible(true).at(x0, y).length(pale > p ? full * pale : 0);
      hp.resize(k).setVisible(true).at(x0, y).length(full * p);
      this.arrow?.setVisible(fought).setPosition(x, y - 16 + bob);
    } else if (this.back && this.fill) {
      this.back.setVisible(true).setPosition(x - this.w / 2 - 2, y).setStrokeStyle(fought ? 2 : 1, fought ? COLORS.target : COLORS.foam, fought ? 1 : 0.8);
      this.fill.setVisible(true).setPosition(x - this.w / 2, y);
      this.fill.scaleX = p;
    }
  }

  hide(): void {
    if (this.pills) for (const p of [this.pills.well, this.pills.mine, this.pills.lost, this.pills.hp]) p.setVisible(false);
    this.arrow?.setVisible(false);
    this.back?.setVisible(false);
    this.fill?.setVisible(false);
  }

  /** The bar now shows another monster: nothing was just taken from it. */
  reset(): void {
    this.trail.reset();
  }

  destroy(): void {
    if (this.pills) for (const p of [this.pills.well, this.pills.mine, this.pills.lost, this.pills.hp]) p.destroy();
    this.arrow?.destroy();
    this.back?.destroy();
    this.fill?.destroy();
  }
}

/** A rarity's colour for words on cream: the common grey is too pale to read there. */
export function inkFor(color: string, onGlass: boolean): string {
  return onGlass && hex(color) === 0xb9b2a6 ? INK.dark : color;
}
