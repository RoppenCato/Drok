// The chest's opening as a screen of its own, over the game, which stands still meanwhile (Robin, 2026-11-20: "I
// think the chests should open like in zite where its a big pop up screen and the game pauses"). It is Zite's
// reveal, by its numbers: a dark veil; the chest big in the middle, charging: it shakes harder and harder and glows
// in the colour of the best thing inside, the longer the rarer; the rarest rumbles, stops dead and squashes; then
// the pop (a flash, rays, sparkles, petals); then each prize on a card of its own, one after the other, a tap or
// two seconds apart; then the game goes on. A tap during the charge opens it at once.

import Phaser from 'phaser';
import { N, RARITIES, itemName, type Item, type Prize, type Rarity } from '../../../rules/src/index.ts';
import { ART, GEAR_ART } from '../art.ts';
import { COLORS, DEPTH, DESIGN_HEIGHT, DESIGN_WIDTH, FONT, RES, WEIGHT, hex } from '../layout.ts';
import { settings } from '../settings.ts';
import { sounds } from '../sound.ts';
import { picture, repicture } from './figures.ts';
import { WOOD, lighter, piece, stretch } from './glass.ts';
import { statWords } from './panels.ts';

type Obj = Phaser.GameObjects.GameObject;
type Register = <T extends Obj>(object: T) => T;

const W = DESIGN_WIDTH;
const H = DESIGN_HEIGHT;
const CX = W / 2;
const CHEST_Y = 430;
const CARD_Y = 660;
const TOP = DEPTH.panel + 30;
/** How hard it shakes, how many sparkles and petals fly, and how hard the ground jolts, by rarity (Zite's table). */
const TIERS: Rarity[] = ['common', 'uncommon', 'rare', 'epic'];
const SHAKE = [0.5, 0.75, 1, 1.4];
const SPARKLES = [6, 8, 10, 16];
const PETALS = [4, 5, 6, 10];
const JOLT = [0, 0, 0.005, 0.009];

export class Reveal {
  /** The screen is up: the game stands still. */
  open = false;

  private readonly scene: Phaser.Scene;
  private readonly reg: Register;
  private objects: Obj[] = [];
  private phase: 'charge' | 'still' | 'cards' | 'closing' = 'charge';
  private clock = 0;
  private charge = 0;
  private tier = 0;
  private color = 0xffffff;
  private light = 0xffffff;
  private prizes: Prize[] = [];
  private chest: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | null = null;
  private chestKey = '';
  private chestScale = 1;
  private glow: Phaser.GameObjects.Arc | Phaser.GameObjects.Image | null = null;
  /** The glow's size at rest: the picture's own scale, or 1 for the stand-in circle. */
  private glowScale = 1;
  private hint: Phaser.GameObjects.Text | null = null;
  private count: Phaser.GameObjects.Text | null = null;
  private rumble = 0;
  private stillAt = 0;
  private popAt = 0;
  private card: Phaser.GameObjects.Container | null = null;
  private cardIndex = -1;
  private cardAt = -1;
  /** When the card now sliding up comes to rest, on this screen's own clock; and what to do then. */
  private restAt = -1;
  private closeAt = 0;
  /** The card that is lifting away while the next slides up. */
  private leaving: Phaser.GameObjects.Container | null = null;
  private rest: (() => void) | null = null;

  constructor(scene: Phaser.Scene, reg: Register) {
    this.scene = scene;
    this.reg = reg;
  }

