// The windows that open over the game: the hero sheet (the hero and his bag), the sea chart, the stall, and the settings. One at a
// time, each rebuilt whole from the state whenever something in it changes, so a window can never show a stale
// number. A window's buttons act when the finger lifts on them (saving a file and choosing one need that); a tap
// beside the window closes it. The world goes on behind an open window: this is not a pause.

import Phaser from 'phaser';
import {
  MONSTERS,
  N,
  PLACES,
  RARITIES,
  SHOP,
  SLOTS,
  wearSlot,
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
import { ART, CHART_ART, GEAR_ART } from '../art.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES, hex } from '../layout.ts';
import type { Intent } from '../local-game.ts';
import { settings } from '../settings.ts';
import { sounds } from '../sound.ts';
import { HeroFigure, picture, type AtlasData, type GearData } from './figures.ts';
import { INK, hasGlass, inkFor, piece, stretch } from './glass.ts';

export type PanelKind = 'menu' | 'bag' | 'hero' | 'chart' | 'shop';

/** The Art Director's chart: where each of his places is on it, the dots of the way between, where the title and the button sit. In design units. */
interface ChartArt {
  places: Record<string, { x: number; y: number }>;
  route: number[][];
  title: { x: number; y: number };
  sail: { x: number; y: number };
}

/** Marks an object as the glass's, so the camera that follows the hero leaves it out. */
export type Register = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

export interface PanelActions {
  state(): GameState;
  /** Ask the rules for something; the scene says why if it is refused. True when it was done. */
  act(intent: Intent): boolean;
  atShop(): boolean;
  atDock(): boolean;
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
const SLOT_NAMES: Record<Slot, string> = { weapon: 'cutlass', shield: 'buckler', hat: 'hat', coat: 'coat', legs: 'breeches', boots: 'boots', necklace: 'necklace', trinket: 'trinket', trinket2: 'trinket' };

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
  /** The part of him whose worn piece is being looked at. */
  private selectedSlot: Slot | null = null;
  /** The hero drawn in his window, wearing his gear. */
  private sheetHero: HeroFigure | null = null;
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
    this.selectedSlot = null;
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
    this.sheetHero?.destroy();
    this.sheetHero = null;
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
    else if (slot === 'legs') shape = s.add.triangle(x, y, 0, 0, 26 * k, 0, 13 * k, 28 * k, tint);
    else if (slot === 'boots') shape = s.add.rectangle(x, y + 4 * k, 30 * k, 14 * k, tint);
    else if (slot === 'necklace') shape = s.add.circle(x, y, 11 * k, 0x000000, 0).setStrokeStyle(4 * k, tint);
    else if (slot === 'trinket' || slot === 'trinket2') shape = s.add.star(x, y, 4, 6 * k, 15 * k, tint);
    else shape = s.add.rectangle(x, y, 24 * k, 28 * k, tint);
    if (slot !== 'necklace') shape.setStrokeStyle(2, hex(COLORS.textDark));
    this.keep(shape.setDepth(DEPTH.panel + 2));
  }

  private rebuild(): void {
    this.clear();
    const state = this.actions.state();
    switch (this.kind) {
      case 'menu':
        this.buildMenu(state);
        break;
      case 'bag':
      case 'hero':
        this.buildSheet(state);
        break;
      case 'chart':
        this.buildChart(state);
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

  // ---- the hero sheet: the hero, what he wears, what he carries, and the piece being looked at -----------------------

  /**
   * One window for the hero and his bag (Robin, 2026-11-20: "a proper inventory system like my other games, look
   * at zite for example"). It is Zite's hero sheet, which he picked there on 2026-11-02 and asked more stats of:
   * the hero wearing his gear in the middle, a slot for each part of him beside him, his numbers under him, the
   * bag as a grid of cells edged in each piece's rarity, and one card at the bottom for the piece that was tapped:
   * what it gives, how it stands against what he wears, and only the buttons that apply. No text under 13.
   */
  private buildSheet(state: GameState): void {
    const s = this.scene;
    const h = state.hero;
    const atShop = this.actions.atShop();
    this.frame(this.selling ? 'Sell from your bag' : 'Hero');
    const left = F.x + 22;
    const right = F.x + F.w - 22;

    // Who he is, how far to the next level, what he owns.
    const need = xpToNext(h.level);
    this.text(left, F.y + 46, `Level ${h.level} Warrior`, 16, COLORS.text, 0);
    this.text(CX + 20, F.y + 46, need > 0 ? `${h.xp} of ${need} xp` : 'top level', 13, COLORS.dim);
    this.text(right, F.y + 46, `${h.gold} gold`, 15, COLORS.goldText, 1);
    this.rect(CX, F.y + 66, F.w - 44, 10, COLORS.barBack);
    const part = need > 0 ? Math.min(1, h.xp / need) : 1;
    if (part > 0) this.keep(s.add.rectangle(left + 1, F.y + 66, (F.w - 46) * part, 8, COLORS.xp).setOrigin(0, 0.5).setDepth(DEPTH.panel + 2));

    // The hero wearing his gear, and a slot for each part of him beside him.
    const top = F.y + 82;
    this.row(CX, top + 73, 150, 146);
    const data = s.textures.exists('hero') ? (s.cache.json.get('hero:data') as AtlasData | undefined) : undefined;
    if (ART.hero && data?.actions) {
      const gear = ART.gear && s.textures.exists('gear') ? ((s.cache.json.get('gear:data') as GearData | undefined) ?? null) : null;
      this.sheetHero = new HeroFigure(s, this.reg, data, gear);
      this.sheetHero.sync({ x: CX, y: top + 132, depth: DEPTH.panel + 3, facing: Math.PI / 2, moving: false, charging: false, down: false, worn: h.worn, delta: 0, flash: false, size: 2.2 });
    } else {
      this.keep(s.add.circle(CX, top + 90, 34, COLORS.hero).setStrokeStyle(3, COLORS.heroDark).setDepth(DEPTH.panel + 2));
      this.keep(s.add.circle(CX, top + 60, 16, COLORS.skin).setStrokeStyle(2, COLORS.heroDark).setDepth(DEPTH.panel + 2));
    }
    // The places on him (Robin, 2026-11-20: "Head, chest, legs, boots, necklace, two trinkets"): what covers him
    // down the left from head to foot, what he holds and his necklace down the right, his two trinkets side by
    // side under him.
    const column = (slots: Slot[], x: number): [Slot, number, number][] => slots.map((slot, i): [Slot, number, number] => [slot, x, top + 23 + i * 50]);
    const places: [Slot, number, number][] = [
      ...column(['hat', 'coat', 'legs', 'boots'], CX - 122),
      ...column(['weapon', 'shield', 'necklace'], CX + 122),
      ['trinket', CX + 72, top + 173],
      ['trinket2', CX + 122, top + 173],
    ];
    this.text(CX + 44, top + 173, 'trinkets', 13, COLORS.dim, 1);
    for (const [slot, x, y] of places) {
      const item = h.worn[slot];
      this.icon(x, y, item, slot, 46, this.selectedSlot === slot);
      this.zone(x, y, 58, 50, () => {
        this.selectedSlot = slot;
        this.selected = null;
        this.refresh();
      });
    }

    // His numbers, under him.
    const bonus = heroBonusDamage(h);
    const numbers = [
      `Health ${Math.ceil(h.hp)} of ${heroMaxHp(h)}`,
      `A swing ${N.hero.damageMin + bonus} to ${N.hero.damageMax + bonus}`,
      `Armour ${heroArmour(h)}`,
      `Crit ${Math.round(N.hero.critChance * 100)}%`,
    ];
    numbers.forEach((line, i) => this.text(i % 2 === 0 ? left + 8 : CX + 22, top + 212 + Math.floor(i / 2) * 20, line, 14, COLORS.text, 0));

    // The bag: a grid of cells, each edged in its piece's rarity; a better piece than the worn one has a mark.
    const gy = F.y + 336;
    this.text(left, gy, `Bag ${h.bag.length} of ${N.bagSize}`, 13, COLORS.dim, 0);
    this.text(right, gy, `Potions ${h.potions} of ${N.potion.carry}`, 13, COLORS.dim, 1);
    const cols = 7;
    const size = 46;
    const gap = 5;
    const gx = CX - (cols * size + (cols - 1) * gap) / 2 + size / 2;
    for (let i = 0; i < N.bagSize; i++) {
      const x = gx + (i % cols) * (size + gap);
      const y = gy + 20 + size / 2 + Math.floor(i / cols) * (size + gap);
      const item = h.bag[i];
      if (!item) {
        const empty = hasGlass(s) ? piece(s, 'slot/empty') : null;
        if (empty) this.keep(empty.setPosition(x, y).setScale(size / empty.width).setDepth(DEPTH.panel + 1).setAlpha(0.45));
        else this.rect(x, y, size, size, COLORS.panelLight, 0.4, COLORS.panelEdge, 1);
        continue;
      }
      this.icon(x, y, item, baseOf(item).slot, size, item.id === this.selected);
      if (power(item) > power(h.worn[wearSlot(h, item)])) this.text(x + 14, y - 14, '▲', 13, COLORS.good);
      this.zone(x, y, size + gap, size + gap, () => {
        this.selected = item.id;
        this.selectedSlot = null;
        this.refresh();
      });
    }

    // The card of the piece that was tapped.
    const cy = gy + 20 + 3 * (size + gap) + 4;
    const ch = 124;
    this.row(CX, cy + ch / 2, F.w - 28, ch);
    const carried = h.bag.find((i) => i.id === this.selected) ?? null;
    const wornPiece = this.selectedSlot ? h.worn[this.selectedSlot] : null;
    const item = carried ?? wornPiece;
    const by = cy + ch + 26;
    if (!item) {
      this.text(CX, cy + 46, h.bag.length === 0 ? 'The bag is empty.' : 'Tap a piece to look at it.', 15, COLORS.dim);
      this.text(CX, cy + 70, h.bag.length === 0 ? 'Loot flies to you when you walk close.' : 'Tap what he wears to take it off.', 13, COLORS.dim);
      if (this.selectedSlot) this.text(CX, cy + 94, `He wears no ${SLOT_NAMES[this.selectedSlot]}.`, 13, COLORS.dim);
    } else {
      const base = baseOf(item);
      const rarity = RARITIES[item.rarity];
      const place = wearSlot(h, item);
      const worn = h.worn[place];
      this.icon(left + 36, cy + 36, item, base.slot, 52);
      this.text(left + 76, cy + 18, itemName(item), 17, rarity.color, 0);
      this.text(left + 76, cy + 38, `${carried ? 'In the bag' : 'Worn'} · ${rarity.name.toLowerCase()} ${SLOT_NAMES[base.slot]}`, 13, COLORS.dim, 0);
      this.text(left + 76, cy + 58, statWords(item), 15, COLORS.text, 0);
      if (carried) {
        // Against what he wears, in words: green when it only gains, red when it only loses.
        const a = itemStats(item);
        const b = worn ? itemStats(worn) : { damage: 0, hp: 0, armour: 0 };
        const diffs: [number, string][] = [
          [a.damage - b.damage, 'damage'],
          [a.hp - b.hp, 'health'],
          [a.armour - b.armour, 'armour'],
        ];
        const words = diffs.filter(([d]) => d !== 0).map(([d, name]) => `${d > 0 ? '+' : '−'}${Math.abs(d)} ${name}`);
        const gains = diffs.some(([d]) => d > 0);
        const losses = diffs.some(([d]) => d < 0);
        const line = !worn ? `He wears no ${SLOT_NAMES[base.slot]}: ${words.join(', ')}` : words.length === 0 ? `The same as his ${itemName(worn)}` : `Against his ${itemName(worn)}: ${words.join(', ')}`;
        this.text(left + 8, cy + 84, line, 13, gains && !losses ? COLORS.good : losses && !gains ? COLORS.bad : COLORS.text, 0);
      } else {
        this.text(left + 8, cy + 84, 'He wears this now.', 13, COLORS.dim, 0);
      }
      this.text(left + 8, cy + 106, atShop ? `The stall gives ${sellPrice(item)} gold for it` : `Worth ${sellPrice(item)} gold at the stall`, 13, COLORS.dim, 0);

      // Only the buttons that apply.
      const buttons: [string, () => void, number][] = [];
      if (carried) {
        buttons.push([
          'Wear',
          () => {
            if (this.actions.act({ type: 'equip', item: item.id })) {
              // The selection follows the piece: it is worn now.
              this.selected = null;
              this.selectedSlot = place;
            }
            this.refresh();
          },
          COLORS.buttonGo,
        ]);
        if (atShop) {
          buttons.push([
            `Sell ${sellPrice(item)}`,
            () => {
              if (this.actions.act({ type: 'sell', item: item.id })) this.selected = null;
              this.refresh();
            },
            COLORS.button,
          ]);
        }
        buttons.push([
          'Drop',
          () => {
            if (this.actions.act({ type: 'discard', item: item.id })) this.selected = null;
            this.refresh();
          },
          COLORS.button,
        ]);
      } else if (this.selectedSlot) {
        const slot = this.selectedSlot;
        buttons.push([
          'Take off',
          () => {
            if (this.actions.act({ type: 'unequip', slot })) {
              this.selectedSlot = null;
              this.selected = item.id;
            }
            this.refresh();
          },
          COLORS.button,
        ]);
      }
      const bw = 104;
      const span = (buttons.length - 1) * (bw + 10);
      buttons.forEach(([label, press, color], i) => this.button(CX - span / 2 + i * (bw + 10), by, bw, 40, label, press, true, color));
    }

    // What he has felled, or the way back to the stall.
    if (item) return;
    if (this.selling) {
      this.button(CX, by, 200, 44, 'Back to the stall', () => this.open('shop'));
      return;
    }
    const felled = Object.keys(MONSTERS)
      .filter((kind) => (state.book[kind] ?? 0) > 0)
      .map((kind) => `${MONSTERS[kind]!.name} ${state.book[kind]}`);
    this.text(CX, by, felled.length ? `Felled: ${felled.join(', ')}  ·  Falls: ${state.deaths}` : `Nothing felled yet  ·  Falls: ${state.deaths}`, 13, COLORS.dim);
  }

  // ---- the sea chart -----------------------------------------------------------------------------------------------

  /** Sail to a place, if he stands on a dock; say so if he does not. */
  private sail(id: string): void {
    if (!this.actions.atDock()) {
      this.actions.toast('Sail from the dock');
      return;
    }
    if (this.actions.act({ type: 'sail', to: id })) this.close();
  }

  /**
   * The Art Director's chart: one picture that fills the screen, with a pin on each place the game knows, a ring
   * round the one he is in, the dotted way between them, the names under them, and his yellow button to sail.
   */
  private buildDrawnChart(state: GameState, chart: ChartArt): void {
    const s = this.scene;
    this.whole = true;
    this.keep(s.add.image(CX, H / 2, 'chart').setDisplaySize(W, H).setDepth(DEPTH.panel + 1));
    const plate = stretch(s, 'panel/title', 200, 44);
    if (plate) this.keep(plate.setPosition(chart.title.x, chart.title.y).setDepth(DEPTH.panel + 2));
    this.text(chart.title.x, chart.title.y - 1, 'Sea chart', 18, COLORS.text, 0.5, true);
    const cross = piece(s, 'button/close');
    if (cross) this.keep(cross.setPosition(W - 32, 35).setDepth(DEPTH.panel + 4));
    this.zone(W - 32, 35, 60, 60, () => this.close());

    const words = (x: number, y: number, text: string, size: number, color = '#ffffff'): void => {
      this.text(x, y, text, size, color, 0.5, true).setStroke(INK.dark, 4);
    };
    const atDock = this.actions.atDock();
    const ids = Object.keys(PLACES).filter((id) => chart.places[CHART_ART[id] ?? ''] !== undefined);
    for (const [x = 0, y = 0] of chart.route.slice(1, -1)) {
      const dot = picture(s, 'pins', 'mark/route');
      if (dot) this.keep(dot.setPosition(x, y).setDepth(DEPTH.panel + 2));
    }
    for (const id of ids) {
      const place = PLACES[id]!;
      const at = chart.places[CHART_ART[id]!]!;
      const here = id === state.place;
      if (here) {
        const ring = picture(s, 'pins', 'mark/here');
        if (ring) this.keep(ring.setPosition(at.x, at.y).setDepth(DEPTH.panel + 2));
      }
      const pin = picture(s, 'pins', place.town ? 'pin/harbour' : 'pin/island');
      if (pin) this.keep(pin.setPosition(at.x, at.y - 8).setDepth(DEPTH.panel + 3));
      // His islands are painted taller than his harbour: the name goes under the painting, not under the point.
      words(at.x, at.y + (place.town ? 56 : 76), place.town ? place.name : `${place.name}  Lv ${place.levels.replace(' to ', '-')}`, 13);
      if (here) words(at.x, at.y - 68, 'You are here', 11, '#ffe9a8');
      else this.zone(at.x, at.y - 6, 130, 150, () => this.sail(id));
    }
    const to = ids.find((id) => id !== state.place);
    if (to) {
      if (!atDock) words(chart.sail.x, chart.sail.y - 38, 'Walk down to the dock to sail.', 12);
      this.button(chart.sail.x, chart.sail.y, 236, 46, `Sail to ${PLACES[to]!.name}`, () => this.sail(to), atDock, COLORS.buttonGo);
      words(chart.sail.x, chart.sail.y + 35, 'What lies on the ground stays behind.', 11);
    }
  }

  private buildChart(state: GameState): void {
    const drawn = ART.chart && hasGlass(this.scene) && this.scene.textures.exists('chart') && this.scene.textures.exists('pins') ? (this.scene.cache.json.get('chart:places') as ChartArt | undefined) : undefined;
    if (drawn?.places && drawn.route && drawn.title && drawn.sail) {
      this.buildDrawnChart(state, drawn);
      return;
    }
    this.frame('Sea chart');
    const atDock = this.actions.atDock();
    const box = { x: F.x + 16, y: F.y + 64, w: F.w - 32, h: 500 };
    this.rect(box.x + box.w / 2, box.y + box.h / 2, box.w, box.h, COLORS.chartSea, 1, COLORS.chartLandEdge, 3);
    // A few waves, so the sea is not a flat board.
    for (let i = 0; i < 9; i++) {
      const wx = box.x + 30 + ((i * 97) % (box.w - 80));
      const wy = box.y + 40 + ((i * 151) % (box.h - 80));
      this.keep(this.scene.add.rectangle(wx, wy, 26, 3, COLORS.foam, 0.45).setDepth(DEPTH.panel + 2));
    }
    const spot = (id: string): { x: number; y: number } => ({ x: box.x + PLACES[id]!.chart.x * box.w, y: box.y + PLACES[id]!.chart.y * box.h });
    const ids = Object.keys(PLACES);
    // The way between the places, as a line of dots.
    for (let i = 1; i < ids.length; i++) {
      const a = spot(ids[i - 1]!);
      const b = spot(ids[i]!);
      for (let t = 0.14; t < 0.88; t += 0.09) this.keep(this.scene.add.circle(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2.5, COLORS.foam, 0.8).setDepth(DEPTH.panel + 2));
    }
    for (const id of ids) {
      const place = PLACES[id]!;
      const at = spot(id);
      const here = id === state.place;
      const big = place.town ? 0.8 : 1.1;
      this.keep(this.scene.add.ellipse(at.x, at.y, 92 * big, 66 * big, COLORS.chartLand).setStrokeStyle(3, here ? COLORS.buttonOn : COLORS.chartLandEdge).setDepth(DEPTH.panel + 2));
      this.keep(this.scene.add.ellipse(at.x - 6, at.y - 4, 50 * big, 30 * big, place.town ? COLORS.roofs[0] : COLORS.palm, 0.9).setDepth(DEPTH.panel + 2));
      this.text(at.x, at.y + 46 * big + 6, place.name, 15, COLORS.text, 0.5, true).setStroke(COLORS.textDark, 4);
      this.text(at.x, at.y + 46 * big + 26, place.town ? 'the harbour town' : `levels ${place.levels}`, 12, COLORS.text, 0.5, true).setStroke(COLORS.textDark, 3);
      if (here) {
        this.keep(this.scene.add.circle(at.x + 18, at.y - 10, 7, COLORS.bandana).setStrokeStyle(2, COLORS.foam).setDepth(DEPTH.panel + 3));
        this.text(at.x, at.y - 46 * big - 4, 'You are here', 12, COLORS.goldText, 0.5, true).setStroke(COLORS.textDark, 3);
      } else {
        this.zone(at.x, at.y + 14, 150, 130, () => this.sail(id));
        if (atDock) this.text(at.x, at.y - 46 * big - 4, 'Tap to sail', 13, COLORS.good, 0.5, true).setStroke(COLORS.textDark, 3);
      }
    }
    const foot = F.y + F.h - 62;
    this.text(CX, foot, atDock ? 'Tap a place to sail there.' : 'Walk to the dock to sail: the pier with the red flag.', 13, COLORS.dim);
    this.text(CX, foot + 22, 'What lies on the ground stays behind.', 12, COLORS.dim);
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
        const worn = h.worn[wearSlot(h, item)];
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
    this.text(CX, F.y + F.h - 54, 'New pieces come each time you sail in.', 12, COLORS.dim);
    this.text(CX, F.y + F.h - 36, `The stall pays about ${Math.round((SHOP.sellShare / SHOP.buyTimes) * 100)}% of what it asks.`, 12, COLORS.dim);
  }
}
