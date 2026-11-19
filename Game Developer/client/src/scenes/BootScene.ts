import Phaser from 'phaser';
import type { GameLog } from '../game-log.ts';

/** The first scene: where pictures and sounds load (none yet). Then the play scene starts. */
export class BootScene extends Phaser.Scene {
  private readonly log: GameLog;

  constructor(o: { log: GameLog }) {
    super({ key: 'boot' });
    this.log = o.log;
  }

  preload(): void {
    // Files in client/public are served from /: this.load.image('hero', '/hero.png');
  }

  create(): void {
    this.log.note('boot done');
    this.scene.start('play');
  }
}
