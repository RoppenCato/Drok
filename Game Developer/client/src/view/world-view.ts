// The place he is in, as the player sees it: the ground, the dock, the chest, the stall, the hero, the monsters,
// the loot and the small effects, all as stand-in shapes until the Art Director's pieces land. Everything that
// lasts is drawn from the state each frame (where a thing is, whether it winds up, is stunned, is the target, what
// he wears); only one-shots come from the events (a number, a puff, the sword's arc). Nothing here decides anything.

import Phaser from 'phaser';
import { MONSTERS, N, RARITIES, chestFull, kindOf, makeRng, placeOf, type Drop, type GameEvent, type GameState, type Monster, type Place, type Vec } from '../../../rules/src/index.ts';
import { ART } from '../art.ts';
import { COLORS, DEPTH, FONT, RES, hex } from '../layout.ts';
import type { Ground } from '../scenes/BootScene.ts';
import { settings } from '../settings.ts';
import { Figure, HeroFigure, picture, repicture, type AtlasData, type GearData, type SetData } from './figures.ts';
import { hasGlass, piece } from './glass.ts';

/** A place as the Art Director laid it out: what stands where. The rules' own copy of the layout is in their data. */
interface PlaceArt {
  props: { name: string; x: number; y: number }[];
  /** Who stands about, where, and which way each looks. */
  people?: { who: string; x: number; y: number; facing: string }[];
}

/** The eight ways, as the Art Director writes them, in the rules' turn (0 is east, a quarter turn is down the screen). */
const WAY_ANGLE: Record<string, number> = { e: 0, se: Math.PI / 4, s: Math.PI / 2, sw: (3 * Math.PI) / 4, w: Math.PI, nw: (-3 * Math.PI) / 4, n: -Math.PI / 2, ne: -Math.PI / 4 };

type Obj = Phaser.GameObjects.GameObject;

/** Marks an object as the field's, so the camera that draws the buttons leaves it out. */
export type Register = <T extends Obj>(object: T) => T;

/** The things of a place that can be walked up to and used. */
export type Thing = 'chest' | 'shop' | 'dock';

interface MonsterView {
  /** The Art Director's figure, when this kind has one; else the stand-in below. */
  figure: Figure | null;
  mode: string;
  body: Phaser.GameObjects.Container | null;
  /** The part that flashes and changes colour with its mood, and the colour it has at rest. */
  shell: Phaser.GameObjects.Shape | null;
  color: number;
  shadow: Phaser.GameObjects.Ellipse;
  barBack: Phaser.GameObjects.Rectangle;
  bar: Phaser.GameObjects.Rectangle;
  star: Phaser.GameObjects.Star;
  /** The ground a slam will hit, shown while it winds up. */
  slam: Phaser.GameObjects.Arc | null;
  radius: number;
  /** Where it is drawn this frame. */
  x: number;
  y: number;
  /** 1 right after a hit, fading to 0: a flash and a small swell. */
  punch: number;
  /** 1 when it has just arrived, fading to 0: it grows into place. */
  pop: number;
}

interface DropView {
  body: Phaser.GameObjects.Container;
  /** The ring or glow of its rarity, which breathes; and its size at rest. */
  glow: Phaser.GameObjects.Image | Phaser.GameObjects.Arc | null;
  glowSize: number;
  /** What catches the eye on a rare piece: a beam (stand-in) or sparks (drawn), which blink. */
  sparks: (Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle)[];
  pop: number;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** What the stand-in hero wears, by the gear's id: a colour for each piece, so a new hat is seen. */
const BLADES: Record<string, { color: number; length: number }> = {
  'rusty-cutlass': { color: 0xb58a6a, length: 24 },
  'sailors-cutlass': { color: 0xe2e8ec, length: 27 },
  'corsairs-cutlass': { color: 0xfff3b0, length: 31 },
};
const BUCKLERS: Record<string, number> = { 'plank-buckler': 0x9a6a3a, 'iron-buckler': 0x8d99a6, 'brass-buckler': 0xe0a93b };
const HATS: Record<string, number> = { bandana: 0xd9363e, tricorn: 0x3b2a2a, 'feathered-hat': 0x7a4fa3 };
const COATS: Record<string, number> = { 'linen-shirt': 0xe9e2cf, 'sailors-coat': 0x2a5d9f, 'corsairs-coat': 0x8c2f39 };

export class WorldView {
  /** Where the hero is drawn this frame: between the last two steps of the world. */
  readonly heroAt: Vec = { x: 0, y: 0 };

  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private readonly monsters = new Map<number, MonsterView>();
  private readonly drops = new Map<number, DropView>();
  /** Fallen monsters playing out their fall: the figure, and the ms it still has. */
  private dying: { figure: Figure; left: number }[] = [];
  /** The hero as the Art Director drew him, when that drop is in the game; else the stand-in shapes. */
  private heroFigure: HeroFigure | null = null;
  /** Everything that belongs to the place he is in; gone when he leaves it. */
  private scenery: Obj[] = [];
  /** The people who stand about in the place: they breathe, so they are moved on every frame. */
  private folk: Figure[] = [];
  private place = '';
  private hero!: Phaser.GameObjects.Container;
  private heroBody!: Phaser.GameObjects.Arc;
  private heroHat!: Phaser.GameObjects.Arc;
  private heroFeather!: Phaser.GameObjects.Arc;
  private heroBuckler!: Phaser.GameObjects.Arc;
  private heroBlade!: Phaser.GameObjects.Rectangle;
  private heroShadow!: Phaser.GameObjects.Ellipse;
  private swordArm!: Phaser.GameObjects.Container;
  private ring!: Phaser.GameObjects.Ellipse;
  private ringArt: Phaser.GameObjects.Image | null = null;
  private destDot!: Phaser.GameObjects.Arc;
  private slash!: Phaser.GameObjects.Graphics;
  private chestLid: Phaser.GameObjects.Rectangle | null = null;
  private chestGlow: Phaser.GameObjects.Arc | null = null;
  /** The drawn chest, the set its pictures are in, and until when it shows "opening". */
  private chestPicture: Phaser.GameObjects.Image | null = null;
  private chestSet = '';
  private chestOpening = 0;
  private now = 0;
  private coatColor: number = COLORS.hero;
  private dressed = '';
  private heroFlash = 0;
  private ringPop = 0;
  private chargeFrom: Vec | null = null;

