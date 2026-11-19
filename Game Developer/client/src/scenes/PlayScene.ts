import Phaser from 'phaser';
import { N } from '../../../rules/src/index.ts';
import { Controls } from '../controls.ts';
import type { GameLog } from '../game-log.ts';
import { DESIGN_HEIGHT, DESIGN_WIDTH, RES } from '../layout.ts';
import type { LocalGame } from '../local-game.ts';
import { Hud } from '../view/hud.ts';
import { WorldView } from '../view/world-view.ts';

/** How fast the camera closes on the hero: at 14 it is all but there in a fifth of a second, with no lag to feel. */
const CAMERA_CATCH_UP = 14;

/**
 * The control test's one screen: a small field, the hero, a few monsters of one kind, and three ways to steer
 * (Robin, 2026-11-19). The scene only wires things together: fingers go to the glass first and then to the controls,
 * the controls send intents to the holder, the holder steps the rules, and the two views draw the state and the events.
 *
 * Two cameras draw it. The main one follows the hero over the field; the second one stands still and draws the
 * glass. Both zoom by RES, so everything is placed in design units and is sharp on a dense screen.
 */
export class PlayScene extends Phaser.Scene {
  private readonly holder: LocalGame;
  private readonly log: GameLog;
  private world!: WorldView;
  private hud!: Hud;
  private controls!: Controls;
  private camX = 0;
  private camY = 0;

  constructor(o: { holder: LocalGame; log: GameLog }) {
    super({ key: 'play' });
    this.holder = o.holder;
    this.log = o.log;
  }

  create(): void {
    const state = this.holder.state;
    const field = this.cameras.main;
    field.setZoom(RES);
    field.setBounds(0, 0, N.field.width, N.field.height);
    const glass = this.cameras.add(0, 0, DESIGN_WIDTH * RES, DESIGN_HEIGHT * RES);
    glass.setZoom(RES);
    // A camera zooms about its middle: this scroll puts design 0, 0 in the canvas's top left corner.
    glass.setScroll((DESIGN_WIDTH * (1 - RES)) / 2, (DESIGN_HEIGHT * (1 - RES)) / 2);

    this.world = new WorldView(this, (o) => {
      glass.ignore(o);
      return o;
    });
    this.hud = new Hud(
      this,
      (o) => {
        field.ignore(o);
        return o;
      },
      {
        scheme: (scheme) => {
          this.controls.letGo();
          this.holder.act({ type: 'scheme', scheme });
          this.hud.setScheme(scheme);
          this.log.note(`scheme ${scheme}`);
        },
        skill: (skill) => {
          const events = this.holder.act({ type: 'skill', skill });
          const refused = events.find((e) => e.type === 'rejected');
          this.log.note(refused && refused.type === 'rejected' ? `${skill} refused: ${refused.reason}` : skill);
        },
        monsters: (change) => {
          // Counted from the state, not from what the menu last drew: two quick presses are two.
          const count = Math.min(N.field.maxMonsters, Math.max(1, this.holder.state.monstersWanted + change));
          this.holder.act({ type: 'monsters', count });
          this.log.note(`monsters ${count}`);
        },
        log: () => this.log.download(),
        startOver: () => {
          this.holder.reset();
          location.reload();
        },
      },
    );
    this.world.build(state);
    this.hud.build(state);
    this.controls = new Controls({ holder: this.holder, camera: field, hud: this.hud, world: this.world });

    this.camX = state.hero.x;
    this.camY = state.hero.y;
    field.centerOn(this.camX, this.camY);

    // Fingers: the glass first, then the field. A held finger is let go only by its own lift, or when the page
    // loses the screen (a call, a swipe to another app), so the hero never runs on with nobody steering.
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (this.hud.press(p.x / RES, p.y / RES)) return;
      this.controls.down(p);
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, (p: Phaser.Input.Pointer) => this.controls.up(p));
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, (p: Phaser.Input.Pointer) => this.controls.up(p));
    this.game.events.on(Phaser.Core.Events.BLUR, () => this.controls.letGo());
    this.game.events.on(Phaser.Core.Events.HIDDEN, () => this.controls.letGo());
  }

  override update(time: number, delta: number): void {
    this.controls.update();
    this.holder.advance(delta);
    const state = this.holder.state;
    const events = this.holder.takeEvents();
    for (const e of events) {
      if (e.type === 'monsterDied') this.log.note(`crab ${e.monster} fell; ${state.kills} so far`);
      else if (e.type === 'heroDown') this.log.note(`down; ${state.deaths} falls`);
    }

    this.world.sync(state, this.holder.prev, this.holder.alpha, time, delta);
    this.world.show(events, state);
    this.hud.show(events);
    this.hud.sync(state, delta);

    // The camera closes on where the hero is drawn. A jump (standing up after a fall) is followed at once.
    const at = this.world.heroAt;
    const k = Math.hypot(at.x - this.camX, at.y - this.camY) > 200 ? 1 : 1 - Math.exp((-delta / 1000) * CAMERA_CATCH_UP);
    this.camX += (at.x - this.camX) * k;
    this.camY += (at.y - this.camY) * k;
    this.cameras.main.centerOn(this.camX, this.camY);
  }
}
