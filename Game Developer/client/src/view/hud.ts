// Everything that stays put on the glass while he plays. At the top: the settings, his level and money, and the
// three small buttons (Robin, 2026-11-20: bag, chart and character). At the bottom, in the middle (Robin,
// 2026-11-20, after playing: "the buttons should be in the middle at the bottom"; health "all the way at top" was
// "hard to glance over. Maybe it should be at the bottom"): the skills and the potion in a row, his health and rage
// over them, and over those who he fights and its health, with the button for the thing he stands by on top of
// the pile and his experience along the very bottom. Where the pile's things stand is mine; how big each is drawn
// is Leonard, AD's (2026-11-20: his health the biggest thing in it, with a heart on its end; rage and experience
// thinner; the monster's health dark, on the plate as over its head, so the two reds are never mixed up). Then
// the stick's ring, and the words that come and go. Placed in design units (412 by 915). It draws from the state and tells the scene what
// was pressed; it decides nothing about the game. The windows are in panels.ts.
//
// It is drawn with the Art Director's pieces when his `glass` drop is in the game (glass.ts), and with plain boxes
// and discs when it is not; the places and the sizes of what can be pressed are the same either way.

import Phaser from 'phaser';
import { N, heroMaxHp, kindOf, xpToNext, type GameEvent, type GameState, type RejectReason, type SkillId, type Vec } from '../../../rules/src/index.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES } from '../layout.ts';
import { settings } from '../settings.ts';
import { Bar, INK, MobBar, hasGlass, piece, stretch } from './glass.ts';
import type { PanelKind } from './panels.ts';
import type { Thing } from './world-view.ts';

/** Marks an object as the glass's, so the camera that follows the hero leaves it out. */
export type Register = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

export interface HudActions {
  skill(skill: SkillId): void;
  potion(): void;
  /** Use the thing he stands by: open the chest, trade at the stall, look at the chart on the dock. */
  use(thing: Thing): void;
  open(panel: PanelKind): void;
}

/** Somewhere a thumb can press: a box or a disc, and what it does. */
interface Zone {
  x: number;
  y: number;
  /** Half the width and height of a box; or, for a disc, the radius in `hw`. */
  hw: number;
  hh: number;
  round: boolean;
  live: () => boolean;
  press: () => void;
}

interface Disc {
  id: SkillId | 'potion';
  disc: Phaser.GameObjects.Arc | Phaser.GameObjects.Image;
  /** The disc's size at rest: a press makes it a little smaller for a moment. */
  size: number;
  label: Phaser.GameObjects.Text | null;
  sub: Phaser.GameObjects.Text;
  cover: Phaser.GameObjects.Graphics;
  count: Phaser.GameObjects.Text;
  zone: Zone;
  radius: number;
  /** How much of the cooldown was drawn last frame, so the cover is only redrawn when it changes. */
  drawn: number;
}

const W = DESIGN_WIDTH;
const H = DESIGN_HEIGHT;
/**
 * The pile in the middle at the bottom, from the floor up (all mine but that it is there). The row of discs stands
 * clear of the phone's gesture bar; each thing above it leaves a gap a thumb's width does not need but an eye does.
 */
const ROW_Y = H - 64;
/** Along the row, from the middle: Cleave, pressed most, in the middle; the potion on the thumb's own side. */
const ROW = { charge: -84, cleave: 0, potion: 78 } as const;
const BAR_W = 200;
const BAR_X = (W - BAR_W) / 2;
const XP_Y = H - 14;
const RAGE_Y = ROW_Y - 54;
const HP_Y = RAGE_Y - 20;
const PLATE_Y = HP_Y - 38;
const USE_Y = PLATE_Y - 50;

export const HELP = 'Tap to walk or to fight. Drag anywhere to steer.';

const REFUSED: Partial<Record<RejectReason, string>> = {
  'on cooldown': 'Not ready',
  'not enough rage': 'Not enough rage',
  'no target in range': 'Nothing in range',
  'no potions': 'No potions left',
  'full health': 'Health is full',
  'chest is empty': 'The chest is empty',
  'too far': 'Too far away',
  'not at the dock': 'Sail from the dock',
  'bag is full': 'The bag is full',
  'not enough gold': 'Not enough gold',
  'potions full': 'No room for more potions',
  'sold out': 'Sold',
};

const USE: Record<Thing, string> = { chest: 'Open chest', shop: 'Trade', dock: 'Sea chart' };

