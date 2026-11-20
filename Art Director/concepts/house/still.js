// still.js: the three concept stills of the new theme (Leonard, AD, 2026-11-20; every design and number is mine).
// Robin, 2026-11-20: "A shrunk person and enemies are insects", "inside a house", open world with biomes, and of the
// idea: "Does it really work well im 2D tho? Scale can be tricky." So the three show the SAME corner of the kitchen
// floor, where the tiles meet a rug, with the hero at three sizes. What differs is how small he is and so what tells
// the size: 1 the room (thumb: 5 cm), 2 the things on the floor (bean: 1.5 cm), 3 the floor itself (ant: 0.6 cm).
// The view is the game's: the floor is drawn tilted as the models are seen (a square tile is wider than tall), so a
// round coin and a square tile agree. The models come from build.py (work/house/<size>/), the hero's body and the
// glass from out/ as delivered. A table or a chair is only its legs and its shadow: the top of a leg fades out.
//   node concepts/house/still.js thumb|bean|ant|antbig [out.png] [--no-glass] [--close out-close.png]
const P = require('../../tools/paint.js'); const D = require('../../tools/dress.js'); const G = require('../../tools/glass.js'); const fs = require('fs'); const path = require('path');
const W = 412, H = 915, S = 2, T = 0.5736, UP = 0.8192, HX = 206, HY = 412, FONT = 'Trebuchet MS', R = P.ROOT;
const SH = '#5b4a82';
const C = { tileA: '#fbefcf', tileA2: '#f4e2b6', tileB: '#74d6d4', tileB2: '#5cc6cc', grout: '#d9c8a4', groutLo: '#bfae8a', navy: '#2b3f78', navyLo: '#22325f', red: '#e9423a', redLo: '#cf352f', yellow: '#ffd640', cream: '#fff3d6', creamLo: '#dcc79c', wood: '#d08a48' };