  constructor(scene: Phaser.Scene, reg: Register) {
    this.scene = scene;
    this.reg = reg;
  }

  /** The hero and the marks, which go with him from place to place; then the place he is in. */
  build(state: GameState): void {
    const s = this.scene;
    // Marks on the ground: where a tap sent him, and the ring under his target.
    this.destDot = this.reg(s.add.circle(0, 0, 5, COLORS.mark, 0.7).setDepth(DEPTH.marks).setVisible(false));
    this.ring = this.reg(s.add.ellipse(0, 0, 50, 34).setStrokeStyle(3, COLORS.target, 1).setDepth(DEPTH.marks).setVisible(false));
    // The Art Director's mark under the target, when his glass is in the game.
    const mark = hasGlass(s) ? piece(s, 'mark/target') : null;
    if (mark) this.ringArt = this.reg(mark.setDepth(DEPTH.marks).setVisible(false));

    // The hero, from above: a coat, a hat, a face that shows where he looks, a buckler on one arm and a cutlass on
    // the other (Robin, 2026-11-20: cutlass and buckler). The whole figure turns to his facing.
    this.heroShadow = this.reg(s.add.ellipse(0, 0, 34, 16, COLORS.shadow, 0.25).setDepth(DEPTH.shadows));
    this.heroBody = s.add.circle(0, 0, N.hero.radius, COLORS.hero).setStrokeStyle(2, COLORS.heroDark);
    const face = s.add.circle(7, 0, 6, COLORS.skin);
    this.heroHat = s.add.circle(-1, 0, 8, COLORS.bandana);
    this.heroFeather = s.add.circle(-6, 5, 3, 0xffffff).setVisible(false);
    this.heroBuckler = s.add.circle(6, -15, 7, COLORS.buckler).setStrokeStyle(2, COLORS.heroDark);
    this.heroBlade = s.add.rectangle(0, 0, 26, 5, COLORS.blade).setOrigin(0, 0.5).setStrokeStyle(1, COLORS.heroDark);
    this.swordArm = s.add.container(8, 14, [this.heroBlade]);
    this.swordArm.rotation = 0.5;
    this.hero = this.reg(s.add.container(state.hero.x, state.hero.y, [this.heroBody, this.heroBuckler, this.swordArm, this.heroHat, this.heroFeather, face]));
    this.hero.rotation = state.hero.facing;
    const drawn = this.atlas('hero', ART.hero);
    if (drawn) {
      const gear = ART.gear && s.textures.exists('gear') ? ((s.cache.json.get('gear:data') as GearData | undefined) ?? null) : null;
      this.heroFigure = new HeroFigure(s, this.reg, drawn, gear);
      this.hero.setVisible(false);
    }
    this.slash = this.reg(s.add.graphics().setDepth(DEPTH.effects).setAlpha(0));
    this.enter(state);
  }

  /** An atlas's data, if that drop is switched on and its files loaded. */
  private atlas(key: string, on: boolean): AtlasData | null {
    if (!on || !this.scene.textures.exists(key)) return null;
    const data = this.scene.cache.json.get(`${key}:data`) as AtlasData | undefined;
    return data?.actions ? data : null;
  }

  /** He is in another place: take the old one down and put this one up. */
  enter(state: GameState): void {
    for (const o of this.scenery) o.destroy();
    this.scenery = [];
    for (const f of this.folk) f.destroy();
    this.folk = [];
    for (const v of this.monsters.values()) this.dropMonster(v);
    this.monsters.clear();
    for (const v of this.drops.values()) v.body.destroy();
    this.drops.clear();
    for (const d of this.dying) d.figure.destroy();
    this.dying = [];
    this.chestLid = null;
    this.chestGlow = null;
    this.chestPicture = null;
    this.place = state.place;
    const place = placeOf(state);
    // The Art Director's place, when that drop is in the game; else the stand-in painting.
    const folder = ART.places[state.place];
    const layout = folder && this.scene.textures.exists(`${folder}:ground`) ? (this.scene.cache.json.get(`${folder}:place`) as PlaceArt | undefined) : undefined;
    if (folder && layout?.props) this.paintFromArt(place, folder, layout);
    else if (place.town) this.paintTown(place);
    else this.paintIsland(place);
    this.heroAt.x = state.hero.x;
    this.heroAt.y = state.hero.y;
    this.hero.setPosition(state.hero.x, state.hero.y);
    this.hero.rotation = state.hero.facing;
  }

  /**
   * Which monster a tap at this point is on, if any. A drawn monster is tapped on its picture, which stands up from
   * the point the rules have it at (a gull flies well above its own); a thumb is wide, so `slop` is added all round.
   */
  monsterAt(state: GameState, at: Vec, slop: number): number | null {
    let best: number | null = null;
    let bestD = Infinity;
    for (const m of state.monsters) {
      const v = this.monsters.get(m.id);
      const tall = v?.figure ? v.figure.height() : 0;
      const d = Math.hypot(at.x - (v?.x ?? m.x), at.y - ((v?.y ?? m.y) - tall * 0.5));
      if (d <= Math.max(kindOf(m).radius, tall * 0.5) + slop && d < bestD) {
        best = m.id;
        bestD = d;
      }
    }
    return best;
  }

