// still.js: three wooden, pirate looks for the windows of the glass (Leonard, AD, 2026-11-20; every design is mine).
// Robin, 2026-11-20, in Victor, GD's chat: "You need to have some nice pirate design to menus and panels. Like some wooden
// feeling. Right now it looks bland. Also update icons so they look fitting." The interface's look is big work, so three
// real and different stills for him to pick from. Each is the SAME window, the hero sheet as the game lays it out today
// (client/src/view/panels.ts, buildSheet: eight slots for gear, his numbers, the bag of 7 by 3, the card, the buttons),
// with the same things in it. What differs is the idea:
//   1 planks   boards lashed with rope: light wood, sailcloth, a painted sign. Sunny, a castaway's raft.
//   2 chart    a sheet of parchment pinned on a dark chart table: ink, a red ribbon, wax. The easiest to read.
//   3 chest    the inside of a treasure chest: dark wood, iron bands, gold plates, velvet. The richest.
// Nothing here is in the game. The background is a screen of the island from tools/scene.js.
//   node tools/scene.js work/wood/bg.png --no-glass       (once)
//   node concepts/wood/still.js planks|chart|chest [out.png] [--close out-close.png]
const P = require('../../tools/paint.js'); const D = require('../../tools/dress.js'); const G = require('../../tools/glass.js'); const fs = require('fs'); const path = require('path');
const W = 412, H = 915, S = 2, CX = 206, F = { x: 20, y: 118, w: 372, h: 690 }, FONT = 'Trebuchet MS', INK = G.INK, R = P.ROOT;
const rr = (g, x, y, w, h, r) => { g.beginPath(); P.rr(g, x, y, w, h, r); };
const ol = (g, lw = 1.6, col = INK) => { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const txt = (g, t, x, y, s, c, align = 'center', o = {}) => P.label(g, t, x, y, s, c, { font: FONT, align, ...o });
const disc = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.closePath(); };
const shadow = (g, draw, dy = 3, a = 0.3) => { g.save(); g.translate(0, dy); g.globalAlpha = a; draw(); g.fillStyle = INK; g.fill(); g.restore(); };
const stud = (g, x, y, r, col, hi) => { disc(g, x, y, r); g.fillStyle = col; g.fill(); ol(g, 1.2); disc(g, x - r * 0.3, y - r * 0.3, r * 0.35); g.fillStyle = hi; g.fill(); };
// boards: n of them across a box, lying (dir 'h') or standing ('v'); each its own tone, a few lines of grain, a knot now and then
function boards(g, x, y, w, h, n, dir, tones, seam, grain, seed, o = {}) {
  const r = P.rng(seed), step = (dir === 'h' ? h : w) / n;
  for (let i = 0; i < n; i++) { const j0 = o.jag ? 2 + r() * o.jag : 0, j1 = o.jag ? 2 + r() * o.jag : 0, bx = dir === 'h' ? x - j0 : x + i * step, by = dir === 'h' ? y + i * step : y, bw = dir === 'h' ? w + j0 + j1 : step, bh = dir === 'h' ? step : h;
    g.save(); rr(g, bx, by, bw, bh, o.round || 0); g.fillStyle = tones[i % tones.length]; g.fill(); g.clip(); g.strokeStyle = grain; g.lineWidth = 1.1; g.globalAlpha = 0.55;
    for (let k = 0; k < 2; k++) { g.beginPath(); if (dir === 'h') { const yy = by + bh * (0.25 + r() * 0.5); g.moveTo(bx, yy); g.bezierCurveTo(bx + bw * 0.3, yy + (r() - 0.5) * 9, bx + bw * 0.7, yy + (r() - 0.5) * 9, bx + bw, yy + (r() - 0.5) * 4); } else { const xx = bx + bw * (0.25 + r() * 0.5); g.moveTo(xx, by); g.bezierCurveTo(xx + (r() - 0.5) * 9, by + bh * 0.3, xx + (r() - 0.5) * 9, by + bh * 0.7, xx + (r() - 0.5) * 4, by + bh); } g.stroke(); }
    if (r() < 0.4) { const kx = bx + bw * (0.15 + r() * 0.7), ky = by + bh * (0.3 + r() * 0.4); g.beginPath(); g.ellipse(kx, ky, dir === 'h' ? 5 : 3, dir === 'h' ? 3 : 5, 0, 0, 7); g.stroke(); }
    g.restore(); rr(g, bx, by, bw, bh, o.round || 0); ol(g, o.line === undefined ? 1.4 : o.line, o.line === 0 ? seam : (o.lineCol || INK));
    if (o.nails) for (const ex of [bx + 9, bx + bw - 9]) for (const ey of [by + bh * 0.28, by + bh * 0.72]) { disc(g, ex, ey, 1.7); g.fillStyle = o.nails; g.fill(); } }
}
// a rope running straight down: a band of twisted strands
function rope(g, x, y0, y1, w, col, lo) { g.save(); rr(g, x - w / 2, y0, w, y1 - y0, w / 2); g.fillStyle = col; g.fill(); g.clip(); g.strokeStyle = lo; g.lineWidth = 1.6; for (let y = y0 - w; y < y1 + w; y += 5.5) { g.beginPath(); g.moveTo(x - w / 2 - 1, y + w * 0.9); g.lineTo(x + w / 2 + 1, y); g.stroke(); } g.restore(); rr(g, x - w / 2, y0, w, y1 - y0, w / 2); ol(g, 1.4); }
// the mark in an empty slot: what part of him it is for. Each draws a path about 0, 0, about 24 across.
const MARK = {
  hat: g => { g.moveTo(-12, 5); g.quadraticCurveTo(-14, -2, -6, -3); g.quadraticCurveTo(0, -13, 6, -3); g.quadraticCurveTo(14, -2, 12, 5); g.quadraticCurveTo(0, 0, -12, 5); g.closePath(); },
  coat: g => { g.moveTo(-5, -10); g.lineTo(-1.5, -7); g.lineTo(1.5, -7); g.lineTo(5, -10); g.lineTo(12, -5); g.lineTo(9, 0); g.lineTo(6, -2); g.lineTo(7, 11); g.lineTo(-7, 11); g.lineTo(-6, -2); g.lineTo(-9, 0); g.lineTo(-12, -5); g.closePath(); },
  gloves: g => { P.rr(g, -6, -11, 12, 17, 5); g.moveTo(-6, -1); g.quadraticCurveTo(-12, -4, -11, 2); g.quadraticCurveTo(-10, 6, -6, 5); P.rr(g, -7, 6, 14, 5, 2); },
  boots: g => { g.moveTo(-6, -11); g.lineTo(3, -11); g.lineTo(3, 2); g.quadraticCurveTo(12, 3, 12, 9); g.lineTo(12, 11); g.lineTo(-6, 11); g.closePath(); },
  weapon: g => { g.moveTo(-10, 10); g.lineTo(-6, 6); g.lineTo(-8, 3); g.lineTo(-5, 1); g.lineTo(-3, 4); g.quadraticCurveTo(7, 0, 11, -11); g.quadraticCurveTo(11, 3, -1, 8); g.lineTo(-6, 12); g.closePath(); },
  shield: g => { g.arc(0, 0, 11, 0, 7); g.closePath(); g.moveTo(4, 0); g.arc(0, 0, 4, 0, 7); },
  ring: g => { g.arc(0, 3, 8, 0, 7); g.closePath(); g.moveTo(5, 3); g.arc(0, 3, 5, 0, 7, true); g.moveTo(0, -11); g.lineTo(4, -7); g.lineTo(0, -3); g.lineTo(-4, -7); g.closePath(); },
  charm: g => { g.moveTo(-7, -5); g.quadraticCurveTo(0, -9, 7, -5); g.quadraticCurveTo(5, 5, 0, 12); g.quadraticCurveTo(-5, 5, -7, -5); g.closePath(); g.moveTo(3, -9); g.arc(0, -9, 3, 0, 7); },
};
const mark = (g, kind, x, y, fill, line, lw = 1.5) => { g.save(); g.translate(x, y); g.beginPath(); MARK[kind](g); if (fill) { g.fillStyle = fill; g.fill('evenodd'); } if (line) { g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } g.restore(); };
const topIcons = (g, face, fill, line) => { for (const [k, x] of [['menu', 30], ['bag', 286], ['chart', 334], ['hero', 382]]) { face(x, 30); g.fillStyle = fill; g.strokeStyle = line; g.lineWidth = k === 'menu' ? 2.4 : 1.5; g.lineCap = 'round'; G.ICON[k](g, x, 30.5, 1); } };