// ---------------------------------------------------------------- the floor
function tiles(g, k, ox, oy, shine) {      // ox, oy: where one tile's corner lies from his feet, in mm; a tile is 100 mm, the joint 3
  g.fillStyle = C.grout; g.fillRect(0, 0, W, H); g.save(); g.translate(HX, HY); g.scale(k, k * T);
  const x0 = -HX / k, x1 = (W - HX) / k, y0 = -HY / (k * T), y1 = (H - HY) / (k * T), TS = 100, gap = 3, r = P.rng(11), rad = 2.4;
  for (let j = Math.floor((y0 - oy) / TS); j <= Math.floor((y1 - oy) / TS); j++) for (let i = Math.floor((x0 - ox) / TS); i <= Math.floor((x1 - ox) / TS); i++) {
    const x = ox + i * TS + gap / 2, y = oy + j * TS + gap / 2, s = TS - gap, even = (((i + j) % 2) + 2) % 2 === 0, t = r();
    g.fillStyle = C.groutLo; g.beginPath(); P.rr(g, x, y + 1.0, s, s, rad); g.fill();                               // the joint's far side in shade: the tile stands a little above it
    g.fillStyle = P.mix(even ? C.tileA : C.tileB, even ? C.tileA2 : C.tileB2, t * 0.5); g.beginPath(); P.rr(g, x, y, s, s, rad); g.fill();
    if (shine) {                                                                                                     // the glaze: two slanted bars of light, flat
      g.save(); g.beginPath(); P.rr(g, x, y, s, s, rad); g.clip(); g.fillStyle = even ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.26)';
      const sx = x + 14 + r() * 30; for (const [dx, w] of [[0, 9], [14, 3.5]]) { g.beginPath(); g.moveTo(sx + dx, y + s); g.lineTo(sx + dx + w, y + s); g.lineTo(sx + dx + w + 44, y); g.lineTo(sx + dx + 44, y); g.closePath(); g.fill(); }
      g.restore();
    }
  }
  g.restore();
}
// the rug north of the tiles: its top with a border, its side, its fringe lying on the floor
function rug(g, k, edge, o = {}) {
  const th = o.th || 8, fr = o.fringe || 30, ye = HY + edge * k * T, hc = th * k * UP, yt = ye - hc, r = P.rng(5), x0 = -HX / k, x1 = (W - HX) / k;
  g.save(); g.beginPath(); g.rect(0, 0, W, yt); g.clip(); g.translate(HX, yt); g.scale(k, k * T); const far = -yt / (k * T) - 4;
  g.fillStyle = C.red; g.fillRect(x0, far, x1 - x0, -far);
  for (let x = Math.floor(x0 / 150) * 150 - 75; x < x1 + 150; x += 150) for (let y = -150; y > far - 150; y -= 150) for (const [dx, dy] of [[0, 0], [75, -75]]) {     // the field: diamonds
    g.fillStyle = C.redLo; g.beginPath(); g.moveTo(x + dx, y + dy - 52); g.lineTo(x + dx + 52, y + dy); g.lineTo(x + dx, y + dy + 52); g.lineTo(x + dx - 52, y + dy); g.closePath(); g.fill();
    g.fillStyle = dx ? C.yellow : C.cream; g.beginPath(); g.moveTo(x + dx, y + dy - 20); g.lineTo(x + dx + 20, y + dy); g.lineTo(x + dx, y + dy + 20); g.lineTo(x + dx - 20, y + dy); g.closePath(); g.fill();
  }
  g.fillStyle = C.yellow; g.fillRect(x0, -78, x1 - x0, 16); g.fillStyle = C.cream; g.fillRect(x0, -62, x1 - x0, 48);
  g.fillStyle = C.navy; for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) { g.beginPath(); g.moveTo(x, -14); g.lineTo(x + 23, -62); g.lineTo(x + 46, -14); g.closePath(); g.fill(); }
  g.fillStyle = C.navy; g.fillRect(x0, -14, x1 - x0, 14);
  g.restore();
  if (k >= 3) {                                                                                                      // the pile: rows of loops, each a light back over a dark gap
    const lp = 3.6 * k, lh = lp * T; g.save(); g.beginPath(); g.rect(0, 0, W, yt); g.clip(); g.lineCap = 'round';
    for (let j = 0, y = yt - lh * 0.5; y > -lh; y -= lh, j++) for (let x = -lp + (j % 2) * lp / 2 + (HX % lp); x < W + lp; x += lp) {
      g.strokeStyle = 'rgba(40,20,60,0.2)'; g.lineWidth = Math.max(1, lh * 0.16); g.beginPath(); g.ellipse(x, y + lh * 0.3, lp * 0.36, lh * 0.34, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = Math.max(1, lh * 0.2); g.beginPath(); g.ellipse(x, y + lh * 0.12, lp * 0.3, lh * 0.3, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    }
    g.restore();
  }
  // the side: the dark binding, sewn with slanted stitches
  g.fillStyle = C.navyLo; g.fillRect(0, yt, W, hc); g.fillStyle = 'rgba(20,10,40,0.35)'; g.fillRect(0, ye - Math.max(1.5, hc * 0.12), W, Math.max(1.5, hc * 0.12));
  if (hc > 12) { g.strokeStyle = '#4a61a4'; g.lineWidth = Math.max(1.5, k * 0.9); g.lineCap = 'round'; const st = 4.2 * k; for (let x = (HX % st) - st; x < W + st; x += st) { g.beginPath(); g.moveTo(x, yt + hc * 0.16); g.lineTo(x + st * 0.42, ye - hc * 0.2); g.stroke(); } }
  // the shadow the rug's edge lays on the tiles, then the fringe: tassels of three strands, a knot at the head of each
  g.fillStyle = P.alpha(SH, 0.26); g.fillRect(0, ye, W, Math.max(2, 2.2 * k * T));
  const sp = 9 * k, L = fr * k * T, wd = Math.max(1.6, 1.9 * k);
  const strand = (x, bend, len, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, ye + wd * 0.3); g.quadraticCurveTo(x + bend * 0.2, ye + len * 0.55, x + bend, ye + len); g.stroke(); };
  for (let x = (HX % sp) - sp; x < W + sp; x += sp) {
    const tas = []; for (let i = 0; i < 3; i++) tas.push([x + (i - 1) * wd * 0.95, (r() - 0.5) * sp * 0.9 + (i - 1) * wd * 0.7, L * (0.8 + r() * 0.3)]);
    for (const [sx, b, len] of tas) { g.save(); g.translate(wd * 0.35, wd * 0.3); strand(sx, b, len, P.alpha(SH, 0.3), wd); g.restore(); }
    for (const [sx, b, len] of tas) { strand(sx, b, len, C.creamLo, wd); strand(sx - wd * 0.12, b, len - wd * 0.2, C.cream, wd * 0.62);
      if (k >= 3) { g.strokeStyle = C.creamLo; g.lineWidth = Math.max(1, wd * 0.14); for (let t = 0.14; t < 0.95; t += 2.2 * wd / len * 0.5) { const px = sx + b * t * t * 0.8 + b * 0.2 * t, py = ye + len * t; g.beginPath(); g.moveTo(px - wd * 0.3, py - wd * 0.22); g.lineTo(px + wd * 0.26, py + wd * 0.22); g.stroke(); } } }
    g.fillStyle = C.creamLo; g.beginPath(); g.ellipse(x, ye + wd * 0.5, wd * 1.5, wd * 0.8, 0, 0, 7); g.fill(); g.fillStyle = C.cream; g.beginPath(); g.ellipse(x - wd * 0.15, ye + wd * 0.36, wd * 1.2, wd * 0.52, 0, 0, 7); g.fill();
  }
  return { ye, yt };
}
// what a table or a chair throws on the floor: an ellipse [cx, cy, rx, ry] for a round table, or an outline with round corners [[x, y]...], rad
const shade = (g, s, a = 0.2) => { g.fillStyle = P.alpha(SH, a); g.beginPath(); if (s.e) g.ellipse(s.e[0], s.e[1], s.e[2], s.e[3], 0, 0, 7); else { const p = s.pts, n = p.length; g.moveTo((p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2); for (let i = 1; i <= n; i++) g.arcTo(p[i % n][0], p[i % n][1], p[(i + 1) % n][0], p[(i + 1) % n][1], s.rad); g.closePath(); } g.fill(); };
// small things painted straight onto the floor: too small for a model at this size
const dot = (g, x, y, r, col, lo) => { g.fillStyle = P.alpha(SH, 0.25); g.beginPath(); g.ellipse(x + r * 0.3, y + r * 0.5, r * 1.1, r * 0.6, 0, 0, 7); g.fill(); g.fillStyle = lo; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.ellipse(x - r * 0.12, y - r * 0.2, r * 0.8, r * 0.58, 0, 0, 7); g.fill(); };
const tinyAnt = (g, x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = '#3b3768'; g.lineWidth = 0.8; for (const d of [-2, 0, 2]) { g.beginPath(); g.moveTo(d, -2.6); g.lineTo(d, 2.6); g.stroke(); } g.fillStyle = '#3b3768'; for (const [d, rr] of [[-3, 1.7], [0, 1.2], [3.2, 2]]) { g.beginPath(); g.ellipse(d, 0, rr, rr * 0.8, 0, 0, 7); g.fill(); } g.restore(); };
const grain = (g, x, y, s, r) => { g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 1.2); g.fillStyle = P.alpha(SH, 0.22); g.fillRect(-s / 2 + 1.5, -s * 0.3 + 2, s, s * 0.62); g.fillStyle = '#dfeaf2'; g.fillRect(-s / 2, -s * 0.3, s, s * 0.62); g.fillStyle = '#ffffff'; g.fillRect(-s / 2, -s * 0.3, s, s * 0.34); g.restore(); };