  /** Which thing of the place a tap at this point is on, if any. A thumb is wide: the things are generous. */
  thingAt(state: GameState, at: Vec): Thing | null {
    const place = placeOf(state);
    if (place.chest && Math.hypot(at.x - place.chest.x, at.y - place.chest.y) < 44) return 'chest';
    if (place.shop && Math.abs(at.x - place.shop.x) < 70 && at.y > place.shop.y - 70 && at.y < place.shop.y + 44) return 'shop';
    if (Math.abs(at.x - place.dock.x) < 46 && at.y > place.dock.y - 70) return 'dock';
    return null;
  }

  /** Draw the state: `alpha` of the way from the step before (`prev`) to the last one (`state`). */
  sync(state: GameState, prev: GameState, alpha: number, time: number, delta: number): void {
    if (state.place !== this.place) this.enter(state);
    this.now = time;
    const samePlace = prev.place === state.place;
    const h = state.hero;
    const fade = Math.min(1, delta / 140);

    // A jump (landing from the boat, waking in town) is not walked through.
    const jumped = !samePlace || Math.hypot(h.x - prev.hero.x, h.y - prev.hero.y) > 60;
    const hx = jumped ? h.x : lerp(prev.hero.x, h.x, alpha);
    const hy = jumped ? h.y : lerp(prev.hero.y, h.y, alpha);
    this.heroAt.x = hx;
    this.heroAt.y = hy;
    const down = h.downFor > 0;
    this.heroFlash = Math.max(0, this.heroFlash - fade);
    if (this.heroFigure) {
      // The drawn hero stands on his feet at the point the rules give.
      this.heroFigure.sync({ x: hx, y: hy, depth: DEPTH.bodies + hy, facing: h.facing, moving: h.moving, charging: h.charging !== null, down, worn: h.worn, delta, flash: this.heroFlash > 0.3 });
      this.heroShadow.setPosition(hx, hy + 1);
    } else {
      const bob = h.moving && !down ? Math.sin(time * 0.022) * 1.3 : 0;
      this.hero.setPosition(hx, hy + bob).setDepth(DEPTH.bodies + hy);
      this.hero.rotation = Phaser.Math.Angle.RotateTo(this.hero.rotation, h.facing, delta * 0.02);
      this.hero.setAlpha(down ? 0.4 : 1).setScale(down ? 0.85 : 1);
      this.heroShadow.setPosition(hx + 2, hy + 9);
      this.dress(h);
      this.heroBody.setFillStyle(this.heroFlash > 0.3 ? 0xffffff : this.coatColor);
    }

    this.destDot.setVisible(h.dest !== null);
    if (h.dest) this.destDot.setPosition(h.dest.x, h.dest.y);
    for (const f of this.folk) f.advance(delta);

    const seen = new Set<number>();
    for (const m of state.monsters) {
      seen.add(m.id);
      let v = this.monsters.get(m.id);
      if (!v) {
        v = this.makeMonster(m);
        this.monsters.set(m.id, v);
      }
      const k = kindOf(m);
      const before = samePlace ? prev.monsters.find((p) => p.id === m.id) : undefined;
      v.x = before ? lerp(before.x, m.x, alpha) : m.x;
      v.y = before ? lerp(before.y, m.y, alpha) : m.y;
      v.punch = Math.max(0, v.punch - fade);
      v.pop = Math.max(0, v.pop - fade * 0.6);

      const stunned = m.stunned > 0;
      const windup = m.mode === 'windup' && !stunned ? 1 - m.timer / k.windupSeconds : 0;
      if (v.figure) {
        // The drawn monster: its wind-up is its own animation, started the step the wind-up starts.
        const f = v.figure;
        const walking = m.mode === 'chase' || m.mode === 'return' || m.mode === 'retreat' || (m.mode === 'wander' && m.goal !== null);
        if (stunned) f.play('hit1');
        else if (m.mode === 'windup') f.play('attack1', v.mode !== 'windup');
        else if (!(f.playing === 'attack1' && !f.done)) f.play(walking ? 'move' : 'stand');
        v.mode = m.mode;
        f.face(m.facing);
        f.advance(delta);
        f.place(v.x, v.y, DEPTH.bodies + v.y, (1 + 0.1 * v.punch) * (1 - 0.5 * v.pop));
        f.flash(v.punch > 0.45);
        v.shadow.setPosition(v.x, v.y + 1);
      } else if (v.body && v.shell) {
        v.body.setPosition(v.x, v.y).setDepth(DEPTH.bodies + v.y);
        v.body.rotation = Phaser.Math.Angle.RotateTo(v.body.rotation, m.facing, delta * 0.012);
        v.body.setScale((1 + 0.28 * windup + 0.16 * v.punch) * (1 - 0.5 * v.pop));
        v.shell.setFillStyle(v.punch > 0.45 ? 0xffffff : stunned ? COLORS.stunned : windup > 0 ? COLORS.windup : v.color);
        v.shadow.setPosition(v.x + 2, v.y + v.radius * 0.55);
      }
      // What floats over it (the star, the health bar) sits above its picture, however tall that is.
      const top = v.figure ? v.figure.height() - 6 : v.radius;
      v.star.setVisible(stunned).setPosition(v.x, v.y - top - 12);
      if (stunned) v.star.rotation = time * 0.006;
      if (v.slam) {
        // The ground a slam will hit fills in as the blow comes: stand outside it.
        v.slam.setVisible(windup > 0).setPosition(v.x, v.y);
        if (windup > 0) v.slam.setFillStyle(COLORS.slam, 0.12 + 0.3 * windup);
      }

      const showBar = m.hp < k.maxHp || h.target === m.id;
      const w = v.radius * 2 + 2;
      v.barBack.setVisible(showBar).setPosition(v.x - w / 2 - 1, v.y - top - 13);
      v.bar.setVisible(showBar).setPosition(v.x - w / 2, v.y - top - 12);
      v.bar.scaleX = Math.max(0, m.hp / k.maxHp);
    }
    for (const [id, v] of this.monsters) {
      if (seen.has(id)) continue;
      // A drawn monster that is gone plays its fall where it stood; a stand-in simply goes.
      if (v.figure && samePlace && v.figure.has('die1')) {
        v.figure.play('die1', true);
        v.figure.flash(false);
        this.dying.push({ figure: v.figure, left: v.figure.length('die1') + 350 });
        v.figure = null;
      }
      this.dropMonster(v);
      this.monsters.delete(id);
    }
    if (this.dying.length > 0) {
      for (const d of this.dying) {
        d.left -= delta;
        d.figure.advance(delta);
        d.figure.image.setAlpha(Math.min(1, Math.max(0, d.left / 350)));
        if (d.left <= 0) d.figure.destroy();
      }
      this.dying = this.dying.filter((d) => d.left > 0);
    }

    const target = h.target !== null ? this.monsters.get(h.target) : undefined;
    const ring = this.ringArt ?? this.ring;
    ring.setVisible(target !== undefined);
    if (target) {
      this.ringPop = Math.max(0, this.ringPop - fade);
      // His mark is drawn at two pixels a unit and made for a crab; a bigger monster gets a bigger one.
      const size = (target.radius / 15) * (this.ringArt ? 0.5 : 1);
      ring.setPosition(target.x, target.y + (this.ringArt ? 2 : 6)).setScale(size * (1 + 0.06 * Math.sin(time * 0.008) + 0.5 * this.ringPop));
    }

    // What lies on the ground, each thing with the glow of its rarity (Robin, 2026-11-19).
    const lying = new Set<number>();
    for (const d of state.drops) {
      lying.add(d.id);
      let v = this.drops.get(d.id);
      if (!v) {
        v = this.makeDrop(d);
        this.drops.set(d.id, v);
      }
      const before = samePlace ? prev.drops.find((p) => p.id === d.id) : undefined;
      const x = before ? lerp(before.x, d.x, alpha) : d.x;
      const y = before ? lerp(before.y, d.y, alpha) : d.y;
      v.pop = Math.max(0, v.pop - fade * 0.5);
      v.body.setPosition(x, y - 14 * Math.sin(v.pop * Math.PI)).setDepth(DEPTH.bodies + y - 4);
      // The last seconds before it is gone, it blinks.
      v.body.setAlpha(d.age > N.drops.lifeSeconds - 8 && Math.sin(time * 0.02) > 0 ? 0.35 : 1);
      if (v.glow) v.glow.setScale(v.glowSize * (1 + 0.12 * Math.sin(time * 0.006 + d.id)));
      v.sparks.forEach((spark, i) => spark.setAlpha(0.3 + 0.55 * Math.max(0, Math.sin(time * 0.007 + d.id + i * 2.1))));
    }
    for (const [id, v] of this.drops) {
      if (lying.has(id)) continue;
      v.body.destroy();
      this.drops.delete(id);
    }

    if (this.chestLid && this.chestGlow) {
      const full = chestFull(state);
      this.chestLid.setVisible(full);
      this.chestGlow.setVisible(full).setScale(1 + 0.12 * Math.sin(time * 0.005));
    }
    // The drawn chest: closed while it is full, "opening" for a moment when he opens it, then open until it fills.
    if (this.chestPicture) repicture(this.scene, this.chestPicture, this.chestSet, time < this.chestOpening ? 'chest/opening' : chestFull(state) ? 'chest/closed' : 'chest/open');
  }

