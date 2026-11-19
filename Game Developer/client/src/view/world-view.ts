// The field as the player sees it: the ground, the hero and the monsters as stand-in shapes, and the small effects.
// Everything that lasts is drawn from the state each frame (where a thing is, whether it winds up, is stunned, is the
// target); only one-shots come from the events (a number, a puff, the sword's arc). Nothing here decides anything.

import Phaser from 'phaser';
import { N, makeRng, type GameEvent, type GameState, type Monster, type Vec } from '../../../rules/src/index.ts';
import { COLORS, DEPTH, FONT, RES } from '../layout.ts';
import { settings } from '../settings.ts';

/** Marks an object as the field's, so the camera that draws the buttons leaves it out. */
export type Register = <T extends Phaser.GameObjects.GameObject>(object: T) => T;

interface MonsterView {
  body: Phaser.GameObjects.Container;
  shell: Phaser.GameObjects.Arc;
  shadow: Phaser.GameObjects.Ellipse;
  barBack: Phaser.GameObjects.Rectangle;
  bar: Phaser.GameObjects.Rectangle;
  star: Phaser.GameObjects.Star;
  /** Where it is drawn this frame. */
  x: number;
  y: number;
  /** 1 right after a hit, fading to 0: a flash and a small swell. */
  punch: number;
  /** 1 when it has just arrived, fading to 0: it grows into place. */
  pop: number;
}