  /** Open the screen for a chest whose best piece is of this rarity; `chestKey` is the atlas its picture is in. */
  show(rarity: Rarity, prizes: Prize[], chestKey: string): void {
    this.clear();
    const s = this.scene;
    const few = settings.get().fewerEffects;
    this.open = true;
    this.phase = 'charge';
    this.clock = 0;
    this.rumble = 0;
    this.cardIndex = -1;
    this.cardAt = -1;
    this.rest = null;
    this.prizes = prizes;
    this.tier = Math.max(0, TIERS.indexOf(rarity));
    this.color = hex(RARITIES[rarity].color);
    this.light = hex(lighter(lighter(RARITIES[rarity].color)));
    this.charge = few ? 0 : N.chest.chargeSeconds[rarity] * 1000;
    this.chestKey = chestKey;

    const veil = this.keep(s.add.rectangle(CX, H / 2, W, H, 0x0a0c14, 0).setDepth(TOP));
    s.tweens.add({ targets: veil, fillAlpha: 0.88, duration: 150 });
    this.words(CX, 170, 'Treasure chest', 26, WOOD.gold);
    this.count = this.words(CX, 204, '', 14, WOOD.dim);
    // Leonard, AD's pieces for the light (white, tinted with the rarity's colour) when that drop is in; else shapes.
    const glow = this.lit('glow');
    if (glow) {
      this.glowScale = (glow.scaleX * 230) / 96;
      this.glow = this.keep(glow.setPosition(CX, CHEST_Y - 14).setTint(this.color).setAlpha(0.2).setScale(this.glowScale * 0.5).setDepth(TOP + 1));
    } else {
      this.glowScale = 1;
      this.glow = this.keep(s.add.circle(CX, CHEST_Y - 10, 96, this.color, 0.2).setBlendMode(Phaser.BlendModes.ADD).setDepth(TOP + 1));
    }
    // Leonard, AD's chest for this screen (planks, gold straps, a lock, coins inside; three times the field's
    // sharpness) when that drop is in; else the field's small chest of this place, blown up.
    const big = s.textures.exists('chest-big');
    if (big) this.chestKey = 'chest-big';
    const drawn = big ? picture(s, 'chest-big', 'chest/closed') : chestKey ? picture(s, chestKey, 'chest/closed') : null;
    if (drawn) {
      this.chestScale = drawn.scaleX * 3.4;
      this.chest = this.keep(drawn.setPosition(CX, CHEST_Y).setScale(this.chestScale).setDepth(TOP + 2));
    } else {
      this.chestScale = 1;
      this.chest = this.keep(s.add.rectangle(CX, CHEST_Y - 30, 120, 86, COLORS.chest).setStrokeStyle(4, COLORS.woodDark).setDepth(TOP + 2));
    }
    this.hint = this.words(CX, H - 110, few ? '' : 'Tap to open', 14, WOOD.dim);
    sounds.play('chest');
  }

  /** A finger came down: open the chest now, or go on to the next prize. */
  tap(): void {
    if (!this.open) return;
    if (this.phase === 'charge' && this.clock > 150) this.pop();
    else if (this.phase === 'still') this.pop();
    else if (this.phase === 'cards' && this.cardAt >= 0) this.nextCard();
  }

  /** A frame of `delta` ms: the charge moves on, a card that has rested long enough makes room. */
  update(delta: number): void {
    if (!this.open) return;
    this.clock += delta;
    const few = settings.get().fewerEffects;
    if (this.phase === 'charge') {
      const t = this.charge > 0 ? Math.min(1, this.clock / this.charge) : 1;
      const hard = t * t * SHAKE[this.tier]!;
      if (this.chest && !few) {
        this.chest.setRotation(Math.sin(this.clock * 0.06) * 0.1 * hard);
        this.chest.setPosition(CX + Math.sin(this.clock * 0.09) * 7 * hard, this.home() - Math.abs(Math.sin(this.clock * 0.045)) * 12 * hard);
        // Its own colour goes most of the way to the rarity's light.
        if (this.chest instanceof Phaser.GameObjects.Image) {
          const c = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.IntegerToColor(0xffffff), Phaser.Display.Color.IntegerToColor(this.light), 100, Math.round(70 * t));
          this.chest.setTint(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
        }
      }
      this.glow?.setAlpha(0.2 + 0.8 * t).setScale(this.glowScale * (0.5 + 0.8 * t));
      // The rarest rumbles: the ground shakes in ticks that come faster and faster.
      if (this.tier >= 3 && !few && this.clock >= this.rumble) {
        this.shake(100, 0.0006 + t * t * 0.004);
        this.rumble = this.clock + 520 - 360 * t;
      }
      if (t >= 1) {
        if (this.tier >= 3 && !few && this.chest) {
          // It stops dead and squashes, a breath before the pop.
          this.phase = 'still';
          this.stillAt = this.clock;
          this.chest.setRotation(0).setPosition(CX, this.home()).setScale(this.chestScale * 1.14, this.chestScale * 0.84);
        } else {
          this.pop();
        }
      }
    } else if (this.phase === 'closing') {
      if (this.clock >= this.closeAt) {
        this.clear();
        this.open = false;
      }
    } else if (this.phase === 'still') {
      if (this.clock - this.stillAt >= 240) this.pop();
    } else if (this.phase === 'cards') {
      if (this.rest && this.clock >= this.restAt) {
        const rest = this.rest;
        this.rest = null;
        rest();
      } else if (this.cardIndex < 0 && this.clock - this.popAt >= (few ? 0 : 360)) this.showCard(0);
      else if (this.cardAt >= 0 && this.clock - this.cardAt >= (few ? 1500 : 2200)) this.nextCard();
    }
  }

