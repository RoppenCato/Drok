import Phaser from 'phaser';
import { N, chestFull, dist, placeOf, type GameEvent, type GameState } from '../../../rules/src/index.ts';
import { Controls } from '../controls.ts';
import type { GameLog } from '../game-log.ts';
import { DESIGN_HEIGHT, DESIGN_WIDTH, RES } from '../layout.ts';
import type { Intent, LocalGame } from '../local-game.ts';
import { Hud } from '../view/hud.ts';
import { Panels } from '../view/panels.ts';
import { FOOT, WorldView, type Thing } from '../view/world-view.ts';

/** How fast the camera closes on the hero: at 14 it is all but there in a fifth of a second, with no lag to feel. */
const CAMERA_CATCH_UP = 14;
/**
 * The camera looks this far below him, so he is drawn above the screen's middle: in the middle of what the glass
 * at the bottom leaves to see (mine; it came with Robin's buttons and health at the bottom, 2026-11-20).
 */
const LOOK_BELOW = 60;

/** The events after which an open window may be showing something that is no longer so. */
const STALE = new Set<GameEvent['type']>(['picked', 'bought', 'sold', 'equipped', 'unequipped', 'discarded', 'levelUp', 'xp', 'sailed', 'heroUp', 'potionUsed', 'chestOpened']);

/**
 * The game's one screen: the place he is in, with the glass over it and a window over that when one is open. The
 * scene only wires things together: fingers go to the open window, else to the glass, else to the controls; the
 * controls send intents to the holder; the holder steps the rules; the views draw the state and the events.
 *
 * Two cameras draw it. The main one follows the hero over the place; the second one stands still and draws the
 * glass and the windows. Both zoom by RES, so everything is placed in design units and is sharp on a dense screen.
 */
export class PlayScene extends Phaser.Scene {
  private readonly holder: LocalGame;
  private readonly log: GameLog;
  private world!: WorldView;
  private hud!: Hud;
  private panels!: Panels;
  private controls!: Controls;
  private place = '';
  private camX = 0;
  private camY = 0;
  /** "Start over" must be pressed twice: until this time, a second press erases the hero. */
  private eraseUntil = 0;

  constructor(o: { holder: LocalGame; log: GameLog }) {
    super({ key: 'play' });
    this.holder = o.holder;
    this.log = o.log;
  }

  create(): void {
    const state = this.holder.state;
    const field = this.cameras.main;
    field.setZoom(RES);
    const glass = this.cameras.add(0, 0, DESIGN_WIDTH * RES, DESIGN_HEIGHT * RES);
    glass.setZoom(RES);
    // A camera zooms about its middle: this scroll puts design 0, 0 in the canvas's top left corner.
    glass.setScroll((DESIGN_WIDTH * (1 - RES)) / 2, (DESIGN_HEIGHT * (1 - RES)) / 2);
    const onGlass = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      field.ignore(o);
      return o;
    };

    this.world = new WorldView(this, (o) => {
      glass.ignore(o);
      return o;
    });
    this.hud = new Hud(this, onGlass, {
      skill: (skill) => {
        const done = this.act({ type: 'skill', skill });
        this.log.note(done ? skill : `${skill} refused`);
      },
      potion: () => this.act({ type: 'potion' }),
      use: (thing) => this.use(thing),
      open: (panel) => {
        this.controls.letGo();
        this.panels.open(panel);
      },
    });
    this.panels = new Panels(this, onGlass, {
      state: () => this.holder.state,
      act: (intent) => this.act(intent),
      atShop: () => this.near(this.holder.state) === 'shop',
      atDock: () => this.near(this.holder.state, true) === 'dock',
      settingsChanged: () => this.hud.place(),
      exportSave: () => this.exportSave(),
      importSave: () => this.importSave(),
      saveLog: () => this.log.download(),
      startOver: () => this.startOver(),
      toast: (text) => this.hud.toast(text),
    });
    this.world.build(state);
    this.hud.build(state);
    this.controls = new Controls({ holder: this.holder, camera: field, hud: this.hud, world: this.world });
    this.arrive(state, false);

