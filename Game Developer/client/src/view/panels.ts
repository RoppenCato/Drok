// The windows that open over the game: the bag, the hero, the map, the stall, and the settings. One at a
// time, each rebuilt whole from the state whenever something in it changes, so a window can never show a stale
// number. A window's buttons act when the finger lifts on them (saving a file and choosing one need that); a tap
// beside the window closes it. The world goes on behind an open window: this is not a pause.

import Phaser from 'phaser';
import {
  MONSTERS,
  N,
  chestFull,
  RARITIES,
  SHOP,
  SLOTS,
  baseOf,
  buyPrice,
  heroArmour,
  heroBonusDamage,
  heroMaxHp,
  itemName,
  itemStats,
  placeOf,
  sellPrice,
  xpToNext,
  type GameState,
  type Item,
  type Slot,
} from '../../../rules/src/index.ts';
import { ART, GEAR_ART } from '../art.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES, hex } from '../layout.ts';
import type { Intent } from '../local-game.ts';
import { settings } from '../settings.ts';
import { sounds } from '../sound.ts';
import { picture } from './figures.ts';
import { INK, hasGlass, inkFor, piece, stretch } from './glass.ts';

export type PanelKind = 'menu' | 'bag' | 'hero' | 'chart' | 'shop';

/** Marks an object as the glass's, so the camera that follows the hero leaves it out. */
export type Register = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

export interface PanelActions {
  state(): GameState;
  /** Ask the rules for something; the scene says why if it is refused. True when it was done. */
  act(intent: Intent): boolean;
  atShop(): boolean;
  /** The hand or the effects switch changed: the glass must lay itself out again. */
  settingsChanged(): void;
  exportSave(): void;
  importSave(): void;
  saveLog(): void;
  startOver(): void;
  toast(text: string): void;
}

interface Zone {
  x: number;
  y: number;
  hw: number;
  hh: number;
  press: () => void;
}

const W = DESIGN_WIDTH;
const H = DESIGN_HEIGHT;
const CX = W / 2;
/** The window's frame. */
const F = { x: 20, y: 118, w: 372, h: 690 };
const SLOT_NAMES: Record<Slot, string> = { weapon: 'cutlass', shield: 'buckler', hat: 'hat', coat: 'coat' };

/** What a piece gives, in words: "+4 damage", "+16 health, 1 armour". */
export function statWords(item: Item): string {
  const s = itemStats(item);
  const parts: string[] = [];
  if (s.damage) parts.push(`+${s.damage} damage`);
  if (s.hp) parts.push(`+${s.hp} health`);
  if (s.armour) parts.push(`${s.armour} armour`);
  return parts.join(', ');
}

/** One number for how good a piece is, to say whether it is better than what he wears. */
function power(item: Item | null): number {
  if (!item) return 0;
  const s = itemStats(item);
  return s.damage * 3 + s.hp * 0.5 + s.armour * 6;
}

export class Panels {
  /** Which window is open, if any. */
  kind: PanelKind | null = null;

  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly actions: PanelActions;
  private objects: Phaser.GameObjects.GameObject[] = [];
  private zones: Zone[] = [];
  private armed: Zone | 'outside' | null = null;
  /** The piece of the bag that is being looked at, and whether the bag was opened from the stall to sell. */
  private selected: number | null = null;
  private selling = false;
  /** The open window fills the whole screen (the drawn sea chart): there is no "beside it" to tap. */
  private whole = false;

  constructor(scene: Phaser.Scene, reg: Register, actions: PanelActions) {
    this.scene = scene;
    this.reg = reg;
    this.actions = actions;
  }

  open(kind: PanelKind, selling = false): void {
    if (this.kind !== kind) sounds.play('open');
    this.kind = kind;
    this.selling = selling;
    this.selected = null;
    this.rebuild();
  }

  close(): void {
    if (this.kind) sounds.play('close');
    this.kind = null;
    this.armed = null;
    this.clear();
  }

