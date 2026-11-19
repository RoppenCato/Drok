// kit.js: what the three look stills share (Leonard, AD, 2026-11-20): the scene's layout at the judging size, the small
// drawing helpers, the face construction, and the chrome laid out as Robin picked it (skills in an arc in the bottom
// corner; bag, chart and character as small buttons at the top). Each concept paints this same scene in its own hand.
// Everything is in CSS pixels of the 412 by 915 screen; a painter scales its context by S (2 for the still).
const P = require('../../tools/paint.js'); const R = require('../../tools/rig.js');
const W = P.JUDGE.w, H = P.JUDGE.h;

// ---------------------------------------------------------------- the scene: one small beach of the first island
const L = {
  hero: [166, 518], crabA: [298, 548], crabB: [98, 668], chest: [116, 330], loot: [322, 436], coins: [232, 640],
  palms: [{ at: [56, 276], lean: 0.24, h: 118, r: 66, seed: 3 }, { at: [338, 244], lean: -0.22, h: 104, r: 60, seed: 8 }, { at: [208, 160], lean: 0.1, h: 70, r: 52, seed: 5 }],
  rocks: [{ at: [366, 344], r: 26, seed: 2 }, { at: [394, 366], r: 13, seed: 4 }, { at: [30, 432], r: 15, seed: 7 }],
  barrel: [46, 560], drift: [150, 748], shells: [[226, 430], [338, 706], [270, 724], [150, 596]], star: [80, 482],
  tufts: [[150, 300], [262, 282], [300, 318], [20, 330], [396, 300], [196, 262]],
  shore: [[-20, 690], [70, 708], [150, 742], [236, 792], [318, 846], [432, 888]],       // sand above this line, sea below
  jungle: [[-20, 268], [58, 246], [128, 258], [174, 232], [238, 228], [292, 252], [352, 226], [432, 242]],   // jungle above this line
};

// ---------------------------------------------------------------- paths
const ell = (x, y, rx, ry, rot = 0) => g => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.closePath(); };
const poly = pts => g => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
const rrect = (x, y, w, h, r) => g => { g.beginPath(); P.rr(g, x, y, w, h, r); };
const smooth = R.smoothPath;
// a smooth open line through points (Catmull-Rom); the caller strokes it, or goes on to close a region
function curve(g, pts, move = true) { if (move) g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); } }
const below = pts => g => { g.beginPath(); curve(g, pts); g.lineTo(pts[pts.length - 1][0], H + 40); g.lineTo(pts[0][0], H + 40); g.closePath(); };
const above = pts => g => { g.beginPath(); curve(g, pts); g.lineTo(pts[pts.length - 1][0], -40); g.lineTo(pts[0][0], -40); g.closePath(); };
const moved = (pts, dx, dy) => pts.map(p => [p[0] + dx, p[1] + dy]);
// a wobbly blob round a centre, the same for a seed
const blob = (x, y, rx, ry, n, k, seed) => { const r = P.rng(seed), pts = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, w = 1 + (r() - 0.5) * k; pts.push([x + Math.cos(t) * rx * w, y + Math.sin(t) * ry * w]); } return smooth(pts, 0.5); };

// ---------------------------------------------------------------- one piece: a flat fill, one shade as a crescent on the side away from the light, a line
// o.shade the shade colour (none: flat); o.d how far the lit shape is pushed toward the light [dx, dy]; o.ink and o.lw the line (lw 0: none)
function piece(g, path, col, o = {}) {
  g.save();
  if (o.shade) { path(g); g.fillStyle = o.shade; g.fill(); g.save(); path(g); g.clip(); const d = o.d || [-2, -2.5]; g.translate(d[0], d[1]); path(g); g.fillStyle = col; g.fill(); g.restore(); }
  else { path(g); g.fillStyle = col; g.fill(); }
  if (o.lw) { path(g); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = o.lw; g.strokeStyle = o.ink || '#000'; g.stroke(); }
  g.restore();
}
function line(g, pts, col, lw, closed = false) { g.save(); g.beginPath(); curve(g, pts); if (closed) g.closePath(); g.lineWidth = lw; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); }