// ---------------------------------------------------------------- 1: boards lashed with rope
const S1 = { wood: '#ecbb7c', woodB: '#e2ab68', hi: '#f7d7a2', lo: '#c98f4c', seam: '#96592e', burnt: '#4a2a1a', rope: '#ead6a4', ropeLo: '#b3925a', cloth: '#fff6e0', stitch: '#c9b184', nail: '#5b4a52', sign: '#c98646', signB: '#bd7a3c' };
const planks = {
  name: 'Lashed planks', ink: { text: S1.burnt, dim: '#7a4f30', good: '#1f7a36', bad: '#b8221c', gold: '#7a3c00' }, rar: c => P.darken(c, 0.28),
  top(g) { topIcons(g, (x, y) => { shadow(g, () => disc(g, x, y, 19), 2); disc(g, x, y, 19); g.fillStyle = S1.rope; g.fill(); ol(g); disc(g, x, y, 15); g.fillStyle = S1.wood; g.fill(); ol(g, 1.3); }, S1.cloth, INK); },
  panel(g) { shadow(g, () => rr(g, F.x - 6, F.y, F.w + 12, F.h, 6), 4, 0.32); boards(g, F.x, F.y, F.w, F.h, 12, 'h', [S1.wood, S1.woodB, S1.wood, S1.hi], S1.seam, S1.lo, 7, { jag: 7, round: 3, nails: S1.nail });
    for (const x of [F.x + 3, F.x + F.w - 3]) { rope(g, x, F.y - 7, F.y + F.h + 7, 8, S1.rope, S1.ropeLo); for (const y of [F.y - 7, F.y + F.h + 7]) { disc(g, x, y, 6.5); g.fillStyle = S1.rope; g.fill(); ol(g, 1.4); disc(g, x, y, 2.4); g.fillStyle = S1.ropeLo; g.fill(); } } },
  title(g, t) { const w = 236, h = 40, x = CX - w / 2, y = F.y + 6 - h / 2; shadow(g, () => rr(g, x, y, w, h, 6), 3); boards(g, x, y, w, h, 1, 'h', [S1.sign], S1.seam, S1.signB, 3, { round: 6, nails: S1.nail, line: 1.6 }); txt(g, t, CX, F.y + 6, 19, '#fff6e0', 'center', { stroke: INK, strokeW: 3.5 }); },
  close(g, x, y) { shadow(g, () => disc(g, x, y, 15), 2); disc(g, x, y, 15); g.fillStyle = '#f0503c'; g.fill(); ol(g); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.lineCap = 'round'; G.ICON.close(g, x, y, 1); },
  patch(g, x, y, w, h) { shadow(g, () => rr(g, x - w / 2, y - h / 2, w, h, 6), 2, 0.22); rr(g, x - w / 2, y - h / 2, w, h, 6); g.fillStyle = S1.cloth; g.fill(); ol(g); g.save(); g.setLineDash([5, 4]); rr(g, x - w / 2 + 5, y - h / 2 + 5, w - 10, h - 10, 3); ol(g, 1.3, S1.stitch); g.restore(); },
  heroBox(g, x, y, w, h) { this.patch(g, x, y, w, h); }, card(g, x, y, w, h) { this.patch(g, x, y, w, h); },
  slot(g, x, y, s, rar, kind, chosen) { const q = s / 2; g.save(); rr(g, x - q, y - q, s, s, 7); g.fillStyle = rar ? S1.hi : '#d39a58'; g.fill(); g.clip(); g.fillStyle = rar ? '#e3b574' : S1.lo; g.fillRect(x - q, y - q, s, 5); g.restore();
    if (rar) { rr(g, x - q + 2.6, y - q + 2.6, s - 5.2, s - 5.2, 5); ol(g, 3, rar); } rr(g, x - q, y - q, s, s, 7); ol(g); if (!rar && kind) mark(g, kind, x, y + 1, '#b9783f', null); if (chosen) { rr(g, x - q - 3, y - q - 3, s + 6, s + 6, 9); ol(g, 3, INK); } },
  bar(g, x, y, w, part) { rr(g, x, y - 5, w, 10, 5); g.fillStyle = S1.seam; g.fill(); ol(g, 1.4); rr(g, x + 1.5, y - 3.5, (w - 3) * part, 7, 3.5); g.fillStyle = G.COL.xp; g.fill(); },
  button(g, x, y, w, h, t, go) { shadow(g, () => rr(g, x - w / 2, y - h / 2, w, h, 9), 2); g.save(); rr(g, x - w / 2, y - h / 2, w, h, 9); g.fillStyle = go ? '#ffd640' : S1.hi; g.fill(); g.clip(); g.fillStyle = go ? '#ffe680' : '#fbe3ba'; g.fillRect(x - w / 2, y - h / 2, w, h * 0.42); g.restore(); rr(g, x - w / 2, y - h / 2, w, h, 9); ol(g); txt(g, t, x, y, 15, S1.burnt); },
};

