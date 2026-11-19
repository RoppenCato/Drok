// Everything that stays put on the glass: the health and rage bars, the switch between the three ways of steering,
// the target's name, the two skill buttons in an arc in the bottom corner (Robin, 2026-11-20), the stick's ring, and
// the small menu. Placed in design units (412 by 915). It draws from the state and tells the scene what was pressed;
// it decides nothing about the game.

import Phaser from 'phaser';
import { N, type GameEvent, type GameState, type RejectReason, type Scheme, type SkillId, type Vec } from '../../../rules/src/index.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES } from '../layout.ts';
import { settings } from '../settings.ts';

/** Marks an object as the glass's, so the camera that follows the hero leaves it out. */
export type Register = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

export interface HudActions {
  scheme(scheme: Scheme): void;
  skill(skill: SkillId): void;
  /** One more or one fewer monster on the field: +1 or -1. */
  monsters(change: number): void;
  log(): void;
  startOver(): void;
}

/** Somewhere a thumb can press: a box or a disc, and what it does. */
interface Zone {
  x: number;
  y: number;
  /** Half the width and height of a box; or a radius. */
  hw: number;
  hh: number;
  round: boolean;
  /** In the menu, or on the glass under it. */
  menu: boolean;
  press: () => void;
}

interface SkillButton {
  id: SkillId;
  disc: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  sub: Phaser.GameObjects.Text;
  cover: Phaser.GameObjects.Graphics;
  count: Phaser.GameObjects.Text;
  zone: Zone;
  /** How much of the cooldown was drawn last frame, so the cover is only redrawn when it changes. */
  drawn: number;
}

const W = DESIGN_WIDTH;
const H = DESIGN_HEIGHT;
const BAR_X = 60;
const BAR_W = 128;
const SKILL_RADIUS = 34;
/** The arc's corner sits above the phone's gesture bar. Cleave, pressed most, is where the thumb rests. */
const ARC = { cornerUp: 24, radius: 108, cleaveDegrees: 22, chargeDegrees: 66 };

const HELP: Record<Scheme, string> = {
  1: 'Tap the sand to walk. Tap a crab to fight it.',
  2: 'Hold a finger down: he walks towards it. He fights the nearest crab.',
  3: 'Put your thumb down anywhere and push. He fights the nearest crab.',
};

const REFUSED: Record<RejectReason, string> = {
  down: '',
  'on cooldown': 'Not ready',
  'not enough rage': 'Not enough rage',
  'no target in range': 'Nothing in range',
  'no such monster': '',
  'bad number': '',
};

export class Hud {
  /** True while the menu is open: the field takes no taps. */
  menuOpen = false;

  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly actions: HudActions;
  private readonly zones: Zone[] = [];
  private readonly skills: SkillButton[] = [];
  private readonly segments: { box: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text }[] = [];
  private readonly menu: Phaser.GameObjects.GameObject[] = [];
  private hp!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private rage!: Phaser.GameObjects.Rectangle;
  private kills!: Phaser.GameObjects.Text;
  private help!: Phaser.GameObjects.Text;
  private helpFor = 0;
  private targetName!: Phaser.GameObjects.Text;
  private targetBack!: Phaser.GameObjects.Rectangle;
  private targetBar!: Phaser.GameObjects.Rectangle;
  private toast!: Phaser.GameObjects.Text;
  private toastFor = 0;
  private downText!: Phaser.GameObjects.Text;
  private stickBase!: Phaser.GameObjects.Arc;
  private stickKnob!: Phaser.GameObjects.Arc;
  private monstersText!: Phaser.GameObjects.Text;
  private handText!: Phaser.GameObjects.Text;
  private effectsText!: Phaser.GameObjects.Text;
  private monstersWanted = 0;

  constructor(scene: Phaser.Scene, reg: Register, actions: HudActions) {
    this.scene = scene;
    this.reg = reg;
    this.actions = actions;
  }