export class Hud {
  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly actions: HudActions;
  private readonly zones: Zone[] = [];
  private readonly discs: Disc[] = [];
  /** Drawn with the Art Director's pieces, or with plain shapes. */
  private glass = false;
  private hp!: Bar;
  private hpText!: Phaser.GameObjects.Text;
  private rage!: Bar;
  private xp!: Bar;
  private level!: Phaser.GameObjects.Text;
  private gold!: Phaser.GameObjects.Text;
  private bag!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private help!: Phaser.GameObjects.Text;
  private helpFor = 0;
  private targetName!: Phaser.GameObjects.Text;
  private targetLevel!: Phaser.GameObjects.Text;
  private targetPlate: Phaser.GameObjects.NineSlice | null = null;
  private targetBar!: MobBar;
  /** Who the plate showed last frame: another one's bar starts afresh. */
  private targetId: number | null = null;
  private toastText!: Phaser.GameObjects.Text;
  private toastFor = 0;
  private bannerTitle!: Phaser.GameObjects.Text;
  private bannerSub!: Phaser.GameObjects.Text;
  private bannerFor = 0;
  private downText!: Phaser.GameObjects.Text;
  private lost = 0;
  private stickBase!: Phaser.GameObjects.Arc | Phaser.GameObjects.Image;
  private stickKnob!: Phaser.GameObjects.Arc | Phaser.GameObjects.Image;
  private useBox!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.NineSlice;
  private useText!: Phaser.GameObjects.Text;
  private useZone!: Zone;
  private thing: Thing | null = null;

  constructor(scene: Phaser.Scene, reg: Register, actions: HudActions) {
    this.scene = scene;
    this.reg = reg;
    this.actions = actions;
  }