// ---------------------------------------------------------------- 2: parchment on a chart table
const S2 = { table: '#7b4a2b', tableB: '#6e4126', grain: '#56321c', paper: '#f9edc9', paperLo: '#efdcab', edge: '#d9c088', sepia: '#4a2f1c', red: '#e9423a', redLo: '#b92d2a', brass: '#f2b63a', brassHi: '#ffe07a', note: '#fffaec' };
const chart = {
  name: 'Chart table', ink: { text: S2.sepia, dim: '#87674a', good: '#237a37', bad: '#b92d2a', gold: '#8a4e00' }, rar: c => P.darken(c, 0.3),
  top(g) { topIcons(g, (x, y) => { shadow(g, () => disc(g, x, y, 19), 2); disc(g, x, y, 19); g.fillStyle = S2.paper; g.fill(); ol(g, 1.6, S2.sepia); disc(g, x, y, 15.5); ol(g, 0.9, S2.sepia); }, '#ffe2a0', S2.sepia); },
  panel(g) { shadow(g, () => rr(g, F.x, F.y, F.w, F.h, 12), 4, 0.32); g.save(); rr(g, F.x, F.y, F.w, F.h, 12); g.clip(); boards(g, F.x, F.y, F.w, F.h, 6, 'v', [S2.table, S2.tableB], S2.grain, S2.grain, 4, { line: 0 }); g.restore(); rr(g, F.x, F.y, F.w, F.h, 12); ol(g, 2);
    const r = P.rng(9), m = 11, x0 = F.x + m, y0 = F.y + m, x1 = F.x + F.w - m, y1 = F.y + F.h - m, pts = [], j = () => (r() - 0.5) * 2.6;      // the sheet: its edge a little uneven, one corner turned up
    for (let x = x0; x < x1; x += 38) pts.push([x, y0 + j()]); for (let y = y0; y < y1; y += 38) pts.push([x1 + j(), y]); pts.push([x1, y1 - 24], [x1 - 24, y1]); for (let x = x1 - 40; x > x0; x -= 38) pts.push([x, y1 + j()]); for (let y = y1; y > y0; y -= 38) pts.push([x0 + j(), y]);
    const sheet = () => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
    shadow(g, sheet, 2, 0.3); sheet(); g.fillStyle = S2.paper; g.fill(); g.save(); sheet(); g.clip(); sheet(); ol(g, 7, S2.edge);
    g.globalAlpha = 0.5; for (const [bx, by, rx, ry] of [[70, 300, 60, 30], [330, 520, 50, 36], [120, 760, 70, 24]]) { g.beginPath(); g.ellipse(bx, by, rx, ry, 0.3, 0, 7); g.fillStyle = S2.paperLo; g.fill(); }
    g.globalAlpha = 0.2; g.strokeStyle = S2.sepia; g.lineWidth = 1.4; const cx = 338, cy = 742; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? 16 : 28; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); g.stroke(); } disc(g, cx, cy, 20); g.stroke(); g.setLineDash([6, 5]); g.beginPath(); g.moveTo(40, 770); g.bezierCurveTo(110, 730, 190, 790, 300, 752); g.stroke(); g.restore();
    sheet(); ol(g, 1.6, S2.sepia); g.beginPath(); g.moveTo(x1, y1 - 24); g.lineTo(x1 - 24, y1 - 24); g.lineTo(x1 - 24, y1); g.closePath(); g.fillStyle = S2.edge; g.fill(); ol(g, 1.4, S2.sepia);
    for (const [tx, ty] of [[x0 + 9, y0 + 9], [x1 - 9, y0 + 9], [x0 + 9, y1 - 9]]) stud(g, tx, ty, 4.6, S2.brass, S2.brassHi); },
  title(g, t) { const w = 226, h = 36, x = CX - w / 2, y = F.y + 4 - h / 2; for (const s of [-1, 1]) { const ex = CX + s * w / 2; g.beginPath(); g.moveTo(ex - s * 16, y + 9); g.lineTo(ex + s * 20, y + 9); g.lineTo(ex + s * 11, y + 9 + h / 2); g.lineTo(ex + s * 20, y + 9 + h); g.lineTo(ex - s * 16, y + 9 + h); g.closePath(); g.fillStyle = S2.redLo; g.fill(); ol(g); }
    shadow(g, () => rr(g, x, y, w, h, 3), 3, 0.25); g.save(); rr(g, x, y, w, h, 3); g.fillStyle = S2.red; g.fill(); g.clip(); g.fillStyle = '#f2605a'; g.fillRect(x, y, w, 6); g.restore(); rr(g, x, y, w, h, 3); ol(g); txt(g, t, CX, F.y + 4, 19, '#fff6e0', 'center', { stroke: INK, strokeW: 3.5 }); },
  close(g, x, y) { const r = P.rng(2), blob = () => { g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, q = 15 + (r() - 0.5) * 3.4; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); }; g.lineJoin = 'round'; shadow(g, blob, 2); blob(); g.fillStyle = '#d6352f'; g.fill(); ol(g); disc(g, x, y, 10.5); ol(g, 1.2, '#a82420'); g.strokeStyle = '#fff6e0'; g.lineWidth = 3; g.lineCap = 'round'; G.ICON.close(g, x, y, 0.9); },
  heroBox(g, x, y, w, h) { rr(g, x - w / 2, y - h / 2, w, h, 4); g.fillStyle = S2.paperLo; g.fill(); ol(g, 1.8, S2.sepia); rr(g, x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8, 2); ol(g, 0.9, S2.sepia); g.save(); g.globalAlpha = 0.3; g.strokeStyle = S2.sepia; g.lineWidth = 1.2; for (const yy of [y + h / 2 - 40, y + h / 2 - 30]) { g.beginPath(); for (let xx = x - w / 2 + 12; xx < x + w / 2 - 12; xx += 16) { g.moveTo(xx, yy); g.quadraticCurveTo(xx + 4, yy - 4, xx + 8, yy); } g.stroke(); } g.restore(); },
  card(g, x, y, w, h) { shadow(g, () => rr(g, x - w / 2, y - h / 2, w, h, 3), 2, 0.25); rr(g, x - w / 2, y - h / 2, w, h, 3); g.fillStyle = S2.note; g.fill(); ol(g, 1.5, S2.sepia); stud(g, x, y - h / 2 + 2, 4.6, S2.brass, S2.brassHi); },
  slot(g, x, y, s, rar, kind, chosen) { const q = s / 2; rr(g, x - q, y - q, s, s, 4); g.fillStyle = rar ? P.mix(S2.paper, rar, 0.24) : '#f1dfb0'; g.fill(); if (rar) { rr(g, x - q + 2.4, y - q + 2.4, s - 4.8, s - 4.8, 3); ol(g, 2.8, rar); } rr(g, x - q, y - q, s, s, 4); ol(g, 1.7, S2.sepia); if (!rar) { rr(g, x - q + 3.5, y - q + 3.5, s - 7, s - 7, 2); g.save(); g.globalAlpha = 0.45; ol(g, 0.9, S2.sepia); g.restore(); }
    if (!rar && kind) { g.save(); g.globalAlpha = 0.5; mark(g, kind, x, y + 1, null, S2.sepia, 1.6); g.restore(); } if (chosen) { rr(g, x - q - 3, y - q - 3, s + 6, s + 6, 6); ol(g, 3, S2.sepia); } },
  bar(g, x, y, w, part) { rr(g, x, y - 5, w, 10, 3); g.fillStyle = S2.paperLo; g.fill(); rr(g, x + 1.5, y - 3.5, (w - 3) * part, 7, 2); g.fillStyle = '#5fc257'; g.fill(); rr(g, x, y - 5, w, 10, 3); ol(g, 1.5, S2.sepia); g.strokeStyle = S2.sepia; g.lineWidth = 1; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(x + w * i / 10, y - 5); g.lineTo(x + w * i / 10, y - 2); g.stroke(); } },
  button(g, x, y, w, h, t, go) { shadow(g, () => rr(g, x - w / 2, y - h / 2, w, h, 6), 2, 0.25); rr(g, x - w / 2, y - h / 2, w, h, 6); g.fillStyle = go ? '#ffd640' : S2.note; g.fill(); ol(g, 1.7, S2.sepia); rr(g, x - w / 2 + 3.5, y - h / 2 + 3.5, w - 7, h - 7, 3.5); ol(g, 0.9, S2.sepia); txt(g, t, x, y, 15, S2.sepia); },
};