  build(state: GameState): void {
    this.monstersWanted = state.monstersWanted;

    // Top left: the menu, then his health and rage.
    this.box(30, 30, 44, 44, COLORS.button, DEPTH.hud);
    this.words(30, 29, '≡', 26, COLORS.text, DEPTH.hud + 1);
    this.zone(30, 30, 24, 24, false, false, () => this.openMenu(true));
    this.reg(this.scene.add.rectangle(BAR_X - 2, 10, BAR_W + 4, 18, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.hp = this.reg(this.scene.add.rectangle(BAR_X, 12, BAR_W, 14, COLORS.hp).setOrigin(0).setDepth(DEPTH.hud + 1));
    this.hpText = this.words(BAR_X + BAR_W / 2, 19, '', 12, COLORS.text, DEPTH.hud + 2);
    this.reg(this.scene.add.rectangle(BAR_X - 2, 30, BAR_W + 4, 12, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.rage = this.reg(this.scene.add.rectangle(BAR_X, 32, BAR_W, 8, COLORS.rage).setOrigin(0).setDepth(DEPTH.hud + 1));
    this.kills = this.words(BAR_X, 51, '', 12, COLORS.textDark, DEPTH.hud + 1).setOrigin(0, 0.5);

    // Top right: the three ways to steer. The lit one is the one in use.
    const labels: Record<Scheme, string> = { 1: '1 Tap', 2: '2 Hold', 3: '3 Stick' };
    for (const scheme of [1, 2, 3] as const) {
      const x = 233 + (scheme - 1) * 69;
      const box = this.box(x, 30, 66, 44, COLORS.button, DEPTH.hud);
      const text = this.words(x, 30, labels[scheme], 14, COLORS.text, DEPTH.hud + 1);
      this.segments.push({ box, text });
      this.zone(x, 30, 34, 24, false, false, () => this.actions.scheme(scheme));
    }
    this.help = this.words(W / 2, 74, '', 13, COLORS.textDark, DEPTH.hud).setWordWrapWidth(W - 40).setAlign('center').setOrigin(0.5, 0);

    // Under them: who he fights.
    this.targetName = this.words(W / 2, 118, '', 13, COLORS.textDark, DEPTH.hud + 1);
    this.targetBack = this.reg(this.scene.add.rectangle(W / 2 - 61, 128, 122, 9, COLORS.barBack, 0.9).setOrigin(0).setDepth(DEPTH.hud));
    this.targetBar = this.reg(this.scene.add.rectangle(W / 2 - 60, 129, 120, 7, COLORS.hp).setOrigin(0).setDepth(DEPTH.hud + 1));

    // The stick's ring and knob (scheme 3): shown where the thumb came down.
    this.stickBase = this.reg(this.scene.add.circle(0, 0, 46).setStrokeStyle(3, COLORS.mark, 0.55).setDepth(DEPTH.hud).setVisible(false));
    this.stickKnob = this.reg(this.scene.add.circle(0, 0, 22, COLORS.mark, 0.45).setDepth(DEPTH.hud).setVisible(false));

    this.skillButton('cleave', 'Cleave', `${N.cleave.rageCost} rage`);
    this.skillButton('charge', 'Charge', 'dash');
    this.placeSkills();

    this.toast = this.words(W / 2, 705, '', 15, COLORS.warn, DEPTH.hud + 2).setStroke(COLORS.textDark, 4);
    this.downText = this.words(W / 2, 360, '', 30, COLORS.text, DEPTH.hud + 2).setStroke(COLORS.textDark, 6).setAlign('center');

    this.buildMenu();
    this.openMenu(false);
    this.setScheme(state.scheme);
  }

  /** A press at this point, in design units. True when the glass took it, so the field must not. */
  press(x: number, y: number): boolean {
    for (const z of this.zones) {
      if (z.menu !== this.menuOpen) continue;
      const hit = z.round ? Math.hypot(x - z.x, y - z.y) <= z.hw : Math.abs(x - z.x) <= z.hw && Math.abs(y - z.y) <= z.hh;
      if (hit) {
        z.press();
        return true;
      }
    }
    if (this.menuOpen) {
      // A tap beside the menu closes it.
      this.openMenu(false);
      return true;
    }
    return false;
  }

  setScheme(scheme: Scheme): void {
    this.segments.forEach((seg, i) => {
      const on = i + 1 === scheme;
      seg.box.setFillStyle(on ? COLORS.buttonOn : COLORS.button);
      seg.text.setColor(on ? COLORS.textDark : COLORS.text);
    });
    this.help.setText(HELP[scheme]);
    this.helpFor = 7000;
    this.stick(null, null);
  }

  /** The stick's ring and knob, or null to put them away. */
  stick(base: Vec | null, knob: Vec | null): void {
    this.stickBase.setVisible(base !== null);
    this.stickKnob.setVisible(knob !== null);
    if (base) this.stickBase.setPosition(base.x, base.y);
    if (knob) this.stickKnob.setPosition(knob.x, knob.y);
  }

  show(events: GameEvent[]): void {
    for (const e of events) {
      if (e.type === 'rejected' && REFUSED[e.reason]) {
        this.toast.setText(REFUSED[e.reason]);
        this.toastFor = 900;
      }
    }
  }

  sync(state: GameState, delta: number): void {
    const h = state.hero;
    this.hp.scaleX = Math.max(0, h.hp / N.hero.maxHp);
    this.hpText.setText(`${Math.ceil(h.hp)}`);
    this.rage.scaleX = Math.max(0, h.rage / N.hero.maxRage);
    this.kills.setText(`Crabs ${state.kills}   Falls ${state.deaths}`);

    this.helpFor = Math.max(0, this.helpFor - delta);
    this.help.setAlpha(Math.min(1, this.helpFor / 600));
    this.toastFor = Math.max(0, this.toastFor - delta);
    this.toast.setAlpha(Math.min(1, this.toastFor / 250));

    const target = h.target !== null ? state.monsters.find((m) => m.id === h.target) : undefined;
    this.targetName.setVisible(target !== undefined);
    this.targetBack.setVisible(target !== undefined);
    this.targetBar.setVisible(target !== undefined);
    if (target) {
      this.targetName.setText(N.monster.name);
      this.targetBar.scaleX = Math.max(0, target.hp / N.monster.maxHp);
    }

    this.downText.setText(h.downFor > 0 ? `Down!\nUp in ${Math.ceil(h.downFor)}` : '');

    for (const b of this.skills) {
      const left = b.id === 'charge' ? h.chargeCd : h.cleaveCd;
      const whole = b.id === 'charge' ? N.charge.cooldownSeconds : N.cleave.cooldownSeconds;
      const part = Math.max(0, Math.min(1, left / whole));
      const poor = b.id === 'cleave' && h.rage < N.cleave.rageCost;
      b.disc.setAlpha(poor ? 0.55 : 0.92);
      b.label.setAlpha(poor ? 0.6 : 1);
      b.count.setText(left > 0 ? `${Math.ceil(left)}` : '');
      if (part !== b.drawn) {
        b.drawn = part;
        b.cover.clear();
        if (part > 0) {
          b.cover.fillStyle(COLORS.barBack, 0.7);
          b.cover.slice(b.zone.x, b.zone.y, SKILL_RADIUS, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * part, false);
          b.cover.fillPath();
        }
      }
    }

    if (state.monstersWanted !== this.monstersWanted) {
      this.monstersWanted = state.monstersWanted;
      this.menuWords();
    }
  }

  // ---- the parts -------------------------------------------------------------------------------------------------

  private box(x: number, y: number, w: number, h: number, color: number, depth: number): Phaser.GameObjects.Rectangle {
    return this.reg(this.scene.add.rectangle(x, y, w, h, color, 0.92).setStrokeStyle(2, COLORS.panelEdge).setDepth(depth));
  }

  private words(x: number, y: number, text: string, size: number, color: string, depth: number): Phaser.GameObjects.Text {
    return this.reg(this.scene.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, resolution: RES }).setOrigin(0.5).setDepth(depth));
  }

  private zone(x: number, y: number, hw: number, hh: number, round: boolean, menu: boolean, press: () => void): Zone {
    const z: Zone = { x, y, hw, hh, round, menu, press };
    this.zones.push(z);
    return z;
  }

  private skillButton(id: SkillId, name: string, note: string): void {
    const disc = this.reg(this.scene.add.circle(0, 0, SKILL_RADIUS, COLORS.button, 0.92).setStrokeStyle(3, COLORS.panelEdge).setDepth(DEPTH.hud));
    const label = this.words(0, 0, name, 13, COLORS.text, DEPTH.hud + 1);
    const sub = this.words(0, 0, note, 10, COLORS.dim, DEPTH.hud + 1);
    const cover = this.reg(this.scene.add.graphics().setDepth(DEPTH.hud + 2));
    const count = this.words(0, 0, '', 22, COLORS.text, DEPTH.hud + 3);
    // The pressing disc is a little bigger than the drawn one: a thumb is not a pointer.
    const zone = this.zone(0, 0, SKILL_RADIUS + 8, 0, true, false, () => {
      this.actions.skill(id);
      disc.setScale(0.9);
      this.scene.tweens.add({ targets: disc, scale: 1, duration: Math.max(1, settings.ms(120)), ease: 'Back.easeOut' });
    });
    this.skills.push({ id, disc, label, sub, cover, count, zone, drawn: -1 });
  }

  /** The arc sits under the right thumb, or under the left with the hand switch. */
  private placeSkills(): void {
    const left = settings.get().leftHand;
    for (const b of this.skills) {
      const degrees = b.id === 'cleave' ? ARC.cleaveDegrees : ARC.chargeDegrees;
      const a = (degrees * Math.PI) / 180;
      const fromEdge = ARC.radius * Math.cos(a);
      const x = left ? fromEdge : W - fromEdge;
      const y = H - ARC.cornerUp - ARC.radius * Math.sin(a);
      b.zone.x = x;
      b.zone.y = y;
      b.disc.setPosition(x, y);
      b.label.setPosition(x, y - 6);
      b.sub.setPosition(x, y + 11);
      b.count.setPosition(x, y);
      b.drawn = -1;
    }
  }

  private buildMenu(): void {
    const cx = W / 2;
    const top = 250;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.menu.push(o);
      return o;
    };
    add(this.reg(this.scene.add.rectangle(cx, top + 190, 320, 420, COLORS.panel, 0.97).setStrokeStyle(3, COLORS.panelEdge).setDepth(DEPTH.panel)));
    add(this.words(cx, top + 10, 'Control test', 20, COLORS.text, DEPTH.panel + 1));

    const row = (i: number, press: () => void): Phaser.GameObjects.Text => {
      const y = top + 68 + i * 58;
      add(this.box(cx, y, 280, 48, COLORS.button, DEPTH.panel + 1));
      this.zone(cx, y, 140, 26, false, true, press);
      return add(this.words(cx, y, '', 16, COLORS.text, DEPTH.panel + 2));
    };

    // Crabs: a minus and a plus, with the number between.
    const y0 = top + 68;
    add(this.box(cx - 104, y0, 72, 48, COLORS.button, DEPTH.panel + 1));
    add(this.words(cx - 104, y0 - 1, '−', 26, COLORS.text, DEPTH.panel + 2));
    add(this.box(cx + 104, y0, 72, 48, COLORS.button, DEPTH.panel + 1));
    add(this.words(cx + 104, y0 - 1, '+', 26, COLORS.text, DEPTH.panel + 2));
    this.monstersText = add(this.words(cx, y0, '', 16, COLORS.text, DEPTH.panel + 2));
    this.zone(cx - 104, y0, 40, 28, false, true, () => this.actions.monsters(-1));
    this.zone(cx + 104, y0, 40, 28, false, true, () => this.actions.monsters(1));

    this.handText = row(1, () => {
      settings.set({ leftHand: !settings.get().leftHand });
      this.placeSkills();
      this.menuWords();
    });
    this.effectsText = row(2, () => {
      settings.set({ fewerEffects: !settings.get().fewerEffects });
      this.menuWords();
    });
    row(3, () => this.actions.log()).setText('Save the log');
    row(4, () => this.actions.startOver()).setText('Start over');
    row(5, () => this.openMenu(false)).setText('Close');
    this.menuWords();
  }

  private menuWords(): void {
    const s = settings.get();
    this.monstersText.setText(`Crabs: ${this.monstersWanted}`);
    this.handText.setText(`Buttons: ${s.leftHand ? 'left' : 'right'} hand`);
    this.effectsText.setText(`Effects: ${s.fewerEffects ? 'fewer' : 'full'}`);
  }

  private openMenu(open: boolean): void {
    this.menuOpen = open;
    for (const o of this.menu) (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(open);
  }
}