// ---------------------------------------------------------------- the three stills: where everything stands, in screen units; his feet are at 206, 412
const STILLS = {
  thumb: { k: 1.08, name: 'Cockroach', lv: 'Lv 2', gear: { blade: 'needle', shield: 'coin', hat: 'thimble' },
    floor(g, k) { tiles(g, k, -42, 34, false); rug(g, k, -424, { fringe: 36 }); },
    shades: [{ e: [-230, 250, 486, 279] }, { pts: [[318, 506], [520, 530], [500, 790], [296, 770]], rad: 30 }],
    paint(g, r) { for (const [x, y] of [[176, 690], [188, 664], [204, 702], [70, 742], [150, 726]]) dot(g, x, y, 3.2, '#b97a45', '#8a5a34');                 // dry food spilt by the bowl
      for (const [x, y, s] of [[128, 506, 2.4], [60, 530, 1.8], [140, 380, 2], [30, 340, 2.6], [96, 300, 1.6], [236, 474, 1.8], [270, 300, 2.2], [352, 372, 1.6], [226, 596, 2]]) dot(g, x, y, s, '#e9bd7a', '#cf9a55');   // crumbs under the table
      for (let i = 0; i < 9; i++) tinyAnt(g, 14 + i * 15.5 + (r() - 0.5) * 4, 596 - i * 9 + Math.sin(i * 1.3) * 5, -0.52 + (r() - 0.5) * 0.4); },             // a trail of ants to a crumb: here an ant is no bigger than his foot
    things: [['table-leg', 98, 432, { cut: 50, fade: 44 }], ['chair-leg', 348, 532, { cut: 32, fade: 36 }], ['chair-leg', 330, 748, { cut: 32, fade: 36 }], ['bowl', 94, 676], ['pencil', 300, 286, { flat: 1 }], ['coin', 252, 548, { flat: 1 }], ['brick', 62, 250], ['marble', 178, 524], ['dice', 236, 248],
      ['loop', 240, 634, { flat: 1 }], ['loop', 262, 648, { flat: 1 }], ['pea', 318, 356], ['pea', 306, 366], ['crumb-a', 154, 602], ['crumb-b', 36, 474], ['macaroni', 44, 392, { flat: 1 }], ['cap', 378, 322, { flat: 1 }], ['button', 150, 206, { flat: 1 }]],
    bugs: [['roach-ne', 268, 436, { flip: 1, bar: [26, 0.45, 0.62], fought: 1 }], ['roach-e', 236, 700, { flip: 1, bar: [26, 0.7, 0] }], ['spider-se', 340, 216, { flip: 1 }]],
    drop: [276, 344], hit: '14' },
  bean: { k: 3.6, name: 'Ant', lv: 'Lv 2', gear: { blade: 'pin', shield: 'button' },
    floor(g, k) { tiles(g, k, -17, 70, true); rug(g, k, -118, { fringe: 30 }); },
    shades: [{ pts: [[-200, -200], [146, -200], [172, 702], [-200, 724]], rad: 70 }],
    paint(g, r) { for (const [x, y, s] of [[236, 508, 5], [330, 470, 3.6], [190, 640, 4.4], [372, 600, 3], [220, 300, 3.4], [300, 392, 2.6], [128, 560, 3.2]]) dot(g, x, y, s, '#e9bd7a', '#cf9a55'); },
    things: [['chair-leg', 52, 640, { cut: 86, fade: 60 }], ['coin', 318, 552, { flat: 1 }], ['brick', 126, 306], ['marble', 364, 330], ['dice', 76, 748], ['pencil', 296, 734, { flat: 1 }], ['loop', 232, 628, { flat: 1 }], ['pea', 176, 520], ['pea', 344, 436],
      ['crumb-a', 150, 258], ['crumb-b', 286, 276], ['crumb-c', 252, 470], ['button', 384, 692, { flat: 1 }]],
    bugs: [['ant-ne', 274, 438, { flip: 1, bar: [34, 0.45, 0.62], fought: 1 }], ['ant-e', 168, 596, { bar: [34, 0.7, 0] }], ['ant-se', 262, 240], ['ladybird-se', 318, 640, { flip: 1 }]],
    drop: [146, 404], hit: '14' },
  ant: { k: 9, name: 'Ant', lv: 'Lv 2', gear: { blade: 'splinter', shield: 'lentil' },
    floor(g, k) { tiles(g, k, -86.5, 16, true); rug(g, k, -51, { fringe: 22 }); },
    shades: [{ pts: [[-300, -300], [176, -300], [204, 800], [-300, 830]], rad: 120 }],
    paint(g, r) { for (let i = 0; i < 15; i++) grain(g, 214 + r() * 190, 268 + r() * 250 + (i % 3) * 90, 5 + r() * 3.5, r); for (let i = 0; i < 5; i++) grain(g, 20 + r() * 150, 300 + r() * 120, 5 + r() * 3, r); },   // grains of sugar
    things: [['chair-leg', -62, 660, { cut: 194, fade: 70, wood: 1 }], ['coin', 372, 676, { flat: 1 }], ['crumb-a', 118, 346], ['crumb-b', 318, 330], ['crumb-c', 236, 560], ['pea', 348, 510], ['loop', 150, 250, { flat: 1 }]],
    bugs: [['ant-ne', 288, 448, { flip: 1, bar: [52, 0.45, 0.62], fought: 1 }], ['ant-e', 100, 470, { bar: [52, 0.7, 0] }], ['ant-se', 300, 236], ['ladybird-se', 158, 640, { flip: 1 }]],
    drop: [226, 330], hit: '14' },
};