const BAR_WIDTH = 32;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export class WorldView {
  /** Where the hero is drawn this frame: between the last two steps of the world. */
  readonly heroAt: Vec = { x: 0, y: 0 };

  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly monsters = new Map<number, MonsterView>();
  private hero!: Phaser.GameObjects.Container;
  private heroBody!: Phaser.GameObjects.Arc;
  private heroShadow!: Phaser.GameObjects.Ellipse;
  private swordArm!: Phaser.GameObjects.Container;
  private ring!: Phaser.GameObjects.Ellipse;
  private destDot!: Phaser.GameObjects.Arc;
  private slash!: Phaser.GameObjects.Graphics;
  private heroFlash = 0;
  private ringPop = 0;
  private chargeFrom: Vec | null = null;

  constructor(scene: Phaser.Scene, reg: Register) {
    this.scene = scene;
    this.reg = reg;
  }

  build(state: GameState): void {
    const s = this.scene;
    const f = N.field;

    // The ground: the tile painted in the boot scene, repeated over the field, with the water's edge round it.
    const ground = this.reg(s.add.tileSprite(0, 0, f.width, f.height, 'ground').setOrigin(0).setDepth(DEPTH.ground));
    ground.setTileScale(1 / RES);
    const edge = 10;
    for (const [x, y, w, h] of [
      [0, 0, f.width, edge],
      [0, f.height - edge, f.width, edge],
      [0, 0, edge, f.height],
      [f.width - edge, 0, edge, f.height],
    ] as const) {
      this.reg(s.add.rectangle(x, y, w, h, COLORS.sea).setOrigin(0).setDepth(DEPTH.decor));
    }
    this.reg(s.add.rectangle(edge, edge, f.width - 2 * edge, f.height - 2 * edge).setOrigin(0).setStrokeStyle(5, COLORS.foam, 0.9).setDepth(DEPTH.decor));

    // Things on the sand, so there is something to walk past. Their own dice: decoration, not rules.
    const rng = makeRng('decor');
    for (let i = 0; i < 70; i++) {
      const x = f.margin + rng.next() * (f.width - 2 * f.margin);
      const y = f.margin + rng.next() * (f.height - 2 * f.margin);
      const kind = rng.next();
      if (kind < 0.55) {
        this.reg(s.add.ellipse(x - 4, y, 11, 6, COLORS.tuftDark).setDepth(DEPTH.decor));
        this.reg(s.add.ellipse(x + 3, y - 2, 13, 7, COLORS.tuft).setDepth(DEPTH.decor));
      } else if (kind < 0.8) {
        this.reg(s.add.circle(x, y, 3.5, COLORS.shell).setDepth(DEPTH.decor));
      } else {
        this.reg(s.add.ellipse(x + 2, y + 3, 20, 9, COLORS.shadow, 0.18).setDepth(DEPTH.decor));
        this.reg(s.add.ellipse(x, y, 18, 12, COLORS.rock).setDepth(DEPTH.decor));
      }
    }

    // Marks on the ground: where a tap sent him, and the ring under his target.
    this.destDot = this.reg(s.add.circle(0, 0, 5, COLORS.mark, 0.7).setDepth(DEPTH.marks).setVisible(false));
    this.ring = this.reg(s.add.ellipse(0, 0, 50, 34).setStrokeStyle(3, COLORS.target, 1).setDepth(DEPTH.marks).setVisible(false));

    // The hero, from above: a coat, a bandana, a face that shows where he looks, a buckler on one arm and a cutlass
    // on the other (Robin, 2026-11-20: cutlass and buckler). The whole figure turns to his facing.
    this.heroShadow = this.reg(s.add.ellipse(0, 0, 34, 16, COLORS.shadow, 0.25).setDepth(DEPTH.shadows));
    this.heroBody = s.add.circle(0, 0, N.hero.radius, COLORS.hero).setStrokeStyle(2, COLORS.heroDark);
    const face = s.add.circle(7, 0, 6, COLORS.skin);
    const bandana = s.add.circle(-1, 0, 8, COLORS.bandana);
    const buckler = s.add.circle(6, -15, 7, COLORS.buckler).setStrokeStyle(2, COLORS.heroDark);
    const blade = s.add.rectangle(0, 0, 26, 5, COLORS.blade).setOrigin(0, 0.5).setStrokeStyle(1, COLORS.heroDark);
    this.swordArm = s.add.container(8, 14, [blade]);
    this.swordArm.rotation = 0.5;
    this.hero = this.reg(s.add.container(state.hero.x, state.hero.y, [this.heroBody, buckler, this.swordArm, bandana, face]));
    this.hero.rotation = state.hero.facing;

    this.slash = this.reg(s.add.graphics().setDepth(DEPTH.effects).setAlpha(0));
    this.heroAt.x = state.hero.x;
    this.heroAt.y = state.hero.y;
  }

  /** Draw the state: `alpha` of the way from the step before (`prev`) to the last one (`state`). */
  sync(state: GameState, prev: GameState, alpha: number, time: number, delta: number): void {
    const h = state.hero;
    const fade = Math.min(1, delta / 140);

    // A jump (standing up in the middle after a fall) is not walked through.
    const jumped = Math.hypot(h.x - prev.hero.x, h.y - prev.hero.y) > 60;
    const hx = jumped ? h.x : lerp(prev.hero.x, h.x, alpha);
    const hy = jumped ? h.y : lerp(prev.hero.y, h.y, alpha);
    this.heroAt.x = hx;
    this.heroAt.y = hy;
    const down = h.downFor > 0;
    const bob = h.moving && !down ? Math.sin(time * 0.022) * 1.3 : 0;
    this.hero.setPosition(hx, hy + bob).setDepth(DEPTH.bodies + hy);
    this.hero.rotation = Phaser.Math.Angle.RotateTo(this.hero.rotation, h.facing, delta * 0.02);
    this.hero.setAlpha(down ? 0.4 : 1).setScale(down ? 0.85 : 1);
    this.heroShadow.setPosition(hx + 2, hy + 9);
    this.heroFlash = Math.max(0, this.heroFlash - fade);
    this.heroBody.setFillStyle(this.heroFlash > 0.3 ? 0xffffff : COLORS.hero);

    this.destDot.setVisible(h.dest !== null);
    if (h.dest) this.destDot.setPosition(h.dest.x, h.dest.y);

    const seen = new Set<number>();
    for (const m of state.monsters) {
      seen.add(m.id);
      let v = this.monsters.get(m.id);
      if (!v) {
        v = this.makeMonster(m);
        this.monsters.set(m.id, v);
      }
      const before = prev.monsters.find((p) => p.id === m.id);
      v.x = before ? lerp(before.x, m.x, alpha) : m.x;
      v.y = before ? lerp(before.y, m.y, alpha) : m.y;
      v.punch = Math.max(0, v.punch - fade);
      v.pop = Math.max(0, v.pop - fade * 0.6);

      const stunned = m.stunned > 0;
      const windup = m.mode === 'windup' && !stunned ? 1 - m.timer / N.monster.windupSeconds : 0;
      v.body.setPosition(v.x, v.y).setDepth(DEPTH.bodies + v.y);
      v.body.rotation = Phaser.Math.Angle.RotateTo(v.body.rotation, m.facing, delta * 0.012);
      v.body.setScale((1 + 0.28 * windup + 0.16 * v.punch) * (1 - 0.5 * v.pop));
      v.shell.setFillStyle(v.punch > 0.45 ? 0xffffff : stunned ? COLORS.monsterStunned : windup > 0 ? COLORS.monsterWindup : COLORS.monster);
      v.shadow.setPosition(v.x + 2, v.y + 8);
      v.star.setVisible(stunned).setPosition(v.x, v.y - 26);
      if (stunned) v.star.rotation = time * 0.006;

      const showBar = m.hp < N.monster.maxHp || h.target === m.id;
      v.barBack.setVisible(showBar).setPosition(v.x - BAR_WIDTH / 2 - 1, v.y - 27);
      v.bar.setVisible(showBar).setPosition(v.x - BAR_WIDTH / 2, v.y - 26);
      v.bar.scaleX = Math.max(0, m.hp / N.monster.maxHp);
    }
    for (const [id, v] of this.monsters) {
      if (seen.has(id)) continue;
      this.dropMonster(v);
      this.monsters.delete(id);
    }

    const target = h.target !== null ? this.monsters.get(h.target) : undefined;
    this.ring.setVisible(target !== undefined);
    if (target) {
      this.ringPop = Math.max(0, this.ringPop - fade);
      this.ring.setPosition(target.x, target.y + 6).setScale(1 + 0.06 * Math.sin(time * 0.008) + 0.5 * this.ringPop);
    }
  }

  /** The one-shots: numbers, puffs, the sword's arc. */
  show(events: GameEvent[], state: GameState): void {
    for (const e of events) {
      switch (e.type) {
        case 'swing':
          this.swingSword();
          break;
        case 'hit': {
          const v = this.monsters.get(e.monster);
          if (v) v.punch = 1;
          this.number(e.x, e.y - 30, e.crit ? `${e.amount}!` : `${e.amount}`, e.crit ? COLORS.crit : COLORS.hit, e.crit ? 22 : e.by === 'cleave' ? 18 : 16);
          break;
        }
        case 'monsterDied':
          this.puff(e.x, e.y, COLORS.monster, N.monster.radius);
          break;
        case 'heroHit':
          this.heroFlash = 1;
          this.number(this.heroAt.x, this.heroAt.y - 32, `-${e.amount}`, COLORS.hurt, 17);
          if (!settings.get().fewerEffects) this.scene.cameras.main.shake(90, 0.004);
          break;
        case 'monsterMissed':
          if (state.hero.downFor <= 0) this.number(this.heroAt.x, this.heroAt.y - 32, 'missed', COLORS.dim, 13);
          break;
        case 'targeted':
          this.ringPop = 1;
          break;
        case 'chargeStarted':
          this.chargeFrom = { x: this.heroAt.x, y: this.heroAt.y };
          break;
        case 'charged':
          if (this.chargeFrom) this.streak(this.chargeFrom, e);
          this.chargeFrom = null;
          this.puff(e.x, e.y, COLORS.mark, 12);
          break;
        case 'cleaved':
          this.sweep(state.hero, e.facing);
          this.swingSword();
          break;
        default:
          break;
      }
    }
  }

  /** A ring where a tap landed on the ground, so a tap is answered the frame it lands. */
  tapMark(at: Vec): void {
    const ring = this.reg(this.scene.add.circle(at.x, at.y, 16).setStrokeStyle(3, COLORS.mark, 0.9).setDepth(DEPTH.marks));
    this.scene.tweens.add({ targets: ring, scale: 0.3, alpha: 0.2, duration: Math.max(1, settings.ms(260)), ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
  }

  private makeMonster(m: Monster): MonsterView {
    const s = this.scene;
    const shell = s.add.circle(0, 0, N.monster.radius, COLORS.monster).setStrokeStyle(2, COLORS.monsterDark);
    const clawLeft = s.add.circle(13, -11, 6, COLORS.monster).setStrokeStyle(2, COLORS.monsterDark);
    const clawRight = s.add.circle(13, 11, 6, COLORS.monster).setStrokeStyle(2, COLORS.monsterDark);
    const eyeLeft = s.add.circle(9, -4, 2.5, 0xffffff);
    const eyeRight = s.add.circle(9, 4, 2.5, 0xffffff);
    const body = this.reg(s.add.container(m.x, m.y, [clawLeft, clawRight, shell, eyeLeft, eyeRight]));
    body.rotation = m.facing;
    return {
      body,
      shell,
      shadow: this.reg(s.add.ellipse(m.x, m.y, 34, 15, COLORS.shadow, 0.25).setDepth(DEPTH.shadows)),
      barBack: this.reg(s.add.rectangle(0, 0, BAR_WIDTH + 2, 6, COLORS.barBack, 0.85).setOrigin(0).setDepth(DEPTH.effects).setVisible(false)),
      bar: this.reg(s.add.rectangle(0, 0, BAR_WIDTH, 4, COLORS.hp).setOrigin(0).setDepth(DEPTH.effects + 1).setVisible(false)),
      star: this.reg(s.add.star(m.x, m.y, 5, 3.5, 8, COLORS.target).setDepth(DEPTH.effects).setVisible(false)),
      x: m.x,
      y: m.y,
      punch: 0,
      pop: 1,
    };
  }

  private dropMonster(v: MonsterView): void {
    v.body.destroy();
    v.shadow.destroy();
    v.barBack.destroy();
    v.bar.destroy();
    v.star.destroy();
  }

  private swingSword(): void {
    this.scene.tweens.killTweensOf(this.swordArm);
    this.swordArm.rotation = -1.5;
    this.scene.tweens.add({ targets: this.swordArm, rotation: 0.5, duration: Math.max(1, settings.ms(170)), ease: 'Cubic.easeOut' });
  }

  /** A number that rises and fades. With fewer effects it stands a moment and goes. */
  private number(x: number, y: number, text: string, color: string, size: number): void {
    const t = this.reg(
      this.scene.add
        .text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: COLORS.textDark, strokeThickness: 3, resolution: RES })
        .setOrigin(0.5)
        .setDepth(DEPTH.effects + 10),
    );
    if (settings.get().fewerEffects) {
      this.scene.time.delayedCall(350, () => t.destroy());
      return;
    }
    this.scene.tweens.add({ targets: t, y: y - 30, alpha: 0.1, duration: 620, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  private puff(x: number, y: number, color: number, radius: number): void {
    if (settings.get().fewerEffects) return;
    const c = this.reg(this.scene.add.circle(x, y, radius, color, 0.6).setDepth(DEPTH.effects));
    this.scene.tweens.add({ targets: c, scale: 2.2, alpha: 0.05, duration: 260, ease: 'Quad.easeOut', onComplete: () => c.destroy() });
  }

  /** The line a Charge leaves behind. */
  private streak(from: Vec, to: Vec): void {
    if (settings.get().fewerEffects) return;
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    if (len < 8) return;
    const line = this.reg(
      this.scene.add
        .rectangle((from.x + to.x) / 2, (from.y + to.y) / 2, len, 10, COLORS.mark, 0.65)
        .setRotation(Math.atan2(to.y - from.y, to.x - from.x))
        .setDepth(DEPTH.marks),
    );
    this.scene.tweens.add({ targets: line, scaleY: 0.1, alpha: 0.05, duration: 240, ease: 'Quad.easeOut', onComplete: () => line.destroy() });
  }

  /** The arc a Cleave covers, flashed where it struck. */
  private sweep(at: Vec, facing: number): void {
    const half = ((N.cleave.arcDegrees / 2) * Math.PI) / 180;
    this.slash.clear();
    this.slash.fillStyle(COLORS.mark, 0.55);
    this.slash.slice(at.x, at.y, N.cleave.radius + N.monster.radius, facing - half, facing + half, false);
    this.slash.fillPath();
    this.scene.tweens.killTweensOf(this.slash);
    this.slash.setAlpha(1);
    this.scene.tweens.add({ targets: this.slash, alpha: 0, duration: Math.max(1, settings.ms(200)), ease: 'Quad.easeOut' });
  }
}
