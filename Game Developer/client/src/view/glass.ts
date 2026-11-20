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
 * A bar that fills from the left: health, rage, experience. On his glass it is a well with his colour inside it;
 * without, two plain boxes.
 */
export class Bar {
  private readonly fill: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private readonly back: Phaser.GameObjects.NineSlice | Phaser.GameObjects.Rectangle;
  private readonly full: number;

  constructor(scene: Phaser.Scene, reg: <T extends Obj>(o: T) => T, o: { x: number; y: number; w: number; kind: 'hp' | 'rage' | 'xp'; depth: number; plain: number }) {
    const well = hasGlass(scene) ? stretch(scene, 'bar/well', o.w, 18) : null;
    const colour = hasGlass(scene) ? piece(scene, `bar/${o.kind}`) : null;
    if (well && colour) {
      // His well is 18 tall; the colour sits 3 units in from its edge all round.
      this.back = reg(well.setPosition(o.x + o.w / 2, o.y).setDepth(o.depth));
      this.fill = reg(colour.setOrigin(0, 0.5).setPosition(o.x + 3, o.y).setDepth(o.depth + 1));
      this.full = (o.w - 6) / colour.width;
      this.fill.setScale(this.full, 12 / colour.height);
    } else {
      colour?.destroy();
      well?.destroy();
      const plain = { hp: COLORS.hp, rage: COLORS.rage, xp: COLORS.xp }[o.kind];
      this.back = reg(scene.add.rectangle(o.x - 2, o.y, o.w + 4, o.plain + 4, COLORS.barBack, 0.9).setOrigin(0, 0.5).setDepth(o.depth));
      this.fill = reg(scene.add.rectangle(o.x, o.y, o.w, o.plain, plain).setOrigin(0, 0.5).setDepth(o.depth + 1));
      this.full = 1;
    }
  }

  /** How full, from 0 to 1. */
  set(part: number): void {
    this.fill.scaleX = this.full * Math.max(0, Math.min(1, part));
  }

  setVisible(on: boolean): void {
    this.fill.setVisible(on);
    this.back.setVisible(on);
  }
}

/** A rarity's colour for words on cream: the common grey is too pale to read there. */
export function inkFor(color: string, onGlass: boolean): string {
  return onGlass && hex(color) === 0xb9b2a6 ? INK.dark : color;
}