  private home(): number {
    return this.chest instanceof Phaser.GameObjects.Image ? CHEST_Y : CHEST_Y - 30;
  }

  private pop(): void {
    const s = this.scene;
    const few = settings.get().fewerEffects;
    this.phase = 'cards';
    this.popAt = this.clock;
    this.hint?.setText('');
    sounds.play('level_up', 0.55 + 0.12 * this.tier);
    sounds.play('coin');
    const chest = this.chest;
    if (chest) {
      chest.setRotation(0).setPosition(CX, this.home());
      if (chest instanceof Phaser.GameObjects.Image) {
        chest.clearTint();
        repicture(s, chest, this.chestKey, 'chest/open');
      } else {
        chest.setFillStyle(COLORS.chestDark);
      }
      if (few) chest.setScale(this.chestScale);
      else {
        chest.setScale(this.chestScale * 1.22, this.chestScale * 0.82);
        s.tweens.add({ targets: chest, scaleX: this.chestScale, scaleY: this.chestScale, duration: 300, ease: 'Back.easeOut' });
      }
    }
    if (this.glow) {
      const g = this.glowScale;
      if (few) this.glow.setAlpha(0.85).setScale(g * 1.4);
      else s.tweens.add({ targets: this.glow, alpha: 1, scale: g * 1.5, duration: 250, onComplete: () => this.glow && s.tweens.add({ targets: this.glow, alpha: 0.85, scale: g * 1.4, duration: 300 }) });
    }
    if (few) return;
    const lit = <T extends Phaser.GameObjects.Shape>(o: T): T => this.keep(o.setBlendMode(Phaser.BlendModes.ADD).setDepth(TOP + 4) as T);
    // A white flash that grows and is gone.
    const flash = lit(s.add.circle(CX, CHEST_Y - 20, 40, 0xffffff, 0.9));
    s.tweens.add({ targets: flash, scale: 5 + this.tier * 2.5, alpha: 0, duration: 200 + this.tier * 60, ease: 'Quad.easeOut', onComplete: () => flash.setVisible(false) });
    if (s.textures.exists('burst')) this.burst();
    else this.shapes(lit);
    if (JOLT[this.tier]! > 0) this.shake(140, JOLT[this.tier]!);
  }