// ---------------------------------------------------------------- a figure as one form with one line round it (rules.md 2)
// draw(g) paints the fills in figure units, feet at (0, 0); k CSS px a unit; box {l, t, r, b} in units round the feet.
// The outer line is the whole silhouette grown by lw CSS px in the ink colour; bias pushes it (heavier lower right).
function figure(S, k, box, draw, o = {}) {
  const sc = S * k, lw = (o.lw || 0) * S, pad = Math.ceil(lw + 4 * S), w = Math.ceil((box.r - box.l) * sc) + pad * 2, h = Math.ceil((box.b - box.t) * sc) + pad * 2;
  const layer = P.createCanvas(w, h), lg = layer.getContext('2d'); lg.translate(pad - box.l * sc, pad - box.t * sc); lg.scale(sc, sc); draw(lg);
  const out = P.createCanvas(w, h), g = out.getContext('2d');
  if (lw > 0) { const n = 32, bx = (o.bias || [0, 0])[0] * S, by = (o.bias || [0, 0])[1] * S; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.drawImage(layer, Math.cos(a) * lw + bx, Math.sin(a) * lw + by); } g.globalCompositeOperation = 'source-in'; g.fillStyle = o.ink || '#000'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
  g.drawImage(layer, 0, 0);
  return { cv: out, ax: (pad - box.l * sc) / S, ay: (pad - box.t * sc) / S, w: w / S, h: h / S };
}
// put a figure with its feet at (x, y); flip mirrors it about the feet
function put(g, f, x, y, flip = false) { g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); g.drawImage(f.cv, -f.ax, -f.ay, f.w, f.h); g.restore(); }

// ---------------------------------------------------------------- the face (rules.md 51), from FapleGlory's tools\hand.js (Harold, AD, 2026-11-04)
// the near eye wide on the viewer's side of the centre line, the far eye narrower close to the edge; cl, ey the centre line and the eye line
function eyes(g, cl, ey, s, o = {}) {
  const { dir = 1, iris = '#3fa8e8', brow = '#5a3620', lid = '#2a1a14', mood = 'ok', browW = 1.6 } = o;
  g.save(); g.translate(cl, ey); g.scale(dir * s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [cx, ew, eh, near] of [[-11, 5.8, 6.4, true], [5.5, 3.6, 6.0, false]]) {
    const lean = near ? 0 : 0.12;
    const almond = g2 => { g2.beginPath(); g2.moveTo(cx - ew, eh * 0.15); g2.bezierCurveTo(cx - ew * 0.7, -eh * 0.9, cx + ew * 0.5, -eh * 1.05, cx + ew, -eh * (0.3 + lean)); g2.bezierCurveTo(cx + ew * 1.0, eh * 0.5, cx + ew * 0.3, eh * 1.0, cx - ew * 0.2, eh * 0.95); g2.bezierCurveTo(cx - ew * 0.8, eh * 0.8, cx - ew * 1.02, eh * 0.4, cx - ew, eh * 0.15); g2.closePath(); };
    almond(g); g.fillStyle = '#ffffff'; g.fill();
    g.save(); almond(g); g.clip();
    const ix = cx + ew * 0.25, iy = eh * 0.1, ir = eh * 0.66;
    g.fillStyle = iris; g.beginPath(); g.ellipse(ix, iy, ir * (near ? 0.9 : 0.64), ir, 0, 0, 7); g.fill();
    g.fillStyle = lid; g.beginPath(); g.ellipse(ix + ew * 0.05, iy + eh * 0.08, ir * (near ? 0.5 : 0.36), ir * 0.55, 0, 0, 7); g.fill();
    g.fillStyle = P.alpha(lid, 0.2); g.fillRect(cx - ew - 1, -eh - 1, ew * 2 + 2, eh * 0.5);
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ix - ir * 0.4, iy - ir * 0.5, ir * 0.24, ir * 0.28, 0, 0, 7); g.fill();
    g.restore();
    g.strokeStyle = lid; g.lineWidth = near ? 2.4 : 2.0; g.beginPath(); g.moveTo(cx - ew * 1.05, -eh * 0.05); g.bezierCurveTo(cx - ew * 0.6, -eh * 1.05, cx + ew * 0.5, -eh * 1.15, cx + ew * 1.02, -eh * (0.3 + lean)); g.stroke();
    g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx - ew * 0.5, eh * 0.85); g.quadraticCurveTo(cx + ew * 0.1, eh * 1.0, cx + ew * 0.6, eh * 0.75); g.stroke();
    const slant = mood === 'fierce' ? 0.55 : 0;   // a fighter's brow: the inner end pulled down toward the nose
    g.strokeStyle = brow; g.lineWidth = browW; g.beginPath(); g.moveTo(cx - ew * 1.1, -eh * (1.55 + (near ? slant * 0.5 : -slant * 0.2))); g.quadraticCurveTo(cx, -eh * (2.0 - slant * 0.2), cx + ew * 1.05, -eh * (1.5 + lean - (near ? slant * 0.5 : -slant * 0.6))); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- the chrome, laid out as Robin picked it (2026-11-20)
