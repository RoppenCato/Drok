// Everything that stays put on the glass while he plays: health, rage and experience, his level and money, the
// three small buttons at the top (Robin, 2026-11-20: bag, chart and character), the target's name, the skills in an
// arc in the bottom corner with the potion beside them, the button that uses the thing he stands by, the stick's
// ring, and the words that come and go. Placed in design units (412 by 915). It draws from the state and tells the
// scene what was pressed; it decides nothing about the game. The windows are in panels.ts.

import Phaser from 'phaser';
import { N, heroMaxHp, kindOf, xpToNext, type GameEvent, type GameState, type RejectReason, type Scheme, type SkillId, type Vec } from '../../../rules/src/index.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES } from '../layout.ts';
import { settings } from '../settings.ts';
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
  disc: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
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
const BAR_X = 60;
const BAR_W = 128;
/** The arc's corner sits above the phone's gesture bar. Cleave, pressed most, is where the thumb rests. */
const ARC = { cornerUp: 24, cleave: [108, 22], charge: [108, 66], potion: [176, 44] } as const;

export const HELP: Record<Scheme, string> = {
  1: 'Tap the ground to walk. Tap a monster to fight it.',
  2: 'Hold a finger down: he walks towards it and fights the nearest monster.',
  3: 'Put your thumb down anywhere and push. He fights the nearest monster.',
};

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
  private hp!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private rage!: Phaser.GameObjects.Rectangle;
  private xp!: Phaser.GameObjects.Rectangle;
  private level!: Phaser.GameObjects.Text;
  private gold!: Phaser.GameObjects.Text;
  private bagBox!: Phaser.GameObjects.Rectangle;
  private help!: Phaser.GameObjects.Text;
  private helpFor = 0;
  private targetName!: Phaser.GameObjects.Text;
  private targetBack!: Phaser.GameObjects.Rectangle;
  private targetBar!: Phaser.GameObjects.Rectangle;
  private toastText!: Phaser.GameObjects.Text;
  private toastFor = 0;
  private bannerTitle!: Phaser.GameObjects.Text;
  private bannerSub!: Phaser.GameObjects.Text;
  private bannerFor = 0;
  private downText!: Phaser.GameObjects.Text;
  private lost = 0;
  private stickBase!: Phaser.GameObjects.Arc;
  private stickKnob!: Phaser.GameObjects.Arc;
  private useBox!: Phaser.GameObjects.Rectangle;
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

    // Top left: the settings, then his health, rage and experience, his level and his money.
    this.box(30, 30, 44, 44, COLORS.button, DEPTH.hud);
    this.words(30, 29, '≡', 26, COLORS.text, DEPTH.hud + 1);
    this.zone(30, 30, 24, 24, false, () => this.actions.open('menu'));
    this.reg(s.add.rectangle(BAR_X - 2, 8, BAR_W + 4, 40, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.hp = this.reg(s.add.rectangle(BAR_X, 10, BAR_W, 16, COLORS.hp).setOrigin(0).setDepth(DEPTH.hud + 1));
    this.hpText = this.words(BAR_X + BAR_W / 2, 18, '', 12, COLORS.text, DEPTH.hud + 2);
    this.rage = this.reg(s.add.rectangle(BAR_X, 29, BAR_W, 8, COLORS.rage).setOrigin(0).setDepth(DEPTH.hud + 1));
    this.xp = this.reg(s.add.rectangle(BAR_X, 40, BAR_W, 6, COLORS.xp).setOrigin(0).setDepth(DEPTH.hud + 1));
    this.reg(s.add.rectangle(194, 8, 62, 40, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.level = this.words(225, 19, '', 13, COLORS.text, DEPTH.hud + 1);
    this.gold = this.words(225, 37, '', 13, COLORS.goldText, DEPTH.hud + 1);

    // Top right: bag, chart, hero (Robin, 2026-11-20).
    const tops: [number, string, PanelKind][] = [
      [286, 'Bag', 'bag'],
      [334, 'Chart', 'chart'],
      [382, 'Hero', 'hero'],
    ];
    for (const [x, label, panel] of tops) {
      const box = this.box(x, 30, 44, 44, COLORS.button, DEPTH.hud);
      if (panel === 'bag') this.bagBox = box;
      this.words(x, 30, label, 12, COLORS.text, DEPTH.hud + 1);
      this.zone(x, 30, 23, 24, false, () => this.actions.open(panel));
    }
    this.help = this.words(W / 2, 60, '', 13, COLORS.textDark, DEPTH.hud).setWordWrapWidth(W - 40).setAlign('center').setOrigin(0.5, 0);

    // Under them: who he fights.
    this.targetName = this.words(W / 2, 104, '', 13, COLORS.textDark, DEPTH.hud + 1);
    this.targetBack = this.reg(s.add.rectangle(W / 2 - 61, 114, 122, 9, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.targetBar = this.reg(s.add.rectangle(W / 2 - 60, 115, 120, 7, COLORS.hp).setOrigin(0).setDepth(DEPTH.hud + 1));

    // The stick's ring and knob (scheme 3): shown where the thumb came down.
    this.stickBase = this.reg(s.add.circle(0, 0, 46).setStrokeStyle(3, COLORS.mark, 0.55).setDepth(DEPTH.hud).setVisible(false));
    this.stickKnob = this.reg(s.add.circle(0, 0, 22, COLORS.mark, 0.45).setDepth(DEPTH.hud).setVisible(false));

    this.disc('cleave', 'Cleave', `${N.cleave.rageCost} rage`, 34, () => this.actions.skill('cleave'));
    this.disc('charge', 'Charge', 'dash', 34, () => this.actions.skill('charge'));
    this.disc('potion', 'Potion', '', 27, () => this.actions.potion());

    // The button for the thing he stands by: it is only there when there is something to use.
    this.useBox = this.reg(s.add.rectangle(0, 0, 150, 46, COLORS.buttonGo, 0.95).setStrokeStyle(3, COLORS.foam).setDepth(DEPTH.hud).setVisible(false));
    this.useText = this.words(0, 0, '', 16, COLORS.text, DEPTH.hud + 1).setVisible(false);
    this.useZone = this.zone(0, 0, 80, 28, false, () => {
      if (this.thing) this.actions.use(this.thing);
    });
    this.useZone.live = () => this.thing !== null;
    this.place();

    // Over the windows too: a refusal inside a window must be read.
    this.toastText = this.words(W / 2, 690, '', 15, COLORS.warn, DEPTH.banner).setStroke(COLORS.textDark, 4);
    this.bannerTitle = this.words(W / 2, 210, '', 30, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 6);
    this.bannerSub = this.words(W / 2, 246, '', 15, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 4);
    this.downText = this.words(W / 2, 360, '', 28, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 6).setAlign('center');
    this.setHelp(HELP[state.scheme]);
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

  /** The arc sits under the right thumb, or under the left with the hand switch; the use button on the other side. */
  place(): void {
    const left = settings.get().leftHand;
    for (const d of this.discs) {
      const [radius, degrees] = ARC[d.id];
      const a = (degrees * Math.PI) / 180;
      const fromEdge = radius * Math.cos(a);
      const x = left ? fromEdge : W - fromEdge;
      const y = H - ARC.cornerUp - radius * Math.sin(a);
      d.zone.x = x;
      d.zone.y = y;
      d.disc.setPosition(x, y);
      d.label.setPosition(x, d.id === 'potion' ? y - 3 : y - 6);
      d.sub.setPosition(x, y + 11);
      d.count.setPosition(x, y);
      d.drawn = -1;
    }
    const ux = left ? W - 104 : 104;
    this.useZone.x = ux;
    this.useZone.y = 852;
    this.useBox.setPosition(ux, 852);
    this.useText.setPosition(ux, 852);
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
    this.hp.scaleX = Math.max(0, Math.min(1, h.hp / max));
    this.hpText.setText(`${Math.ceil(h.hp)} / ${max}`);
    this.rage.scaleX = Math.max(0, h.rage / N.hero.maxRage);
    const need = xpToNext(h.level);
    this.xp.scaleX = need > 0 ? Math.min(1, h.xp / need) : 1;
    this.level.setText(`Level ${h.level}`);
    this.gold.setText(`${h.gold} gold`);
    this.bagBox.setFillStyle(h.bag.length >= N.bagSize ? COLORS.rage : COLORS.button);

    this.helpFor = Math.max(0, this.helpFor - delta);
    this.help.setAlpha(Math.min(1, this.helpFor / 600));
    this.toastFor = Math.max(0, this.toastFor - delta);
    this.toastText.setAlpha(Math.min(1, this.toastFor / 250));
    this.bannerFor = Math.max(0, this.bannerFor - delta);
    const shown = Math.min(1, this.bannerFor / 500);
    this.bannerTitle.setAlpha(shown);
    this.bannerSub.setAlpha(shown);

    const target = h.target !== null ? state.monsters.find((m) => m.id === h.target) : undefined;
    this.targetName.setVisible(target !== undefined);
    this.targetBack.setVisible(target !== undefined);
    this.targetBar.setVisible(target !== undefined);
    if (target) {
      const k = kindOf(target);
      this.targetName.setText(`${k.name}  ·  level ${k.level}`);
      this.targetBar.scaleX = Math.max(0, target.hp / k.maxHp);
    }

    this.downText.setText(h.downFor > 0 ? `Down!\n${this.lost > 0 ? `Lost ${this.lost} gold\n` : ''}Waking in ${Math.ceil(h.downFor)}` : '');

    for (const d of this.discs) {
      const left = d.id === 'charge' ? h.chargeCd : d.id === 'cleave' ? h.cleaveCd : h.potionCd;
      const whole = d.id === 'charge' ? N.charge.cooldownSeconds : d.id === 'cleave' ? N.cleave.cooldownSeconds : N.potion.cooldownSeconds;
      const part = Math.max(0, Math.min(1, left / whole));
      const poor = (d.id === 'cleave' && h.rage < N.cleave.rageCost) || (d.id === 'potion' && h.potions <= 0);
      d.disc.setAlpha(poor ? 0.55 : 0.92);
      d.label.setAlpha(poor ? 0.6 : 1);
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
    const disc = this.reg(this.scene.add.circle(0, 0, radius, potion ? COLORS.potion : COLORS.button, 0.92).setStrokeStyle(3, potion ? COLORS.foam : COLORS.panelEdge).setDepth(DEPTH.hud));
    const label = this.words(0, 0, name, potion ? 11 : 13, COLORS.text, DEPTH.hud + 1);
    const sub = this.words(0, 0, note, potion ? 12 : 10, potion ? COLORS.text : COLORS.dim, DEPTH.hud + 1);
    const cover = this.reg(this.scene.add.graphics().setDepth(DEPTH.hud + 2));
    const count = this.words(0, 0, '', 22, COLORS.text, DEPTH.hud + 3);
    // The pressing disc is a little bigger than the drawn one: a thumb is not a pointer.
    const zone = this.zone(0, 0, radius + 8, 0, true, () => {
      press();
      disc.setScale(0.9);
      this.scene.tweens.add({ targets: disc, scale: 1, duration: Math.max(1, settings.ms(120)), ease: 'Back.easeOut' });
    });
    this.discs.push({ id, disc, label, sub, cover, count, zone, radius, drawn: -1 });
  }
}