// the same size again, when something bigger than a ladybird comes: a cockroach is longer than the screen is wide
STILLS.antbig = Object.assign({}, STILLS.ant, { from: 'ant',
  things: [['chair-leg', -62, 660, { cut: 194, fade: 70, wood: 1 }], ['coin', 344, 300, { flat: 1 }], ['crumb-a', 118, 346], ['crumb-c', 236, 560], ['loop', 150, 250, { flat: 1 }]],
  bugs: [['ant-ne', 288, 448, { flip: 1, bar: [52, 0.45, 0.62], fought: 1 }], ['ant-e', 100, 470, { bar: [52, 0.7, 0] }], ['ladybird-se', 158, 640, { flip: 1 }], ['roach-e', 456, 644, { flip: 1 }]],
  drop: [196, 540] });

async function main() {
  const args = process.argv.slice(2), size = args[0] || 'bean', out = args[1] && !args[1].startsWith('--') ? args[1] : path.join(R, 'concepts/house', { thumb: 1, bean: 2, ant: 3, antbig: '3-big' }[size] + '.png'), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
  const Z = STILLS[size], k = Z.k, r = P.rng(3);
  const load = async dir => { const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')), o = {}; for (const it of m.items) o[it.name] = { im: await P.loadImage(path.join(dir, it.file)), o: it.origin }; return o; };
  const M = await load(path.join(R, 'work/house', Z.from || size)), GEAR = await load(path.join(R, 'work/house/gear')), A = await D.load(), glass = await D.atlas(path.join(R, 'out/glass'), 'glass'), loot = await D.atlas(path.join(R, 'out/loot'), 'loot');
  const cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  Z.floor(g, k); for (const s of Z.shades) shade(g, s); Z.paint(g, r);
  // everything that stands, sorted by where it meets the floor
  const shadow = (x, y, rx, ry, dy = 1) => { g.save(); g.globalAlpha = 0.24; g.fillStyle = SH; g.beginPath(); g.ellipse(x + rx * 0.12, y + dy, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
  const sprite = (m, x, y, o = {}) => { let im = m.im;
    if (o.fade || o.wood) {   // a leg: its top is cut away (cut) and fades out below that (fade), so no seat or table top hides the floor
      const t = P.createCanvas(im.width, im.height), q = t.getContext('2d'); q.drawImage(im, 0, 0);
      if (o.wood) { q.globalCompositeOperation = 'source-atop'; q.strokeStyle = 'rgba(120,62,24,0.22)'; q.lineWidth = 4; q.lineCap = 'round'; const rr = P.rng(9); for (let i = 0; i < 30; i++) { const gx = 20 + rr() * (im.width - 40), y0 = rr() * im.height * 0.85, len = 140 + rr() * 320; q.beginPath(); q.moveTo(gx, y0); q.bezierCurveTo(gx + 4, y0 + len * 0.3, gx - 4, y0 + len * 0.7, gx + 1, y0 + len); q.stroke(); } }
      if (o.fade) { q.globalCompositeOperation = 'destination-out'; const c = (o.cut || 12) * S, f = o.fade * S, gr = q.createLinearGradient(0, 0, 0, c + f); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(c / (c + f), 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(0, 0, im.width, c + f); }
      im = t; }
    g.save(); g.translate(x, y); g.scale(o.flip ? -0.5 : 0.5, 0.5); g.drawImage(im, -m.o[0], -m.o[1]); g.restore(); };
  // a thing that lies flat throws its own outline as a shadow, a little down and to the right
  const flatShadow = (m, x, y, o) => { if (!m.sil) { const t = P.createCanvas(m.im.width, m.im.height), q = t.getContext('2d'); q.drawImage(m.im, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = SH; q.fillRect(0, 0, t.width, t.height); m.sil = t; }
    g.save(); g.globalAlpha = 0.24; g.translate(x + 2 + k * 0.25, y + 3 + k * 0.35); g.scale(o.flip ? -0.5 : 0.5, 0.5); g.drawImage(m.sil, -m.o[0], -m.o[1]); g.restore(); };
  const things = [];
  for (const [name, x, y, o = {}] of Z.things) { const m = M[name]; if (!m) throw new Error('no model ' + name); const hw = m.im.width / 4;
    things.push({ y, shadow: () => o.flat ? flatShadow(m, x, y, o) : shadow(x, y, hw * 0.8, hw * 0.34), draw: () => sprite(m, x, y, o) }); }
  for (const [name, x, y, o = {}] of Z.bugs) { const m = M[name]; if (!m) throw new Error('no model ' + name); const hw = m.im.width / 4; things.push({ y, shadow: () => shadow(x, y, hw * 0.5, hw * 0.2), draw: () => sprite(m, x, y, o) }); }
  const heroDraw = () => { const fc = 'se', F = D.frameOf(A.hero, 'stand', fc, 0), pts = F.points || {}, q = Z.gear;
    const pc = (pt, it) => { if (!pt || !it) return; g.save(); g.translate(pt.x, pt.y); g.rotate(pt.r * Math.PI / 180); g.drawImage(it.im, -it.o[0], -it.o[1]); g.restore(); };
    const parts = [[pts.off, q.shield && GEAR[`shield-${q.shield}-${fc}`]], [pts.hand, q.blade && GEAR['blade-' + q.blade]], [pts.head, q.hat && GEAR[`${q.hat}-${fc}`]]];
    g.save(); g.translate(HX, HY); g.scale(0.5, 0.5); for (const [pt, it] of parts) if (pt && !pt.front) pc(pt, it); D.pic(g, A.hero, F.name); for (const [pt, it] of parts) if (pt && pt.front) pc(pt, it); g.restore(); };
  things.push({ y: HY, shadow: () => shadow(HX, HY, 15, 6), draw: heroDraw });
  const fr = key => glass.j.frames[key].frame, it = key => glass.j.items[key];
  const piece = (key, x, y, kk = 1) => { g.save(); g.translate(x, y); g.scale(0.5 * kk, 0.5 * kk); D.pic(g, glass, key); g.restore(); };
  const fought = Z.bugs.find(b => b[3] && b[3].fought); if (fought) piece('mark/target', fought[1], fought[2] + 2);
  if (Z.drop) { const [x, y] = Z.drop; g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, loot, 'ring/rare'); g.restore(); things.push({ y, shadow: () => shadow(x, y, 8, 3), draw: () => { g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, loot, 'gear'); g.restore(); } }); }
  things.sort((a, b) => a.y - b.y); for (const t of things) t.shadow(); for (const t of things) t.draw();
  // the glass, as the game has it today (tools/scene.js --pile bare): his bar over his head, a bar over a hurt monster, the plate, the discs
  const pill = (key, x, y, w, kk = 1) => { const f = fr(key), [l, , rr] = it(key).slice, pw = Math.round(w / kk * 2); if (pw < l + rr) return; const t = P.createCanvas(pw, f.h), q = t.getContext('2d');
    q.drawImage(glass.im, f.x, f.y, l, f.h, 0, 0, l, f.h); q.drawImage(glass.im, f.x + l, f.y, f.w - l - rr, f.h, l, 0, pw - l - rr, f.h); q.drawImage(glass.im, f.x + f.w - rr, f.y, rr, f.h, pw - rr, 0, rr, f.h); g.drawImage(t, x, y - f.h / 4 * kk, w, f.h / 2 * kk); };
  const txt = (t, x, y, s, c, o = {}) => P.label(g, t, x, y, s, c, { font: FONT, ...o }), white = (t, x, y, s, o = {}) => txt(t, x, y, s, '#ffffff', { stroke: G.INK, strokeW: s > 13 ? 4 : 3, ...o });
  const bar = (kind, x, y, w, part, kk = 1) => { pill('bar/well', x, y, w, kk); const full = w - 6 * kk; if (part > 0) pill('fill/' + kind, x + 3 * kk, y - kk, Math.max(10 * kk, full * part), kk); };
  const mobBar = (x, y, w, part, lost, f) => { const kk = f ? 1.2 : 1, key = f ? 'mob/well-mine' : 'mob/well', inset = it(key).inset * kk, full = w * kk, x0 = x - full / 2; pill(key, x0 - inset, y, full + inset * 2, kk); if (lost > part) pill('mob/lost', x0, y, full * lost, kk); if (part > 0) pill('mob/hp', x0, y, Math.max(5 * kk, full * part), kk); };
  const flat = (key, x, y, w, h) => { const f = fr(key); g.drawImage(glass.im, f.x + 1, f.y, f.w - 2, f.h, x, y, w, h); };
  const ownBar = (x, y, w, hp, rage) => { const rm = it('own/frame').rooms, x0 = x - w / 2, y0 = y - fr('own/frame').h / 4, full = w - 2 * rm.hp.x; pill('own/back', x0, y, w); flat('own/hp', x0 + rm.hp.x, y0 + rm.hp.y, full * hp, rm.hp.h); flat('own/rage', x0 + rm.rage.x, y0 + rm.rage.y, full * rage, rm.rage.h); pill('own/frame', x0, y, w); };
  if (!args.includes('--no-glass')) {
    for (const [, x, y, o = {}] of Z.bugs) if (o.bar) { const by = y - o.bar[0] - 14; mobBar(x, by, 44, o.bar[1], o.bar[2], !!o.fought); if (o.fought && Z.hit) white(Z.hit, x + 44, by - 16, 20, { align: 'center' }); }
    const h0 = D.frameOf(A.hero, 'stand', 's', 0).origin, heroTop = (h0.y !== undefined ? h0.y : h0[1]) / 2; ownBar(HX, Math.round(HY - heroTop - 13 - (Z.gear.hat ? 6 : 0)), it('own/frame').length, 0.76, 0.84);
    piece('button/menu', 30, 30); white('Lv 2', 62, 30, 16); piece('mark/coin', 122, 30); white('86', 134, 30, 16); piece('button/bag', 286, 30); piece('button/chart', 334, 30); piece('button/hero', 382, 30);
    const ROW_Y = H - 64, BAR_W = 200, BAR_X = (W - BAR_W) / 2; bar('xp', BAR_X, H - 14, BAR_W, 0.38, 0.72);
    for (const [key, dx, rr] of [['charge', -84, 36], ['cleave', 0, 36], ['potion', 78, 28]]) { const x = W / 2 + dx, y = ROW_Y + (36 - rr); piece('skill/' + key, x, y, rr * 2 / 76); if (key === 'potion') white('3', x + rr * 0.55, y + rr * 0.6, 13, { align: 'center' }); }
    pill('plate', BAR_X, ROW_Y - 62, BAR_W); txt(Z.name, W / 2 - 84, ROW_Y - 67, 14, G.INK); txt(Z.lv, W / 2 + 84, ROW_Y - 67, 12, '#7a6a80', { align: 'right' });
  }
  P.save(cv, out); console.log('wrote', out);
  const close = opt('close'); if (close) { const [x, y, w, h] = [HX - 66, HY - 104, 216, 168], z = 3, c2 = P.createCanvas(w * z, h * z), g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = true; g2.imageSmoothingQuality = 'high'; g2.drawImage(cv, x * S, y * S, w * S, h * S, 0, 0, w * z, h * z); P.save(c2, close); console.log('wrote', close); }
}
main();
