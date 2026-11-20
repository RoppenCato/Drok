// The sound layer. Basic sounds only, all copies from Robin's common library (public\sfx\NOTES.md says which);
// which one plays for what is Victor, GD's pick until Hugh, SD's set replaces it (Robin, 2026-11-20: "set up some
// basic sounds and effects ... Just things you can get from the storage"). One file a variation, loaded at the
// start; a sound is one of its variations at a slightly different pitch each time, so a grind is not one sample.
// Silent with the setting "Sound: off" and with ?mute=1 in the address (the AI's test pages).
import Phaser from 'phaser';
import type { GameEvent } from '../../rules/src/index.ts';
import { settings } from './settings.ts';

interface Entry {
  files: string[];
  volume: number;
}

/** The actions whose refusal is worth a sound: a press on a button that could not act. A refused step is not. */
const REFUSALS = new Set<string>(['skill', 'potion', 'openChest', 'equip', 'unequip', 'buy', 'sell']);
/** The same sound is not started twice within this many milliseconds: Cleave on five crabs is one blow to the ear. */
const APART_MS = 50;

class Sounds {
  private manager: Phaser.Sound.BaseSoundManager | null = null;
  private map: Record<string, Entry> = {};
  private readonly lastAt = new Map<string, number>();
  private readonly lastFile = new Map<string, number>();
  private readonly addressMute = typeof location !== 'undefined' && new URLSearchParams(location.search).get('mute') === '1';
  /** How many sounds were started, by name: for a test to read, since a test page is mute. */
  readonly played: Record<string, number> = {};

  /** In the boot scene's preload: the list, then every file on it. A file that fails is logged by the scene. */
  preload(scene: Phaser.Scene): void {
    this.manager = scene.sound;
    scene.load.json('sfx', 'sfx/sfx.json');
    scene.load.once('filecomplete-json-sfx', (_key: string, _type: string, data: Record<string, Entry>) => {
      this.map = data;
      for (const entry of Object.values(data)) for (const file of entry.files) scene.load.audio(`sfx:${file}`, `sfx/${file}`);
    });
  }

  get muted(): boolean {
    return this.addressMute || settings.get().mute;
  }

  /** Start a sound. `loud` scales its own volume (a quiet echo of a sound: 0.5). */
  play(name: string, loud = 1): void {
    const entry = this.map[name];
    if (!entry || !this.manager) return;
    const now = performance.now();
    if (now - (this.lastAt.get(name) ?? -1e9) < APART_MS) return;
    this.lastAt.set(name, now);
    this.played[name] = (this.played[name] ?? 0) + 1;
    if (this.muted) return;
    // Another variation than the last one, when there is one.
    let i = Math.floor(Math.random() * entry.files.length);
    if (entry.files.length > 1 && i === this.lastFile.get(name)) i = (i + 1) % entry.files.length;
    this.lastFile.set(name, i);
    const key = `sfx:${entry.files[i]}`;
    if (!this.manager.game.cache.audio.exists(key)) return;
    try {
      this.manager.play(key, { volume: Math.min(1, entry.volume * loud), rate: 0.95 + Math.random() * 0.1 });
    } catch {
      // A phone that will not play it: the game goes on without.
    }
  }

  /** What the rules said happened, as sound. */
  event(e: GameEvent): void {
    switch (e.type) {
      case 'swing':
        return this.play('swing');
      case 'hit':
        return this.play(e.by === 'cleave' ? 'hit_heavy' : 'hit');
      case 'cleaved':
        return this.play('cleave');
      case 'chargeStarted':
        return this.play('charge');
      case 'charged':
        return this.play('hit_heavy');
      case 'heroHit':
        return this.play('hero_hurt');
      case 'heroDown':
        return this.play('hero_down');
      case 'monsterDied':
        return this.play('monster_die');
      case 'monsterWindup':
        // Only a slow, heavy blow is announced; a crab's nip every second would be a drum.
        if (e.seconds >= 0.8) this.play('windup');
        return;
      case 'picked':
        if (e.drop.kind === 'gold') return this.play('coin');
        this.play('pickup');
        if (e.drop.item && (e.drop.item.rarity === 'rare' || e.drop.item.rarity === 'epic')) this.play('level_up', 0.5);
        return;
      case 'levelUp':
        return this.play('level_up');
      case 'chestOpened':
        return this.play('chest');
      case 'potionUsed':
        return this.play('potion');
      case 'equipped':
      case 'unequipped':
        return this.play('equip');
      case 'bought':
      case 'sold':
        return this.play('coin');
      case 'bagFull':
        return this.play('refuse');
      case 'rejected':
        if (REFUSALS.has(e.action)) this.play('refuse');
        return;
      default:
        return;
    }
  }
}

export const sounds = new Sounds();
