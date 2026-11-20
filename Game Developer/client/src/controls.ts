// One way to steer, with two hands to it (Robin, 2026-11-20, after trying the three of the control test: "click to
// move is good, but there needs to be a simple way to also move freely", "both available at the same time"):
//   a tap   on the ground walks him there; on a monster targets it and he walks up to it; on the chest, the stall
//           or the dock walks him there and uses it.
//   a drag  anywhere on the field is a stick: it appears where the thumb came down, and pushing it steers him.
// A touch is a tap until the thumb has slid a little; then it is the stick until that thumb lifts. A tap is acted on
// when the thumb lifts (mine): acted on the moment it comes down, every drag would first send him a step towards
// the thumb. A second finger is always a tap, so one thumb can steer while the other picks who he fights.
// What Zite2's first playtest taught still holds: a held thumb lets go only when that thumb lifts, never because it
// slid somewhere, and steering is sent the frame it changes.

import type Phaser from 'phaser';
import { dist, placeOf, type Vec } from '../../rules/src/index.ts';
import { RES } from './layout.ts';
import type { LocalGame } from './local-game.ts';
import type { Hud } from './view/hud.ts';
import type { Thing, WorldView } from './view/world-view.ts';

/** How far outside a monster's body a tap still counts as on it: a thumb is wide. */
const TAP_SLOP = 26;
/** How far the thumb must slide, in design units, before a touch is the stick and no longer a tap. */
const STICK_START = 10;
/** The stick's reach in design units, and the wobble near its middle that counts as no push. */
const STICK_REACH = 46;
const STICK_DEAD = 7;

export class Controls {
  /** A thing he was sent to by a tap, to be used when he gets there. Any other tap or push forgets it. */
  pending: Thing | null = null;

  private readonly holder: LocalGame;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly hud: Hud;
  private readonly world: WorldView;
  /** The first finger on the field: a tap in the making, or the stick once it has slid. */
  private finger: Phaser.Input.Pointer | null = null;
  private steering = false;
  /** Other fingers that came down on the field while the first was there: each a tap when it lifts. */
  private readonly others = new Set<number>();
  /** Where the first finger came down, then where the stick stands, in design units. */
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
    if (this.finger) {
      this.others.add(p.id);
      return;
    }
    this.finger = p;
    this.steering = false;
    this.base.x = p.x / RES;
    this.base.y = p.y / RES;
  }

  /** A finger lifted. A touch that never slid was a tap; the stick's own finger lets the stick go. */
  up(p: Phaser.Input.Pointer): void {
    if (this.finger && p.id === this.finger.id) {
      const wasTap = !this.steering;
      this.letGo();
      if (wasTap) this.tap(p);
    } else if (this.others.delete(p.id)) {
      this.tap(p);
    }
  }

  /** Let go of everything: the page lost the screen, a window opened, a thing was used. No tap comes of it. */
  letGo(): void {
    this.finger = null;
    this.steering = false;
    this.others.clear();
    this.hud.stick(null, null);
    this.send(0, 0);
  }

  /** Once a frame, before the world steps: where the held thumb is now. */
  update(): void {
    const p = this.finger;
    if (!p) return;
    if (!p.isDown) {
      // Its lift never reached us (the page was covered for a moment): nothing was meant by it.
      this.letGo();
      return;
    }
    if (!this.steering) {
      if (Math.hypot(p.x / RES - this.base.x, p.y / RES - this.base.y) < STICK_START) return;
      this.steering = true;
      this.pending = null;
    }
    this.stick(p);
  }

  /** A tap on a monster targets it; on a thing, walks to it to use it; on the ground, walks there. */
  private tap(p: Phaser.Input.Pointer): void {
    this.pending = null;
    const state = this.holder.state;
    const at = this.camera.getWorldPoint(p.x, p.y);
    const best = this.world.monsterAt(state, at, TAP_SLOP);
    if (best !== null) {
      this.holder.act({ type: 'target', monster: best });
      return;
    }
    const thing = this.world.thingAt(state, at);
    const to = thing ? this.standBy(thing) : at;
    const events = this.holder.act({ type: 'moveTo', x: to.x, y: to.y });
    if (events.some((e) => e.type === 'rejected')) return;
    this.pending = thing;
    this.world.tapMark(this.holder.state.hero.dest ?? to);
  }

  /** Where he stands to use a thing: before the chest on his own side, before the stall's table. */
  private standBy(thing: Thing): Vec {
    const state = this.holder.state;
    const place = placeOf(state);
    if (thing === 'chest' && place.chest) {
      const d = Math.max(1, dist(state.hero, place.chest));
      return { x: place.chest.x + ((state.hero.x - place.chest.x) / d) * 42, y: place.chest.y + ((state.hero.y - place.chest.y) / d) * 42 };
    }
    if (place.shop) return { x: place.shop.x, y: place.shop.y + 62 };
    return { x: state.hero.x, y: state.hero.y };
  }

  /** The push is how far the thumb is from where the stick stands; past its reach the stick comes along. */
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
