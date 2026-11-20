// scene.js: a judging picture drawn the way the game draws (Leonard, AD, 2026-11-20): a place's ground at double size, its
// props and the figures sorted by where their feet stand, flat shadows, the glass on top at the game's own places
// (the control test's hud.ts: bars top left, Cleave and Charge in their arc of radius 108 in the bottom right corner).
// Everything comes from out/ as delivered, so if this picture is right the deliveries are right.
//   node tools/scene.js <out.png> [--at 640,2040] [--zoom 1] [--no-glass]
const P = require('./paint.js'); const D = require('./dress.js'); const fs = require('fs'); const path = require('path');
const G = require('./glass.js');
const W = P.JUDGE.w, H = P.JUDGE.h, FONT = 'Trebuchet MS';
async function main() {
  const args = process.argv.slice(2), out = args[0], opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
  const at = (opt('at') || '640,2040').split(',').map(Number), S = 2, R = P.ROOT;
  const place = JSON.parse(fs.readFileSync(path.join(R, 'out/island/place.json'), 'utf8')), ground = await P.loadImage(path.join(R, 'out/island/ground.png'));
  const A = await D.load(), isl = await D.atlas(path.join(R, 'out/island'), 'island'), crab = await D.atlas(path.join(R, 'out/sand-crab'), 'sand-crab'), glass = await D.atlas(path.join(R, 'out/glass'), 'glass');
  const loot = fs.existsSync(path.join(R, 'out/loot/loot.json')) ? await D.atlas(path.join(R, 'out/loot'), 'loot') : null;
  const cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const cam = [at[0] - W / 2, at[1] - H / 2], sx = x => x - cam[0], sy = y => y - cam[1];
  g.drawImage(ground, cam[0], cam[1], W, H, 0, 0, W, H);                                    // the ground: one pixel a unit, drawn at two
  const shadow = (x, y, rx, ry) => { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(sx(x) + rx * 0.2, sy(y) + 1, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
  const sprite = (At, key, x, y) => { g.save(); g.translate(sx(x), sy(y)); g.scale(0.5, 0.5); D.pic(g, At, key); g.restore(); };
  // who is where: the hero in the middle, a crab he has picked winding up, a second one idling
  const hero = { x: at[0], y: at[1] }, c1 = { x: at[0] + 84, y: at[1] + 34 }, c2 = { x: at[0] - 96, y: at[1] + 96 }, drop = { x: at[0] + 70, y: at[1] - 70 }, coins = { x: at[0] - 30, y: at[1] + 150 };
  const things = [];
  for (const p of place.props) { const f = isl.j.frames[p.name]; if (!f) continue; if (sx(p.x) < -160 || sx(p.x) > W + 160 || sy(p.y) < -60 || sy(p.y) > H + 300) continue; things.push({ y: p.y, shadow: () => shadow(p.x, p.y, f.frame.w * 0.16, f.frame.w * 0.055), draw: () => sprite(isl, p.name, p.x, p.y) }); }
  things.push({ y: hero.y, shadow: () => shadow(hero.x, hero.y, 15, 6), draw: () => D.hero(g, A, { action: 'stand', facing: 'se', i: 0, cutlass: 'rusty', buckler: 'plank', hat: 'bandana' }, sx(hero.x), sy(hero.y), 0.5) });
  things.push({ y: c1.y, shadow: () => shadow(c1.x, c1.y, 17, 7), draw: () => D.figure(g, crab, { action: 'attack1', facing: 'nw', i: 2 }, sx(c1.x), sy(c1.y), 0.5) });
  things.push({ y: c2.y, shadow: () => shadow(c2.x, c2.y, 17, 7), draw: () => D.figure(g, crab, { action: 'stand', facing: 's', i: 0 }, sx(c2.x), sy(c2.y), 0.5) });
  g.save(); g.translate(sx(c1.x), sy(c1.y) + 2); g.scale(0.5, 0.5); D.pic(g, glass, 'mark/target'); g.restore();        // the ring under the picked target
  if (loot) { for (const [key, q, rar] of [['gear', drop, 'rare'], ['coins', coins, null]]) { if (rar) { g.save(); g.translate(sx(q.x), sy(q.y)); g.scale(0.5, 0.5); D.pic(g, loot, 'ring/' + rar); g.restore(); } things.push({ y: q.y, shadow: () => shadow(q.x, q.y, 8, 3), draw: () => sprite(loot, key, q.x, q.y) }); } }
  things.sort((a, b) => a.y - b.y); for (const t of things) t.shadow(); for (const t of things) t.draw();
  P.label(g, '14', sx(c1.x) + 4, sy(c1.y) - 44, 20, '#ffffff', { align: 'center', font: FONT, stroke: G.INK, strokeW: 4 });
  if (!args.includes('--no-glass')) {
    const piece = (key, x, y) => { g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, glass, key); g.restore(); };
    const slice = (key, x, y, w, h) => { const f = glass.j.frames[key].frame, it = glass.j.items[key], [l, t, r, b] = it.slice || [0, 0, 0, 0], k = 0.5, xs = [0, l, f.w - r, f.w], ys = [0, t, f.h - b, f.h], dx = [x, x + l * k, x + w - r * k, x + w], dy = [y, y + t * k, y + h - b * k, y + h]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const sw = xs[i + 1] - xs[i], sh = ys[j + 1] - ys[j]; if (sw > 0 && sh > 0) g.drawImage(glass.im, f.x + xs[i], f.y + ys[j], sw, sh, dx[i], dy[j], dx[i + 1] - dx[i], dy[j + 1] - dy[j]); } };
    const bar = (kind, x, y, w, part) => { slice('bar/well', x - 2, y - 2, w + 4, 18 * 0.5 * 2); const f = glass.j.frames['bar/' + kind].frame; g.save(); g.beginPath(); P.rr(g, x, y + 1, w, 10, 5); g.clip(); g.drawImage(glass.im, f.x, f.y, f.w, f.h, x, y + 1, w * part, 10); g.restore(); };
    const txt = (t, x, y, s, c, o = {}) => P.label(g, t, x, y, s, c, { font: FONT, ...o });
    piece('button/menu', 30, 30); bar('hp', 60, 12, 128, 0.72); bar('rage', 60, 30, 128, 0.45); txt('Lv 2', 62, 54, 12, '#ffffff', { stroke: G.INK, strokeW: 3.5 }); piece('mark/coin', 110, 54); txt('86', 121, 54.5, 12, '#ffffff', { stroke: G.INK, strokeW: 3.5 });
    piece('button/bag', 296, 32); piece('button/chart', 340, 32); piece('button/hero', 384, 32);
    slice('plate', W / 2 - 78, 100, 156, 34); txt('Sand Crab', W / 2 - 62, 111, 12.5, G.INK); txt('Lv 1', W / 2 + 62, 111, 11, '#8a6a7a', { align: 'right' }); bar('hp', W / 2 - 62, 118, 124, 0.56);
    piece('skill/cleave', W - 108 * Math.cos(22 * Math.PI / 180), H - 24 - 108 * Math.sin(22 * Math.PI / 180)); piece('skill/charge', W - 108 * Math.cos(66 * Math.PI / 180), H - 24 - 108 * Math.sin(66 * Math.PI / 180)); piece('skill/potion', 236, 872);
    bar('xp', 14, 893, 150, 0.38);
    slice('plate', 12, 74, 132, 28); piece('mark/quest', 27, 89); txt('Sand crabs 7/30', 44, 88, 11, G.INK);
  }
  P.save(cv, out); console.log('wrote', out);
}
main();
