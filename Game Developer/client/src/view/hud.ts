// Everything that stays put on the glass while he plays. At the top: the settings, his level and money, and the
// three small buttons (Robin, 2026-11-20: bag, chart and character). At the bottom, in the middle (Robin,
// 2026-11-20, after playing: "the buttons should be in the middle at the bottom"): the skills and the potion in a
// row, over them a plate with the name and level of the one he fights, on top of that the button for the thing he
// stands by, and his experience along the very bottom. His own health and rage are not here: they go with him over
// his head (Robin, 2026-11-20; world-view.ts), and a monster's health is over its own. Where the pile's things
// stand is mine. Then the stick's ring, and the words that come and go. Placed in design units (412 by 915). It
// draws from the state and tells the scene what was pressed; it decides nothing about the game. The windows are in
// panels.ts.
//
// It is drawn with the Art Director's pieces when his `glass` drop is in the game (glass.ts), and with plain boxes
// and discs when it is not; the places and the sizes of what can be pressed are the same either way.

import Phaser from 'phaser';
import { N, SKILLS, cooldownLeft, kindOf, skillCost, xpToNext, type GameEvent, type GameState, type RejectReason, type SkillId, type Vec } from '../../../rules/src/index.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES, WEIGHT } from '../layout.ts';
import { settings } from '../settings.ts';
import { repicture } from './figures.ts';
import { Bar, INK, hasGlass, piece, stretch } from './glass.ts';
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
  /** A place on the glass: the two skills he carries (the first in the middle), and the potion. */
  id: 'slot0' | 'slot1' | 'potion';
  /** The skill this disc shows just now. */
  skill: SkillId | null;
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
const ROW = { slot1: -84, slot0: 0, potion: 78 } as const;
const BAR_W = 200;
const BAR_X = (W - BAR_W) / 2;
const XP_Y = H - 14;
const PLATE_Y = ROW_Y - 63;
const USE_Y = PLATE_Y - 49;

export const HELP = 'Tap to walk or to fight. Drag anywhere to steer.';

