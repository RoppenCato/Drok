// burst-look.js: a chest opening, as four moments, drawn into tools/scene.js's picture with the pieces of out/chest-burst
// and out/loot (Leonard, AD, 2026-11-20). A module for scene.js's --over: under() lays the light behind the chest, draw()
// what is over it. MOMENT 1 it shines, 2 the pop, 3 the burst, 4 what is left; RAR common|uncommon|rare|epic.
//   MOMENT=3 RAR=rare node tools/scene.js work/chest-burst/3.png --place crab-cay --at 2205,920 --no-mobs --no-loot --pile bare --own none --swap chest/closed=chest/open --over tools/burst-look.js --crop 150,190,200,240,4
// The chest is swapped by --swap: chest/closed for moment 1, chest/opening for 2, chest/open for 3 and 4.
const path = require('path');
const CHEST = [2275, 850], MOUTH = 18, M = +(process.env.MOMENT || 3), RAR = process.env.RAR || 'rare';
let B, L;
async function load(c) { if (B) return; const D = require('./dress.js'); B = await D.atlas(path.join(c.P.ROOT, 'out/chest-burst'), 'burst'); L = await D.atlas(path.join(c.P.ROOT, 'out/loot'), 'loot'); }
// one piece at a screen point: o.scale (or sx, sy), rot, alpha, tint (a colour laid over the white piece), add (drawn as light)
function put(g, c, A, key, x, y, o = {}) {
  const F = A.j.frames[key], f = F.frame, t = c.P.createCanvas(f.w, f.h), q = t.getContext('2d'); q.drawImage(A.im, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  if (o.tint) { q.globalCompositeOperation = 'source-in'; q.fillStyle = o.tint; q.fillRect(0, 0, f.w, f.h); }
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale((o.sx || o.scale || 1) * 0.5, (o.sy || o.scale || 1) * 0.5); g.globalAlpha = o.alpha === undefined ? 1 : o.alpha; if (o.add) g.globalCompositeOperation = 'lighter';
  g.drawImage(t, -F.pivot.x * f.w, -F.pivot.y * f.h); g.restore();
}
const tones = c => { const it = L.j.items['ring/' + RAR]; return { light: it.light, col: it.colour, pale: c.P.mix(it.light, '#ffffff', 0.55) }; };
exports.under = async (g, c) => {
  await load(c); const T = tones(c), x = c.sx(CHEST[0]), y = c.sy(CHEST[1]), my = y - MOUTH;
  if (M === 1) { put(g, c, B, 'glow', x, my + 6, { scale: 1.0, alpha: 0.85, tint: T.col }); put(g, c, B, 'glow', x, my + 6, { scale: 0.5, alpha: 0.7, tint: T.pale, add: true }); }
  if (M === 2) { put(g, c, B, 'ring', x, y + 2, { scale: 0.75, alpha: 0.95, tint: T.pale }); put(g, c, B, 'glow', x, my, { scale: 1.8, alpha: 0.9, tint: T.light }); put(g, c, B, 'glow', x, my, { scale: 1.1, alpha: 0.95, tint: '#ffffff', add: true }); }
  if (M === 3) { put(g, c, B, 'ring', x, y + 2, { scale: 1.55, alpha: 0.55, tint: T.col }); put(g, c, B, 'glow', x, my, { scale: 1.3, alpha: 0.7, tint: T.col }); put(g, c, B, 'rays', x, my, { scale: 1.0, rot: 0.3, alpha: 0.95, tint: T.light }); put(g, c, B, 'rays', x, my, { scale: 0.62, rot: -0.5, alpha: 0.8, tint: T.pale, add: true }); }
  if (M === 4) { put(g, c, B, 'glow', x, my, { scale: 0.75, alpha: 0.5, tint: T.col }); put(g, c, B, 'rays', x, my, { scale: 0.6, rot: 0.9, alpha: 0.4, tint: T.light }); }
};
exports.draw = async (g, c) => {
  await load(c); const T = tones(c), P = c.P, x = c.sx(CHEST[0]), y = c.sy(CHEST[1]), my = y - MOUTH, r = P.rng(5);
  const shadow = (sx, sy, rx) => { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(sx + rx * 0.2, sy + 1, rx, rx * 0.4, 0, 0, 7); g.fill(); g.restore(); };
  if (M === 1) { put(g, c, B, 'star', x - 15, my - 8, { scale: 0.55, rot: 0.3, tint: T.pale }); put(g, c, B, 'star', x + 17, my + 2, { scale: 0.36, tint: T.pale }); put(g, c, B, 'mote', x + 4, my - 22, { tint: T.light, alpha: 0.9 }); put(g, c, B, 'mote', x - 22, my + 8, { scale: 0.7, tint: T.light, alpha: 0.8 }); }
  if (M === 2) { put(g, c, B, 'beam', x, my, { sx: 0.9, sy: 0.5, alpha: 0.95, tint: T.pale, add: true }); put(g, c, B, 'star', x, my - 4, { scale: 1.5, rot: 0.2, tint: '#ffffff' }); }
  if (M === 3) {
    put(g, c, B, 'beam', x, my, { sx: 1, sy: 1, alpha: 0.7, tint: T.pale, add: true });
    const fan = (n, lo, hi) => Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + ((i + 0.5) / n - 0.5) * 2.5 + (r() - 0.5) * 0.25, d = lo + r() * (hi - lo); return [x + Math.cos(a) * d, my + Math.sin(a) * d * 0.92 - 4]; });
    for (const [px, py] of fan(9, 16, 50)) put(g, c, B, 'mote', px, py, { scale: 0.6 + r() * 0.7, tint: T.light, alpha: 0.9 });
    fan(7, 26, 58).forEach(([px, py], i) => put(g, c, B, 'coin/' + (1 + i % 4), px, py, { scale: 1 }));
    for (const [px, py] of fan(6, 34, 66)) put(g, c, B, 'star', px, py, { scale: 0.45 + r() * 0.5, rot: r() * 1.5, tint: T.pale });
    put(g, c, L, 'gear', x + 26, my - 40, { rot: 0.35 }); put(g, c, L, 'potion', x - 30, my - 30, { rot: -0.4 });      // the prizes in the air, on their way to the ground
  }
  if (M === 4) {
    put(g, c, L, 'ring/' + RAR, x + 40, y + 22); shadow(x + 40, y + 22, 8); put(g, c, L, 'gear', x + 40, y + 22); put(g, c, L, 'spark', x + 49, y + 8, { scale: 0.8, tint: T.light });
    shadow(x - 28, y + 24, 8); put(g, c, L, 'coins', x - 28, y + 24); shadow(x + 4, y + 36, 6); put(g, c, L, 'potion', x + 4, y + 36);
    for (const [dx, dy, s] of [[-14, -30, 0.8], [12, -44, 0.6], [22, -22, 0.5], [-4, -58, 0.5]]) put(g, c, B, 'mote', x + dx, my + dy, { scale: s, tint: T.light, alpha: 0.75 });
  }
};
