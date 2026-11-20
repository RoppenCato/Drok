// over.js: one candidate for the grove's monster drawn into tools/scene.js's picture, beside the Warrior, with its flat
// shadow (Leonard, AD, 2026-11-20). The candidate's name comes in the environment: CAND=monkey.
//   CAND=monkey node tools/scene.js work/grove-mob/1.png --place crab-cay --at 1180,2610 --no-mobs --no-loot --pile bare --own none --over concepts/grove-mob/over.js --crop 136,302,190,170,4
const fs = require('fs'); const path = require('path');
const SHADOW = { monkey: 17, snake: 17, piglet: 18, rat: 15, lizard: 16, frog: 18 };
exports.draw = async (g, c) => {
  const name = process.env.CAND || 'monkey', P = c.P, im = await P.loadImage(path.join(P.ROOT, 'work/grove-mob/render', name + '_sw.png'));
  const x = c.sx(c.hero.x + 60), y = c.sy(c.hero.y + 16), rx = SHADOW[name] || 16;
  g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(x + rx * 0.2, y + 1, rx, rx * 0.4, 0, 0, 7); g.fill(); g.restore();
  g.drawImage(im, x - 160 / 2, y - 200 / 2, im.width / 2, im.height / 2);      // the render's origin is at 160, 200 of 320 by 288, two file pixels a unit
};