  build(state: GameState): void {
    const s = this.scene;
    const g = hasGlass(s);
    this.glass = g;
    const top = DEPTH.hud;

    // Top left: the settings, then his level and his money as words on the world, a coin before the money.
    const menu = g ? piece(s, 'button/menu') : null;
    if (menu) this.reg(menu.setPosition(30, 30).setDepth(top));
    else {
      this.box(30, 30, 44, 44, COLORS.button, top);
      this.words(30, 29, '≡', 26, COLORS.text, top + 1);
    }
    this.zone(30, 30, 24, 24, false, () => this.actions.open('menu'));
    this.level = this.words(62, 30, '', 16, COLORS.text, top + 1).setOrigin(0, 0.5).setStroke(INK.dark, 4);
    const coin = g ? piece(s, 'mark/coin') : null;
    if (coin) this.reg(coin.setPosition(122, 30).setDepth(top + 1));
    this.gold = this.words(coin ? 134 : 116, 30, '', 16, coin ? COLORS.text : COLORS.goldText, top + 1).setOrigin(0, 0.5).setStroke(INK.dark, 4);

    // The bottom, in the middle: his health with its numbers and a heart on its left end, the biggest thing in the
    // pile; his rage under it, thinner and a little shorter; his experience along the floor, thinner still.
    this.hp = new Bar(s, this.reg, { x: BAR_X, y: HP_Y - 2, w: BAR_W, kind: 'hp', depth: top, plain: 14, size: 1.3, trail: true });
    const heart = g ? piece(s, 'mark/heart') : null;
    if (heart) this.reg(heart.setPosition(BAR_X + 3, HP_Y - 3).setDepth(top + 3));
    this.hpText = this.words(W / 2 + (heart ? 6 : 0), HP_Y - 3.5, '', 14, COLORS.text, top + 4).setStroke(INK.dark, 4);
    this.rage = new Bar(s, this.reg, { x: BAR_X + 16, y: RAGE_Y + 3, w: BAR_W - 16, kind: 'rage', depth: top, plain: 8, size: 0.8 });
    this.xp = new Bar(s, this.reg, { x: BAR_X, y: XP_Y, w: BAR_W, kind: 'xp', depth: top, plain: 6, size: 0.72 });

    // Top right: bag, chart, hero (Robin, 2026-11-20).
    const tops: [number, string, PanelKind][] = [
      [286, 'Bag', 'bag'],
      [334, 'Chart', 'chart'],
      [382, 'Hero', 'hero'],
    ];
    for (const [x, label, panel] of tops) {
      const drawn = g ? piece(s, `button/${panel}`) : null;
      if (drawn) {
        this.reg(drawn.setPosition(x, 30).setDepth(top));
        if (panel === 'bag') this.bag = drawn;
      } else {
        const box = this.box(x, 30, 44, 44, COLORS.button, top);
        if (panel === 'bag') this.bag = box;
        this.words(x, 30, label, 12, COLORS.text, top + 1);
      }
      this.zone(x, 30, 23, 24, false, () => this.actions.open(panel));
    }
    this.help = this.words(W / 2, 66, '', 13, COLORS.text, top).setWordWrapWidth(W - 40).setAlign('center').setOrigin(0.5, 0).setStroke(INK.dark, 4);

    // Over his own health: who he fights. On the Art Director's glass, a plate with the name and the level, and on
    // its foot the monster's own dark bar, the same as over its head; the two healths sit one over the other, so
    // one glance takes in the fight.
    if (g) {
      this.targetPlate = stretch(s, 'plate', BAR_W, 34);
      if (this.targetPlate) this.reg(this.targetPlate.setPosition(W / 2, PLATE_Y - 6).setDepth(top));
    }
    this.targetName = this.words(g ? W / 2 - 84 : W / 2, PLATE_Y - 11, '', 14, g ? INK.dark : COLORS.text, top + 1);
    this.targetLevel = this.words(W / 2 + 84, PLATE_Y - 11, '', 12, INK.dim, top + 1).setOrigin(1, 0.5);
    if (g) this.targetName.setOrigin(0, 0.5);
    else this.targetName.setStroke(INK.dark, 4);
    // On the plate the bar is always "the one he fights", so it is drawn a fifth bigger: its fill is 172 long as
    // drawn (Leonard, AD), which keeps the whole bar, 184 long, inside the plate's 200.
    this.targetBar = new MobBar(s, this.reg, { w: g ? 172 / 1.2 : 176, depth: top + 2, arrow: false });

    // The stick's ring and knob: shown where the thumb came down, once it has slid. His pictures carry their own
    // see-through, so they are drawn at full strength.
    const ring = g ? piece(s, 'stick/ring') : null;
    const knob = g ? piece(s, 'stick/knob') : null;
    this.stickBase = this.reg((ring ?? s.add.circle(0, 0, 46).setStrokeStyle(3, COLORS.mark, 0.55)).setDepth(top).setVisible(false));
    this.stickKnob = this.reg((knob ?? s.add.circle(0, 0, 22, COLORS.mark, 0.45)).setDepth(top + 1).setVisible(false));

    this.disc('cleave', 'Cleave', `${N.cleave.rageCost} rage`, 36, () => this.actions.skill('cleave'));
    this.disc('charge', 'Charge', 'dash', 36, () => this.actions.skill('charge'));
    this.disc('potion', 'Potion', '', 28, () => this.actions.potion());

    // The button for the thing he stands by: it is only there when there is something to use.
    const pill = g ? stretch(s, 'button/context', 156, 48) : null;
    this.useBox = this.reg((pill ?? s.add.rectangle(0, 0, 150, 46, COLORS.buttonGo, 0.95).setStrokeStyle(3, COLORS.foam)).setDepth(top).setVisible(false));
    this.useText = this.words(0, 0, '', pill ? 17 : 16, pill ? INK.dark : COLORS.text, top + 1).setVisible(false);
    this.useZone = this.zone(0, 0, 80, 28, false, () => {
      if (this.thing) this.actions.use(this.thing);
    });
    this.useZone.live = () => this.thing !== null;
    this.place();

    // Over the windows too: a refusal inside a window must be read. It stands just over the pile.
    this.toastText = this.words(W / 2, USE_Y - 44, '', 15, COLORS.warn, DEPTH.banner).setStroke(COLORS.textDark, 4);
    this.bannerTitle = this.words(W / 2, 210, '', 30, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 6);
    this.bannerSub = this.words(W / 2, 246, '', 15, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 4);
    this.downText = this.words(W / 2, 360, '', 28, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 6).setAlign('center');
    this.setHelp(HELP);
  }

  /** A press at this point, in design units. True when the glass took it, so the field must not. */
  press(x: number, y: number): boolean {
    for (const z of this.zones) {
      if (!z.live()) continue;
      const hit = z.round ? Math.hypot(x - z.x, y - z.y) <= z.hw : Math.abs(x - z.x) <= z.hw && Math.abs(y - z.y) <= z.hh;
      if (hit) {
        z.press();
        return true;
      }
    }
    return false;
  }

  /** A line of help under the top bar, for a few seconds. */
  setHelp(text: string): void {
    this.help.setText(text);
    this.helpFor = 7000;
  }

  /** Words that matter for a moment, in the middle of the glass's lower half. */
  toast(text: string): void {
    this.toastText.setText(text);
    this.toastFor = 1300;
  }