const REFUSED: Partial<Record<RejectReason, string>> = {
  'on cooldown': 'Not ready',
  'not enough rage': 'Not enough rage',
  'no target in range': 'Nothing in range',
  'not learnt': 'Not learnt yet',
  'not equipped': 'Not on a button',
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

/**
 * A place's name comes up just under the top buttons (Leonard, AD, 2026-11-20): he walks north into most places, so
 * what a place shows him first comes in above his head, and a banner there covered the very thing it names.
 */
const BANNER_Y = 84;

export class Hud {
  /** The skills he carries, as the last frame had them: what the two discs press. */
  private slots: SkillId[] = [];
  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly actions: HudActions;
  private readonly zones: Zone[] = [];
  private readonly discs: Disc[] = [];
  /** Drawn with the Art Director's pieces, or with plain shapes. */
  private glass = false;
  private xp!: Bar;
  private level!: Phaser.GameObjects.Text;
  private gold!: Phaser.GameObjects.Text;
  private bag!: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private help!: Phaser.GameObjects.Text;
  private helpFor = 0;
  private targetName!: Phaser.GameObjects.Text;
  private targetLevel!: Phaser.GameObjects.Text;
  private targetPlate: Phaser.GameObjects.NineSlice | null = null;
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

    // Along the floor: his experience, thin (0.72 of the Art Director's size, his number).
    this.xp = new Bar(s, this.reg, { x: BAR_X, y: XP_Y, w: BAR_W, kind: 'xp', depth: top, plain: 6, size: 0.72 });

    // Top right: bag, chart, hero (Robin, 2026-11-20).
    const tops: [number, string, PanelKind][] = [
      [286, 'Bag', 'bag'],
      [334, 'Chart', 'chart'],
      [382, 'Skills', 'skills'],
    ];
    for (const [x, label, panel] of tops) {
      const drawn = g ? (piece(s, `button/${panel}`) ?? (panel === 'skills' ? piece(s, 'button/hero') : null)) : null;
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

    // Right over the buttons: who he fights. On the Art Director's glass, a plate with the name and the level;
    // its health is over its own head, where the eye is in a fight.
    if (g) {
      this.targetPlate = stretch(s, 'plate', BAR_W, 34);
      if (this.targetPlate) this.reg(this.targetPlate.setPosition(W / 2, PLATE_Y).setDepth(top));
    }
    this.targetName = this.words(g ? W / 2 - 84 : W / 2, PLATE_Y - 2, '', 14, g ? INK.dark : COLORS.text, top + 1);
    this.targetLevel = this.words(W / 2 + 84, PLATE_Y - 2, '', 12, INK.dim, top + 1).setOrigin(1, 0.5);
    if (g) this.targetName.setOrigin(0, 0.5);
    else this.targetName.setStroke(INK.dark, 4);

    // The stick's ring and knob: shown where the thumb came down, once it has slid. His pictures carry their own
    // see-through, so they are drawn at full strength.
    const ring = g ? piece(s, 'stick/ring') : null;
    const knob = g ? piece(s, 'stick/knob') : null;
    this.stickBase = this.reg((ring ?? s.add.circle(0, 0, 46).setStrokeStyle(3, COLORS.mark, 0.55)).setDepth(top).setVisible(false));
    this.stickKnob = this.reg((knob ?? s.add.circle(0, 0, 22, COLORS.mark, 0.45)).setDepth(top + 1).setVisible(false));

    // The two skills he carries: whichever they are (Robin, 2026-11-20: skills to choose between).
    for (const i of [0, 1]) {
      this.disc(i === 0 ? 'slot0' : 'slot1', '', '', 36, () => {
        const id = this.slots[i];
        if (id) this.actions.skill(id);
      });
    }
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
    this.toastText = this.words(W / 2, USE_Y - 38, '', 15, COLORS.warn, DEPTH.banner).setStroke(COLORS.textDark, 4);
    this.bannerTitle = this.words(W / 2, BANNER_Y, '', 30, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 6);
    this.bannerSub = this.words(W / 2, BANNER_Y + 34, '', 15, COLORS.text, DEPTH.banner).setStroke(COLORS.textDark, 4);
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
      if (d.id === 'potion' || !this.glass) d.sub.setPosition(this.glass ? x + d.radius * 0.55 : x, this.glass ? y + d.radius * 0.6 : y + 11);
      else d.sub.setPosition(x, y - 1);
      d.count.setPosition(x, y);
      d.drawn = -1;
    }
    // The button for the thing he stands by tops the pile, in the middle.
    const ux = W / 2;
    const uy = USE_Y;
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
      } else if (e.type === 'skillLearnt') {
        this.toast(`New skill: ${SKILLS[e.skill].name}`);
        this.toastFor = 2600;
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
      this.bag.setFillStyle(full ? COLORS.buttonOn : COLORS.button);
    }

    this.helpFor = Math.max(0, this.helpFor - delta);
    this.help.setAlpha(Math.min(1, this.helpFor / 600));
    this.toastFor = Math.max(0, this.toastFor - delta);
    this.toastText.setAlpha(Math.min(1, this.toastFor / 250));
    this.bannerFor = Math.max(0, this.bannerFor - delta);
    const shown = Math.min(1, this.bannerFor / 500);
    this.bannerTitle.setAlpha(shown);
    this.bannerSub.setAlpha(shown);
    // Under the help line while that is up.
    const under = this.helpFor > 0 && this.help.text !== '' ? this.help.y + this.help.height - BANNER_Y + 22 : 0;
    this.bannerTitle.setY(BANNER_Y + Math.max(0, under));
    this.bannerSub.setY(BANNER_Y + 34 + Math.max(0, under));

    const target = h.target !== null ? state.monsters.find((m) => m.id === h.target) : undefined;
    const has = target !== undefined;
    this.targetName.setVisible(has);
    this.targetLevel.setVisible(has && this.glass);
    this.targetPlate?.setVisible(has);
    if (target) {
      const k = kindOf(target);
      this.targetName.setText(this.glass ? k.name : `${k.name}  ·  level ${k.level}`);
      this.targetLevel.setText(`Lv ${k.level}`);
    }

    this.downText.setText(h.downFor > 0 ? `Down!\n${this.lost > 0 ? `Lost ${this.lost} gold\n` : ''}Waking in ${Math.ceil(h.downFor)}` : '');

    this.slots = h.slots;
    for (const d of this.discs) {
      const skill = d.id === 'slot0' ? (h.slots[0] ?? null) : d.id === 'slot1' ? (h.slots[1] ?? null) : null;
      if (d.id !== 'potion' && skill !== d.skill) this.dress(d, skill);
      const cost = skill ? skillCost(skill) : null;
      const left = skill ? cooldownLeft(h, skill) : d.id === 'potion' ? h.potionCd : 0;
      const whole = cost ? Math.max(0.1, cost.cooldown) : N.potion.cooldownSeconds;
      const part = Math.max(0, Math.min(1, left / whole));
      const poor = (cost !== null && h.rage < cost.rage) || (d.id === 'potion' && h.potions <= 0);
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
    return this.reg(this.scene.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: WEIGHT, color, resolution: RES }).setOrigin(0.5).setDepth(depth));
  }

  private zone(x: number, y: number, hw: number, hh: number, round: boolean, press: () => void): Zone {
    const z: Zone = { x, y, hw, hh, round, live: () => true, press };
    this.zones.push(z);
    return z;
  }

  private disc(id: Disc['id'], name: string, note: string, radius: number, press: () => void): void {
    const potion = id === 'potion';
    const drawn = this.glass ? piece(this.scene, potion ? 'skill/potion' : 'skill/empty') : null;
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
    this.discs.push({ id, skill: null, disc, size, label, sub, cover, count, zone, radius, drawn: -1 });
  }

  /** A skill disc takes the picture of the skill it now holds: his picture of it, or his empty disc with its letters. */
  private dress(d: Disc, skill: SkillId | null): void {
    d.skill = skill;
    const letters = skill
      ? SKILLS[skill].name
          .split(' ')
          .map((w) => w[0]!.toUpperCase())
          .join('')
      : '';
    if (d.disc instanceof Phaser.GameObjects.Image) {
      const data = this.scene.cache.json.get('glass:data') as { items?: Record<string, unknown> } | undefined;
      const own = skill !== null && data?.items?.[`skill/${skill}`] !== undefined;
      repicture(this.scene, d.disc, 'glass', own ? `skill/${skill}` : 'skill/empty');
      d.sub.setText(own ? '' : letters);
      d.sub.setFontSize(own ? 13 : 20);
      d.sub.setPosition(d.zone.x, d.zone.y - 1);
    } else {
      d.label?.setText(skill ? SKILLS[skill].name : '');
      const cost = skill ? skillCost(skill) : null;
      d.sub.setText(cost && cost.rage > 0 ? `${cost.rage} rage` : '');
    }
  }
}