  /** The one-shots: numbers, puffs, the sword's arc. */
  show(events: GameEvent[], state: GameState): void {
    for (const e of events) {
      switch (e.type) {
        case 'swing':
          this.swingSword();
          this.heroFigure?.play('attack1');
          break;
        case 'hit': {
          const v = this.monsters.get(e.monster);
          if (v) v.punch = 1;
          this.number(e.x, e.y - 30, e.crit ? `${e.amount}!` : `${e.amount}`, e.crit ? COLORS.crit : COLORS.hit, e.crit ? 22 : e.by === 'cleave' ? 18 : 16);
          break;
        }
        case 'monsterDied':
          this.puff(e.x, e.y, 0xffffff, MONSTERS[e.kind]?.radius ?? 15);
          break;
        case 'heroHit':
          this.heroFlash = 1;
          this.heroFigure?.play('hit1');
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
          this.heroFigure?.play('cleave');
          break;
        case 'picked': {
          const d = e.drop;
          if (d.kind === 'gold') this.number(this.heroAt.x, this.heroAt.y - 34, `+${d.amount}`, COLORS.goldText, 15);
          else if (d.kind === 'potion') this.number(this.heroAt.x, this.heroAt.y - 34, '+potion', COLORS.hurt, 14);
          else if (d.item) this.number(this.heroAt.x, this.heroAt.y - 46, '+gear', RARITIES[d.item.rarity].color, 15);
          break;
        }
        case 'levelUp':
          this.puff(this.heroAt.x, this.heroAt.y, COLORS.target, 30);
          this.puff(this.heroAt.x, this.heroAt.y, COLORS.mark, 18);
          break;
        case 'chestOpened':
          this.puff(e.x, e.y, COLORS.gold, 26);
          this.chestOpening = this.now + 160;
          break;
        default:
          break;
      }
    }
  }

