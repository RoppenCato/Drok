import Phaser from 'phaser';
import * as rules from '../../rules/src/index.ts';
import { GameLog } from './game-log.ts';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, GAME_NAME, RES } from './layout.ts';
import { LocalGame } from './local-game.ts';
import { BootScene } from './scenes/BootScene.ts';
import { PlayScene } from './scenes/PlayScene.ts';
import { storageOrNull } from './settings.ts';

const log = new GameLog(GAME_NAME);
log.attach(window);

const query = new URLSearchParams(location.search);

// The save, or a new game. The holder keeps the state and calls the rules; the scenes only ask it.
// ?seed=tide starts a fresh game on that seed, for a script that wants the same field every time.
const storage = storageOrNull();
const seed = query.get('seed');
const saved = seed ? null : LocalGame.load(storage);
const holder = saved ?? LocalGame.create(storage, seed ?? undefined);
holder.drive = query.get('drive') === '1';
log.note(`${saved ? 'loaded' : 'new game'}: seed ${holder.state.seed}, level ${holder.state.hero.level} in ${holder.state.place}, canvas x${RES}`);

const phaser = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  // The canvas is the design size times RES, so shapes and words are sharp; the cameras zoom by RES (layout.ts).
  width: DESIGN_WIDTH * RES,
  height: DESIGN_HEIGHT * RES,
  backgroundColor: COLORS.page,
  banner: false,
  disableContextMenu: true,
  // The design size fitted into the screen and centred: a phone fills it, a computer gets dark bands at the sides.
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // Three fingers at once: one steers, one presses a skill, one to spare.
  input: { activePointers: 3 },
  render: { antialias: true },
  // The first scene starts on its own; the rest wait to be started.
  scene: [new BootScene({ log }), new PlayScene({ holder, log })],
});

// The frame log: one write a frame, a line a second.
phaser.events.on(Phaser.Core.Events.STEP, (_time: number, delta: number) => log.frame(delta));

// The save is written when the page is put away, so closing the tab loses nothing.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') holder.save();
});
window.addEventListener('pagehide', () => holder.save());

// For the browser pane and scripts. With ?drive=1 the page's own clock is stopped and time moves only when a script
// calls window.dev.step(n): n frames of one world step each, drawn. A hidden or slow pane then tests exactly.
//   window.dev.holder.act({ type: 'moveTo', x: 300, y: 300 }); window.dev.step(60); window.dev.holder.state.hero
let fake = 0;
function step(n = 1): void {
  if (!holder.drive) throw new Error('dev.step needs ?drive=1 in the address');
  // The page's own clock may have been woken (the pane shown, the window focused): it stays stopped while a script drives.
  if (phaser.loop.running) phaser.loop.stop();
  for (let i = 0; i < n; i++) {
    holder.step(1);
    fake += 1000 / 60;
    phaser.step(fake, 1000 / 60);
  }
}
if (holder.drive) {
  // The page's own clock runs until the pictures are loaded and the play scene stands (the loader needs steps to
  // work through its files); then it is stopped, and only a script moves time.
  const stopWhenPlaying = (): void => {
    if (!phaser.scene.isActive('play')) return;
    phaser.events.off(Phaser.Core.Events.POST_STEP, stopWhenPlaying);
    phaser.loop.stop();
    fake = phaser.loop.now || performance.now();
  };
  phaser.events.on(Phaser.Core.Events.POST_STEP, stopWhenPlaying);
}

/** For a script: is the game up (pictures loaded, the play scene standing)? In a hidden pane that can take a while. */
const ready = (): boolean => phaser.scene.isActive('play');

declare global {
  interface Window {
    dev: { holder: LocalGame; log: GameLog; phaser: Phaser.Game; rules: typeof rules; step: (n?: number) => void; ready: () => boolean; res: number };
  }
}
window.dev = { holder, log, phaser, rules, step, ready, res: RES };