    // Fingers: an open window first, then the glass, then the field. A held finger is let go only by its own lift,
    // or when the page loses the screen (a call, a swipe to another app), so the hero never runs on unsteered.
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      const x = p.x / RES;
      const y = p.y / RES;
      if (this.panels.kind) {
        this.panels.down(x, y);
        return;
      }
      if (this.hud.press(x, y)) return;
      this.controls.down(p);
    });
    const lifted = (p: Phaser.Input.Pointer): void => {
      this.panels.up(p.x / RES, p.y / RES);
      this.controls.up(p);
    };
    this.input.on(Phaser.Input.Events.POINTER_UP, lifted);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, lifted);
    this.game.events.on(Phaser.Core.Events.BLUR, () => this.controls.letGo());
    this.game.events.on(Phaser.Core.Events.HIDDEN, () => this.controls.letGo());
  }

  override update(time: number, delta: number): void {
    this.controls.update();
    this.holder.advance(delta);
    const state = this.holder.state;
    const events = this.holder.takeEvents();

    let stale = false;
    for (const e of events) {
      if (STALE.has(e.type)) stale = true;
      if (e.type === 'sailed') this.log.note(`sailed to ${e.to}`);
      else if (e.type === 'levelUp') this.log.note(`level ${e.level} at ${(state.time / 60).toFixed(1)} min`);
      else if (e.type === 'heroDown') this.log.note(`down in ${state.place}; lost ${e.lost} gold; ${state.deaths} falls`);
      else if (e.type === 'chestOpened') this.log.note('chest opened');
      // A bite with a window open: the window gets out of the way.
      else if (e.type === 'heroHit' && this.panels.kind) this.panels.close();
    }
    if (state.place !== this.place) this.arrive(state, true);

    this.world.sync(state, this.holder.prev, this.holder.alpha, time, delta);
    this.world.show(events, state);
    this.hud.show(events, state);
    this.hud.sync(state, delta);
    if (stale) this.panels.refresh();

    // The thing he stands by gets its button; a thing he was sent to by a tap is used the moment he is there.
    const near = this.near(state);
    this.hud.setThing(this.panels.kind ? null : near);
    if (this.controls.pending && !state.hero.dest) {
      const thing = this.controls.pending;
      this.controls.pending = null;
      if (this.near(state, true) === thing) this.use(thing);
    }

    // The camera closes on where the hero is drawn. A jump is followed at once.
    const at = this.world.heroAt;
    const lookY = at.y + LOOK_BELOW;
    const k = Math.hypot(at.x - this.camX, lookY - this.camY) > 200 ? 1 : 1 - Math.exp((-delta / 1000) * CAMERA_CATCH_UP);
    this.camX += (at.x - this.camX) * k;
    this.camY += (lookY - this.camY) * k;
    this.cameras.main.centerOn(this.camX, this.camY);
  }

  /** Ask the rules. True when it was done; a refusal is said on the glass by the next frame. */
  private act(intent: Intent): boolean {
    return !this.holder.act(intent).some((e) => e.type === 'rejected');
  }

  /**
   * The thing of the place he stands by, if any. An empty chest is no thing to use, unless `evenEmpty` (a tap sent
   * him there: he should be told it is empty).
   */
  private near(state: GameState, evenEmpty = false): Thing | null {
    const h = state.hero;
    if (h.downFor > 0) return null;
    const place = placeOf(state);
    if (place.chest && dist(h, place.chest) <= N.reach.chest && (evenEmpty || chestFull(state))) return 'chest';
    if (place.shop && dist(h, place.shop) <= N.reach.shop) return 'shop';
    if (dist(h, place.dock) <= N.reach.dock) return 'dock';
    return null;
  }

  private use(thing: Thing): void {
    this.controls.letGo();
    if (thing === 'chest') this.act({ type: 'openChest' });
    else this.panels.open(thing === 'shop' ? 'shop' : 'chart');
  }

  /** He is in a place: the camera gets its edges and jumps to him; when he has just come, the glass says where. */
  private arrive(state: GameState, announce: boolean): void {
    const place = placeOf(state);
    this.place = state.place;
    this.cameras.main.setBounds(0, 0, place.width, place.height + FOOT);
    this.camX = state.hero.x;
    this.camY = state.hero.y + LOOK_BELOW;
    this.cameras.main.centerOn(this.camX, this.camY);
    this.panels.close();
    if (announce) this.hud.banner(place.name, place.town ? 'The harbour town' : `Levels ${place.levels}`);
  }

  /** "Export save" (Robin, 2026-11-20: from day one): the save as a file the player keeps. */
  private exportSave(): void {
    this.holder.save();
    const blob = new Blob([this.holder.pack()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drok-save-level-${this.holder.state.hero.level}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.hud.toast('Save exported');
    this.log.note('save exported');
  }

  /** "Import save": the player picks a file; if it is a save, it takes this game's place. */
  private importSave(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then((text) => {
        if (!this.holder.unpack(text)) {
          this.hud.toast('That file is not a Drok save');
          this.log.note('import refused: not a save');
          return;
        }
        this.controls.letGo();
        this.world.enter(this.holder.state);
        this.arrive(this.holder.state, true);
        this.hud.toast('Save loaded');
        this.log.note(`save imported: level ${this.holder.state.hero.level}`);
      });
    });
    input.click();
  }

  /** A new hero. This one is gone for good, so it takes two presses within a few seconds. */
  private startOver(): void {
    if (this.time.now > this.eraseUntil) {
      this.eraseUntil = this.time.now + 4000;
      this.hud.toast('Press again to erase this hero for good');
      return;
    }
    this.holder.reset();
    location.reload();
  }
}