// ---------------------------------------------------------------- 3: the inside of a treasure chest
const S3 = { wood: '#6b3f27', woodB: '#5e3621', grain: '#42241a', iron: '#4b4759', ironHi: '#77728a', gold: '#f6c23a', goldHi: '#ffe27a', goldLo: '#c4871c', velvet: '#45294e', velvetLo: '#2f1b38', velvetHi: '#5d3b68', cream: '#fff3d6', inset: '#43261a' };
const band = (g, x, y, w, h, studs) => { g.save(); rr(g, x, y, w, h, 2); g.fillStyle = S3.iron; g.fill(); g.clip(); g.fillStyle = S3.ironHi; if (w > h) g.fillRect(x, y, w, h * 0.3); else g.fillRect(x, y, w * 0.3, h); g.restore(); rr(g, x, y, w, h, 2); ol(g, 1.4); for (const [sx, sy] of studs) stud(g, sx, sy, 3.1, S3.gold, S3.goldHi); };
const plate = (g, x, y, w, h, r, col, hi, lo) => { g.save(); rr(g, x, y, w, h, r); g.fillStyle = col; g.fill(); g.clip(); g.fillStyle = hi; g.fillRect(x, y, w, h * 0.36); g.fillStyle = lo; g.fillRect(x, y + h * 0.84, w, h * 0.16); g.restore(); rr(g, x, y, w, h, r); ol(g); };
const chest = {
  name: 'Treasure chest', ink: { text: S3.cream, dim: '#dab892', good: '#93e283', bad: '#ff9482', gold: '#ffd95e' }, rar: c => P.lighten(c, 0.22),
  top(g) { topIcons(g, (x, y) => { shadow(g, () => disc(g, x, y, 19), 2); disc(g, x, y, 19); g.fillStyle = S3.gold; g.fill(); ol(g); g.save(); disc(g, x, y, 15.5); g.clip(); g.fillStyle = S3.wood; g.fillRect(x - 20, y - 20, 40, 40); g.restore(); disc(g, x, y, 15.5); ol(g, 1.3); }, S3.cream, INK); },
  panel(g) { shadow(g, () => rr(g, F.x, F.y, F.w, F.h, 10), 4, 0.36); g.save(); rr(g, F.x, F.y, F.w, F.h, 10); g.clip(); boards(g, F.x, F.y, F.w, F.h, 8, 'v', [S3.wood, S3.woodB], S3.grain, S3.grain, 6, { line: 0 }); g.restore(); rr(g, F.x, F.y, F.w, F.h, 10); ol(g, 2);
    const xs = []; for (let x = F.x + 46; x < F.x + F.w - 30; x += 46.7) xs.push(x); const ys = []; for (let y = F.y + 60; y < F.y + F.h - 40; y += 57) ys.push(y);
    band(g, F.x + 2, F.y + 2, 9, F.h - 4, ys.map(y => [F.x + 6.5, y])); band(g, F.x + F.w - 11, F.y + 2, 9, F.h - 4, ys.map(y => [F.x + F.w - 6.5, y])); band(g, F.x + 2, F.y + F.h - 11, F.w - 4, 9, xs.map(x => [x, F.y + F.h - 6.5])); band(g, F.x + 2, F.y + 2, F.w - 4, 9, xs.filter(x => x < CX - 124 || x > CX + 124).map(x => [x, F.y + 6.5]));
    band(g, F.x + 11, F.y + 318, F.w - 22, 7, []);
    for (const [cx, cy, sx, sy] of [[F.x, F.y, 1, 1], [F.x + F.w, F.y, -1, 1], [F.x, F.y + F.h, 1, -1], [F.x + F.w, F.y + F.h, -1, -1]]) { g.save(); rr(g, F.x, F.y, F.w, F.h, 10); g.clip(); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * 32, cy); g.lineTo(cx + sx * 32, cy + sy * 12); g.lineTo(cx + sx * 12, cy + sy * 12); g.lineTo(cx + sx * 12, cy + sy * 32); g.lineTo(cx, cy + sy * 32); g.closePath(); g.fillStyle = S3.gold; g.fill(); ol(g, 1.4); g.restore();
      stud(g, cx + sx * 6.5, cy + sy * 6.5, 2.6, S3.goldLo, S3.goldHi); stud(g, cx + sx * 24, cy + sy * 6, 2.2, S3.goldLo, S3.goldHi); stud(g, cx + sx * 6, cy + sy * 24, 2.2, S3.goldLo, S3.goldHi); }
    rr(g, F.x, F.y, F.w, F.h, 10); ol(g, 2); },
  title(g, t) { const w = 236, h = 40, x = CX - w / 2, y = F.y + 6 - h / 2, shape = () => { g.beginPath(); g.moveTo(x + 14, y); g.lineTo(x + w - 14, y); g.lineTo(x + w, y + h / 2); g.lineTo(x + w - 14, y + h); g.lineTo(x + 14, y + h); g.lineTo(x, y + h / 2); g.closePath(); };
    shadow(g, shape, 3); g.save(); shape(); g.fillStyle = S3.gold; g.fill(); g.clip(); g.fillStyle = S3.goldHi; g.fillRect(x, y, w, h * 0.34); g.fillStyle = S3.goldLo; g.fillRect(x, y + h * 0.84, w, h * 0.16); g.restore(); shape(); ol(g); stud(g, x + 17, y + h / 2, 3, S3.goldLo, S3.goldHi); stud(g, x + w - 17, y + h / 2, 3, S3.goldLo, S3.goldHi); txt(g, t, CX, F.y + 6.5, 19, '#3a2414'); },
  close(g, x, y) { shadow(g, () => disc(g, x, y, 16), 2); disc(g, x, y, 16); g.fillStyle = S3.gold; g.fill(); ol(g); g.save(); disc(g, x, y, 12); g.fillStyle = '#e0352f'; g.fill(); g.clip(); g.fillStyle = '#f26a5c'; g.beginPath(); g.moveTo(x - 12, y - 12); g.lineTo(x + 4, y - 12); g.lineTo(x - 12, y + 4); g.closePath(); g.fill(); g.restore(); disc(g, x, y, 12); ol(g, 1.3); g.strokeStyle = '#ffffff'; g.lineWidth = 2.8; g.lineCap = 'round'; G.ICON.close(g, x, y, 0.82); },
  lined(g, x, y, w, h, r, rim) { g.save(); rr(g, x, y, w, h, r); g.fillStyle = S3.velvet; g.fill(); g.clip(); g.fillStyle = S3.velvetLo; g.fillRect(x, y, w, 6); g.fillStyle = S3.velvetHi; g.fillRect(x, y + h - 4, w, 4); g.restore(); rr(g, x + 1.6, y + 1.6, w - 3.2, h - 3.2, r - 1); ol(g, 3, rim); rr(g, x, y, w, h, r); ol(g); rr(g, x + 3.4, y + 3.4, w - 6.8, h - 6.8, Math.max(1, r - 3)); ol(g, 1, INK); },
  heroBox(g, x, y, w, h) { this.lined(g, x - w / 2, y - h / 2, w, h, 8, S3.gold); g.save(); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(x, y + 22, 52, 66, 0, 0, 7); g.fillStyle = S3.velvetHi; g.fill(); g.restore(); },
  card(g, x, y, w, h) { rr(g, x - w / 2, y - h / 2, w, h, 8); g.fillStyle = S3.inset; g.fill(); rr(g, x - w / 2 + 1.6, y - h / 2 + 1.6, w - 3.2, h - 3.2, 7); ol(g, 2.4, S3.goldLo); rr(g, x - w / 2, y - h / 2, w, h, 8); ol(g); },
  slot(g, x, y, s, rar, kind, chosen) { const q = s / 2; if (rar) { g.save(); rr(g, x - q, y - q, s, s, 6); g.fillStyle = '#ecdcb4'; g.fill(); g.clip(); g.fillStyle = '#d6c294'; g.fillRect(x - q, y - q, s, 6); g.restore(); rr(g, x - q + 1.6, y - q + 1.6, s - 3.2, s - 3.2, 5); ol(g, 3, rar); rr(g, x - q, y - q, s, s, 6); ol(g); rr(g, x - q + 3.4, y - q + 3.4, s - 6.8, s - 6.8, 3); ol(g, 1, INK); } else this.lined(g, x - q, y - q, s, s, 6, S3.ironHi); if (!rar && kind) mark(g, kind, x, y + 1, S3.velvetHi, null); if (chosen) { rr(g, x - q - 3, y - q - 3, s + 6, s + 6, 8); ol(g, 3, S3.goldHi); rr(g, x - q - 4.6, y - q - 4.6, s + 9.2, s + 9.2, 9); ol(g, 1.2); } },
  bar(g, x, y, w, part) { rr(g, x, y - 5, w, 10, 5); g.fillStyle = S3.grain; g.fill(); ol(g, 1.4); rr(g, x + 1.5, y - 3.5, (w - 3) * part, 7, 3.5); g.fillStyle = G.COL.xp; g.fill(); rr(g, x, y - 5, w, 10, 5); ol(g, 1.6, S3.goldLo); },
  button(g, x, y, w, h, t, go) { shadow(g, () => rr(g, x - w / 2, y - h / 2, w, h, 8), 2); if (go) plate(g, x - w / 2, y - h / 2, w, h, 8, S3.gold, S3.goldHi, S3.goldLo); else plate(g, x - w / 2, y - h / 2, w, h, 8, S3.iron, S3.ironHi, '#34313f'); txt(g, t, x, y, 15, go ? '#3a2414' : S3.cream); },
};
const SKINS = { planks, chart, chest };

