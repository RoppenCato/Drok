// a.js: look 1, "Toy-box models" (Leonard, AD, 2026-11-20). The figures, the palms, the rocks, the chest and the bushes are
// small 3D models rendered flat with a thin line (a_build.py, Blender); this paints the ground under them without a line,
// the small things on the sand, the shadows, and the chrome over them. The hand of The Wind Waker: soft toy shapes, flat tones.
//   node tools/blender.js concepts/look/a_build.py -- concepts/look     the two renders
//   node concepts/look/a.js                                                   writes 1.png and 1-close.png
const K = require('./kit.js'); const { P, L, ell, poly, smooth, piece, line, curve } = K; const path = require('path');
const C = {
  ink: '#33203a', sand: '#f8e7b6', sandHi: '#fdf3d2', sandLo: '#eed79e', wet: '#e6cf98', sea: '#52d6d8', sea2: '#30b8d6', sea3: '#2196cc', foam: '#ffffff',
  jungle: '#2f9259', jungle2: '#217c50', shade: '#5b4a82', rare: '#3d9cff', gold: '#f6c23a', goldSh: '#d99a26', steel: '#dbe6ee', brass: '#f6c23a', wood: '#c98646', pink: '#ff9eb8'
};
const mid = (a, b, k = 0.5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const along = (pts, t) => { const n = pts.length - 1, f = t * n, j = Math.min(n - 1, Math.floor(f)); return mid(pts[j], pts[j + 1], f - j); };
function shadow(g, x, y, rx, ry, a = 0.26) { g.save(); g.globalAlpha = a; g.fillStyle = C.shade; ell(x + rx * 0.3, y + ry * 0.25, rx, ry, 0.1)(g); g.fill(); g.restore(); }
function shell(g, x, y, s, col) { const pts = [[x, y + 4 * s]]; for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.08 + 0.84 * i / 6); pts.push([x + Math.cos(a) * 6.5 * s * (i % 2 ? 1 : 0.9), y + 2 * s + Math.sin(a) * 6.5 * s]); } piece(g, smooth(pts, 0.4), col, { shade: P.darken(col, 0.14), d: [-0.8, -1], ink: C.ink, lw: 0.9 }); }
function starfish(g, x, y) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + 0.3, rr = i % 2 ? 3.6 : 8.5; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); } piece(g, smooth(pts, 0.4), '#ff9a4a', { shade: '#e97a34', d: [-0.8, -1], ink: C.ink, lw: 0.9 }); }
function spark(g, x, y, r, col) { g.save(); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
function blade(g, x, y) {   // the drop on the sand, drawn small and flat in the models' colours
  g.save(); g.translate(x, y); g.rotate(-0.5); g.scale(0.62, 0.62);
  piece(g, smooth([[-11, -3.2], [4, -5], [17, -7.4], [26, -8.6], [23, -2], [11, 2.6], [-11, 3.6]], 0.5), C.steel, { shade: '#a9bccb', d: [-0.6, -1.8], ink: C.ink, lw: 1.3 });
  piece(g, poly([[-22, -2.4], [-13, -2.4], [-13, 2.4], [-22, 2.4]]), C.wood, { ink: C.ink, lw: 1.3 }); piece(g, smooth([[-14, -5.5], [-10, -5.5], [-10, 5.5], [-14, 5.5]], 0.3), C.brass, { ink: C.ink, lw: 1.3 }); g.restore();
}

async function paint(S, crop, renderFile, at) {
  const { cv, g } = K.still(S, crop), r = P.rng(31);
  // the ground has no line: sand in three flat tones, the sea in three, a white edge of foam
  g.fillStyle = C.sand; g.fillRect(-10, -10, K.W + 20, K.H + 20);
  for (let i = 0; i < 14; i++) piece(g, K.blob(r() * K.W, 260 + r() * 460, 30 + r() * 44, 10 + r() * 14, 10, 0.3, 60 + i), i % 3 ? C.sandHi : C.sandLo);
  for (let i = 0; i < 40; i++) { g.fillStyle = C.sandLo; g.beginPath(); g.arc(r() * K.W, 255 + r() * 470, 0.8 + r() * 0.8, 0, 7); g.fill(); }
  piece(g, K.below(K.moved(L.shore, 0, -12)), C.wet); piece(g, K.below(L.shore), C.sea); piece(g, K.below(K.moved(L.shore, -28, 58)), C.sea2); piece(g, K.below(K.moved(L.shore, -66, 140)), C.sea3);
  g.save(); g.beginPath(); curve(g, K.moved(L.shore, 0, 2)); g.lineWidth = 6; g.strokeStyle = C.foam; g.stroke(); g.restore();
  for (const [dx, dy, lw, a] of [[-6, 16, 2.4, 1], [-14, 33, 1.8, 0.7]]) { const pts = K.moved(L.shore, dx, dy); let t = r() * 0.03; while (t < 0.98) { const len = 0.03 + r() * 0.09, seg = []; for (let i = 0; i <= 6; i++) seg.push(along(pts, Math.min(1, t + len * i / 6))); g.save(); g.globalAlpha = a; line(g, seg, C.foam, lw); g.restore(); t += len + 0.02 + r() * 0.06; } }   // the foam's second and third lines, broken unevenly
  for (const [x, y, w] of [[60, 778, 30], [130, 826, 36], [36, 862, 30], [216, 872, 30], [150, 898, 24], [292, 904, 28]]) { g.save(); g.globalAlpha = 0.8; piece(g, ell(x, y, w * 0.5, 2.2), '#c8f4f4'); g.restore(); }
  // the jungle floor; the bushes on it are models
  piece(g, K.above(K.moved(L.jungle, 0, 6)), C.jungle); piece(g, K.above(K.moved(L.jungle, 0, -70)), C.jungle2);
  piece(g, K.blob(206, 226, 27, 46, 10, 0.24, 5), C.sand); piece(g, K.blob(202, 172, 16, 32, 9, 0.3, 6), C.sandLo);
  // shadows: one flat violet shape under every model, all to the same side
  for (const q of L.rocks) shadow(g, q.at[0], q.at[1] + q.r * 0.3, q.r * 1.1, q.r * 0.4);
  shadow(g, L.chest[0], L.chest[1] - 2, 22, 8); shadow(g, L.barrel[0], L.barrel[1] - 2, 16, 7);
  for (const p of L.palms) shadow(g, p.at[0] + p.lean * p.h * 0.5 + 14, p.at[1] + 6, p.r * 0.75, p.r * 0.24, 0.22);
  shadow(g, L.hero[0], L.hero[1] + 1, 20, 8); shadow(g, L.crabA[0], L.crabA[1] + 2, 26, 10); shadow(g, L.crabB[0], L.crabB[1] + 2, 24, 9);
  for (const [x, y] of L.tufts) for (const dx of [-4, 0, 4]) line(g, [[x + dx, y], [x + dx * 1.7, y - 8 - Math.abs(dx)]], '#49b862', 2.6);
  // the small things on the sand are drawn, in the models' line
  g.save(); g.translate(L.drift[0], L.drift[1]); g.rotate(-0.25); piece(g, K.rrect(-26, -5, 52, 10, 5), '#dcc09a', { shade: '#bd9b74', d: [-1, -2], ink: C.ink, lw: 1 }); piece(g, K.rrect(8, -12, 7, 10, 3), '#dcc09a', { ink: C.ink, lw: 1 }); g.restore();
  shell(g, L.shells[0][0], L.shells[0][1], 1, C.pink); shell(g, L.shells[1][0], L.shells[1][1], 0.9, '#fff3dc'); shell(g, L.shells[2][0], L.shells[2][1], 0.8, '#ffc680'); shell(g, L.shells[3][0], L.shells[3][1], 0.8, C.pink); starfish(g, L.star[0], L.star[1]);
  g.save(); ell(L.loot[0], L.loot[1], 19, 8.5)(g); g.fillStyle = 'rgba(205,232,255,0.8)'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = C.rare; g.stroke(); g.restore(); blade(g, L.loot[0], L.loot[1] - 4);
  spark(g, L.loot[0] - 16, L.loot[1] - 15, 5.5, '#ffffff'); spark(g, L.loot[0] + 15, L.loot[1] - 20, 4, '#cfe6ff'); spark(g, L.loot[0] + 20, L.loot[1] - 4, 3, '#ffffff');
  for (const [dx, dy] of [[0, 0], [9, 3], [3, -5]]) piece(g, ell(L.coins[0] + dx, L.coins[1] + dy, 5.2, 3.8), C.gold, { shade: C.goldSh, d: [-0.8, -1], ink: C.ink, lw: 1 }); spark(g, L.coins[0] + 13, L.coins[1] - 9, 3.4, '#ffffff');
  g.save(); ell(L.crabA[0], L.crabA[1] + 3, 35, 15)(g); g.lineWidth = 2.2; g.strokeStyle = '#ff4a52'; g.stroke(); g.globalAlpha = 0.16; g.fillStyle = '#ff4a52'; g.fill(); g.restore();
  // the models
  const im = await P.loadImage(path.join(__dirname, renderFile)); g.drawImage(im, at.x, at.y, at.w, at.h);
  K.hitNumber(g, '14', L.crabA[0] + 2, L.crabA[1] - 50, { font: 'Segoe UI', size: 23, col: '#ffffff', stroke: C.ink, strokeW: 4.5 });
  K.chrome(g, { font: 'Segoe UI', panel: 'rgba(255,250,236,0.96)', line: C.ink, lw: 1.4, text: C.ink, sub: '#8a6a7a', hp: '#f0503c', rage: '#ff9a2e', xp: '#6fd060', gold: C.gold, btn: 'rgba(255,250,236,0.96)', well: '#cdbfae', shadow: 1.6, shadowCol: 'rgba(51,32,58,0.28)', badge: '#ea4038', badgeText: '#fff', quest: C.gold, skill: ['#3f9fe8', '#f0503c', '#4cbf68'], glyph: '#ffffff', glyphLine: C.ink, iconFill: '#ffe2a0', iconLw: 1.4, hudText: '#ffffff', hudStroke: C.ink,
    portrait: (gg, x, y) => { gg.fillStyle = '#9fe3ea'; gg.fillRect(x - 30, y - 30, 60, 60); piece(gg, ell(x, y + 5, 17, 16), '#f4bf8e', { shade: '#dc9a70', d: [-2, -2.4], ink: C.ink, lw: 1.2 }); piece(gg, smooth([[x - 18, y + 1], [x - 17, y - 9], [x - 8, y - 16], [x + 6, y - 16.5], [x + 15, y - 10], [x + 18, y], [x + 8, y - 4], [x - 6, y - 3]], 0.55), '#ea4038', { shade: '#c22c36', d: [-2, -2.4], ink: C.ink, lw: 1.2 });
      for (const dx of [-5, 8]) { piece(gg, ell(x + dx, y + 6, 3.4, 4.4), '#fffaf0', { ink: C.ink, lw: 0.8 }); gg.fillStyle = '#2a1814'; gg.beginPath(); gg.ellipse(x + dx + 0.6, y + 6.5, 2, 3, 0, 0, 7); gg.fill(); } gg.strokeStyle = '#5a3622'; gg.lineWidth = 2; gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(x - 9, y - 0.5); gg.lineTo(x - 2.5, y + 1); gg.moveTo(x + 5, y + 1); gg.lineTo(x + 11.5, y - 0.5); gg.stroke(); } });
  return cv;
}
if (require.main === module) (async () => {
  P.save(await paint(2, null, 'a-render.png', { x: 0, y: 0, w: K.W, h: K.H }), path.join(__dirname, '1.png'));
  const c = { x: 106, y: 414, w: 250, h: 190 }; P.save(await paint(6, c, 'a-close-render.png', c), path.join(__dirname, '1-close.png')); console.log('wrote 1.png');
})();
module.exports = { paint };