  /** Big words across the top: a new place, a new level. */
  banner(title: string, sub: string): void {
    this.bannerTitle.setText(title);
    this.bannerSub.setText(sub);
    this.bannerFor = 2600;
  }

  /** The thing he stands by, or null: the button comes and goes with it. */
  setThing(thing: Thing | null): void {
    if (thing === this.thing) return;
    this.thing = thing;
    this.useBox.setVisible(thing !== null);
    this.useText.setVisible(thing !== null).setText(thing ? USE[thing] : '');
  }

  /** The stick's ring and knob, or null to put them away. */
  stick(base: Vec | null, knob: Vec | null): void {
    this.stickBase.setVisible(base !== null);
    this.stickKnob.setVisible(knob !== null);
    if (base) this.stickBase.setPosition(base.x, base.y);
    if (knob) this.stickKnob.setPosition(knob.x, knob.y);
  }

  /** The row in the middle at the bottom; the hand switch turns it round, so the potion is on the thumb's side. */
  place(): void {
    const side = settings.get().leftHand ? -1 : 1;
    for (const d of this.discs) {
      const x = W / 2 + ROW[d.id] * side;
      // The smaller potion disc stands on the same floor as the two big ones.
      const y = ROW_Y + (36 - d.radius);
      d.zone.x = x;
      d.zone.y = y;
      d.disc.setPosition(x, y);
      d.label?.setPosition(x, d.id === 'potion' ? y - 3 : y - 6);
      // On his discs the picture says what it is; only the potion's count is written, at its foot.
      d.sub.setPosition(this.glass ? x + d.radius * 0.55 : x, this.glass ? y + d.radius * 0.6 : y + 11);
      d.count.setPosition(x, y);
      d.drawn = -1;
    }
    // The button for the thing he stands by tops the pile, in the middle.
    const ux = W / 2;
    const uy = USE_Y - 6;
    this.useZone.x = ux;
    this.useZone.y = uy;
    this.useBox.setPosition(ux, uy);
    this.useText.setPosition(ux, uy);
  }

  show(events: GameEvent[], state: GameState): void {
    for (const e of events) {
      if (e.type === 'rejected') {
        const words = REFUSED[e.reason];
        if (words) this.toast(words);
      } else if (e.type === 'levelUp') {
        this.banner(`Level ${e.level}`, e.level >= N.levels.max ? 'As far as this chapter goes' : 'Stronger, and whole again');
      } else if (e.type === 'heroDown') {
        this.lost = e.lost;
      } else if (e.type === 'bagFull') {
        this.toast('The bag is full');
      } else if (e.type === 'picked' && e.drop.item && state.hero.bag.length >= N.bagSize) {
        this.toast('The bag is full now');
      }
    }
  }

