// The three ways to steer that Robin tries (Robin, 2026-11-19), each turning fingers into intents for the rules:
//   1 Tap    a tap on the sand walks him there; a tap on a monster targets it and he walks up to it.
//   2 Hold   while a finger is down he walks towards it; the rules pick the nearest monster.
//   3 Stick  a stick appears where the thumb comes down; pushing it steers; the rules pick the nearest monster.
// What Zite2's first playtest taught holds for all three: a held finger lets go only when that finger lifts, never
// because it slid somewhere, and steering is sent the frame it changes.

import type Phaser from 'phaser';
import { N, dist, type Vec } from '../../rules/src/index.ts';
import { RES } from './layout.ts';
import type { LocalGame } from './local-game.ts';
import type { Hud } from './view/hud.ts';
import type { WorldView } from './view/world-view.ts';

/** How far outside a monster's body a tap still counts as on it: a thumb is wide. */
const TAP_SLOP = 26;
/** Scheme 2: closer than this to the finger he stands; from there the push grows to full over the next stretch. */
const HOLD_DEAD = 14;
const HOLD_FULL = 54;
const HOLD_LEAST = 0.35;
/** Scheme 3: the stick's reach in design units, and the wobble near its middle that counts as no push. */
const STICK_REACH = 46;
const STICK_DEAD = 7;

export class Controls {
  private readonly holder: LocalGame;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly hud: Hud;
  private readonly world: WorldView;
  /** The finger that steers (schemes 2 and 3), until it lifts. */
  private finger: Phaser.Input.Pointer | null = null;
  private readonly base: Vec = { x: 0, y: 0 };
  private readonly sent: Vec = { x: 0, y: 0 };

  constructor(o: { holder: LocalGame; camera: Phaser.Cameras.Scene2D.Camera; hud: Hud; world: WorldView }) {
    this.holder = o.holder;
    this.camera = o.camera;
    this.hud = o.hud;
    this.world = o.world;
  }

  /** A finger came down on the field (the glass's buttons had their turn first). */
  down(p: Phaser.Input.Pointer): void {
    const scheme = this.holder.state.scheme;
    if (scheme === 1) {
      this.tap(p);
      return;
    }
    if (this.finger) return;
    this.finger = p;
    if (scheme === 3) {
      this.base.x = p.x / RES;
      this.base.y = p.y / RES;
    }
    this.update();
  }

  /** A finger lifted. Only the steering finger's lift lets go. */
  up(p: Phaser.Input.Pointer): void {
    if (this.finger && p.id === this.finger.id) this.letGo();
  }

  /** Let go of the steering: the finger lifted, the page lost the screen, or the way of steering changed. */
  letGo(): void {
    this.finger = null;
    this.hud.stick(null, null);
    this.send(0, 0);
  }

  /** Once a frame, before the world steps: where the held finger is now. */
  update(): void {
    const p = this.finger;
    if (!p) return;
    if (!p.isDown) {
      this.letGo();
      return;
    }
    if (this.holder.state.scheme === 2) this.hold(p);
    else if (this.holder.state.scheme === 3) this.stick(p);
    else this.letGo();
  }

  /** Scheme 1: a tap on a monster targets it; a tap on the sand walks him there. */
  private tap(p: Phaser.Input.Pointer): void {
    const at = this.camera.getWorldPoint(p.x, p.y);
    let best: number | null = null;
    let bestD = N.monster.radius + TAP_SLOP;
    for (const m of this.holder.state.monsters) {
      const d = dist(at, m);
      if (d <= bestD) {
        best = m.id;
        bestD = d;
      }
    }
    if (best !== null) {
      this.holder.act({ type: 'target', monster: best });
    } else {
      const events = this.holder.act({ type: 'moveTo', x: at.x, y: at.y });
      if (!events.some((e) => e.type === 'rejected')) this.world.tapMark(this.holder.state.hero.dest ?? at);
    }
  }

  /** Scheme 2: he walks towards the finger, and stands when he is under it. */
  private hold(p: Phaser.Input.Pointer): void {
    const at = this.camera.getWorldPoint(p.x, p.y);
    const h = this.holder.state.hero;
    const dx = at.x - h.x;
    const dy = at.y - h.y;
    const d = Math.hypot(dx, dy);
    if (d < HOLD_DEAD) {
      this.send(0, 0);
      return;
    }
    const push = Math.min(1, Math.max(HOLD_LEAST, (d - HOLD_DEAD) / (HOLD_FULL - HOLD_DEAD)));
    this.send((dx / d) * push, (dy / d) * push);
  }

  /** Scheme 3: the push is how far the thumb is from where the stick stands; past its reach the stick comes along. */
  private stick(p: Phaser.Input.Pointer): void {
    const x = p.x / RES;
    const y = p.y / RES;
    let dx = x - this.base.x;
    let dy = y - this.base.y;
    let d = Math.hypot(dx, dy);
    if (d > STICK_REACH) {
      // The base follows the thumb, so turning back never has to cross the whole stick first.
      this.base.x = x - (dx / d) * STICK_REACH;
      this.base.y = y - (dy / d) * STICK_REACH;
      dx = x - this.base.x;
      dy = y - this.base.y;
      d = STICK_REACH;
    }
    this.hud.stick(this.base, { x, y });
    if (d < STICK_DEAD) this.send(0, 0);
    else this.send(dx / STICK_REACH, dy / STICK_REACH);
  }

  /** Tell the rules, but only when the push has changed. */
  private send(x: number, y: number): void {
    const same = Math.abs(x - this.sent.x) + Math.abs(y - this.sent.y) < 0.004;
    // Letting go is always told, however small the last push was: he must stop dead.
    const lettingGo = x === 0 && y === 0 && (this.sent.x !== 0 || this.sent.y !== 0);
    if (same && !lettingGo) return;
    this.sent.x = x;
    this.sent.y = y;
    this.holder.act({ type: 'steer', x, y });
  }
}
