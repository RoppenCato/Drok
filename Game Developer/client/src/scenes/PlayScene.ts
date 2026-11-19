import Phaser from 'phaser';
import type { GameEvent } from '../../../rules/src/index.ts';
import type { GameLog } from '../game-log.ts';
import { COLORS, DESIGN_WIDTH, FONT, GAME_NAME } from '../layout.ts';
import type { LocalGame } from '../local-game.ts';
import { settings } from '../settings.ts';

const SQUARE = 96;
const GAP = 14;
const BOARD_TOP = 250;

/**
 * The one screen: the game's name, the small board to tap, a hint line and the small buttons. A tap becomes an intent
 * for the holder; what the rules answer (moved, rejected) is drawn from the events, never guessed here.
 */
export class PlayScene extends Phaser.Scene {
  private readonly holder: LocalGame;
  private readonly log: GameLog;
  private readonly squares = new Map<string, Phaser.GameObjects.Rectangle>();
  private left = 0;
  private marker!: Phaser.GameObjects.Arc;
  private gold!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  // Named for what they are: a scene already has `sound` (its sound manager).
  private effectsButton!: Phaser.GameObjects.Text;
  private soundButton!: Phaser.GameObjects.Text;

  constructor(o: { holder: LocalGame; log: GameLog }) {
    super({ key: 'play' });
    this.holder = o.holder;
    this.log = o.log;
  }

  create(): void {
    const spaces = Object.values(this.holder.state.board.spaces);
    const columns = Math.max(...spaces.map((s) => s.col)) + 1;
    this.left = (DESIGN_WIDTH - (columns * SQUARE + (columns - 1) * GAP)) / 2 + SQUARE / 2;

    this.add.text(DESIGN_WIDTH / 2, 90, GAME_NAME, { fontFamily: FONT, fontSize: '34px', fontStyle: 'bold', color: COLORS.text }).setOrigin(0.5);
    this.gold = this.add.text(DESIGN_WIDTH / 2, 150, '', { fontFamily: FONT, fontSize: '20px', color: COLORS.gold }).setOrigin(0.5);

    for (const space of spaces) {
      const { x, y } = this.centre(space.col, space.row);
      const square = this.add.rectangle(x, y, SQUARE, SQUARE, COLORS.square).setStrokeStyle(2, COLORS.border);
      square.setInteractive({ useHandCursor: true });
      square.on('pointerdown', () => this.tap(space.id));
      this.add.text(x, y + SQUARE / 2 - 14, space.id, { fontFamily: FONT, fontSize: '13px', color: COLORS.dim }).setOrigin(0.5);
      this.squares.set(space.id, square);
    }
    const here = this.holder.state.board.spaces[this.holder.me.space]!;
    const at = this.centre(here.col, here.row);
    this.marker = this.add.circle(at.x, at.y, 22, COLORS.player);

    this.hint = this.add.text(DESIGN_WIDTH / 2, 640, '', { fontFamily: FONT, fontSize: '18px', color: COLORS.text, align: 'center', wordWrap: { width: DESIGN_WIDTH - 60 } }).setOrigin(0.5);
    this.say('Tap a square next to you.', COLORS.dim);

    // The small buttons: the log for Robin's phone, the two settings, and a way to start over while testing.
    this.button(DESIGN_WIDTH / 2, 790, 'New game', () => {
      this.holder.reset();
      location.reload();
    });
    this.button(62, 860, 'Log', () => this.log.download());
    this.effectsButton = this.button(190, 860, '', () => {
      settings.set({ fewerEffects: !settings.get().fewerEffects });
      this.words();
    });
    this.soundButton = this.button(328, 860, '', () => {
      settings.set({ mute: !settings.get().mute });
      this.words();
    });
    this.words();
    this.refresh();
  }

  /** A square tapped: ask the rules. */
  private tap(to: string): void {
    void this.holder.act({ type: 'move', player: this.holder.player, to }).then((events) => this.show(events));
  }

  /** Draw what the rules said. */
  private show(events: GameEvent[]): void {
    for (const e of events) {
      if (e.type === 'moved') {
        const space = this.holder.state.board.spaces[e.to]!;
        const { x, y } = this.centre(space.col, space.row);
        // With fewer effects the marker jumps: settings.ms gives 0.
        this.tweens.add({ targets: this.marker, x, y, duration: settings.ms(180), ease: 'Quad.easeOut' });
        this.say(`Found ${e.found} gold on ${e.to}.`, COLORS.text);
        this.log.note(`moved ${e.from} to ${e.to}, found ${e.found}`);
      } else if (e.type === 'rejected') {
        this.say(`No: ${e.reason}.`, COLORS.warn);
        this.log.note(`rejected: ${e.reason}`);
      }
    }
    this.refresh();
  }

  /** The numbers and the squares as the state has them now. */
  private refresh(): void {
    const me = this.holder.me;
    this.gold.setText(`Gold: ${me.gold}`);
    const near = this.holder.state.board.spaces[me.space]?.links ?? [];
    for (const [id, square] of this.squares) square.setFillStyle(near.includes(id) ? COLORS.squareNear : COLORS.square);
  }

  private say(text: string, color: string): void {
    this.hint.setText(text).setColor(color);
  }

  private words(): void {
    const s = settings.get();
    this.effectsButton.setText(`Effects: ${s.fewerEffects ? 'fewer' : 'full'}`);
    this.soundButton.setText(`Sound: ${s.mute ? 'off' : 'on'}`);
  }

  private centre(col: number, row: number): { x: number; y: number } {
    return { x: this.left + col * (SQUARE + GAP), y: BOARD_TOP + SQUARE / 2 + row * (SQUARE + GAP) };
  }

  /** A text button with padding, so a thumb has something to hit. */
  private button(x: number, y: number, text: string, onTap: () => void): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: COLORS.text, backgroundColor: COLORS.button, padding: { x: 14, y: 10 } }).setOrigin(0.5);
    t.setInteractive({ useHandCursor: true });
    t.on('pointerdown', onTap);
    return t;
  }
}
