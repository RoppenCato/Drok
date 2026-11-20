import Phaser from 'phaser';
import { makeRng } from '../../../rules/src/index.ts';
import { ART } from '../art.ts';
import type { GameLog } from '../game-log.ts';
import { COLORS, RES } from '../layout.ts';
import { sounds } from '../sound.ts';

/** A ground tile's size, in design units. Drawn once at RES times that, so it is sharp under the zoom. */
export const GROUND_TILE = 256;

/** The grounds the places are laid with. Stand-ins: the Art Director's kits replace them. */
export const GROUNDS = ['sand', 'grass', 'rock', 'cobble'] as const;
export type Ground = (typeof GROUNDS)[number];

/** The first scene: where pictures and sounds load, and the grounds are painted once. Then play starts. */
export class BootScene extends Phaser.Scene {
  private readonly log: GameLog;

  constructor(o: { log: GameLog }) {
    super({ key: 'boot' });
    this.log = o.log;
  }

  /**
   * The Art Director's drops that are switched on in art.ts. Each atlas is loaded twice over: as pictures, and as
   * plain data for its `actions` block (delays, origins, the points gear rides on), which the picture loader drops.
   * A file that fails to load is logged; the view then draws the stand-in.
   */
  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => this.log.error(`a file did not load:${file.key} (${String(file.url)})`));
    const atlas = (key: string, folder: string, name = key): void => {
      this.load.atlas(key, `art/${folder}/${name}.png`, `art/${folder}/${name}.json`);
      this.load.json(`${key}:data`, `art/${folder}/${name}.json`);
    };
    sounds.preload(this);
    if (ART.hero) atlas('hero', 'hero');
    if (ART.gear) {
      atlas('gear', 'gear');
      atlas('gear-icons', 'gear');
    }
    for (const kind of ART.monsters) atlas(kind, kind);
    if (ART.loot) atlas('loot', 'loot');
    if (ART.glass) atlas('glass', 'glass');
    // A place: its ground as one picture, its props as a set, and where each prop stands.
    for (const folder of new Set(Object.values(ART.places))) {
      this.load.image(`${folder}:ground`, `art/${folder}/ground.png`);
      atlas(folder, folder, ART.sets[folder] ?? folder);
      this.load.json(`${folder}:place`, `art/${folder}/place.json`);
      const folk = ART.folk[folder];
      if (folk) atlas(`${folder}:folk`, folder, folk);
    }
    if (ART.chart) {
      this.load.image('chart', 'art/chart/chart.png');
      atlas('pins', 'chart', 'pins');
      this.load.json('chart:places', 'art/chart/chart-places.json');
    }
  }

  create(): void {
    for (const ground of GROUNDS) this.paintGround(ground);
    this.log.note('boot done');
    this.scene.start('play');
  }

  /**
   * A stand-in ground: one tile with specks, painted once into a texture and repeated over a place. Something on
   * the ground has to pass under the hero, or walking cannot be felt. The specks wrap at the tile's edges. Cobbles
   * get rows of stones instead.
   */
  private paintGround(ground: Ground): void {
    const size = Math.round(GROUND_TILE * RES);
    const texture = this.textures.createCanvas(`ground-${ground}`, size, size);
    if (!texture) return;
    const [base, dark, light] = COLORS[ground];
    const ctx = texture.getContext();
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    // The decoration's own dice, apart from the game's: the same ground on every phone, and no rule depends on it.
    const rng = makeRng(ground);
    if (ground === 'cobble') {
      const step = size / 8;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1.5 * RES;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const x = col * step + (row % 2 ? step / 2 : 0);
          ctx.fillStyle = rng.next() < 0.3 ? light : base;
          for (const ox of [-size, 0]) {
            ctx.beginPath();
            ctx.rect(x + ox + 2 * RES, row * step + 2 * RES, step - 4 * RES, step - 4 * RES);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    } else {
      const specks = ground === 'grass' ? 140 : 90;
      for (let i = 0; i < specks; i++) {
        const x = rng.next() * size;
        const y = rng.next() * size;
        const r = (0.8 + rng.next() * 2.2) * RES;
        ctx.fillStyle = rng.next() < 0.6 ? dark : light;
        for (const ox of [-size, 0, size]) {
          for (const oy of [-size, 0, size]) {
            ctx.beginPath();
            ctx.ellipse(x + ox, y + oy, ground === 'grass' ? r * 0.7 : r * 1.6, ground === 'grass' ? r * 1.8 : r, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    texture.refresh();
  }
}