// ---------------------------------------------------------------- the window, laid out as the game lays it out
async function main() {
  const args = process.argv.slice(2), which = args[0] || 'planks', K = SKINS[which], out = args[1] && !args[1].startsWith('--') ? args[1] : path.join(R, 'concepts/wood', { planks: 1, chart: 2, chest: 3 }[which] + '.png'), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
  const A = await D.load(), icons = await D.atlas(path.join(R, 'out/gear'), 'gear-icons'), bg = await P.loadImage(path.join(R, 'work/wood/bg.png')), glass = await D.atlas(path.join(R, 'out/glass'), 'glass');
  const cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(bg, 0, 0, W, H);
  for (const [key, dx, rad] of [['charge', -84, 36], ['cleave', 0, 36], ['potion', 78, 28]]) { g.save(); g.translate(W / 2 + dx, H - 64 + (36 - rad)); g.scale(0.5 * rad * 2 / 76, 0.5 * rad * 2 / 76); D.pic(g, glass, 'skill/' + key); g.restore(); }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  K.top(g); txt(g, 'Lv 3', 62, 30, 16, '#ffffff', 'left', { stroke: INK, strokeW: 4 }); g.save(); g.translate(122, 30); g.scale(0.5, 0.5); D.pic(g, glass, 'mark/coin'); g.restore(); txt(g, '214', 134, 30, 16, '#ffffff', 'left', { stroke: INK, strokeW: 4 });
  K.panel(g); K.title(g, 'Hero'); K.close(g, F.x + F.w - 12, F.y + 10);
  const left = F.x + 22, right = F.x + F.w - 22, top = F.y + 82, I = K.ink;
  txt(g, 'Level 3 Warrior', left, F.y + 46, 16, I.text, 'left'); txt(g, '96 of 400 xp', CX + 20, F.y + 46, 13, I.dim); txt(g, '214 gold', right, F.y + 46, 15, I.gold, 'right'); K.bar(g, left, F.y + 66, F.w - 44, 0.24);
  K.heroBox(g, CX, top + 98, 150, 196); D.hero(g, A, { action: 'stand', facing: 's', i: 0, cutlass: 'sailor', buckler: 'plank', hat: 'bandana' }, CX, top + 168, 0.5 * 2.7);
  const icon = (key, x, y, size) => { const f = icons.j.frames['icon/' + key].frame, k = size * 0.74 / (f.w / 2); g.save(); g.translate(x, y); g.scale(0.5 * k, 0.5 * k); D.pic(g, icons, 'icon/' + key); g.restore(); };
  const worn = { hat: ['hat-bandana', 'common'], coat: ['coat-linen', 'common'], gloves: null, boots: null, weapon: ['cutlass-sailor', 'uncommon'], shield: ['buckler-plank', 'common'], ring: null, charm: null };
  [['hat', 'coat', 'gloves', 'boots'], ['weapon', 'shield', 'ring', 'charm']].forEach((col, c) => col.forEach((kind, i) => { const x = CX + (c ? 122 : -122), y = top + 23 + i * 50, it = worn[kind]; K.slot(g, x, y, 46, it ? G.RARITY[it[1]] : null, kind, false); if (it) icon(it[0], x, y, 46); }));
  ['Health 142 of 160', 'A swing 14 to 19', 'Armour 6', 'Crit 10%'].forEach((line, i) => txt(g, line, i % 2 === 0 ? left + 8 : CX + 22, top + 212 + Math.floor(i / 2) * 20, 14, I.text, 'left'));
  const gy = F.y + 336; txt(g, 'Bag 9 of 20', left, gy, 13, I.dim, 'left'); txt(g, 'Potions 3 of 10', right, gy, 13, I.dim, 'right');
  const bag = [['cutlass-corsair', 'rare', 1], ['buckler-iron', 'uncommon', 1], ['hat-tricorn', 'rare', 1], ['coat-sailor', 'uncommon', 1], ['buckler-brass', 'epic', 1], ['hat-feathered', 'epic', 1], ['cutlass-rusty', 'common', 0], ['coat-corsair', 'rare', 1], ['hat-bandana', 'common', 0]], size = 46, gap = 5, gx = CX - (7 * size + 6 * gap) / 2 + size / 2;
  for (let i = 0; i < 20; i++) { const x = gx + (i % 7) * (size + gap), y = gy + 20 + size / 2 + Math.floor(i / 7) * (size + gap), it = bag[i]; K.slot(g, x, y, size, it ? G.RARITY[it[1]] : null, null, i === 0); if (it) { icon(it[0], x, y, size); if (it[2]) { g.beginPath(); g.moveTo(x + 14, y - 20); g.lineTo(x + 20, y - 10); g.lineTo(x + 8, y - 10); g.closePath(); g.fillStyle = '#3fd45a'; g.fill(); ol(g, 1.3); } } }
  const cy = gy + 20 + 3 * (size + gap) + 4, ch = 124; K.card(g, CX, cy + ch / 2, F.w - 28, ch);
  K.slot(g, left + 36, cy + 36, 52, G.RARITY.rare, null, false); icon('cutlass-corsair', left + 36, cy + 36, 52);
  txt(g, "Corsair's cutlass", left + 76, cy + 18, 17, K.rar(G.RARITY.rare), 'left'); txt(g, 'In the bag · rare cutlass', left + 76, cy + 38, 13, I.dim, 'left'); txt(g, 'Damage 9 to 13', left + 76, cy + 58, 15, I.text, 'left');
  txt(g, "Against his Sailor's cutlass: +3 damage", left + 8, cy + 84, 13, I.good, 'left'); txt(g, 'Worth 42 gold at the stall', left + 8, cy + 106, 13, I.dim, 'left');
  const by = cy + ch + 26; K.button(g, CX - 57, by, 104, 40, 'Wear', true); K.button(g, CX + 57, by, 104, 40, 'Drop', false);
  P.save(cv, out); console.log('wrote', out);
  const close = opt('close'); if (close) { const [x, y, w, h] = [F.x - 12, F.y - 24, 250, 216], z = 3, c2 = P.createCanvas(w * z, h * z), g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = true; g2.imageSmoothingQuality = 'high'; g2.drawImage(cv, x * S, y * S, w * S, h * S, 0, 0, w * z, h * z); P.save(c2, close); console.log('wrote', close); }
}
main().catch(e => { console.error(e); process.exit(1); });
