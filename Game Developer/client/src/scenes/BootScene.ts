import Phaser from 'phaser';
import { makeRng } from '../../../rules/src/index.ts';
import type { GameLog } from '../game-log.ts';
import { COLORS, RES } from '../layout.ts';

/** The ground's tile, in design units. Drawn once at RES times that, so it is sharp under the zoom. */
export const GROUND_TILE = 256;

/** The first scene: where pictures and sounds load (none yet), and the ground is painted once. Then play starts. */
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
    this.paintGround();
    this.log.note('boot done');
    this.scene.start('play');
  }

  /**
   * A stand-in for sand: one tile with specks, painted once into a texture and repeated over the field. Something on
   * the ground has to pass under the hero, or walking cannot be felt. The specks wrap at the tile's edges.
   */
  private paintGround(): void {
    const size = Math.round(GROUND_TILE * RES);
    const texture = this.textures.createCanvas('ground', size, size);
    if (!texture) return;
    const ctx = texture.getContext();
    ctx.fillStyle = COLORS.sand;
    ctx.fillRect(0, 0, size, size);
    // The decoration's own dice, apart from the game's: the same sand on every phone, and no rule depends on it.
    const rng = makeRng('sand');
    for (let i = 0; i < 90; i++) {
      const x = rng.next() * size;
      const y = rng.next() * size;
      const r = (0.8 + rng.next() * 2.2) * RES;
      ctx.fillStyle = rng.next() < 0.6 ? COLORS.sandSpeck : COLORS.sandLight;
      for (const ox of [-size, 0, size]) {
        for (const oy of [-size, 0, size]) {
          ctx.beginPath();
          ctx.ellipse(x + ox, y + oy, r * 1.6, r, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    texture.refresh();
  }
}