  /** A ring where a tap landed on the ground, so a tap is answered the frame it lands. */
  tapMark(at: Vec): void {
    const drawn = hasGlass(this.scene) ? piece(this.scene, 'mark/tap') : null;
    if (drawn) {
      this.reg(drawn.setPosition(at.x, at.y).setDepth(DEPTH.marks));
      const size = drawn.scaleX;
      this.scene.tweens.add({ targets: drawn, scale: size * 0.35, alpha: 0.2, duration: Math.max(1, settings.ms(280)), ease: 'Quad.easeOut', onComplete: () => drawn.destroy() });
      return;
    }
    const ring = this.reg(this.scene.add.circle(at.x, at.y, 16).setStrokeStyle(3, COLORS.mark, 0.9).setDepth(DEPTH.marks));
    this.scene.tweens.add({ targets: ring, scale: 0.3, alpha: 0.2, duration: Math.max(1, settings.ms(260)), ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
  }

  // ---- the places ------------------------------------------------------------------------------------------------

  /** One more piece of the place: remembered, so it goes when he leaves. */
  private put<T extends Obj>(o: T): T {
    this.scenery.push(o);
    return this.reg(o);
  }

  private ground(key: Ground, x: number, y: number, w: number, h: number): void {
    const g = this.put(this.scene.add.tileSprite(x, y, w, h, `ground-${key}`).setOrigin(0).setDepth(DEPTH.ground));
    g.setTileScale(1 / RES);
  }

  /** The sea round the place, deeper at the south where the boat lies, and the pier he lands on. */
  private shore(place: Place): void {
    const s = this.scene;
    const edge = 10;
    const south = 64;
    for (const [x, y, w, h] of [
      [0, 0, place.width, edge],
      [0, 0, edge, place.height],
      [place.width - edge, 0, edge, place.height],
      [0, place.height - south, place.width, south],
    ] as const) {
      this.put(s.add.rectangle(x, y, w, h, COLORS.sea).setOrigin(0).setDepth(DEPTH.decor));
    }
    this.put(s.add.rectangle(0, place.height - south * 0.45, place.width, south * 0.45, COLORS.seaDeep).setOrigin(0).setDepth(DEPTH.decor));
    this.put(s.add.rectangle(edge, place.height - south - 4, place.width - 2 * edge, 5, COLORS.foam, 0.9).setOrigin(0).setDepth(DEPTH.decor));
    // The pier: planks out over the water, a post each side, and a flag to find it by.
    const d = place.dock;
    const top = d.y - 74;
    this.put(s.add.rectangle(d.x - 34, top, 68, place.height - top - 6, COLORS.wood).setOrigin(0).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.decor + 1));
    for (let y = top + 14; y < place.height - 10; y += 14) this.put(s.add.rectangle(d.x - 33, y, 66, 2, COLORS.woodDark, 0.6).setOrigin(0).setDepth(DEPTH.decor + 1));
    this.put(s.add.circle(d.x - 34, top, 6, COLORS.woodDark).setDepth(DEPTH.decor + 1));
    this.put(s.add.circle(d.x + 34, top, 6, COLORS.woodDark).setDepth(DEPTH.decor + 1));
    this.put(s.add.rectangle(d.x + 44, d.y - 30, 4, 34, COLORS.woodDark).setDepth(DEPTH.bodies + d.y));
    this.put(s.add.triangle(d.x + 58, d.y - 40, 0, 0, 22, 8, 0, 16, COLORS.bandana).setDepth(DEPTH.bodies + d.y));
  }

  /**
   * A place as the Art Director made it: his ground as one picture under everything (it is painted at one pixel a
   * unit and drawn at the place's size), each prop standing on its own point and sorted with the figures by how far
   * down the screen it stands, a flat shadow under each, and his chest.
   */
  private paintFromArt(place: Place, folder: string, layout: PlaceArt): void {
    const s = this.scene;
    this.put(s.add.image(0, 0, `${folder}:ground`).setOrigin(0).setDisplaySize(place.width, place.height).setDepth(DEPTH.ground));
    const set = s.cache.json.get(`${folder}:data`) as SetData | undefined;
    const shadow = (x: number, y: number, name: string): void => {
      const wide = (set?.items[name]?.w ?? 60) / (set?.meta.filePx ?? 2);
      this.put(s.add.ellipse(x, y + 1, Math.max(14, wide * 0.55), Math.max(6, wide * 0.2), 0x5b4a82, 0.25).setDepth(DEPTH.shadows));
    };
    for (const p of layout.props) {
      const image = picture(s, folder, p.name);
      if (!image) continue;
      // What stands over the water (the dock, the boat) casts no shadow on the sand.
      if (!p.name.startsWith('dock') && !p.name.startsWith('boat')) shadow(p.x, p.y, p.name);
      this.put(image.setPosition(p.x, p.y).setDepth(DEPTH.bodies + p.y));
    }
    // The people who stand about: one atlas whose actions are who they are, each standing and breathing.
    const people = this.atlas(`${folder}:folk`, true);
    for (const p of (people && layout.people) || []) {
      const f = new Figure(s, `${folder}:folk`, people!);
      if (!f.has(p.who)) {
        f.destroy();
        continue;
      }
      this.reg(f.image);
      f.play(p.who, true);
      f.face(WAY_ANGLE[p.facing] ?? Math.PI / 2);
      // The keeper stands inside his stall, under its awning: sorted by where he stands, the stall would hide him,
      // so he is drawn just over it, as in the Art Director's own picture of the town.
      const stall = layout.props.find((prop) => prop.name === 'stall' && Math.abs(prop.x - p.x) < 50 && prop.y >= p.y && prop.y - p.y < 40);
      f.place(p.x, p.y, DEPTH.bodies + (stall ? stall.y + 0.5 : p.y));
      this.put(s.add.ellipse(p.x, p.y + 1, 30, 11, 0x5b4a82, 0.25).setDepth(DEPTH.shadows));
      this.folk.push(f);
    }
    if (place.chest) {
      const chest = picture(s, folder, 'chest/closed');
      if (chest) {
        shadow(place.chest.x, place.chest.y, 'chest/closed');
        this.chestPicture = this.put(chest.setPosition(place.chest.x, place.chest.y).setDepth(DEPTH.bodies + place.chest.y));
        this.chestSet = folder;
      } else {
        this.paintChest(place.chest);
      }
    }
  }

  /** The island: a beach in the south where he lands, grass in the middle, a rocky cove in the north. */
  private paintIsland(place: Place): void {
    const s = this.scene;
    const rockTo = 720;
    const grassTo = 1440;
    this.ground('rock', 0, 0, place.width, rockTo);
    this.ground('grass', 0, rockTo, place.width, grassTo - rockTo);
    this.ground('sand', 0, grassTo, place.width, place.height - grassTo);
    // Decoration's own dice: the same island on every phone, and no rule depends on it.
    const rng = makeRng(`decor:${this.place}`);
    // Where two grounds meet, the edge is broken up so it is not a ruled line.
    for (const [y, color] of [
      [rockTo, hex(COLORS.grass[0])],
      [grassTo, hex(COLORS.sand[0])],
    ] as const) {
      for (let x = -20; x < place.width; x += 46) this.put(s.add.ellipse(x + rng.next() * 30, y + (rng.next() - 0.5) * 22, 60 + rng.next() * 70, 26 + rng.next() * 28, color).setDepth(DEPTH.ground + 1));
    }
    for (let i = 0; i < 150; i++) {
      const x = N.margin + rng.next() * (place.width - 2 * N.margin);
      const y = N.margin + rng.next() * (place.height - 2 * N.margin - 60);
      const kind = rng.next();
      if (y < rockTo) {
        if (kind < 0.6) {
          this.put(s.add.ellipse(x + 2, y + 4, 26 + kind * 20, 10, COLORS.shadow, 0.18).setDepth(DEPTH.decor));
          this.put(s.add.ellipse(x, y, 22 + kind * 20, 14 + kind * 8, COLORS.stone).setDepth(DEPTH.decor));
        }
      } else if (y < grassTo) {
        if (kind < 0.16) {
          // A palm, seen from above: low enough to walk over, so nothing hides him.
          this.put(s.add.ellipse(x + 4, y + 6, 54, 30, COLORS.shadow, 0.16).setDepth(DEPTH.decor));
          this.put(s.add.star(x, y, 7, 9, 28, COLORS.palmDark).setDepth(DEPTH.decor));
          this.put(s.add.star(x, y, 7, 6, 21, COLORS.palm).setRotation(0.4).setDepth(DEPTH.decor));
        } else if (kind < 0.7) {
          this.put(s.add.ellipse(x - 4, y, 11, 6, COLORS.tuftDark).setDepth(DEPTH.decor));
          this.put(s.add.ellipse(x + 3, y - 2, 13, 7, COLORS.tuft).setDepth(DEPTH.decor));
        }
      } else if (kind < 0.35) {
        this.put(s.add.circle(x, y, 3.5, COLORS.shell).setDepth(DEPTH.decor));
      } else if (kind < 0.5) {
        this.put(s.add.ellipse(x - 4, y, 11, 6, COLORS.tuftDark).setDepth(DEPTH.decor));
        this.put(s.add.ellipse(x + 3, y - 2, 13, 7, COLORS.tuft).setDepth(DEPTH.decor));
      }
    }
    this.shore(place);
    if (place.chest) this.paintChest(place.chest);
  }

  /** The harbour town: a cobbled quay with house fronts round it, the stall, and a few people who stand about. */
  private paintTown(place: Place): void {
    const s = this.scene;
    this.ground('cobble', 0, 0, place.width, place.height);
    // House fronts along the top and the sides: he walks up to them, not over them.
    const fronts: [number, number, number, number][] = [];
    for (let x = 0, i = 0; x < place.width; x += 150, i++) fronts.push([x, 0, 150, 58 + (i % 2) * 10]);
    for (let y = 80, i = 0; y < place.height - 240; y += 170, i++) {
      fronts.push([0, y, 40 + (i % 2) * 8, 170]);
      fronts.push([place.width - 40 - ((i + 1) % 2) * 8, y, 48, 170]);
    }
    fronts.forEach(([x, y, w, h], i) => {
      this.put(s.add.rectangle(x, y, w, h, COLORS.roofs[i % COLORS.roofs.length]).setOrigin(0).setStrokeStyle(3, COLORS.woodDark).setDepth(DEPTH.decor));
      const wide = w > h;
      this.put(s.add.rectangle(wide ? x + w / 2 - 9 : x + (x === 0 ? w - 7 : 0), wide ? y + h - 7 : y + h / 2 - 9, wide ? 18 : 7, wide ? 7 : 18, COLORS.wall).setOrigin(0).setDepth(DEPTH.decor));
    });
    const rng = makeRng(`decor:${this.place}`);
    for (let i = 0; i < 16; i++) {
      // Crates and barrels on the quay.
      const x = 80 + rng.next() * (place.width - 160);
      const y = 120 + rng.next() * (place.height - 360);
      if (place.shop && Math.hypot(x - place.shop.x, y - place.shop.y) < 130) continue;
      if (Math.hypot(x - place.wake.x, y - place.wake.y) < 70) continue;
      this.put(s.add.ellipse(x + 2, y + 6, 24, 9, COLORS.shadow, 0.18).setDepth(DEPTH.decor));
      if (rng.next() < 0.5) this.put(s.add.rectangle(x, y, 20, 20, COLORS.wood).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.decor));
      else this.put(s.add.circle(x, y, 10, COLORS.wood).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.decor));
    }
    this.shore(place);
    if (place.shop) {
      // The stall: a striped awning, the keeper under it, his table between him and the customer.
      const k = place.shop;
      this.put(s.add.rectangle(k.x, k.y - 36, 132, 40, COLORS.awning).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.decor + 1));
      for (let i = -2; i <= 2; i += 2) this.put(s.add.rectangle(k.x + i * 22, k.y - 36, 16, 38, COLORS.awningStripe).setDepth(DEPTH.decor + 1));
      this.figure(k.x, k.y, COLORS.keeper, Math.PI / 2);
      this.put(s.add.rectangle(k.x, k.y + 26, 118, 16, COLORS.wood).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.bodies + k.y + 26));
      for (const [dx, color] of [
        [-38, COLORS.potion],
        [-8, COLORS.gold],
        [26, COLORS.blade],
      ] as const) {
        this.put(s.add.circle(k.x + dx, k.y + 25, 5, color).setStrokeStyle(1, COLORS.woodDark).setDepth(DEPTH.bodies + k.y + 27));
      }
    }
    this.figure(place.width * 0.68, place.height * 0.4, COLORS.folk[0], 2.4);
    this.figure(place.width * 0.6, place.height * 0.72, COLORS.folk[1], -0.6);
  }

  /** Someone who stands: a body, a head, a shadow. */
  private figure(x: number, y: number, color: number, facing: number): void {
    const s = this.scene;
    this.put(s.add.ellipse(x + 2, y + 9, 32, 14, COLORS.shadow, 0.25).setDepth(DEPTH.shadows));
    const body = s.add.circle(0, 0, 15, color).setStrokeStyle(2, COLORS.woodDark);
    const head = s.add.circle(5, 0, 7, COLORS.skin);
    const c = this.put(s.add.container(x, y, [body, head]).setDepth(DEPTH.bodies + y));
    c.rotation = facing;
  }

  private paintChest(at: Vec): void {
    const s = this.scene;
    this.chestGlow = this.put(s.add.circle(at.x, at.y, 30, COLORS.gold, 0.22).setDepth(DEPTH.marks));
    this.put(s.add.ellipse(at.x + 2, at.y + 12, 40, 14, COLORS.shadow, 0.25).setDepth(DEPTH.shadows));
    // The open chest is what is always there; the lid lies over it while it is full.
    this.put(s.add.rectangle(at.x, at.y, 34, 24, COLORS.chestDark).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.bodies + at.y));
    this.chestLid = this.put(s.add.rectangle(at.x, at.y, 34, 24, COLORS.chest).setStrokeStyle(2, COLORS.woodDark).setDepth(DEPTH.bodies + at.y + 1));
    this.put(s.add.rectangle(at.x, at.y, 6, 24, COLORS.chestBand).setDepth(DEPTH.bodies + at.y + 2));
  }

  // ---- the figures -----------------------------------------------------------------------------------------------

  /** What he wears, shown on the stand-in as colours and a longer blade, changed only when his gear changes. */
  private dress(h: GameState['hero']): void {
    const w = h.worn;
    const key = `${w.weapon?.base}|${w.shield?.base}|${w.hat?.base}|${w.coat?.base}`;
    if (key === this.dressed) return;
    this.dressed = key;
    const blade = BLADES[w.weapon?.base ?? ''];
    this.heroBlade.setVisible(blade !== undefined);
    if (blade) {
      this.heroBlade.setFillStyle(blade.color);
      this.heroBlade.setSize(blade.length, 5);
    }
    const buckler = BUCKLERS[w.shield?.base ?? ''];
    this.heroBuckler.setVisible(buckler !== undefined);
    if (buckler !== undefined) this.heroBuckler.setFillStyle(buckler);
    // Bare-headed he still has his red bandana: it is who he is.
    this.heroHat.setFillStyle(HATS[w.hat?.base ?? ''] ?? COLORS.bandana);
    this.heroHat.setRadius(w.hat && w.hat.base !== 'bandana' ? 10 : 8);
    this.heroFeather.setVisible(w.hat?.base === 'feathered-hat');
    this.coatColor = COATS[w.coat?.base ?? ''] ?? COLORS.hero;
  }

  private makeMonster(m: Monster): MonsterView {
    const s = this.scene;
    const k = kindOf(m);
    const r = k.radius;
    const drawn = this.atlas(m.kind, ART.monsters.includes(m.kind));
    let figure: Figure | null = null;
    let body: Phaser.GameObjects.Container | null = null;
    let shell: Phaser.GameObjects.Shape | null = null;
    let color = 0;
    let parts: Phaser.GameObjects.GameObject[] = [];
    if (drawn) {
      figure = new Figure(s, m.kind, drawn);
      this.reg(figure.image);
      figure.face(m.facing);
      figure.place(m.x, m.y, DEPTH.bodies + m.y);
    } else if (m.kind === 'reef-gull') {
      color = COLORS.gull;
      shell = s.add.ellipse(0, 0, r * 2.2, r * 1.5, color).setStrokeStyle(2, COLORS.gullDark);
      const wingLeft = s.add.ellipse(-3, -r * 0.95, r * 1.5, r * 0.75, COLORS.gullDark);
      const wingRight = s.add.ellipse(-3, r * 0.95, r * 1.5, r * 0.75, COLORS.gullDark);
      const beak = s.add.triangle(r + 5, 0, 0, -4, 9, 0, 0, 4, COLORS.beak);
      parts = [wingLeft, wingRight, shell, beak, s.add.circle(r * 0.5, -3.5, 1.8, 0x16313f), s.add.circle(r * 0.5, 3.5, 1.8, 0x16313f)];
    } else {
      const big = m.kind === 'coconut-crab';
      color = big ? COLORS.coconut : COLORS.crab;
      const dark = big ? COLORS.coconutDark : COLORS.crabDark;
      shell = s.add.circle(0, 0, r, color).setStrokeStyle(2, dark);
      const claw = big ? r * 0.45 : r * 0.4;
      const clawLeft = s.add.circle(r * 0.87, -r * 0.73, claw, color).setStrokeStyle(2, dark);
      const clawRight = s.add.circle(r * 0.87, r * 0.73, claw, color).setStrokeStyle(2, dark);
      parts = [clawLeft, clawRight, shell, s.add.circle(r * 0.6, -r * 0.27, 2.5, 0xffffff), s.add.circle(r * 0.6, r * 0.27, 2.5, 0xffffff)];
      if (big) parts.push(s.add.circle(-r * 0.25, 0, r * 0.42, dark, 0.55));
    }
    if (!figure) {
      body = this.reg(s.add.container(m.x, m.y, parts));
      body.rotation = m.facing;
    }
    const w = r * 2 + 2;
    return {
      figure,
      mode: m.mode,
      body,
      shell,
      color,
      shadow: this.reg(s.add.ellipse(m.x, m.y, r * 2.3, r, COLORS.shadow, 0.25).setDepth(DEPTH.shadows)),
      barBack: this.reg(s.add.rectangle(0, 0, w + 2, 6, COLORS.barBack, 0.85).setOrigin(0).setDepth(DEPTH.effects).setVisible(false)),
      bar: this.reg(s.add.rectangle(0, 0, w, 4, COLORS.hp).setOrigin(0).setDepth(DEPTH.effects + 1).setVisible(false)),
      star: this.reg(s.add.star(m.x, m.y, 5, 3.5, 8, COLORS.target).setDepth(DEPTH.effects).setVisible(false)),
      slam: k.slamRadius > 0 ? this.reg(s.add.circle(m.x, m.y, k.slamRadius, COLORS.slam, 0.15).setStrokeStyle(2, COLORS.slam, 0.7).setDepth(DEPTH.marks).setVisible(false)) : null,
      radius: r,
      x: m.x,
      y: m.y,
      punch: 0,
      pop: 1,
    };
  }

  private dropMonster(v: MonsterView): void {
    v.figure?.destroy();
    v.body?.destroy();
    v.shadow.destroy();
    v.barBack.destroy();
    v.bar.destroy();
    v.star.destroy();
    v.slam?.destroy();
  }

  /** A thing on the ground: coins, a bottle, or a bundle with the glow of its rarity and, when it is rare, a beam. */
  private makeDrop(d: Drop): DropView {
    const s = this.scene;
    const pop = d.age < 0.2 ? 1 : 0;
    if (ART.loot && s.textures.exists('loot')) {
      // The Art Director's loot: under a piece of gear the ring of its rarity, then the bundle; coins and potions
      // need no ring; a rare or epic piece gets a spark or two in its rarity's light tone, blinking.
      const set = s.cache.json.get('loot:data') as SetData | undefined;
      const drawn: Phaser.GameObjects.Image[] = [];
      const sparks: Phaser.GameObjects.Image[] = [];
      let ring: Phaser.GameObjects.Image | null = null;
      if (d.kind === 'item' && d.item) {
        ring = picture(s, 'loot', `ring/${d.item.rarity}`);
        if (ring) drawn.push(ring);
        const bundle = picture(s, 'loot', 'gear');
        if (bundle) drawn.push(bundle);
        const light = hex(set?.items[`ring/${d.item.rarity}`]?.light ?? RARITIES[d.item.rarity].color);
        const count = d.item.rarity === 'epic' ? 2 : d.item.rarity === 'rare' ? 1 : 0;
        for (let i = 0; i < count; i++) {
          const spark = picture(s, 'loot', 'spark');
          if (!spark) continue;
          spark.setPosition(i === 0 ? 12 : -13, i === 0 ? -20 : -12).setTint(light);
          drawn.push(spark);
          sparks.push(spark);
        }
      } else {
        const thing = picture(s, 'loot', d.kind === 'gold' ? 'coins' : 'potion');
        if (thing) drawn.push(thing);
      }
      if (drawn.length > 0) return { body: this.reg(s.add.container(d.x, d.y, drawn)), glow: ring, glowSize: ring ? ring.scaleX : 1, sparks, pop };
    }
    const parts: Phaser.GameObjects.GameObject[] = [s.add.ellipse(1, 7, 20, 8, COLORS.shadow, 0.22)];
    let glow: Phaser.GameObjects.Arc | null = null;
    let beam: Phaser.GameObjects.Rectangle | null = null;
    if (d.kind === 'gold') {
      const coins = d.amount >= 10 ? 3 : d.amount >= 4 ? 2 : 1;
      for (let i = 0; i < coins; i++) parts.push(s.add.circle(i * 6 - (coins - 1) * 3, i % 2 ? -2 : 1, 5, COLORS.gold).setStrokeStyle(1.5, COLORS.goldDark));
    } else if (d.kind === 'potion') {
      parts.push(s.add.rectangle(0, -7, 5, 6, COLORS.wall).setStrokeStyle(1, COLORS.woodDark));
      parts.push(s.add.circle(0, 1, 6.5, COLORS.potion).setStrokeStyle(1.5, 0x7d1f24));
    } else if (d.item) {
      const info = RARITIES[d.item.rarity];
      const color = hex(info.color);
      if (d.item.rarity !== 'common') {
        glow = s.add.circle(0, 2, 15, color, 0.35);
        parts.push(glow);
      }
      if (d.item.rarity === 'rare' || d.item.rarity === 'epic') {
        beam = s.add.rectangle(0, -34, d.item.rarity === 'epic' ? 9 : 6, 72, color, 0.45);
        parts.push(beam);
      }
      parts.push(s.add.rectangle(0, 0, 15, 13, COLORS.wood).setStrokeStyle(2.5, color));
      parts.push(s.add.rectangle(0, 0, 15, 3, color));
    }
    return { body: this.reg(s.add.container(d.x, d.y, parts)), glow, glowSize: 1, sparks: beam ? [beam] : [], pop };
  }

  // ---- the one-shots ---------------------------------------------------------------------------------------------

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
    this.slash.slice(at.x, at.y, N.cleave.radius + 15, facing - half, facing + half, false);
    this.slash.fillPath();
    this.scene.tweens.killTweensOf(this.slash);
    this.slash.setAlpha(1);
    this.scene.tweens.add({ targets: this.slash, alpha: 0, duration: Math.max(1, settings.ms(200)), ease: 'Quad.easeOut' });
  }
}
