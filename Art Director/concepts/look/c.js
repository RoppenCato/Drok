// c.js: look 3, "Painted print" (Leonard, AD, 2026-11-20). After the three pictures Robin's pick named: Rousseau's leaves,
// Gauguin's hot flat colour, Hokusai's wave. A thin deep-blue line that swells to the lower right, a short list of strong
// flat colours, pattern where another look would shade (stripes, leaf veins, wave rows), a taller hero with a big blade.
//   node concepts/look/c.js        writes 3.png (the still at 2x) and 3-close.png (the hero and the crab at 3 times)
const K = require('./kit.js'); const { P, R, L, ell, poly, smooth, piece, line, curve } = K; const path = require('path');
const C = {
  ink: '#1b2559', paper: '#fbeccb', sand: '#f8c88c', sandHi: '#fcdcae', sandLo: '#eba86e', pink: '#f2a39a', wet: '#e99878',
  sea: '#1c4a98', sea2: '#2a7ac6', sea3: '#55b9d6', foam: '#fff8ea',
  jungle: '#0d4f55', leafA: '#1f9c63', leafB: '#b3cf3c', leafC: '#2a8580', leafD: '#0f6c4b', flower: '#e8452c', fruit: '#f59a1c',
  trunk: '#dc9c4a', trunkSh: '#b9742e', rock: '#8c84b8', rockHi: '#bcb4de',
  skin: '#eaa978', skinSh: '#c67c58', ban: '#e8452c', banSh: '#b12a2c', shirt: '#fbf1d8', shirtSh: '#d8c6aa', trou: '#3058b8', trouSh: '#213e8c', sash: '#f3a61c', sashSh: '#cf7d18', hair: '#2a2140',
  steel: '#eaf0f2', steelSh: '#9fb4ca', brass: '#f3b41c', brassSh: '#cf8a18', wood: '#cb783c', woodSh: '#9a5230',
  crab: '#e8452c', crabSh: '#b12a2c', crabHi: '#f7a45c', crabInk: '#1b2559', claw: '#f0603a', rare: '#3a8fe8', gold: '#f7c41c'
};
const LW = 0.85;
const fig = (g, pth, col, sh, o = {}) => piece(g, pth, col, { shade: sh, d: o.d || [-2.2, -2.8], ink: C.ink, lw: o.lw === undefined ? LW : o.lw });
const mid = (a, b, k = 0.5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const SHADOW = P.alpha(C.ink, 0.24);
function shadow(g, x, y, rx, ry) { g.save(); g.fillStyle = SHADOW; ell(x + rx * 0.22, y + ry * 0.3, rx, ry, 0.12)(g); g.fill(); g.restore(); }

// ---------------------------------------------------------------- the hero: taller, broad in the shoulder, a blade to match
const BONES = { upper: 14, fore: 13, thigh: 16, shin: 15 };
const POSE = R.skeleton({ hip: [0, -29], neck: [2, -56], head: [3, -71], shF: [-14, -52], hF: [-28, -69], shB: [15, -52], hB: [33, -40], hipF: [-6, -29], footF: [-15, 0], hipB: [7, -29], footB: [17, -2] });
function head(g, hx, hy) {
  fig(g, ell(hx - 10.4, hy + 2.5, 2.7, 3.5), C.skin, C.skinSh);
  fig(g, smooth([[hx - 12, hy], [hx - 13.5, hy + 8], [hx - 8, hy + 11], [hx - 5, hy + 4]], 0.6), C.hair, null);
  fig(g, ell(hx, hy, 13, 14.4), C.skin, C.skinSh, { d: [-2.6, -3] });
  const cl = hx + 13 * 0.55, ey = hy + 2.2;
  g.save(); g.fillStyle = C.ink; ell(cl - 6.3, ey, 1.55, 2.15)(g); g.fill(); ell(cl + 3.3, ey - 0.2, 1.05, 2.0)(g); g.fill();
  g.strokeStyle = C.hair; g.lineCap = 'round'; g.lineWidth = 1.7; g.beginPath(); g.moveTo(cl - 9.4, ey - 5); g.lineTo(cl - 3.6, ey - 3.3); g.moveTo(cl + 1.6, ey - 3.4); g.lineTo(cl + 5, ey - 4.8); g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cl + 0.3, ey + 0.6); g.lineTo(cl + 2.3, ey + 4.6); g.lineTo(cl + 0.1, ey + 5.2); g.stroke();
  g.lineWidth = 1.1; g.beginPath(); g.moveTo(cl - 5.6, ey + 8.6); g.lineTo(cl - 0.6, ey + 8.2); g.stroke(); g.restore();
  // the head cloth, its tails long and flying
  fig(g, smooth([[hx - 12.5, hy - 5], [hx - 22, hy - 10], [hx - 34, hy - 6], [hx - 27, hy - 2.5], [hx - 17, hy - 2]], 0.5), C.ban, C.banSh);
  fig(g, smooth([[hx - 12.5, hy - 3], [hx - 21, hy + 1], [hx - 29, hy + 9], [hx - 22, hy + 7], [hx - 14, hy + 1]], 0.5), C.ban, C.banSh);
  fig(g, smooth([[hx - 13.4, hy - 2], [hx - 13, hy - 10], [hx - 6, hy - 15.6], [hx + 4, hy - 16], [hx + 11.5, hy - 11.5], [hx + 13.6, hy - 5.5], [hx + 7, hy - 7.6], [hx - 1, hy - 7], [hx - 8, hy - 4.6]], 0.55), C.ban, C.banSh, { d: [-2.6, -3] });
  fig(g, ell(hx - 13, hy - 3.4, 2.4, 2.8), C.ban, C.banSh);
}
function cutlass(g, hd, a, k = 1.2) {
  g.save(); g.translate(hd[0], hd[1]); g.rotate(a); g.scale(k, k);
  fig(g, smooth([[5, -3.4], [20, -5.4], [33, -8], [43, -9.6], [39.5, -2], [27, 3], [5, 3.8]], 0.45), C.steel, C.steelSh, { d: [-0.4, -2.2] });
  g.strokeStyle = C.ink; g.lineWidth = 0.6; g.beginPath(); g.moveTo(8, -1.6); g.quadraticCurveTo(24, -3.4, 37, -6.4); g.stroke();           // the fuller, as one line
  fig(g, poly([[-6.5, -2.4], [3, -2.4], [3, 2.4], [-6.5, 2.4]]), C.wood, null);
  fig(g, smooth([[2, -6], [6, -6], [6, 6], [2, 6]], 0.3), C.brass, C.brassSh);
  g.strokeStyle = C.brass; g.lineWidth = 2.3; g.beginPath(); g.moveTo(4, 5.4); g.quadraticCurveTo(-1, 11, -6.5, 3); g.stroke(); g.strokeStyle = C.ink; g.lineWidth = 0.6; g.beginPath(); g.moveTo(4.5, 6.6); g.quadraticCurveTo(-1, 12.4, -7.2, 3.6); g.stroke();
  g.restore();
}
function buckler(g, c) {
  fig(g, ell(c[0], c[1], 12.5, 15.5, 0.12), C.steel, C.steelSh, { d: [-1.6, -2] });
  fig(g, ell(c[0], c[1], 9.8, 12.6, 0.12), C.wood, null, { lw: 0.7 });
  g.save(); ell(c[0], c[1], 9.8, 12.6, 0.12)(g); g.clip(); g.fillStyle = C.ban; g.fillRect(c[0] - 14, c[1] - 16, 14.4, 16); g.fillRect(c[0] + 0.4, c[1], 14, 16); g.restore();   // painted in quarters
  ell(c[0], c[1], 9.8, 12.6, 0.12)(g); g.lineWidth = 0.7; g.strokeStyle = C.ink; g.stroke();
  fig(g, ell(c[0] + 0.3, c[1], 4, 4.8), C.brass, C.brassSh, { d: [-0.8, -1] });
}
function leg(g, hip, knee, foot, far) {
  fig(g, R.limbPath(knee, mid(knee, foot), foot, 4.6, 4.8, 3.8), C.skin, C.skinSh);
  fig(g, smooth([[foot[0] - 3.5, foot[1] - 3.6], [foot[0] + 5, foot[1] - 4], [foot[0] + 10.5, foot[1] - 1], [foot[0] + 9.5, foot[1] + 1.6], [foot[0] - 3.5, foot[1] + 1.6]], 0.5), C.skin, C.skinSh);
  fig(g, R.limbPath(hip, knee, mid(knee, foot, 0.45), 7.4, 6.4, 5.8), far ? C.trouSh : C.trou, far ? P.darken(C.trouSh, 0.2) : C.trouSh);
}
function arm(g, sh, el, hd, far) {
  fig(g, R.limbPath(sh, el, hd, 5.6, 5.4, 4.6), C.skin, C.skinSh);
  fig(g, R.limbPath(sh, mid(sh, el), mid(sh, el, 0.9), 7.4, 7, 6.6), far ? C.shirtSh : C.shirt, far ? P.darken(C.shirtSh, 0.12) : C.shirtSh);
}
function hero(g) {
  const J = R.solve(POSE, BONES), aF = R.angleOf(J.elF, J.hF);
  arm(g, J.shB, J.elB, J.hB, true); buckler(g, [J.hB[0] + 6, J.hB[1] + 1]);
  leg(g, J.hipB, J.kneeB, J.footB, true);
  cutlass(g, J.hF, -1.98);
  leg(g, J.hipF, J.kneeF, J.footF, false);
  const shirt = smooth([[-17, -52], [-6, -58.5], [10, -58.5], [19, -51], [17, -39], [13, -27], [4, -23.4], [-6, -23.4], [-12, -28], [-16, -40]], 0.5);
  fig(g, shirt, C.shirt, C.shirtSh, { d: [-2.6, -3] });
  g.save(); shirt(g); g.clip(); g.strokeStyle = C.trou; g.lineWidth = 1.5; for (let y = -55; y < -24; y += 4.6) { g.beginPath(); g.moveTo(-20, y + 1.5); g.quadraticCurveTo(0, y + 3.4, 22, y); g.stroke(); } g.restore();   // a sailor's stripes
  shirt(g); g.lineWidth = LW; g.strokeStyle = C.ink; g.stroke();
  fig(g, poly([[-2.5, -59], [8.5, -59], [3.5, -48]]), C.skin, null, { lw: 0.7 });
  fig(g, smooth([[-15.6, -35.5], [0, -33.6], [16.2, -35.5], [13.6, -27], [4, -23.6], [-6, -23.6], [-12.4, -28]], 0.5), C.sash, C.sashSh);
  fig(g, smooth([[-12, -29], [-17.5, -22], [-19, -10], [-13.5, -12], [-9, -24]], 0.6), C.sash, C.sashSh);
  head(g, J.head[0], J.head[1]);
  arm(g, J.shF, J.elF, J.hF, false);
  g.save(); g.translate(J.hF[0], J.hF[1]); g.rotate(aF); fig(g, smooth([[-4.6, -5], [4, -5.4], [6.6, -1.5], [6, 3.4], [2.5, 5.4], [-4.6, 5]], 0.5), C.skin, C.skinSh); g.restore();
}
const HERO_BOX = { l: -74, t: -142, r: 58, b: 8 }, HERO_K = 0.74;
const crab = (g, th, raise) => K.crab(g, th, raise, C, { lw: LW, facet: true, dots: [[-10, -4], [-3, -8], [5, -7], [11, -2], [-5, 1], [4, 2]], dotR: 1.5, dotCol: C.paper, eyeWhite: C.paper });
const CRAB_BOX = { l: -58, t: -62, r: 58, b: 52 }, CRAB_K = 0.84;

