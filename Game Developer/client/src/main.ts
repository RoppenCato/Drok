import Phaser from 'phaser';
import * as rules from '../../rules/src/index.ts';
import { GameLog } from './game-log.ts';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH, GAME_NAME } from './layout.ts';
import { LocalGame, TICK_MS } from './local-game.ts';
import { BootScene } from './scenes/BootScene.ts';
import { PlayScene } from './scenes/PlayScene.ts';
import { storageOrNull } from './settings.ts';

const log = new GameLog(GAME_NAME);
log.attach(window);

// The save, or a new game. The holder keeps the state and calls the rules; the scenes only ask it.
const storage = storageOrNull();
const saved = LocalGame.load(storage);
const holder = saved ?? LocalGame.create(storage);
log.note(saved ? `loaded: on ${holder.me.space} with ${holder.me.gold} gold, seed ${holder.state.seed}` : `new game, seed ${holder.state.seed}`);

const phaser = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
  backgroundColor: COLORS.background,
  banner: false,
  // The design size fitted into the screen and centred: a phone fills it, a computer gets dark bands at the sides.
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // The first scene starts on its own; the rest wait to be started.
  scene: [new BootScene({ log }), new PlayScene({ holder, log })],
});

// The frame log: one write a frame, a line a second.
phaser.events.on(Phaser.Core.Events.STEP, (_time: number, delta: number) => log.frame(delta));

// The world ticks once a minute while the page is open, and when it comes back to the front.
const tick = (): void => {
  for (const e of holder.tick()) log.note(e.type === 'ticked' ? `tick ${e.ticks}` : e.type);
};
window.setInterval(tick, TICK_MS);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tick();
});
window.addEventListener('pageshow', tick);

// For the browser pane and scripts: drive the game, read the log, reach the rules.
// window.dev.holder.actNow({ type: 'move', player: 'local', to: 'b1' }); window.dev.log.text()
declare global {
  interface Window {
    dev: { holder: LocalGame; log: GameLog; phaser: Phaser.Game; rules: typeof rules };
  }
}
window.dev = { holder, log, phaser, rules };