// st: { panel, line, lw, text, sub, hp, rage, xp, gold, btn, btnHi, skill: [charge, cleave, guard], font, r (corner), shadow, portrait(g, x, y, r), flat }
const ICON = {
  bag: (g, x, y, s) => { g.beginPath(); P.rr(g, x - 7 * s, y - 4 * s, 14 * s, 12 * s, 3.5 * s); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 4 * s, y - 4 * s); g.quadraticCurveTo(x, y - 12 * s, x + 4 * s, y - 4 * s); g.stroke(); },
  chart: (g, x, y, s) => { g.beginPath(); g.moveTo(x - 8 * s, y - 6 * s); g.lineTo(x - 3 * s, y - 8 * s); g.lineTo(x + 3 * s, y - 6 * s); g.lineTo(x + 8 * s, y - 8 * s); g.lineTo(x + 8 * s, y + 6 * s); g.lineTo(x + 3 * s, y + 8 * s); g.lineTo(x - 3 * s, y + 6 * s); g.lineTo(x - 8 * s, y + 8 * s); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 3 * s, y - 8 * s); g.lineTo(x - 3 * s, y + 6 * s); g.moveTo(x + 3 * s, y - 6 * s); g.lineTo(x + 3 * s, y + 8 * s); g.stroke(); },
  hero: (g, x, y, s) => { g.beginPath(); g.arc(x, y - 4 * s, 4.5 * s, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 8 * s, y + 8 * s); g.quadraticCurveTo(x - 8 * s, y + 1 * s, x, y + 1 * s); g.quadraticCurveTo(x + 8 * s, y + 1 * s, x + 8 * s, y + 8 * s); g.closePath(); g.fill(); g.stroke(); },
  charge: (g, x, y, s) => { for (const dx of [-7, 0, 7]) { g.beginPath(); g.moveTo(x + (dx - 4) * s, y - 8 * s); g.lineTo(x + (dx + 4) * s, y); g.lineTo(x + (dx - 4) * s, y + 8 * s); g.stroke(); } },
  cleave: (g, x, y, s) => { g.beginPath(); g.arc(x - 2 * s, y + 3 * s, 13 * s, -2.5, 0.35); g.arc(x - 5 * s, y + 7 * s, 11 * s, 0.1, -2.2, true); g.closePath(); g.fill(); g.stroke(); },
  guard: (g, x, y, s) => { g.beginPath(); g.moveTo(x - 9 * s, y - 9 * s); g.lineTo(x + 9 * s, y - 9 * s); g.lineTo(x + 9 * s, y); g.quadraticCurveTo(x + 8 * s, y + 9 * s, x, y + 12 * s); g.quadraticCurveTo(x - 8 * s, y + 9 * s, x - 9 * s, y); g.closePath(); g.fill(); g.stroke(); },
};
function chrome(g, st) {
  const f = st.font || 'Arial', txt = (t, x, y, s, c, o = {}) => P.label(g, t, x, y, s, c, { font: f, ...o });
  const panel = (path, col = st.panel) => { if (st.shadow) { g.save(); g.translate(0, st.shadow); path(g); g.fillStyle = st.shadowCol || 'rgba(0,0,0,0.25)'; g.fill(); g.restore(); } path(g); g.fillStyle = col; g.fill(); if (st.lw) { path(g); g.lineWidth = st.lw; g.strokeStyle = st.line; g.lineJoin = 'round'; g.stroke(); } };
  const bar = (x, y, w, h, k, col) => { panel(rrect(x, y, w, h, h / 2), st.well || '#00000055'); g.save(); rrect(x, y, w, h, h / 2)(g); g.clip(); g.fillStyle = col; g.fillRect(x, y, w * k, h); if (st.barHi) { g.fillStyle = st.barHi; g.fillRect(x, y + 1.5, w * k, h * 0.28); } g.restore(); if (st.lw) { rrect(x, y, w, h, h / 2)(g); g.lineWidth = st.lw; g.strokeStyle = st.line; g.stroke(); } };
  // top left: the hero's face, level, health, rage, gold
  panel(ell(40, 48, 26, 26)); if (st.portrait) { g.save(); ell(40, 48, 23.5, 23.5)(g); g.clip(); st.portrait(g, 40, 48, 24); g.restore(); if (st.lw) { ell(40, 48, 26, 26)(g); g.lineWidth = st.lw; g.strokeStyle = st.line; g.stroke(); } }
  panel(ell(22, 70, 11, 11), st.badge || st.btn); txt('2', 22, 70.5, 13, st.badgeText || st.text, { align: 'center' });
  bar(72, 32, 122, 13, 0.72, st.hp); bar(72, 50, 96, 9, 0.45, st.rage);
  g.beginPath(); g.arc(79, 73, 6.5, 0, 7); g.fillStyle = st.gold; g.fill(); if (st.lw) { g.lineWidth = st.lw * 0.8; g.strokeStyle = st.line; g.stroke(); } txt('86', 90, 73.5, 13, st.hudText || st.text, { stroke: st.hudStroke, strokeW: 3.5 });
  // top right: bag, chart, character
  [['bag', 292], ['chart', 338], ['hero', 384]].forEach(([n, x]) => { panel(ell(x, 46, 19, 19), st.btn); g.save(); g.fillStyle = st.iconFill || st.panel; g.strokeStyle = st.icon || st.line; g.lineWidth = st.iconLw || 1.8; g.lineJoin = 'round'; g.lineCap = 'round'; ICON[n](g, x, 46.5, 1); g.restore(); });
  // the target, top centre
  panel(rrect(120, 96, 172, 30, st.r === undefined ? 15 : st.r)); txt('Sand Crab', 134, 106.5, 12.5, st.text); txt('Lv 2', 280, 106.5, 11, st.sub || st.text, { align: 'right' }); bar(132, 114, 148, 7, 0.56, st.hp);
  // a quest line, left
  panel(rrect(12, 138, 122, 24, st.r === undefined ? 12 : st.r)); panel(ell(26, 150, 8, 8), st.quest || st.gold); txt('!', 26, 150.5, 12, st.questText || st.text, { align: 'center' }); txt('Sand crabs 7/30', 40, 150.5, 11, st.text);
  // bottom right: the skills in an arc under the thumb; cleave is the big one, with the rage it needs as a ring
  const sk = [['charge', 268, 872, 27, st.skill[0]], ['guard', 370, 766, 27, st.skill[2]], ['cleave', 344, 846, 37, st.skill[1]]];
  for (const [n, x, y, r, col] of sk) {
    panel(ell(x, y, r, r), col); if (st.skillHi) { g.save(); ell(x, y, r - (st.lw || 0) / 2, r - (st.lw || 0) / 2)(g); g.clip(); g.fillStyle = st.skillHi; g.beginPath(); g.ellipse(x, y - r * 0.55, r * 1.1, r * 0.6, 0, 0, 7); g.fill(); g.restore(); if (st.lw) { ell(x, y, r, r)(g); g.lineWidth = st.lw; g.strokeStyle = st.line; g.stroke(); } }
    if (st.ring) { ell(x, y, r - 4.5, r - 4.5)(g); g.lineWidth = 1; g.strokeStyle = st.ring; g.stroke(); }
    g.save(); g.fillStyle = st.glyph || '#fff'; g.strokeStyle = st.glyphLine || st.line; g.lineWidth = (st.iconLw || 1.8) * (n === 'charge' ? 2.2 : 1.1); g.lineJoin = 'round'; g.lineCap = 'round'; if (n === 'charge') g.strokeStyle = st.glyph || '#fff'; ICON[n](g, x, y, r / 24); g.restore();
  }
  g.save(); g.beginPath(); g.arc(344, 846, 42.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.45); g.lineWidth = 4; g.strokeStyle = st.rage; g.lineCap = 'round'; g.stroke(); g.restore();
  // bottom left: the way to the next level
  bar(14, 894, 196, 8, 0.38, st.xp); txt('Lv 2', 16, 881, 11, st.hudText || st.text, { stroke: st.hudStroke, strokeW: 3.5 });
}
// a number that pops out of a hit
function hitNumber(g, t, x, y, st) { P.label(g, t, x, y, st.size || 22, st.col || '#fff', { align: 'center', font: st.font || 'Arial', stroke: st.stroke || '#000', strokeW: st.strokeW || 5 }); }