  /**
   * The burst from Leonard, AD's pieces (his drop of 2026-11-20, made for the chest in the field and used here on
   * its own screen): a ring that runs out under the chest, rays that turn behind it for as long as the screen is
   * up, a beam on its mouth, stars thrown out, and gold coins that fly up and fall. The coloured pieces are drawn
   * plain and only the beam is added as light: his lesson, a coloured piece added as light goes white.
   */
  private burst(): void {
    const s = this.scene;
    const mouth = CHEST_Y - 24;
    const ring = this.lit('ring');
    if (ring) {
      const k = ring.scaleX * 1.6;
      this.keep(ring.setPosition(CX, CHEST_Y + 6).setTint(this.light).setScale(k * 0.3).setDepth(TOP + 1));
      s.tweens.add({ targets: ring, scale: k * 1.8, alpha: 0, duration: 420, ease: 'Quad.easeOut', onComplete: () => ring.setVisible(false) });
    }
    const rays = this.lit('rays');
    if (rays) {
      const k = rays.scaleX * (2.2 + this.tier * 0.25);
      this.keep(rays.setPosition(CX, mouth).setTint(this.light).setAlpha(0).setScale(k * 0.6).setDepth(TOP + 1));
      s.tweens.add({ targets: rays, alpha: 0.75, scale: k, duration: 260, ease: 'Quad.easeOut' });
      // About forty degrees a second, for as long as the screen is up.
      s.tweens.add({ targets: rays, angle: 360, duration: 9000, repeat: -1 });
    }
    const beam = this.lit('beam');
    if (beam) {
      const k = beam.scaleX * 1.6;
      this.keep(beam.setPosition(CX, mouth).setTint(this.light).setBlendMode(Phaser.BlendModes.ADD).setScale(k, k * 0.2).setAlpha(0.9).setDepth(TOP + 3));
      s.tweens.add({ targets: beam, scaleY: k * (1.2 + this.tier * 0.2), duration: 220, ease: 'Quad.easeOut' });
      s.tweens.add({ targets: beam, alpha: 0, delay: 420, duration: 380, onComplete: () => beam.setVisible(false) });
    }
    for (let i = 0; i < SPARKLES[this.tier]!; i++) {
      const star = this.lit('star');
      if (!star) break;
      const a = -Math.PI / 2 + ((i / Math.max(1, SPARKLES[this.tier]! - 1)) - 0.5) * 2.6;
      const far = 90 + ((i * 53) % 70);
      const k = star.scaleX * (0.5 + ((i * 37) % 5) * 0.12);
      this.keep(star.setPosition(CX, mouth).setTint(this.light).setScale(k * 0.3).setDepth(TOP + 4));
      s.tweens.add({ targets: star, x: CX + Math.cos(a) * far, y: mouth + Math.sin(a) * far, angle: 200, duration: 480 + (i % 4) * 60, ease: 'Quad.easeOut' });
      s.tweens.add({ targets: star, scale: k, duration: 200, yoyo: true, hold: 120, onComplete: () => star.setVisible(false) });
    }
    // Coins: up out of the mouth, turning, and down past the chest.
    const coins = [5, 7, 9, 12][this.tier]!;
    for (let i = 0; i < coins; i++) {
      const coin = picture(s, 'burst', `coin/${(i % 4) + 1}`);
      if (!coin) break;
      const dx = ((i * 61) % 220) - 110;
      const high = 90 + ((i * 29) % 90);
      this.keep(coin.setPosition(CX, mouth).setScale(coin.scaleX * 1.6).setDepth(TOP + 4));
      let frame = i % 4;
      const turn = s.time.addEvent({ delay: 70, loop: true, callback: () => coin.active && repicture(s, coin, 'burst', `coin/${(frame = (frame + 1) % 4) + 1}`) });
      s.tweens.add({ targets: coin, x: CX + dx, duration: 760 + (i % 3) * 80, ease: 'Linear' });
      s.tweens.add({ targets: coin, y: mouth - high, duration: 300, ease: 'Quad.easeOut' });
      s.tweens.add({
        targets: coin,
        y: CHEST_Y + 70 + ((i * 17) % 40),
        alpha: 0,
        delay: 300,
        duration: 460 + (i % 3) * 80,
        ease: 'Quad.easeIn',
        onComplete: () => {
          turn.remove();
          coin.setVisible(false);
        },
      });
    }
  }

  /** One of his light pieces, or null when that drop is not in the game. */
  private lit(name: string): Phaser.GameObjects.Image | null {
    return this.scene.textures.exists('burst') ? picture(this.scene, 'burst', name) : null;
  }