// ---------------------------------------------------------------- the place
// a leaf in two flat tones split along its rib, with veins: Rousseau's way of making a jungle from leaves you can count
function blade(g, x, y, len, a, w, c1, c2, veins = 4) {
  const tip = [x + Math.cos(a) * len, y + Math.sin(a) * len], nx = -Math.sin(a), ny = Math.cos(a), m = mid([x, y], tip, 0.42), W2 = len * w;
  const one = smooth([[x, y], [m[0] + nx * W2, m[1] + ny * W2], tip, [m[0] - nx * W2, m[1] - ny * W2]], 0.75);
  piece(g, one, c2, { lw: 0 }); g.save(); one(g); g.clip(); g.beginPath(); g.moveTo(x, y); g.lineTo(tip[0], tip[1]); g.lineTo(tip[0] + nx * W2 * 3 - Math.cos(a) * 4, tip[1] + ny * W2 * 3); g.lineTo(x + nx * W2 * 3, y + ny * W2 * 3); g.closePath(); g.fillStyle = c1; g.fill();
  g.strokeStyle = P.alpha(C.ink, 0.55); g.lineWidth = 0.7; for (let i = 1; i <= veins; i++) { const q = mid([x, y], tip, i / (veins + 1.2)); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + (nx * s * 0.8 + Math.cos(a) * 0.55) * W2 * 1.3, q[1] + (ny * s * 0.8 + Math.sin(a) * 0.55) * W2 * 1.3); g.stroke(); } }
  g.restore(); line(g, [[x, y], tip], C.ink, 0.8); one(g); g.lineWidth = 1; g.strokeStyle = C.ink; g.stroke();
}
function fan(g, x, y, r, a, col, col2) {   // a fan palm: a half disc cut into fingers
  const pts = [[x, y]], n = 9; for (let i = 0; i <= n * 2; i++) { const t = a - 1.25 + 2.5 * i / (n * 2), rr = r * (i % 2 ? 0.78 : 1); pts.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr * 0.85]); }
  piece(g, poly(pts), col, { ink: C.ink, lw: 1 }); g.save(); poly(pts)(g); g.clip(); g.fillStyle = col2; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * 1.2, a - 1.3, a); g.closePath(); g.fill(); g.restore();
  for (let i = 0; i <= n; i++) { const t = a - 1.25 + 2.5 * i / n; line(g, [[x, y], [x + Math.cos(t) * r * 0.86, y + Math.sin(t) * r * 0.74]], P.alpha(C.ink, 0.6), 0.7); } poly(pts)(g); g.lineWidth = 1; g.strokeStyle = C.ink; g.stroke();
}
function bloom(g, x, y, s, col) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - 0.3; piece(g, ell(x + Math.cos(a) * 3 * s, y + Math.sin(a) * 3 * s, 2.6 * s, 2.6 * s), col, { ink: C.ink, lw: 0.8 }); } piece(g, ell(x, y, 1.8 * s, 1.8 * s), C.gold, { ink: C.ink, lw: 0.7 }); }
function palm(g, p) {
  const r = P.rng(p.seed), top = [p.at[0] + p.lean * p.h, p.at[1] - p.h], c1 = [p.at[0] + p.lean * p.h * 0.1, p.at[1] - p.h * 0.6];
  const at = t => { const a = mid(p.at, c1, t), b = mid(c1, top, t); return mid(a, b, t); };
  const left = [], right = []; for (let i = 0; i <= 8; i++) { const t = i / 8, q = at(t), q2 = at(Math.min(1, t + 0.05)), dx = q2[0] - q[0], dy = q2[1] - q[1], n = Math.hypot(dx, dy) || 1, w = 7 - 3 * t; left.push([q[0] + dy / n * w, q[1] - dx / n * w]); right.unshift([q[0] - dy / n * w, q[1] + dx / n * w]); }
  const tr = smooth([...left, ...right], 0.4); piece(g, tr, C.trunk, { shade: C.trunkSh, d: [-3, -0.5], lw: 0 });
  g.save(); tr(g); g.clip(); g.strokeStyle = C.ink; g.lineWidth = 0.8; for (let i = 1; i < 13; i++) { const q = at(i / 13), w = 9; g.beginPath(); g.moveTo(q[0] - w, q[1] + 2); g.quadraticCurveTo(q[0], q[1] + 5.5, q[0] + w, q[1] + 1); g.stroke(); } g.restore(); tr(g); g.lineWidth = 1.1; g.strokeStyle = C.ink; g.stroke();
  const n = 9, fr = Array.from({ length: n }, (_, i) => ({ a: i / n * Math.PI * 2 + (r() - 0.5) * 0.3 + 0.2, len: p.r * (0.85 + r() * 0.3) })).sort((a, b) => Math.sin(a.a) - Math.sin(b.a));
  for (const f of fr) {
    const tip = [top[0] + Math.cos(f.a) * f.len, top[1] + Math.sin(f.a) * f.len * 0.6 + f.len * 0.22], arch = [top[0] + Math.cos(f.a) * f.len * 0.5, top[1] + Math.sin(f.a) * f.len * 0.3 - f.len * 0.14];
    const sp = t => { const a = mid(top, arch, t), b = mid(arch, tip, t); return mid(a, b, t); }, up = [], dn = [], N = 13;
    for (let i = 0; i <= N; i++) { const t = i / N, q = sp(t), q2 = sp(Math.min(1, t + 0.03)), dx = q2[0] - q[0], dy = q2[1] - q[1], m = Math.hypot(dx, dy) || 1, w = f.len * 0.26 * Math.sin(Math.PI * Math.pow(t, 0.7)) * (i % 2 ? 1 : 0.5) + 0.5; up.push([q[0] + dy / m * w + dx / m * 2.5, q[1] - dx / m * w + dy / m * 2.5]); dn.unshift([q[0] - dy / m * w + dx / m * 2.5, q[1] + dx / m * w + dy / m * 2.5]); }
    const spine = Array.from({ length: N + 1 }, (_, i) => sp(i / N)), far = Math.sin(f.a) < -0.2;
    piece(g, poly([...up, ...dn]), far ? C.leafD : C.leafA, { ink: C.ink, lw: 0.9 }); piece(g, poly([...up, ...spine.slice().reverse()]), far ? C.leafC : C.leafB, { lw: 0 });
    poly([...up, ...dn])(g); g.lineWidth = 0.9; g.strokeStyle = C.ink; g.stroke(); line(g, spine, C.ink, 0.8);
  }
  for (const [dx, dy] of [[-4, 3], [4, 4.5], [0, 8]]) piece(g, ell(top[0] + dx, top[1] + dy, 4.4, 4.4), C.fruit, { shade: C.sashSh, d: [-1, -1.2], ink: C.ink, lw: 0.9 });
}
function rock(g, q) {
  const r = P.rng(q.seed), n = 7, pts = Array.from({ length: n }, (_, i) => { const t = i / n * 6.283 + 0.3, w = 0.82 + r() * 0.36; return [q.at[0] + Math.cos(t) * q.r * w, q.at[1] + Math.sin(t) * q.r * 0.7 * w]; });
  piece(g, poly(pts), C.rock, { ink: C.ink, lw: 1 }); const topF = pts.map(p => [q.at[0] + (p[0] - q.at[0]) * 0.62 - q.r * 0.14, q.at[1] + (p[1] - q.at[1]) * 0.6 - q.r * 0.2]); piece(g, poly(topF), C.rockHi, { ink: C.ink, lw: 0.7 });
  for (let i = 0; i < 3; i++) line(g, [[q.at[0] + q.r * (0.25 + i * 0.16), q.at[1] + q.r * 0.12], [q.at[0] + q.r * (0.12 + i * 0.16), q.at[1] + q.r * 0.46]], P.alpha(C.ink, 0.6), 0.7);
}
function chest(g, x, y) {
  const o = { ink: C.ink, lw: 1 };
  piece(g, K.rrect(x - 17, y - 14, 34, 16, 1.5), C.wood, { ...o, shade: C.woodSh, d: [-2.4, -2.4] });
  piece(g, smooth([[x - 17, y - 14], [x - 15, y - 25], [x, y - 28], [x + 15, y - 25], [x + 17, y - 14]], 0.4), C.ban, { ...o, shade: C.banSh, d: [-2.4, -2.4] });
  for (const dx of [-11, 11]) piece(g, K.rrect(x + dx - 2.2, y - 26.5, 4.4, 28, 0.6), C.brass, { ink: C.ink, lw: 0.8 });
  piece(g, K.rrect(x - 3.6, y - 16.5, 7.2, 7.5, 1), C.brass, { ...o, lw: 0.9 }); g.fillStyle = C.ink; g.beginPath(); g.arc(x, y - 13, 1.2, 0, 7); g.fill();
}
function barrel(g, x, y) {
  const body = smooth([[x - 12, y - 24], [x - 14, y - 12], [x - 11, y], [x, y + 3], [x + 11, y], [x + 14, y - 12], [x + 12, y - 24]], 0.45);
  piece(g, body, C.wood, { shade: C.woodSh, d: [-3, -0.5], lw: 0 }); g.save(); body(g); g.clip(); g.strokeStyle = P.alpha(C.ink, 0.5); g.lineWidth = 0.7; for (const dx of [-7, -2, 3, 8]) { g.beginPath(); g.moveTo(x + dx, y - 26); g.lineTo(x + dx * 1.1, y + 4); g.stroke(); }
  g.strokeStyle = C.trou; g.lineWidth = 3; for (const dy of [-18, -5]) { g.beginPath(); g.moveTo(x - 15, y + dy); g.quadraticCurveTo(x, y + dy + 4.5, x + 15, y + dy); g.stroke(); } g.restore(); body(g); g.lineWidth = 1; g.strokeStyle = C.ink; g.stroke();
  piece(g, ell(x, y - 24, 12, 5), P.lighten(C.wood, 0.2), { ink: C.ink, lw: 1 });
}
function shell(g, x, y, s, col) { const pts = [[x, y + 4 * s]]; for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.08 + 0.84 * i / 6); pts.push([x + Math.cos(a) * 6.5 * s * (i % 2 ? 1 : 0.86), y + 2 * s + Math.sin(a) * 6.5 * s]); } piece(g, poly(pts), col, { ink: C.ink, lw: 0.8 }); for (let i = 1; i < 6; i += 2) line(g, [[x, y + 4 * s], pts[i + 1]], P.alpha(C.ink, 0.6), 0.6); }
function starfish(g, x, y) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + 0.3, rr = i % 2 ? 3.2 : 8.5; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); } piece(g, poly(pts), C.fruit, { ink: C.ink, lw: 0.9 }); }
function spark(g, x, y, r, col) { g.save(); g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 0.6; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
const along = (pts, t) => { const n = pts.length - 1, f = t * n, j = Math.min(n - 1, Math.floor(f)); return mid(pts[j], pts[j + 1], f - j); };

function paint(S, crop) {
  const { cv, g } = K.still(S, crop), r = P.rng(23);
  // the sand, with its ripples as rows of small arcs
  g.fillStyle = C.sand; g.fillRect(-10, -10, K.W + 20, K.H + 20);
  for (let i = 0; i < 7; i++) piece(g, K.blob(30 + r() * 350, 290 + r() * 400, 40 + r() * 40, 12 + r() * 12, 9, 0.3, 30 + i), C.sandHi);
  g.save(); g.strokeStyle = C.sandLo; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const cx = r() * K.W, cy = 280 + r() * 600, n = 1 + Math.floor(r() * 3); for (let j = 0; j < n; j++) { const rr = 4 + r() * 5; g.lineWidth = 0.9 + r() * 0.5; g.beginPath(); g.arc(cx + j * (rr * 2 + 3) + (r() - 0.5) * 4, cy + (r() - 0.5) * 7 + j * 2, rr, 0.3 + r() * 0.3, Math.PI - 0.3 - r() * 0.3); g.stroke(); } } g.restore();
  // the sea: three flat bands, wave rows in the deep, long lines nearer in, a foam edge with fingers
  piece(g, K.below(K.moved(L.shore, 0, -14)), C.wet); piece(g, K.below(L.shore), C.sea3); piece(g, K.below(K.moved(L.shore, -26, 54)), C.sea2); const deep = K.below(K.moved(L.shore, -64, 132)); piece(g, deep, C.sea);
  g.save(); deep(g); g.clip(); g.strokeStyle = '#5f97dc'; g.lineWidth = 1; for (let y = 760; y < 940; y += 13) for (let x = (Math.round(y / 13) % 2) * 13 - 20; x < 320; x += 26) { g.beginPath(); g.arc(x, y, 12, Math.PI, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x, y, 7, Math.PI, Math.PI * 2); g.stroke(); } g.restore();
  for (const [dx, dy] of [[-12, 30], [-20, 44], [-40, 86], [-50, 104]]) line(g, K.moved(L.shore, dx, dy), '#dff3f4', 1.1);
  g.save(); g.beginPath(); curve(g, K.moved(L.shore, 0, 3)); g.lineWidth = 8; g.strokeStyle = C.foam; g.stroke(); g.restore();
  for (let i = 0; i < 34; i++) { const q = along(L.shore, i / 33), s = 0.8 + (i % 3) * 0.2; piece(g, smooth([[q[0] - 4 * s, q[1] + 2], [q[0] - 3 * s, q[1] - 5 * s], [q[0] + 1 * s, q[1] - 8.5 * s], [q[0] + 4.5 * s, q[1] - 5.5 * s], [q[0] + 2 * s, q[1] - 3.6 * s], [q[0] + 4 * s, q[1] + 2]], 0.6), C.foam, { ink: C.ink, lw: 0.7 }); }
  g.save(); g.beginPath(); curve(g, K.moved(L.shore, 0, 2.5)); g.lineWidth = 6; g.strokeStyle = C.foam; g.stroke(); g.restore(); line(g, K.moved(L.shore, 0, 7), C.ink, 0.8);
  // the jungle: a dark ground and leaves you can count, back rows first; a pink path into it
  piece(g, K.above(L.jungle), C.jungle); line(g, L.jungle, C.ink, 1);
  piece(g, smooth([[160, 276], [184, 244], [194, 204], [192, 150], [214, 142], [222, 198], [234, 238], [258, 272], [210, 284]], 0.6), C.pink); line(g, [[176, 254], [184, 244], [194, 204], [192, 150]], C.ink, 0.9); line(g, [[214, 142], [222, 198], [234, 238], [242, 250]], C.ink, 0.9); piece(g, smooth([[196, 196], [197, 156], [210, 150], [214, 196]], 0.6), '#e58a8c');
  const greens = [[C.leafA, C.leafD], [C.leafB, C.leafA], [C.leafC, C.jungle], [C.leafA, C.leafC]];
  for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) { const x = i * 50 + (row % 2) * 24 + (r() - 0.5) * 22 - 6, y = 26 + row * 50 + (r() - 0.5) * 20, k = Math.floor(r() * 4), [c1, c2] = greens[(k + row) % 4]; if (Math.abs(x - 204) < 34 && y > 130) continue;
    if (k === 0) fan(g, x, y + 12, 26 + r() * 10, -Math.PI / 2 + (r() - 0.5) * 0.7, c1, c2); else for (let j = 0; j < 3; j++) blade(g, x, y + 16, 30 + r() * 20, -Math.PI / 2 + (j - 1) * (0.55 + r() * 0.3) + (r() - 0.5) * 0.3, 0.2 + r() * 0.08, c1, c2);
    if (r() > 0.72) bloom(g, x + 8, y - 4, 1.1, r() > 0.5 ? C.flower : C.pink); else if (r() > 0.8) piece(g, ell(x - 6, y + 4, 4.4, 4.4), C.fruit, { ink: C.ink, lw: 0.9 }); }
  palm(g, L.palms[2]);
  for (let i = 0; i < 15; i++) { const q = along(L.jungle, i / 14); if (Math.abs(q[0] - 206) < 36) continue; const [c1, c2] = greens[i % 4]; if (i % 3 === 1) fan(g, q[0], q[1] + 14, 24 + r() * 8, -Math.PI / 2 + (r() - 0.5) * 0.5, c1, c2); else for (let j = 0; j < 3; j++) blade(g, q[0] + (r() - 0.5) * 6, q[1] + 16, 28 + r() * 16, -Math.PI / 2 + (j - 1) * (0.6 + r() * 0.3), 0.22 + r() * 0.08, c1, c2); if (i % 4 === 2) bloom(g, q[0] + 9, q[1] + 2, 1.15, C.flower); }
  for (const [x, y] of L.tufts) for (const a of [-2.0, -1.57, -1.15]) blade(g, x, y, 11, a, 0.2, C.leafB, C.leafA, 0);
  // what lies on the sand
  for (const q of L.rocks) { shadow(g, q.at[0], q.at[1] + q.r * 0.4, q.r * 1.05, q.r * 0.36); rock(g, q); }
  shadow(g, L.chest[0], L.chest[1], 21, 7); chest(g, L.chest[0], L.chest[1]); shadow(g, L.barrel[0], L.barrel[1], 16, 6.5); barrel(g, L.barrel[0], L.barrel[1]);
  g.save(); g.translate(L.drift[0], L.drift[1]); g.rotate(-0.25); piece(g, K.rrect(-26, -5, 52, 10, 4), '#e9c9a0', { ink: C.ink, lw: 0.9 }); for (const x of [-14, -2, 9]) line(g, [[x, -2], [x + 9, -1]], P.alpha(C.ink, 0.6), 0.6); piece(g, K.rrect(8, -12, 7, 10, 2.5), '#e9c9a0', { ink: C.ink, lw: 0.9 }); g.restore();
  shell(g, L.shells[0][0], L.shells[0][1], 1, C.pink); shell(g, L.shells[1][0], L.shells[1][1], 0.9, C.paper); shell(g, L.shells[2][0], L.shells[2][1], 0.8, C.fruit); shell(g, L.shells[3][0], L.shells[3][1], 0.8, C.pink); starfish(g, L.star[0], L.star[1]);
  // the drop that waits, in its rarity's colour; a few coins
  g.save(); ell(L.loot[0], L.loot[1], 19, 8.5)(g); g.fillStyle = '#cfe6fb'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = C.rare; g.stroke(); ell(L.loot[0], L.loot[1], 22.5, 10.5)(g); g.lineWidth = 0.8; g.strokeStyle = C.ink; g.stroke(); g.restore();
  g.save(); g.translate(L.loot[0], L.loot[1] - 4); g.rotate(-0.5); g.scale(0.6, 0.6); cutlass(g, [-18, 0], 0, 1); g.restore();
  spark(g, L.loot[0] - 16, L.loot[1] - 16, 5.5, C.foam); spark(g, L.loot[0] + 15, L.loot[1] - 21, 4, '#cfe6fb'); spark(g, L.loot[0] + 21, L.loot[1] - 4, 3, C.foam);
  for (const [dx, dy] of [[0, 0], [9, 3], [3, -5]]) piece(g, ell(L.coins[0] + dx, L.coins[1] + dy, 5.2, 3.8), C.gold, { shade: C.brassSh, d: [-0.9, -1.1], ink: C.ink, lw: 0.9 }); spark(g, L.coins[0] + 13, L.coins[1] - 9, 3.4, C.foam);
  // the fighters
  g.save(); ell(L.crabA[0], L.crabA[1] + 2, 35, 15.5)(g); g.lineWidth = 2.4; g.strokeStyle = C.flower; g.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6, x = L.crabA[0] + Math.cos(a) * 35, y = L.crabA[1] + 2 + Math.sin(a) * 15.5; g.fillStyle = C.flower; g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } g.restore();
  shadow(g, L.hero[0], L.hero[1], 22, 7.5); shadow(g, L.crabA[0], L.crabA[1] + 2, 27, 9); shadow(g, L.crabB[0], L.crabB[1] + 2, 25, 8);
  const fo = { lw: 1.05, ink: C.ink, bias: [0.55, 0.7] };
  K.put(g, K.figure(S, HERO_K, HERO_BOX, hero, fo), L.hero[0], L.hero[1]);
  const th = Math.atan2(-(L.hero[0] - L.crabA[0]), (L.hero[1] - L.crabA[1]) / 0.8);
  K.put(g, K.figure(S, CRAB_K, CRAB_BOX, gg => crab(gg, th, 1), fo), L.crabA[0], L.crabA[1]);
  K.put(g, K.figure(S, CRAB_K * 0.92, CRAB_BOX, gg => crab(gg, 0.25, 0), fo), L.crabB[0], L.crabB[1]);
  for (const p of [L.palms[0], L.palms[1]]) { shadow(g, p.at[0] + 14, p.at[1] + 4, 30, 9); palm(g, p); }
  K.hitNumber(g, '14', L.crabA[0] + 4, L.crabA[1] - 50, { font: 'Georgia', size: 24, col: C.paper, stroke: C.ink, strokeW: 4.5 });
  K.chrome(g, { font: 'Georgia', panel: C.paper, line: C.ink, lw: 1.3, text: C.ink, sub: C.banSh, hp: C.flower, rage: C.sash, xp: C.leafB, gold: C.gold, btn: C.paper, well: '#d9c7a8', badge: C.ink, badgeText: C.paper, quest: C.gold, r: 3, shadow: 2.2, shadowCol: C.ink, skill: [C.sea2, C.flower, C.leafA], ring: C.paper, glyph: C.paper, glyphLine: C.ink, iconFill: C.sandHi, iconLw: 1.3, hudText: C.paper, hudStroke: C.ink,
    portrait: (gg, x, y) => { gg.fillStyle = C.sea3; gg.fillRect(x - 30, y - 30, 60, 60); gg.save(); gg.translate(x - 4, y + 4 + 71 * 1.25); gg.scale(1.25, 1.25); head(gg, 3, -71); gg.restore(); } });
  return cv;
}
if (require.main === module) {
  const out = path.join(__dirname, '3.png'); P.save(paint(2), out);
  P.save(paint(6, { x: 106, y: 414, w: 250, h: 190 }), path.join(__dirname, '3-close.png')); console.log('wrote', out);
}
module.exports = { paint };