// ---------------------------------------------------------------- the sand crab, in figure units, the body's middle on the ground at (0, 0)
// th turns it on the ground (0: it faces the camera); raise lifts the claws (the windup); every point goes through the ground's turn and tilt.
// C: { crab, crabSh, crabHi, crabInk, claw }; o: { lw, facet (an angular shell), dots, dotR, dotCol, eyeWhite }
function crab(g, th, raise, C, o = {}) {
  const LW = o.lw || 1.1, N = o.facet ? 9 : 18, SM = o.facet ? 0.18 : 0.5;
  const cs = Math.cos(th), sn = Math.sin(th), pt = (x, y, z = 0) => [x * cs - y * sn, (x * sn + y * cs) * 0.8 - z], depth = (x, y) => x * sn + y * cs;
  const ring = (cx, cy, rx, ry, z, n = N, rot = 0) => smooth(Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry; return pt(cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot), z); }), SM);
  const limb = (pts, w, col) => { g.save(); g.beginPath(); curve(g, pts); g.lineWidth = w + 2 * LW; g.strokeStyle = C.crabInk; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.beginPath(); curve(g, pts); g.lineWidth = w; g.strokeStyle = col; g.stroke(); g.restore(); };
  const ROOT = [[17, 6], [19.5, -1], [16.5, -8]], KNEE = [[27, 12], [31.5, -3], [26, -15.5]], TIP = [[31.5, 20.5], [38.5, -1.5], [31, -23]];
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { limb([pt(s * KNEE[i][0], KNEE[i][1], 10), pt(s * TIP[i][0], TIP[i][1], 0)], 2.8, C.crabSh); limb([pt(s * ROOT[i][0], ROOT[i][1], 5), pt(s * KNEE[i][0], KNEE[i][1], 10)], 4, C.crabSh); }
  const claw = s => () => {
    const cz = 6 + 13 * raise, k = 1 + 0.3 * raise, cc = [s * (21 + 5 * raise), 30 + 3 * raise], tilt = -s * (0.35 + 0.15 * raise);
    limb([pt(s * 13, 11, 5), pt(s * 23, 17, 8 + 5 * raise), pt(cc[0], cc[1] - 8, cz)], 5.4, C.crab);
    piece(g, ring(cc[0], cc[1], 8.6 * k, 11.5 * k, cz, o.facet ? 8 : 16, tilt), C.claw, { shade: C.crabSh, d: [-1.5, -1.9], ink: C.crabInk, lw: LW });
    const lc = (x, y) => pt(cc[0] + (x * Math.cos(tilt) - y * Math.sin(tilt)) * k, cc[1] + (x * Math.sin(tilt) + y * Math.cos(tilt)) * k, cz);
    piece(g, poly([lc(-s * 1.2, 12.5), lc(-s * 5.2, 2.5), lc(s * 0.4, 3.5)]), C.crabInk, { lw: 0 });     // the gap of the pincer, a dark wedge
  };
  const eye = s => () => { const b = pt(s * 6, 11, 7), t = pt(s * 8, 14, 18); limb([b, t], 2.6, C.crab); piece(g, ell(t[0], t[1], 4.8, 5), o.eyeWhite || '#ffffff', { ink: C.crabInk, lw: LW }); const d = pt(s * 0.4, 2.4, 0); g.fillStyle = C.crabInk; g.beginPath(); g.arc(t[0] + d[0], t[1] + d[1] + 0.5, 2.3, 0, 7); g.fill(); };
  const shell = () => {
    piece(g, ring(0, 0, 22, 15.5, 5), C.crab, { shade: C.crabSh, d: [-2.2, -2.8], ink: C.crabInk, lw: LW });
    piece(g, ring(0, -1, 13.5, 8.2, 9.6), C.crabHi, { lw: 0 }); piece(g, ring(0, -1.4, 13.5, 8.2, 8.2), C.crab, { lw: 0 });   // the dome's light as a thin arc
    for (const [x, y] of (o.dots || [[-8, -5], [7, -6], [0, 3]])) piece(g, ring(x, y, o.dotR || 2.6, (o.dotR || 2.6) * 0.85, 6.5, 10), o.dotCol || C.crabSh, { lw: 0 });
    if (cs > 0.3) { const m = pt(0, 13.5, 4); g.save(); g.strokeStyle = C.crabInk; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(m[0] - 3.5, m[1]); g.quadraticCurveTo(m[0], m[1] + 2.4, m[0] + 3.5, m[1]); g.stroke(); g.restore(); }
  };
  const parts = [{ d: 0, f: shell }]; for (const s of [-1, 1]) { parts.push({ d: depth(s * 21, 30) + (depth(s * 21, 30) > 0 ? 50 : -50), f: claw(s) }); parts.push({ d: depth(s * 6, 11) > 0 ? 20 : -20, f: eye(s) }); }
  parts.sort((p, q) => p.d - q.d).forEach(p => p.f());
}

// a new canvas for a still: S px a CSS px, or a crop {x, y, w, h} of the screen
function still(S, crop) { const c = crop || { x: 0, y: 0, w: W, h: H }, cv = P.createCanvas(Math.round(c.w * S), Math.round(c.h * S)), g = cv.getContext('2d'); g.scale(S, S); g.translate(-c.x, -c.y); g.lineJoin = 'round'; g.lineCap = 'round'; return { cv, g }; }

module.exports = { crab, P, R, W, H, L, ell, poly, rrect, smooth, curve, below, above, moved, blob, piece, line, figure, put, eyes, chrome, hitNumber, still, ICON };
