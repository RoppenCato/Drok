// b.js: look 2, "Sticker cartoon" (Leonard, AD, 2026-11-20). Drawn in 2D on the rig: a thick dark line round every figure,
// flat candy colour with one shade, a round big-headed hero, props with a thinner coloured line. The hand of MapleStory.
//   node concepts/look/b.js        writes 2.png (the still at 2x) and 2-close.png (the hero and the crab at 3 times)
const K = require('./kit.js'); const { P, R, L, ell, poly, smooth, piece, line, curve } = K; const path = require('path');
const C = {
  ink: '#3a2114', sand: '#ffe2a0', sandHi: '#fff0c8', sandLo: '#f6cd84', wet: '#eec47a', sea: '#38d0e4', sea2: '#1fb6de', sea3: '#1a9ad2', foam: '#ffffff',
  jungle: '#27a05c', jungle2: '#1c8656', leaf: '#46c968', leafSh: '#28a257', leafInk: '#15603c', leaf2: '#8fe05a', leaf2Sh: '#58bd4a',
  trunk: '#c98a4a', trunkSh: '#9a6030', trunkInk: '#5e3518', nut: '#8a5326',
  rock: '#b4bfd6', rockSh: '#8590b2', rockInk: '#4c5878',
  skin: '#f8c592', skinSh: '#e09a6c', ban: '#f0443c', banSh: '#c22c3a', shirt: '#fff6dc', shirtSh: '#e8d2a2', trou: '#3197c2', trouSh: '#226f9e', sash: '#ffbe2e', sashSh: '#e8922a', hair: '#5c3620',
  steel: '#e4eef4', steelSh: '#aabdcc', brass: '#ffc93c', brassSh: '#e09a2a', wood: '#cf8a48', woodSh: '#a36434', grip: '#7a4a2a',
  crab: '#ff6a48', crabSh: '#d9403c', crabHi: '#ffb48a', crabInk: '#7a1f1c', claw: '#ff8a5c',
  rare: '#3d9cff', gold: '#ffcf3a', goldSh: '#e39a22'
};
const LW = 1.1;   // the inner line, in figure units
const fig = (g, pth, col, sh, o = {}) => piece(g, pth, col, { shade: sh, d: o.d || [-1.6, -2], ink: C.ink, lw: o.lw === undefined ? LW : o.lw });
const mid = (a, b, k = 0.5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ---------------------------------------------------------------- the hero: a nobody from the harbour, cutlass and buckler
const BONES = { upper: 11, fore: 10, thigh: 10, shin: 9.5 }, HR = 21;
const POSE = R.skeleton({ hip: [0, -22], neck: [2, -42], head: [3, -62], shF: [-11, -40], hF: [-24, -55], shB: [13, -40], hB: [29, -30], hipF: [-5, -22], footF: [-13, 0], hipB: [6, -22], footB: [14, -2] });
function head(g, hx, hy) {
  fig(g, ell(hx - HR * 0.78, hy + 3, 4.2, 5.2), C.skin, C.skinSh);                                                           // the near ear
  fig(g, smooth([[hx - 19, hy + 2], [hx - 21, hy + 10], [hx - 15, hy + 15], [hx - 9, hy + 8], [hx - 12, hy - 2]], 0.6), C.hair, null);  // hair at the nape
  fig(g, ell(hx, hy, HR, HR - 1), C.skin, C.skinSh, { d: [-2.4, -3] });
  fig(g, smooth([[hx + 2, hy - 6], [hx + 10, hy - 9], [hx + 17, hy - 6.5], [hx + 9, hy - 2.5]], 0.6), C.hair, null, { lw: 0.8 });   // a tuft under the cloth
  const cl = hx + HR * 0.55, ey = hy + 3.5;
  g.save(); g.globalAlpha = 0.3; g.fillStyle = '#ff6a5a'; ell(cl - 10.5, ey + 9, 4.6, 2.6)(g); g.fill(); ell(cl + 6, ey + 8.5, 2.6, 2.2)(g); g.fill(); g.restore();   // the cheeks
  K.eyes(g, cl, ey, HR / 22, { iris: '#2f86d8', lid: '#2a1610', brow: C.hair, mood: 'fierce', browW: 2 });
  g.save(); g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(cl + 0.5, ey + 5.5); g.quadraticCurveTo(cl + 2.6, ey + 7.2, cl + 0.6, ey + 8.2); g.stroke();   // the nose
  g.lineWidth = 1.6; g.beginPath(); g.moveTo(cl - 8.5, ey + 10.6); g.quadraticCurveTo(cl - 3.5, ey + 14.4, cl + 1.2, ey + 10.4); g.stroke(); g.restore();                           // a set grin
  // the head cloth: over the crown, a knot and two tails at the back
  fig(g, smooth([[hx - 21.5, hy - 5.5], [hx - 28, hy - 9], [hx - 34, hy - 5], [hx - 30, hy + 1], [hx - 22, hy - 1]], 0.6), C.ban, C.banSh);
  fig(g, smooth([[hx - 21, hy - 3], [hx - 28, hy + 2], [hx - 30, hy + 9], [hx - 24, hy + 8], [hx - 19, hy + 1]], 0.6), C.ban, C.banSh);
  fig(g, smooth([[hx - 21.5, hy - 2], [hx - 20.5, hy - 13], [hx - 10, hy - 21.5], [hx + 5, hy - 22.5], [hx + 17, hy - 16], [hx + 21.8, hy - 6], [hx + 12, hy - 9.5], [hx, hy - 9], [hx - 12, hy - 6]], 0.55), C.ban, C.banSh, { d: [-2.4, -3] });
  fig(g, ell(hx - 21, hy - 3.5, 3.4, 3.8), C.ban, C.banSh);
  g.save(); g.fillStyle = '#ffffff'; for (const [x, y] of [[-8, -15], [4, -17.5], [13, -13.5], [-15, -9.5]]) { g.beginPath(); g.arc(hx + x, hy + y, 1.4, 0, 7); g.fill(); } g.restore();   // spots on the cloth
}
function cutlass(g, hd, a) {
  g.save(); g.translate(hd[0], hd[1]); g.rotate(a);
  fig(g, smooth([[5, -3.2], [20, -5], [33, -7.4], [42, -8.6], [39, -2], [27, 2.6], [5, 3.6]], 0.5), C.steel, C.steelSh, { d: [-0.6, -1.8] });   // the blade, wider toward the tip, the back curved
  fig(g, poly([[-6, -2.4], [3, -2.4], [3, 2.4], [-6, 2.4]]), C.grip, null);
  fig(g, smooth([[2, -5.5], [6, -5.5], [6, 5.5], [2, 5.5]], 0.3), C.brass, C.brassSh);
  g.strokeStyle = C.brass; g.lineWidth = 2.2; g.beginPath(); g.moveTo(4, 5); g.quadraticCurveTo(-1, 10.5, -6, 3); g.stroke(); g.strokeStyle = C.ink; g.lineWidth = 0.7; g.beginPath(); g.moveTo(4.5, 6.2); g.quadraticCurveTo(-1, 12, -6.6, 3.6); g.stroke();   // the knuckle bow
  g.restore();
}
function buckler(g, c) {
  fig(g, ell(c[0], c[1], 11.5, 14, 0.12), C.steel, C.steelSh, { d: [-1.4, -1.8] });
  fig(g, ell(c[0], c[1], 8.6, 11, 0.12), C.wood, C.woodSh, { d: [-1.2, -1.6], lw: 0.8 });
  g.save(); g.strokeStyle = C.woodSh; g.lineWidth = 0.8; for (const dx of [-3.4, 3.2]) { g.beginPath(); g.moveTo(c[0] + dx, c[1] - 10); g.lineTo(c[0] + dx + 1, c[1] + 10); g.stroke(); } g.restore();
  fig(g, ell(c[0] + 0.3, c[1], 3.8, 4.4), C.brass, C.brassSh, { d: [-0.8, -1] });
}
function leg(g, J, hip, knee, foot, far) {
  const tr = far ? P.darken(C.trou, 0.1) : C.trou;
  fig(g, R.limbPath(knee, mid(knee, foot), foot, 4.8, 4.6, 4.2), C.skin, C.skinSh);
  fig(g, ell(foot[0] + 3.2, foot[1] - 1.2, 7, 4.2, -0.08), C.skin, C.skinSh);                                              // a bare foot
  fig(g, R.limbPath(hip, knee, mid(knee, foot, 0.5), 7, 6.6, 6), tr, C.trouSh);
}
function arm(g, sh, el, hd, far) {
  fig(g, R.limbPath(sh, el, hd, 5.4, 4.9, 4.5), C.skin, C.skinSh);
  fig(g, R.limbPath(sh, mid(sh, el), el, 6.8, 6.5, 6.2), far ? P.darken(C.shirt, 0.06) : C.shirt, C.shirtSh);          // a rolled sleeve
}
function hero(g) {
  const J = R.solve(POSE, BONES), aF = R.angleOf(J.elF, J.hF);
  arm(g, J.shB, J.elB, J.hB, true); fig(g, ell(17.5, -43.5, 8.5, 8), P.darken(C.shirt, 0.06), C.shirtSh); buckler(g, [J.hB[0] + 5.5, J.hB[1] + 0.5]);
  leg(g, J, J.hipB, J.kneeB, J.footB, true);
  cutlass(g, J.hF, -1.92);
  leg(g, J, J.hipF, J.kneeF, J.footF, false);
  fig(g, smooth([[-13, -40], [-4, -45], [9, -45], [16, -39.5], [14.5, -30], [12.5, -21], [4, -18], [-6, -18], [-11, -22], [-13.5, -31]], 0.55), C.shirt, C.shirtSh, { d: [-2, -2.4] });   // the shirt
  fig(g, poly([[-1.5, -45.5], [7.5, -45.5], [3.5, -37]]), C.skin, null, { lw: 0.8 });                                         // the open collar
  fig(g, smooth([[-12.6, -28.5], [0, -27], [13.4, -28.5], [12.5, -21.5], [4, -18.4], [-6, -18.4], [-11.4, -22]], 0.5), C.sash, C.sashSh);   // the sash
  fig(g, smooth([[-11, -23], [-15, -17], [-15.5, -9], [-11.5, -10], [-8.5, -19]], 0.6), C.sash, C.sashSh);                 // its tail
  head(g, J.head[0], J.head[1]);
  arm(g, J.shF, J.elF, J.hF, false);
  g.save(); g.translate(J.hF[0], J.hF[1]); g.rotate(aF); fig(g, smooth([[-4.2, -4.6], [3.6, -5], [6, -1.5], [5.6, 3], [2.5, 5], [-4.2, 4.6]], 0.5), C.skin, C.skinSh); g.restore();   // the fist round the grip
}
const HERO_BOX = { l: -46, t: -108, r: 50, b: 8 }, HERO_K = 0.8;

// ---------------------------------------------------------------- the sand crab: every point goes through the ground's turn and tilt
const crab = (g, th, raise) => K.crab(g, th, raise, C, { lw: LW });
const CRAB_BOX = { l: -58, t: -62, r: 58, b: 52 }, CRAB_K = 0.8;

// ---------------------------------------------------------------- the place
function palm(g, p) {
  const r = P.rng(p.seed), top = [p.at[0] + p.lean * p.h, p.at[1] - p.h], c1 = [p.at[0] + p.lean * p.h * 0.1, p.at[1] - p.h * 0.6];
  const at = t => { const a = mid(p.at, c1, t), b = mid(c1, top, t); return mid(a, b, t); };
  const left = [], right = []; for (let i = 0; i <= 8; i++) { const t = i / 8, q = at(t), q2 = at(Math.min(1, t + 0.05)), dx = q2[0] - q[0], dy = q2[1] - q[1], n = Math.hypot(dx, dy) || 1, w = 7.5 - 3 * t; left.push([q[0] + dy / n * w, q[1] - dx / n * w]); right.unshift([q[0] - dy / n * w, q[1] + dx / n * w]); }
  piece(g, smooth([...left, ...right], 0.4), C.trunk, { shade: C.trunkSh, d: [-2.4, -1], ink: C.trunkInk, lw: 1.5 });
  g.save(); g.strokeStyle = C.trunkSh; g.lineWidth = 1.3; for (let i = 1; i < 8; i++) { const q = at(i / 8.5), w = 6 - 2.6 * i / 8; g.beginPath(); g.moveTo(q[0] - w, q[1] + 1.5); g.quadraticCurveTo(q[0], q[1] + 4, q[0] + w, q[1] + 1); g.stroke(); } g.restore();
  const n = 9, fr = Array.from({ length: n }, (_, i) => ({ a: i / n * Math.PI * 2 + (r() - 0.5) * 0.35 + 0.3, len: p.r * (0.82 + r() * 0.3), w: 0.2 + r() * 0.06 })).sort((a, b) => Math.sin(a.a) - Math.sin(b.a));
  for (const f of fr) {
    const tip = [top[0] + Math.cos(f.a) * f.len, top[1] + Math.sin(f.a) * f.len * 0.6 + f.len * 0.2], arch = [top[0] + Math.cos(f.a) * f.len * 0.5, top[1] + Math.sin(f.a) * f.len * 0.3 - f.len * 0.16];
    const sp = t => { const a = mid(top, arch, t), b = mid(arch, tip, t); return mid(a, b, t); }, L1 = [], R1 = [];
    for (let i = 0; i <= 7; i++) { const t = i / 7, q = sp(t), q2 = sp(Math.min(1, t + 0.04)), dx = q2[0] - q[0], dy = q2[1] - q[1], m = Math.hypot(dx, dy) || 1, w = f.len * f.w * Math.sin(Math.PI * Math.pow(t, 0.75)) * (1 + (i % 2 ? 0.12 : -0.08)) + 0.6; L1.push([q[0] + dy / m * w, q[1] - dx / m * w]); R1.unshift([q[0] - dy / m * w, q[1] + dx / m * w]); }
    const far = Math.sin(f.a) < -0.2; piece(g, smooth([...L1, ...R1], 0.45), far ? C.leafSh : C.leaf, { shade: far ? P.darken(C.leafSh, 0.12) : C.leafSh, d: [-1.5, -2.2], ink: C.leafInk, lw: 1.5 });
    g.save(); g.strokeStyle = far ? C.leafInk : P.mix(C.leafInk, C.leafSh, 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(arch[0], arch[1], sp(0.93)[0], sp(0.93)[1]); g.stroke(); g.restore();
  }
  for (const [dx, dy] of [[-4, 3], [4, 4.5], [0, 8]]) piece(g, ell(top[0] + dx, top[1] + dy, 4.6, 4.6), C.nut, { shade: P.darken(C.nut, 0.25), d: [-1, -1.2], ink: C.trunkInk, lw: 1.3 });
}
function bush(g, x, y, s, seed, flower) {
  const r = P.rng(seed), n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) { const a = -Math.PI * (0.08 + 0.84 * (i + r() * 0.5) / n), len = s * (0.75 + r() * 0.5), tip = [x + Math.cos(a) * len, y + Math.sin(a) * len * 0.8], nx = -Math.sin(a), ny = Math.cos(a), w = len * (0.3 + r() * 0.1), m = mid([x, y], tip, 0.5), two = r() > 0.6;
    piece(g, smooth([[x, y], [m[0] + nx * w, m[1] + ny * w * 0.8], tip, [m[0] - nx * w, m[1] - ny * w * 0.8]], 0.7), two ? C.leaf2 : C.leaf, { shade: two ? C.leaf2Sh : C.leafSh, d: [-1.4, -1.8], ink: C.leafInk, lw: 1.4 });
    line(g, [[x, y], mid([x, y], tip, 0.85)], P.mix(C.leafInk, C.leafSh, 0.3), 0.9); }
  if (flower) { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; piece(g, ell(x + Math.cos(a) * 3.2, y - s * 0.5 + Math.sin(a) * 3.2, 2.6, 2.6), flower, { ink: C.ink, lw: 1 }); } piece(g, ell(x, y - s * 0.5, 2, 2), C.gold, { ink: C.ink, lw: 0.9 }); }
}
function rock(g, q) { piece(g, K.blob(q.at[0], q.at[1], q.r, q.r * 0.72, 9, 0.3, q.seed), C.rock, { shade: C.rockSh, d: [-q.r * 0.14, -q.r * 0.2], ink: C.rockInk, lw: 1.5 }); line(g, [[q.at[0] - q.r * 0.3, q.at[1] - q.r * 0.1], [q.at[0], q.at[1] + q.r * 0.06], [q.at[0] + q.r * 0.25, q.at[1] - q.r * 0.16]], C.rockSh, 1.1); }
function chest(g, x, y) {
  const o = { ink: '#5e3518', lw: 1.6 };
  piece(g, K.rrect(x - 17, y - 14, 34, 16, 2.5), C.wood, { ...o, shade: C.woodSh, d: [-2, -2] });                           // the front
  piece(g, smooth([[x - 17, y - 14], [x - 15, y - 25], [x, y - 28], [x + 15, y - 25], [x + 17, y - 14]], 0.4), P.lighten(C.wood, 0.12), { ...o, shade: C.wood, d: [-2, -2] });   // the lid, seen from above
  for (const dx of [-11, 11]) piece(g, K.rrect(x + dx - 2.2, y - 26.5, 4.4, 28, 1), C.brass, { ink: '#5e3518', lw: 1.1 });
  piece(g, K.rrect(x - 3.6, y - 16.5, 7.2, 7.5, 1.6), C.brass, { ...o, lw: 1.2, shade: C.brassSh, d: [-0.8, -1] }); g.fillStyle = '#5e3518'; g.beginPath(); g.arc(x, y - 13, 1.2, 0, 7); g.fill();
}
function barrel(g, x, y) {
  const o = { ink: '#5e3518', lw: 1.6 };
  piece(g, smooth([[x - 12, y - 24], [x - 14, y - 12], [x - 11, y], [x, y + 3], [x + 11, y], [x + 14, y - 12], [x + 12, y - 24]], 0.45), C.wood, { ...o, shade: C.woodSh, d: [-2.5, -1] });
  for (const dy of [-18, -5]) { g.save(); g.strokeStyle = C.rockSh; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x - 13, y + dy); g.quadraticCurveTo(x, y + dy + 4.5, x + 13, y + dy); g.stroke(); g.strokeStyle = '#5e3518'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - 13, y + dy + 1.7); g.quadraticCurveTo(x, y + dy + 6.2, x + 13, y + dy + 1.7); g.stroke(); g.restore(); }
  piece(g, ell(x, y - 24, 12, 5), P.lighten(C.wood, 0.18), { ...o, shade: C.wood, d: [-1, -1.2] });
}
function shell(g, x, y, s, col) { const pts = [[x, y + 4 * s]]; for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.08 + 0.84 * i / 6); pts.push([x + Math.cos(a) * 6.5 * s * (i % 2 ? 1 : 0.9), y + 2 * s + Math.sin(a) * 6.5 * s]); } piece(g, smooth(pts, 0.4), col, { shade: P.darken(col, 0.18), d: [-0.8, -1], ink: P.darken(col, 0.55), lw: 1.2 }); }
function starfish(g, x, y) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + 0.3, rr = i % 2 ? 3.4 : 8.5; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); } piece(g, smooth(pts, 0.35), '#ff9a3a', { shade: '#e6702c', d: [-0.8, -1], ink: '#8a3a14', lw: 1.3 }); }
function spark(g, x, y, r, col) { g.save(); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
function shadow(g, x, y, rx, ry, a = 0.22) { g.save(); g.globalAlpha = a; g.fillStyle = '#7a4a1e'; ell(x, y, rx, ry)(g); g.fill(); g.restore(); }

function paint(S, crop) {
  const { cv, g } = K.still(S, crop), r = P.rng(11);
  // the sand, the wet band, the sea in three flat steps, the foam
  g.fillStyle = C.sand; g.fillRect(-10, -10, K.W + 20, K.H + 20);
  for (let i = 0; i < 16; i++) piece(g, K.blob(r() * K.W, 250 + r() * 470, 22 + r() * 30, 8 + r() * 10, 9, 0.35, 20 + i), i % 3 ? C.sandHi : '#fad892');
  for (let i = 0; i < 60; i++) { g.fillStyle = i % 2 ? C.sandLo : '#e9b96e'; g.beginPath(); g.arc(r() * K.W, 250 + r() * 480, 0.9 + r() * 0.9, 0, 7); g.fill(); }
  piece(g, K.below(K.moved(L.shore, 0, -13)), C.wet); piece(g, K.below(L.shore), C.sea);
  piece(g, K.below(K.moved(L.shore, -30, 62)), C.sea2); piece(g, K.below(K.moved(L.shore, -70, 150)), C.sea3);
  g.save(); g.beginPath(); curve(g, K.moved(L.shore, 0, 3)); g.lineWidth = 9; g.strokeStyle = C.foam; g.stroke(); g.restore();
  for (let i = 0; i < 30; i++) { const t = i / 29, a = L.shore, n = a.length - 1, f = t * n, j = Math.min(n - 1, Math.floor(f)), q = mid(a[j], a[j + 1], f - j); g.fillStyle = C.foam; g.beginPath(); g.arc(q[0], q[1] + 8 + (i % 2) * 2, 5 + (i % 3), 0, 7); g.fill(); }
  line(g, K.moved(L.shore, 0, -2.5), '#7fe6f0', 1.6);
  for (const [x, y, w] of [[60, 770, 26], [130, 820, 34], [40, 860, 30], [220, 868, 28], [150, 895, 22], [300, 900, 26]]) line(g, [[x, y], [x + w * 0.5, y - 4], [x + w, y]], '#bff3f8', 2.2);
  // the jungle behind the beach, the path into it
  piece(g, K.above(L.jungle), C.jungle); piece(g, K.above(K.moved(L.jungle, 0, -60)), C.jungle2);
  piece(g, K.blob(206, 222, 28, 46, 10, 0.25, 5), C.sand); piece(g, K.blob(200, 170, 16, 30, 9, 0.3, 6), C.sandLo);
  for (let i = 0; i < 26; i++) bush(g, r() * K.W, 20 + r() * 180, 16 + r() * 14, 40 + i, i % 7 === 0 ? '#ff5a8a' : i % 9 === 0 ? '#ffd23a' : null);
  palm(g, L.palms[2]);
  const edge = []; for (let i = 0; i < 17; i++) { const t = i / 16, a = L.jungle, n = a.length - 1, f = t * n, j = Math.min(n - 1, Math.floor(f)), q = mid(a[j], a[j + 1], f - j); if (Math.abs(q[0] - 206) > 30) edge.push(q); }
  edge.forEach((q, i) => bush(g, q[0] + (r() - 0.5) * 8, q[1] + 6 + r() * 6, 17 + r() * 10, 80 + i, i % 5 === 2 ? '#ff5a8a' : null));
  for (const [x, y] of L.tufts) { for (const dx of [-4, 0, 4]) line(g, [[x + dx, y], [x + dx * 1.6, y - 8 - Math.abs(dx)]], C.leafSh, 2.4); }
  // what lies on the sand
  for (const q of L.rocks) { shadow(g, q.at[0] + 4, q.at[1] + q.r * 0.55, q.r * 1.05, q.r * 0.3); rock(g, q); }
  shadow(g, L.chest[0] + 3, L.chest[1] + 2, 21, 6); chest(g, L.chest[0], L.chest[1]);
  shadow(g, L.barrel[0] + 4, L.barrel[1] + 2, 16, 6); barrel(g, L.barrel[0], L.barrel[1]);
  g.save(); g.translate(L.drift[0], L.drift[1]); g.rotate(-0.25); piece(g, K.rrect(-26, -5, 52, 10, 5), '#d9b48a', { shade: '#b88c62', d: [-1, -2], ink: '#6b4526', lw: 1.5 }); piece(g, K.rrect(8, -12, 7, 10, 3), '#d9b48a', { ink: '#6b4526', lw: 1.5 }); g.restore();
  shell(g, L.shells[0][0], L.shells[0][1], 1, '#ff9eb8'); shell(g, L.shells[1][0], L.shells[1][1], 0.9, '#fff0d8'); shell(g, L.shells[2][0], L.shells[2][1], 0.8, '#ffc078'); shell(g, L.shells[3][0], L.shells[3][1], 0.8, '#ff9eb8'); starfish(g, L.star[0], L.star[1]);
  // the drop that waits: a rare blade in its colour, and a few coins
  g.save(); ell(L.loot[0], L.loot[1], 19, 8.5)(g); g.fillStyle = 'rgba(200,232,255,0.7)'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = C.rare; g.stroke(); g.restore();
  g.save(); g.translate(L.loot[0], L.loot[1] - 4); g.rotate(-0.5); g.scale(0.62, 0.62); cutlass(g, [-16, 0], 0); g.restore();
  spark(g, L.loot[0] - 15, L.loot[1] - 15, 5.5, '#ffffff'); spark(g, L.loot[0] + 14, L.loot[1] - 20, 4, '#bfe0ff'); spark(g, L.loot[0] + 19, L.loot[1] - 4, 3, '#ffffff');
  for (const [dx, dy] of [[0, 0], [9, 3], [3, -5]]) piece(g, ell(L.coins[0] + dx, L.coins[1] + dy, 5.2, 3.8), C.gold, { shade: C.goldSh, d: [-0.8, -1], ink: '#7a4a12', lw: 1.2 }); spark(g, L.coins[0] + 12, L.coins[1] - 9, 3.4, '#ffffff');
  // the fighters, back to front: the hero, the crab he has picked, a crab that has not noticed yet
  shadow(g, L.crabA[0], L.crabA[1] + 3, 27, 9); g.save(); ell(L.crabA[0], L.crabA[1] + 2, 34, 15)(g); g.setLineDash([13, 7]); g.lineWidth = 2.6; g.strokeStyle = '#ff3d4a'; g.stroke(); g.restore();
  shadow(g, L.hero[0] + 2, L.hero[1] + 1, 21, 7.5); shadow(g, L.crabB[0], L.crabB[1] + 3, 25, 8);
  K.put(g, K.figure(S, HERO_K, HERO_BOX, hero, { lw: 1.7, ink: C.ink, bias: [0.25, 0.35] }), L.hero[0], L.hero[1]);
  const th = Math.atan2(-(L.hero[0] - L.crabA[0]), (L.hero[1] - L.crabA[1]) / 0.8);
  K.put(g, K.figure(S, CRAB_K, CRAB_BOX, gg => crab(gg, th, 1), { lw: 1.7, ink: C.crabInk, bias: [0.25, 0.35] }), L.crabA[0], L.crabA[1]);
  K.put(g, K.figure(S, CRAB_K * 0.92, CRAB_BOX, gg => crab(gg, 0.25, 0), { lw: 1.7, ink: C.crabInk, bias: [0.25, 0.35] }), L.crabB[0], L.crabB[1]);
  // the front palms and rocks stand over what is behind them
  for (const p of [L.palms[0], L.palms[1]]) { shadow(g, p.at[0] + 16, p.at[1] + 6, 30, 9, 0.2); palm(g, p); }
  K.hitNumber(g, '14', L.crabA[0] + 2, L.crabA[1] - 46, { font: 'Trebuchet MS', size: 24, col: '#fff4b8', stroke: C.ink, strokeW: 5.5 });
  K.chrome(g, { font: 'Trebuchet MS', panel: '#fff6dc', line: C.ink, lw: 2.2, text: C.ink, sub: '#8a5a3a', hp: '#ff4d5e', rage: '#ff9a2e', xp: '#8be04e', gold: C.gold, btn: '#fff6dc', well: '#6b4a3a', barHi: 'rgba(255,255,255,0.35)', badge: C.ban, badgeText: '#fff', quest: C.gold, shadow: 2.5, shadowCol: 'rgba(58,33,20,0.35)', skill: ['#4aa8ff', '#ff5a4a', '#59c96b'], skillHi: 'rgba(255,255,255,0.25)', glyph: '#ffffff', glyphLine: C.ink, iconFill: '#ffd98a', hudText: '#fff6dc', hudStroke: C.ink,
    portrait: (gg, x, y) => { gg.fillStyle = '#8fdcf0'; gg.fillRect(x - 30, y - 30, 60, 60); gg.save(); gg.translate(x - 5, y + 4 + 62 * 0.86); gg.scale(0.86, 0.86); head(gg, 3, -62); gg.restore(); } });
  return cv;
}
if (require.main === module) {
  const out = path.join(__dirname, '2.png'); P.save(paint(2), out);
  P.save(paint(6, { x: 106, y: 414, w: 250, h: 190 }), path.join(__dirname, '2-close.png')); console.log('wrote', out);
}
module.exports = { paint };
