# His own health and rage: the pile, and the three ways tried, put away 2026-11-20

**What**: `hud.ts`, `world-view.ts` and `glass.ts` from `client\src\view\` as they were at commit 47827bc, while the
game had four places for the hero's own health and rage on a row "Bars" in the settings (`settings.ownBars`, and
`?bars=0..3` in the address):

- **0, the pile at the bottom**: his health 200 long with its numbers and a heart, his rage under it, the target's
  plate over them with the monster's dark bar on its foot (Robin, 2026-11-20, after his first play: health "maybe
  at the bottom"; the sizes were Leonard, AD's).
- **1**: both over his head, as two of the pile's bars drawn small. **2**: health over his head, rage on the ground
  under his feet. **3**: health over his head, rage as a ring round the Cleave button with a notch at one Cleave's
  worth.

**Why it is here**: Robin, 2026-11-20: "I think the heros health bar should show over his character, and the rage
bar below it", "Give me some suggestions"; and of the four ways shown (the fourth was Leonard, AD's sketch: way 1
as one small piece): "I think 4, but the heart isnt needed. Also rage is traditionally red. So they need to be
distinctive different red colors". The game now has that one way: `OwnBar` in `client\src\view\glass.ts`, drawn
from Leonard, AD's pieces `own/*`. Everything else here is out of the game.

**What only these files still hold**:

- the pile with his health and rage in it (`hud.ts`: `HP_Y`, `RAGE_Y`, the heart, the numbers "62 / 100", the
  monster's bar on the plate, 172 long as drawn);
- the ring round the Cleave button (`hud.ts`, `rageRing`);
- a bar of the pile that can be moved (`Bar.at` in `glass.ts`), and the bars of ways 1 and 2 (`world-view.ts`);
- the arrow over the one he fights, bobbing once a second (`MobBar` in `glass.ts`, `mark/mine`). Leonard, AD had
  it left out while the hero's bar is on the field: it touched that bar when the monster stood beside him. The
  piece is still in the atlas.

**What went with it** and is not kept here, since git has it: the `ownBars` setting, the row in the settings, the
`restart` action that saved and opened the page again, the `?bars=` parameter.

**One thing not to bring back as it was**: ways 1 to 3 put his bar on whole units of the field. The camera glides
after him, so such a bar trembles against him as he walks. Place it after the camera, on whole pixels of the screen,
as `WorldView.pin` does now.

It is not compiled: this folder is outside the TypeScript project. Rage was orange in these files (`COLORS.rage`
`0xf59e0b`, the ring `0xff9a2e`); it is crimson now.