  /** The burst as plain shapes, for a game without his pieces. */
  private shapes(lit: <T extends Phaser.GameObjects.Shape>(o: T) => T): void {
    const s = this.scene;
    const rays = 8 + this.tier * 2;
    for (let i = 0; i < rays; i++) {
      const long = 150 + this.tier * 40;
      const ray = lit(s.add.triangle(CX, CHEST_Y - 20, 0, 0, -12, -long, 12, -long, this.light, 0.7).setOrigin(0, 0));
      ray.setRotation((i / rays) * Math.PI * 2);
      s.tweens.add({ targets: ray, rotation: ray.rotation + 0.8, alpha: 0, scale: 1.5, duration: 700 + this.tier * 120, ease: 'Quad.easeOut', onComplete: () => ray.setVisible(false) });
    }
    for (let i = 0; i < SPARKLES[this.tier]!; i++) {
      const star = lit(s.add.star(CX + ((i * 37) % 160) - 80, CHEST_Y - 10, 4, 3, 9, this.light, 1));
      s.tweens.add({ targets: star, y: CHEST_Y - 80 - ((i * 53) % 80), alpha: 0, angle: 180, duration: 460 + (i % 4) * 70, ease: 'Quad.easeOut', onComplete: () => star.setVisible(false) });
    }
    for (let i = 0; i < PETALS[this.tier]!; i++) {
      const petal = this.keep(s.add.rectangle(CX, CHEST_Y - 20, 10, 7, this.color).setDepth(TOP + 3).setRotation(i));
      s.tweens.add({ targets: petal, x: CX + ((i * 61) % 200) - 100, y: CHEST_Y - 50 - ((i * 29) % 50), duration: 240, ease: 'Quad.easeOut' });
      s.tweens.add({ targets: petal, y: CHEST_Y + 90 + ((i * 17) % 40), alpha: 0, angle: 300, delay: 240, duration: 520 + ((i * 71) % 300), ease: 'Quad.easeIn', onComplete: () => petal.setVisible(false) });
    }
  }

  /** The prize's card slides up from behind the chest; when it rests, a bell, and its name swells for a moment. */
  private showCard(index: number): void {
    const s = this.scene;
    const prize = this.prizes[index];
    if (!prize) {
      this.close();
      return;
    }
    const few = settings.get().fewerEffects;
    this.cardIndex = index;
    this.cardAt = -1;
    this.count?.setText(`${index + 1} of ${this.prizes.length}`);
    const rarity = prize.item ? RARITIES[prize.item.rarity] : null;
    const rim = rarity ? hex(rarity.color) : hex(WOOD.gold);
    const parts: Obj[] = [];
    parts.push(s.add.rectangle(0, 0, 316, 116, rim));
    const board = stretch(s, 'row', 308, 108);
    parts.push(board ?? s.add.rectangle(0, 0, 308, 108, COLORS.panel));
    parts.push(...this.icon(prize));
    const name = this.text(-88, prize.item ? -28 : -12, prize.kind === 'gold' ? `${prize.amount} gold` : prize.kind === 'potion' ? `${prize.amount} ${prize.amount === 1 ? 'potion' : 'potions'}` : itemName(prize.item!), 18, rarity ? lighter(rarity.color) : WOOD.gold).setOrigin(0, 0.5);
    parts.push(name);
    if (prize.item) {
      parts.push(this.text(-88, -4, statWords(prize.item), 14, WOOD.text).setOrigin(0, 0.5));
      parts.push(this.text(-88, 22, `${rarity!.name}. ${prize.kept === 'worn' ? 'You put it on.' : prize.kept === 'ground' ? 'Bag full: it lies by the chest.' : 'Into your bag.'}`, 13, WOOD.dim).setOrigin(0, 0.5));
    } else {
      parts.push(this.text(-88, 14, prize.kind === 'gold' ? 'Into your purse.' : 'Into your belt.', 13, WOOD.dim).setOrigin(0, 0.5));
    }
    const card = this.keep(s.add.container(CX, few ? CARD_Y : CHEST_Y + 40, parts).setDepth(TOP + 6).setAlpha(few ? 1 : 0));
    this.card = card;
    sounds.play('open');
    const rest = (): void => {
      if (this.card !== card) return;
      // The card before it is gone by now, whatever became of its fade.
      this.leaving?.setVisible(false);
      this.leaving = null;
      card.setPosition(CX, CARD_Y).setAlpha(1);
      this.cardAt = this.clock;
      sounds.play('pickup');
      this.hint?.setText(index + 1 < this.prizes.length ? 'Tap for the next' : 'Tap to go on');
      if (!few) s.tweens.add({ targets: name, scale: 1.12, duration: 110, yoyo: true });
    };
    // It rests by this screen's own clock, not by the slide's end: a slide that is cut short never leaves it stuck.
    this.rest = rest;
    this.restAt = this.clock + (few ? 0 : 380);
    if (!few) s.tweens.add({ targets: card, y: CARD_Y, alpha: 1, duration: 380, ease: 'Back.easeOut' });
  }