  /** Something changed: draw the open window again from the state. */
  refresh(): void {
    if (this.kind) this.rebuild();
  }

  /** A finger came down while a window is open. */
  down(x: number, y: number): void {
    this.armed = this.hit(x, y) ?? (this.inside(x, y) ? null : 'outside');
  }

  /** The finger lifted: a button it came down on and is still on acts; a tap beside the window closes it. */
  up(x: number, y: number): void {
    const armed = this.armed;
    this.armed = null;
    if (!armed || !this.kind) return;
    if (armed === 'outside') {
      if (!this.inside(x, y)) this.close();
      return;
    }
    if (this.hit(x, y) === armed) {
      sounds.play('tap');
      armed.press();
    }
  }

  // ---- the frame and its parts -------------------------------------------------------------------------------------

  private clear(): void {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.zones = [];
    this.whole = false;
  }

  private inside(x: number, y: number): boolean {
    return this.whole || (x >= F.x && x <= F.x + F.w && y >= F.y && y <= F.y + F.h);
  }

  private hit(x: number, y: number): Zone | null {
    for (const z of this.zones) if (Math.abs(x - z.x) <= z.hw && Math.abs(y - z.y) <= z.hh) return z;
    return null;
  }

  private keep<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.objects.push(o);
    return this.reg(o);
  }

  private rect(x: number, y: number, w: number, h: number, color: number, alpha = 1, edge: number = COLORS.panelEdge, edgeWidth = 2): Phaser.GameObjects.Rectangle {
    const r = this.scene.add.rectangle(x, y, w, h, color, alpha).setDepth(DEPTH.panel + 1);
    if (edgeWidth > 0) r.setStrokeStyle(edgeWidth, edge);
    return this.keep(r);
  }

  /** Words in a window. On the Art Director's cream panel the light colours become ink; `light` keeps them (on the sea chart, on the title). */
  private text(x: number, y: number, words: string, size: number, color: string = COLORS.text, originX = 0.5, light = false): Phaser.GameObjects.Text {
    const ink = hasGlass(this.scene) && !light ? this.ink(color) : color;
    return this.keep(this.scene.add.text(x, y, words, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color: ink, resolution: RES }).setOrigin(originX, 0.5).setDepth(DEPTH.panel + 3));
  }

  private ink(color: string): string {
    if (color === COLORS.text) return INK.dark;
    if (color === COLORS.dim) return INK.dim;
    if (color === COLORS.good) return INK.good;
    if (color === COLORS.bad) return INK.bad;
    if (color === COLORS.goldText) return INK.gold;
    return inkFor(color, true);
  }

  /** The ground a row of a window lies on. */
  private row(x: number, y: number, w: number, h: number): void {
    const drawn = hasGlass(this.scene) ? stretch(this.scene, 'row', w, h) : null;
    if (drawn) this.keep(drawn.setPosition(x, y).setDepth(DEPTH.panel + 1));
    else this.rect(x, y, w, h, COLORS.panelLight, 0.7, COLORS.panelEdge, 1);
  }

  private zone(x: number, y: number, w: number, h: number, press: () => void): void {
    this.zones.push({ x, y, hw: w / 2, hh: h / 2, press });
  }

  /** A button: `on` false draws it dim, but it still answers, so it can say why it will not do. */
  private button(x: number, y: number, w: number, h: number, label: string, press: () => void, on = true, color: number = COLORS.button): void {
    const drawn = hasGlass(this.scene) ? stretch(this.scene, color === COLORS.buttonGo ? 'button/context' : 'row', w, h) : null;
    if (drawn) this.keep(drawn.setPosition(x, y).setDepth(DEPTH.panel + 1).setAlpha(on ? 1 : 0.5));
    else this.rect(x, y, w, h, color, on ? 1 : 0.45);
    this.text(x, y, label, 15).setAlpha(on ? 1 : 0.55);
    this.zone(x, y, w, h + 8, press);
  }

  /** The frame every window shares: a veil over the game, the box, its title and a cross to close it. */
  private frame(title: string): void {
    this.keep(this.scene.add.rectangle(CX, H / 2, W, H, 0x000000, 0.35).setDepth(DEPTH.panel));
    const panel = hasGlass(this.scene) ? stretch(this.scene, 'panel', F.w, F.h) : null;
    const cross = panel ? piece(this.scene, 'button/close') : null;
    if (panel && cross) {
      // His panel, his blue title sitting on its top edge, his red cross on its corner.
      this.keep(panel.setPosition(F.x + F.w / 2, F.y + F.h / 2).setDepth(DEPTH.panel + 1));
      const plate = stretch(this.scene, 'panel/title', 236, 44);
      if (plate) this.keep(plate.setPosition(CX, F.y + 6).setDepth(DEPTH.panel + 2));
      this.text(CX, F.y + 5, title, 18, COLORS.text, 0.5, true);
      this.keep(cross.setPosition(F.x + F.w - 12, F.y + 10).setDepth(DEPTH.panel + 4));
      this.zone(F.x + F.w - 16, F.y + 14, 52, 52, () => this.close());
      return;
    }
    panel?.destroy();
    cross?.destroy();
    this.rect(F.x + F.w / 2, F.y + F.h / 2, F.w, F.h, COLORS.panel, 0.98, COLORS.panelEdge, 3);
    this.text(CX, F.y + 30, title, 20);
    this.button(F.x + F.w - 30, F.y + 30, 44, 40, '✕', () => this.close());
  }

  /** A stand-in picture of a piece: a box edged in its rarity's colour, with a shape for what part of him it is for. */
  private icon(x: number, y: number, item: Item | null, slot: Slot, size: number, chosen = false): void {
    const edge = item ? hex(RARITIES[item.rarity].color) : COLORS.panelEdge;
    const slotArt = hasGlass(this.scene) ? piece(this.scene, item ? `slot/${item.rarity}` : 'slot/empty') : null;
    if (slotArt) {
      // His slot, edged in the rarity's colour; the one being looked at gets a dark frame round it.
      this.keep(slotArt.setPosition(x, y).setScale(size / slotArt.width).setDepth(DEPTH.panel + 1).setAlpha(item ? 1 : 0.6));
      if (chosen) this.keep(this.scene.add.rectangle(x, y, size + 4, size + 4).setStrokeStyle(3, hex(INK.dark)).setDepth(DEPTH.panel + 2));
    } else {
      this.rect(x, y, size, size, COLORS.panelLight, 1, chosen ? COLORS.mark : edge, chosen ? 4 : 3);
    }
    const s = this.scene;
    // The Art Director's icon for the piece, when that drop is in the game; else a plain shape for its slot.
    const art = item ? `icon/${GEAR_ART[item.base] ?? ''}` : '';
    if (item && ART.gear && s.textures.exists('gear-icons') && s.textures.get('gear-icons').has(art)) {
      const picture = s.add.image(x, y, 'gear-icons', art).setDepth(DEPTH.panel + 2);
      picture.setScale(Math.min((size * 0.7) / picture.width, (size * 0.7) / picture.height));
      this.keep(picture);
      return;
    }
    const tint = item ? 0xf3f6f8 : 0x3a6072;
    const k = size / 62;
    let shape: Phaser.GameObjects.Shape;
    if (slot === 'weapon') shape = s.add.rectangle(x, y, 36 * k, 7 * k, tint).setRotation(-0.8);
    else if (slot === 'shield') shape = s.add.circle(x, y, 14 * k, tint);
    else if (slot === 'hat') shape = s.add.triangle(x, y, 0, 24 * k, 15 * k, 0, 30 * k, 24 * k, tint);
    else shape = s.add.rectangle(x, y, 24 * k, 28 * k, tint);
    this.keep(shape.setDepth(DEPTH.panel + 2).setStrokeStyle(2, hex(COLORS.textDark)));
  }

  private rebuild(): void {
    this.clear();
    const state = this.actions.state();
    switch (this.kind) {
      case 'menu':
        this.buildMenu(state);
        break;
      case 'bag':
        this.buildBag(state);
        break;
      case 'hero':
        this.buildHero(state);
        break;
      case 'chart':
        this.buildMap(state);
        break;
      case 'shop':
        this.buildShop(state);
        break;
      default:
        break;
    }
  }

  // ---- the settings ------------------------------------------------------------------------------------------------

  private buildMenu(state: GameState): void {
    this.frame('Settings');
    const s = settings.get();
    const rows: [string, () => void][] = [
      [
        `Sound: ${s.mute ? 'off' : 'on'}`,
        () => {
          settings.set({ mute: !settings.get().mute });
          this.refresh();
        },
      ],
      [
        `Buttons: ${s.leftHand ? 'left' : 'right'} hand`,
        () => {
          settings.set({ leftHand: !settings.get().leftHand });
          this.actions.settingsChanged();
          this.refresh();
        },
      ],
      [
        `Effects: ${s.fewerEffects ? 'fewer' : 'full'}`,
        () => {
          settings.set({ fewerEffects: !settings.get().fewerEffects });
          this.refresh();
        },
      ],
      ['Export save (a file to keep)', () => this.actions.exportSave()],
      ['Import save (from a file)', () => this.actions.importSave()],
      ['Save the log', () => this.actions.saveLog()],
      ['Start over (a new hero)', () => this.actions.startOver()],
      ['Close', () => this.close()],
    ];
    rows.forEach(([label, press], i) => this.button(CX, F.y + 96 + i * 62, 320, 50, label, press));
    this.text(CX, F.y + F.h - 54, 'The save lives on this phone only.', 12, COLORS.dim);
    this.text(CX, F.y + F.h - 36, 'Export it now and then to keep it safe.', 12, COLORS.dim);
  }

  // ---- the bag -----------------------------------------------------------------------------------------------------

  private buildBag(state: GameState): void {
    const h = state.hero;
    const atShop = this.actions.atShop();
    this.frame(this.selling ? 'Sell from your bag' : 'Bag');
    this.text(CX, F.y + 62, `${h.bag.length} of ${N.bagSize} pieces   ·   ${h.gold} gold   ·   ${h.potions} potions`, 13, COLORS.dim);
    const cols = 5;
    const size = 62;
    const gap = 8;
    const left = CX - (cols * size + (cols - 1) * gap) / 2 + size / 2;
    const top = F.y + 88 + size / 2;
    for (let i = 0; i < N.bagSize; i++) {
      const x = left + (i % cols) * (size + gap);
      const y = top + Math.floor(i / cols) * (size + gap);
      const item = h.bag[i];
      if (!item) {
        const empty = hasGlass(this.scene) ? piece(this.scene, 'slot/empty') : null;
        if (empty) this.keep(empty.setPosition(x, y).setScale(size / empty.width).setDepth(DEPTH.panel + 1).setAlpha(0.45));
        else this.rect(x, y, size, size, COLORS.panelLight, 0.4, COLORS.panelEdge, 1);
        continue;
      }
      this.icon(x, y, item, baseOf(item).slot, size, item.id === this.selected);
      if (power(item) > power(h.worn[baseOf(item).slot])) this.text(x + 20, y - 20, '▲', 13, COLORS.good);
      this.zone(x, y, size + gap, size + gap, () => {
        this.selected = item.id;
        this.refresh();
      });
    }

    const y0 = F.y + 396;
    const item = h.bag.find((i) => i.id === this.selected);
    if (!item) {
      this.text(CX, y0 + 60, h.bag.length === 0 ? 'Nothing yet.' : 'Tap a piece to look at it.', 15, COLORS.dim);
      if (h.bag.length === 0) this.text(CX, y0 + 84, 'Loot flies to you when you walk close.', 13, COLORS.dim);
      if (this.selling) this.button(CX, F.y + F.h - 46, 200, 48, 'Back to the stall', () => this.open('shop'));
      return;
    }
    const base = baseOf(item);
    const rarity = RARITIES[item.rarity];
    const worn = h.worn[base.slot];
    this.text(CX, y0 + 14, itemName(item), 19, rarity.color);
    this.text(CX, y0 + 40, `${rarity.name} ${SLOT_NAMES[base.slot]}`, 13, COLORS.dim);
    this.text(CX, y0 + 70, statWords(item), 16);
    const better = power(item) - power(worn);
    this.text(CX, y0 + 98, worn ? `You wear: ${itemName(worn)}, ${statWords(worn)}` : `You wear no ${SLOT_NAMES[base.slot]}`, 13, better > 0 ? COLORS.good : better < 0 ? COLORS.bad : COLORS.dim);
    this.text(CX, y0 + 122, `The stall gives ${sellPrice(item)} gold for it`, 13, COLORS.dim);

    const by = F.y + F.h - 46;
    this.button(CX - 120, by, 108, 48, 'Wear', () => {
      if (this.actions.act({ type: 'equip', item: item.id })) this.selected = null;
      this.refresh();
    });
    this.button(
      CX,
      by,
      108,
      48,
      `Sell ${sellPrice(item)}`,
      () => {
        if (!this.actions.atShop()) {
          this.actions.toast('Sell at the stall at home');
          return;
        }
        if (this.actions.act({ type: 'sell', item: item.id })) this.selected = null;
        this.refresh();
      },
      atShop,
      atShop ? COLORS.buttonGo : COLORS.button,
    );
    this.button(CX + 120, by, 108, 48, 'Drop', () => {
      if (this.actions.act({ type: 'discard', item: item.id })) this.selected = null;
      this.refresh();
    });
  }

  // ---- the hero ----------------------------------------------------------------------------------------------------

  private buildHero(state: GameState): void {
    const h = state.hero;
    this.frame('Hero');
    const need = xpToNext(h.level);
    const bonus = heroBonusDamage(h);
    const x = F.x + 28;
    let y = F.y + 76;
    this.text(x, y, `Level ${h.level} Warrior`, 18, COLORS.text, 0);
    y += 26;
    this.rect(CX, y, F.w - 56, 10, COLORS.barBack);
    const part = need > 0 ? Math.min(1, h.xp / need) : 1;
    if (part > 0) this.keep(this.scene.add.rectangle(x, y, (F.w - 56) * part, 8, COLORS.xp).setOrigin(0, 0.5).setDepth(DEPTH.panel + 2));
    y += 20;
    this.text(x, y, need > 0 ? `${h.xp} of ${need} experience to level ${h.level + 1}` : 'As far as this chapter goes', 13, COLORS.dim, 0);
    y += 30;
    const lines = [
      `Health  ${Math.ceil(h.hp)} of ${heroMaxHp(h)}`,
      `A swing  ${N.hero.damageMin + bonus} to ${N.hero.damageMax + bonus}`,
      `Armour  ${heroArmour(h)} off every bite`,
      `Gold  ${h.gold}     Potions  ${h.potions} of ${N.potion.carry}`,
    ];
    for (const line of lines) {
      this.text(x, y, line, 15, COLORS.text, 0);
      y += 24;
    }
    y += 22;
    for (const slot of SLOTS) {
      const item = h.worn[slot];
      this.icon(x + 26, y, item, slot, 52);
      if (item) {
        this.text(x + 62, y - 10, itemName(item), 15, RARITIES[item.rarity].color, 0);
        this.text(x + 62, y + 11, statWords(item), 13, COLORS.dim, 0);
        this.button(F.x + F.w - 62, y, 88, 40, 'Take off', () => {
          this.actions.act({ type: 'unequip', slot });
          this.refresh();
        });
      } else {
        this.text(x + 62, y, `No ${SLOT_NAMES[slot]}`, 15, COLORS.dim, 0);
      }
      y += 62;
    }
    y += 4;
    const felled = Object.keys(MONSTERS)
      .filter((kind) => (state.book[kind] ?? 0) > 0)
      .map((kind) => `${MONSTERS[kind]!.name} ${state.book[kind]}`);
    this.text(x, y, felled.length ? `Felled: ${felled.join('   ')}` : 'Nothing felled yet', 13, COLORS.dim, 0);
    this.text(x, y + 22, `Falls: ${state.deaths}`, 13, COLORS.dim, 0);
  }

  // ---- the map ---------------------------------------------------------------------------------------------------

  /**
   * The map of the world he is in (it was the sea chart): its floors with their names and levels, the big things,
   * home, the chest, and a dot for him. A stand-in drawn from the rules' own layout (Victor, GD, 2026-11-20);
   * there is nowhere to travel to by tapping, so it only shows.
   */
  private buildMap(state: GameState): void {
    const s = this.scene;
    const place = placeOf(state);
    this.frame(place.name);
    const room = { w: F.w - 40, h: F.h - 150 };
    const k = Math.min(room.w / place.width, room.h / place.height);
    const box = { x: CX - (place.width * k) / 2, y: F.y + 70, w: place.width * k, h: place.height * k };
    const at = (x: number, y: number): { x: number; y: number } => ({ x: box.x + x * k, y: box.y + y * k });
    for (const b of place.biomes) {
      const p = at(b.x, b.y);
      this.keep(s.add.rectangle(p.x, p.y, b.w * k, b.h * k, Phaser.Display.Color.HexStringToColor(b.floor).color).setOrigin(0).setDepth(DEPTH.panel + 1));
    }
    for (const b of place.boxes) {
      const p = at(b.x, b.y);
      this.keep(s.add.rectangle(p.x, p.y, Math.max(2, b.w * k), Math.max(2, b.h * k), 0x2a2140, 0.45).setOrigin(0).setDepth(DEPTH.panel + 2));
    }
    this.keep(s.add.rectangle(box.x, box.y, box.w, box.h).setOrigin(0).setStrokeStyle(3, 0x2a2140).setDepth(DEPTH.panel + 2));
    for (const b of place.biomes) {
      const p = at(b.x + b.w / 2, b.y + b.h / 2);
      this.text(p.x, p.y - 9, b.name, 14, COLORS.text, 0.5, true).setStroke(INK.dark, 4);
      this.text(p.x, p.y + 10, `Lv ${b.levels.replace(' to ', '-')}`, 12, COLORS.text, 0.5, true).setStroke(INK.dark, 3);
    }
    if (place.home) {
      const p = at(place.home.x, place.home.y);
      this.keep(s.add.circle(p.x, p.y, place.home.r * k, 0xfff6d8, 0.35).setStrokeStyle(2, 0xfff6d8, 0.9).setDepth(DEPTH.panel + 2));
      this.text(p.x, p.y + place.home.r * k + 9, 'Home', 12, COLORS.text, 0.5, true).setStroke(INK.dark, 3);
    }
    if (place.chest) {
      const p = at(place.chest.x, place.chest.y);
      this.keep(s.add.rectangle(p.x, p.y, 10, 8, chestFull(state) ? COLORS.gold : COLORS.chestDark).setStrokeStyle(2, 0x2a2140).setDepth(DEPTH.panel + 3));
    }
    const h = at(state.hero.x, state.hero.y);
    this.keep(s.add.circle(h.x, h.y, 6, COLORS.bandana).setStrokeStyle(2, 0xffffff).setDepth(DEPTH.panel + 4));
    this.text(h.x, h.y - 16, 'You', 11, COLORS.goldText, 0.5, true).setStroke(INK.dark, 3);
    this.text(CX, F.y + F.h - 56, 'One world: walk anywhere. No insect comes for you at home.', 12, COLORS.dim);
  }

  // ---- the stall ---------------------------------------------------------------------------------------------------

  private buildShop(state: GameState): void {
    const h = state.hero;
    const keeper = placeOf(state).shop?.keeper ?? 'The';
    this.frame(`${keeper}'s stall`);
    this.text(CX, F.y + 62, `You have ${h.gold} gold`, 14, COLORS.goldText);
    const x = F.x + 24;
    let y = F.y + 118;
    state.shop.forEach((item, i) => {
      this.row(CX, y, F.w - 32, 76);
      if (!item) {
        this.text(CX, y, 'Sold', 15, COLORS.dim);
      } else {
        const base = baseOf(item);
        const price = buyPrice(item);
        const worn = h.worn[base.slot];
        const better = power(item) - power(worn);
        this.icon(x + 34, y, item, base.slot, 54);
        this.text(x + 70, y - 20, itemName(item), 15, RARITIES[item.rarity].color, 0);
        this.text(x + 70, y, statWords(item), 13, COLORS.text, 0);
        this.text(x + 70, y + 20, worn ? `you wear ${statWords(worn)}` : `you wear no ${SLOT_NAMES[base.slot]}`, 12, better > 0 ? COLORS.good : COLORS.dim, 0);
        this.button(
          F.x + F.w - 62,
          y,
          84,
          44,
          `Buy ${price}`,
          () => {
            this.actions.act({ type: 'buy', what: i });
            this.refresh();
          },
          h.gold >= price,
          h.gold >= price ? COLORS.buttonGo : COLORS.button,
        );
      }
      y += 84;
    });
    this.row(CX, y, F.w - 32, 76);
    // The Art Director's bottle from his loot, in a slot like the pieces above it; else a red disc.
    const bottle = ART.loot && hasGlass(this.scene) ? this.scene.textures.exists('loot') && this.scene.textures.get('loot').has('potion') : false;
    const slot = bottle ? piece(this.scene, 'slot/empty') : null;
    if (slot) {
      this.keep(slot.setPosition(x + 34, y).setScale(54 / slot.width).setDepth(DEPTH.panel + 1));
      // His frame carries the point it stands on as its pivot; in a slot it is centred instead.
      const bottled = this.scene.add.image(x + 34, y, 'loot', 'potion').setOrigin(0.5).setDepth(DEPTH.panel + 2);
      this.keep(bottled.setScale(Math.min(36 / bottled.width, 36 / bottled.height)));
    } else {
      this.keep(this.scene.add.circle(x + 34, y + 3, 14, COLORS.potion).setStrokeStyle(2, COLORS.foam).setDepth(DEPTH.panel + 2));
    }
    this.text(x + 70, y - 20, 'Healing potion', 15, COLORS.text, 0);
    this.text(x + 70, y, `mends ${N.potion.heal} health`, 13, COLORS.text, 0);
    this.text(x + 70, y + 20, `you carry ${h.potions} of ${N.potion.carry}`, 12, COLORS.dim, 0);
    const canPotion = h.gold >= N.potion.price && h.potions < N.potion.carry;
    this.button(
      F.x + F.w - 62,
      y,
      84,
      44,
      `Buy ${N.potion.price}`,
      () => {
        this.actions.act({ type: 'buy', what: 'potion' });
        this.refresh();
      },
      canPotion,
      canPotion ? COLORS.buttonGo : COLORS.button,
    );
    y += 96;
    this.button(CX, y, 260, 50, `Sell from your bag (${h.bag.length})`, () => this.open('bag', true));
    this.text(CX, F.y + F.h - 54, 'New pieces come each time you come home.', 12, COLORS.dim);
    this.text(CX, F.y + F.h - 36, `The stall pays about ${Math.round((SHOP.sellShare / SHOP.buyTimes) * 100)}% of what it asks.`, 12, COLORS.dim);
  }
}