  sync(state: GameState, delta: number): void {
    const h = state.hero;
    const max = heroMaxHp(h);
    this.hp.set(h.hp / max, delta);
    this.hpText.setText(`${Math.ceil(h.hp)} / ${max}`);
    this.rage.set(h.rage / N.hero.maxRage);
    const need = xpToNext(h.level);
    this.xp.set(need > 0 ? h.xp / need : 1);
    this.level.setText(`Lv ${h.level}`);
    this.gold.setText(this.glass ? `${h.gold}` : `${h.gold} gold`);
    // A full bag shows on its button.
    const full = h.bag.length >= N.bagSize;
    if (this.bag instanceof Phaser.GameObjects.Image) {
      if (full) this.bag.setTint(0xffb347);
      else this.bag.clearTint();
    } else {
      this.bag.setFillStyle(full ? COLORS.rage : COLORS.button);
    }

    this.helpFor = Math.max(0, this.helpFor - delta);
    this.help.setAlpha(Math.min(1, this.helpFor / 600));
    this.toastFor = Math.max(0, this.toastFor - delta);
    this.toastText.setAlpha(Math.min(1, this.toastFor / 250));
    this.bannerFor = Math.max(0, this.bannerFor - delta);
    const shown = Math.min(1, this.bannerFor / 500);
    this.bannerTitle.setAlpha(shown);
    this.bannerSub.setAlpha(shown);

    const target = h.target !== null ? state.monsters.find((m) => m.id === h.target) : undefined;
    const has = target !== undefined;
    this.targetName.setVisible(has);
    this.targetLevel.setVisible(has && this.glass);
    this.targetPlate?.setVisible(has);
    if (target) {
      const k = kindOf(target);
      this.targetName.setText(this.glass ? k.name : `${k.name}  ·  level ${k.level}`);
      this.targetLevel.setText(`Lv ${k.level}`);
      if (target.id !== this.targetId) this.targetBar.reset();
      this.targetBar.draw(W / 2, PLATE_Y + 9, target.hp / k.maxHp, true, delta);
    } else {
      this.targetBar.hide();
    }
    this.targetId = target ? target.id : null;

    this.downText.setText(h.downFor > 0 ? `Down!\n${this.lost > 0 ? `Lost ${this.lost} gold\n` : ''}Waking in ${Math.ceil(h.downFor)}` : '');

    for (const d of this.discs) {
      const left = d.id === 'charge' ? h.chargeCd : d.id === 'cleave' ? h.cleaveCd : h.potionCd;
      const whole = d.id === 'charge' ? N.charge.cooldownSeconds : d.id === 'cleave' ? N.cleave.cooldownSeconds : N.potion.cooldownSeconds;
      const part = Math.max(0, Math.min(1, left / whole));
      const poor = (d.id === 'cleave' && h.rage < N.cleave.rageCost) || (d.id === 'potion' && h.potions <= 0);
      d.disc.setAlpha(poor ? 0.5 : this.glass ? 1 : 0.92);
      d.label?.setAlpha(poor ? 0.6 : 1);
      d.count.setText(left > 0 ? `${Math.ceil(left)}` : '');
      if (d.id === 'potion') d.sub.setText(`${h.potions}`);
      if (part !== d.drawn) {
        d.drawn = part;
        d.cover.clear();
        if (part > 0) {
          d.cover.fillStyle(COLORS.barBack, 0.7);
          d.cover.slice(d.zone.x, d.zone.y, d.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * part, false);
          d.cover.fillPath();
        }
      }
    }
  }

  // ---- the parts -------------------------------------------------------------------------------------------------

  private box(x: number, y: number, w: number, h: number, color: number, depth: number): Phaser.GameObjects.Rectangle {
    return this.reg(this.scene.add.rectangle(x, y, w, h, color, 0.92).setStrokeStyle(2, COLORS.panelEdge).setDepth(depth));
  }

  private words(x: number, y: number, text: string, size: number, color: string, depth: number): Phaser.GameObjects.Text {
    return this.reg(this.scene.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, resolution: RES }).setOrigin(0.5).setDepth(depth));
  }

  private zone(x: number, y: number, hw: number, hh: number, round: boolean, press: () => void): Zone {
    const z: Zone = { x, y, hw, hh, round, live: () => true, press };
    this.zones.push(z);
    return z;
  }

  private disc(id: Disc['id'], name: string, note: string, radius: number, press: () => void): void {
    const potion = id === 'potion';
    const drawn = this.glass ? piece(this.scene, `skill/${id}`) : null;
    let disc: Disc['disc'];
    let label: Phaser.GameObjects.Text | null = null;
    let sub: Phaser.GameObjects.Text;
    if (drawn) {
      // His disc is 76 across; it is drawn at this button's own size.
      disc = this.reg(drawn.setScale((radius * 2) / drawn.width).setDepth(DEPTH.hud));
      sub = this.words(0, 0, '', 13, COLORS.text, DEPTH.hud + 1).setStroke(INK.dark, 4);
    } else {
      disc = this.reg(this.scene.add.circle(0, 0, radius, potion ? COLORS.potion : COLORS.button, 0.92).setStrokeStyle(3, potion ? COLORS.foam : COLORS.panelEdge).setDepth(DEPTH.hud));
      label = this.words(0, 0, name, potion ? 11 : 13, COLORS.text, DEPTH.hud + 1);
      sub = this.words(0, 0, note, potion ? 12 : 10, potion ? COLORS.text : COLORS.dim, DEPTH.hud + 1);
    }
    const size = disc.scaleX;
    const cover = this.reg(this.scene.add.graphics().setDepth(DEPTH.hud + 2));
    const count = this.words(0, 0, '', 22, COLORS.text, DEPTH.hud + 3).setStroke(INK.dark, 4);
    // The pressing disc is a little bigger than the drawn one: a thumb is not a pointer.
    const zone = this.zone(0, 0, radius + 8, 0, true, () => {
      press();
      disc.setScale(size * 0.9);
      this.scene.tweens.add({ targets: disc, scale: size, duration: Math.max(1, settings.ms(120)), ease: 'Back.easeOut' });
    });
    this.discs.push({ id, disc, size, label, sub, cover, count, zone, radius, drawn: -1 });
  }
}