  private nextCard(): void {
    const s = this.scene;
    const card = this.card;
    this.card = null;
    this.cardAt = -1;
    this.rest = null;
    this.leaving?.setVisible(false);
    this.leaving = card;
    if (card) s.tweens.killTweensOf(card);
    if (card) s.tweens.add({ targets: card, y: card.y - 40, alpha: 0, duration: 160, onComplete: () => card.setVisible(false) });
    if (!settings.get().fewerEffects) {
      for (let i = 0; i < 4; i++) {
        const star = this.keep(s.add.star(CX - 90 + i * 60, CARD_Y - 30, 4, 2, 7, this.light, 1).setBlendMode(Phaser.BlendModes.ADD).setDepth(TOP + 7));
        s.tweens.add({ targets: star, y: CARD_Y - 90 - i * 8, alpha: 0, duration: 380, onComplete: () => star.setVisible(false) });
      }
    }
    this.showCard(this.cardIndex + 1);
  }

  /** The picture of a prize, left on its card. */
  private icon(prize: Prize): Obj[] {
    const s = this.scene;
    const x = -122;
    if (prize.item) {
      const out: Obj[] = [];
      const slot = piece(s, `slot/${prize.item.rarity}`);
      if (slot) out.push(slot.setPosition(x, 0).setScale(60 / slot.width));
      const art = `icon/${GEAR_ART[prize.item.base] ?? ''}`;
      if (ART.gear && s.textures.exists('gear-icons') && s.textures.get('gear-icons').has(art)) {
        const pic = s.add.image(x, 0, 'gear-icons', art);
        out.push(pic.setScale(Math.min(44 / pic.width, 44 / pic.height)));
      }
      return out;
    }
    if (prize.kind === 'potion' && ART.loot && s.textures.exists('loot') && s.textures.get('loot').has('potion')) {
      const pic = picture(s, 'loot', 'potion');
      if (pic) return [pic.setPosition(x, 4).setScale(pic.scaleX * 2)];
    }
    const coin = prize.kind === 'gold' ? piece(s, 'mark/coin') : null;
    if (coin) return [coin.setPosition(x, 0).setScale(coin.scaleX * 3)];
    return [s.add.circle(x, 0, 22, prize.kind === 'gold' ? COLORS.gold : COLORS.potion).setStrokeStyle(3, COLORS.woodDark)];
  }

  /** Everything fades, and the game goes on. */
  private close(): void {
    this.phase = 'closing';
    this.hint?.setText('');
    this.count?.setText('');
    // It is over by this screen's own clock, a moment after the fade starts.
    this.closeAt = this.clock + (settings.get().fewerEffects ? 0 : 180);
    if (!settings.get().fewerEffects) this.scene.tweens.add({ targets: this.objects, alpha: 0, duration: 180 });
    sounds.play('close');
  }

  private clear(): void {
    for (const o of this.objects) {
      this.scene.tweens.killTweensOf(o);
      o.destroy();
    }
    this.objects = [];
    this.chest = null;
    this.glow = null;
    this.hint = null;
    this.count = null;
    this.card = null;
    this.leaving = null;
  }

  private shake(ms: number, strength: number): void {
    for (const camera of this.scene.cameras.cameras) camera.shake(ms, strength);
  }

  private keep<T extends Obj>(o: T): T {
    this.objects.push(o);
    return this.reg(o);
  }

  private text(x: number, y: number, words: string, size: number, color: string): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, words, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: WEIGHT, color, resolution: RES }).setOrigin(0.5);
  }

  private words(x: number, y: number, words: string, size: number, color: string): Phaser.GameObjects.Text {
    return this.keep(this.text(x, y, words, size, color).setDepth(TOP + 5).setStroke('#1a1220', 4));
  }
}

export type { Item };
