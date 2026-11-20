// world.js: the house's first world, a corner of the kitchen (Leonard, AD, 2026-11-20; the layout and every look are mine).
// A CONCEPT: Robin left the house the same day ("I think i like pirate more. Lets expand on pirate"). Kept as the worked
// example of a world made as a kit; its files are in concepts/house/kitchen.
// Robin, 2026-11-20: an open world of biomes, a shrunk person in a house, "Go for 2": he is bean size, 1.5 cm, so a
// centimetre of floor is 36 design units across. The floor is drawn tilted as the models are seen, so a centimetre is
// 20.7 units in depth and a 10 cm tile is 360 by 207.
// The world is far too big to paint as one picture (4320 by 5796 units). So the floor is a KIT, and this file is both
// the painter and the cutter:
//   three floors that repeat (tiles in the sun, the same tiles in the table's shadow, the rug's field),
//   flat pieces laid on them (the rug's borders and fringe, the round corners of the shadow, a chair's shadow, the walls),
//   and world.json: where each fill and each piece goes, the biomes, what stands where, what is in the way, home, the zones.
// The reference drawer at the bottom draws the world from those files alone, the way the game should: if its pictures are
// right, the data is right.
//   node tools/world.js kit              paint and cut: work/world/ (floor-*.png, pieces/, world.json)
//   node tools/world.js deliver          the kit and the packed things into concepts/house/kitchen (then python tools/shrink.py concepts/house/kitchen)
//   node tools/world.js check            the kit drawn from its pieces against the floor painted whole
//   node tools/world.js walk             can he reach the chest, the stall and every zone from where he wakes?
//   node tools/world.js map [out.jpg]    the whole world at a quarter size, with the names on it
//   node tools/world.js screen x y [out.png] [--no-glass] [--bugs name,x,y,flip;...] [--gear pin,button,thimble] [--plain]
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const R = P.ROOT, S = 2, SH = '#5b4a82', OUT = path.join(R, 'work/world'), DELIVERED = path.join(R, 'concepts/house/kitchen'), KITDIR = () => fs.existsSync(path.join(DELIVERED, 'world.json')) ? DELIVERED : OUT;
const TW = 360, TH = 207, MX = 3.6, MY = 2.07, CM = 36, CMY = 20.7;   // a tile; units a millimetre across and in depth; units a centimetre
const W = 12 * TW, H = 28 * TH;                                        // 4320 by 5796: 1.2 m across, 2.8 m deep
const FLOOR = [180, 290, 3960, 5386];                                  // where he can walk at all: inside the skirting boards
const DUSK = [400, 560, 3500, 2070], DUSK_RAD = 72;                    // the shadow of the table and its two chairs: every leg stands in it
const RUG = { x: 1296, y: 3060, w: 2304, h: 1538, th: 18, bx: 252, by: 145, fringe: 62, sp: 36, cell: [540, 312], tooth: 104 };   // its top as drawn; it lies th lower on the floor
const CHAIRS = [{ legs: [[520, 1223], [1816, 1223], [520, 1967], [1816, 1967]] }, { legs: [[2444, 1095], [3740, 1095], [2444, 1839], [3740, 1839]] }];
const TABLE_LEGS = [[960, 720], [3340, 720], [960, 2470], [3340, 2470]];
const C = { tileA: '#fbefcf', tileA2: '#f4e2b6', tileB: '#74d6d4', tileB2: '#5cc6cc', grout: '#d9c8a4', groutLo: '#bfae8a', navy: '#2b3f78', navyLo: '#22325f', red: '#e9423a', redLo: '#cf352f', yellow: '#ffd640', cream: '#fff3d6', creamLo: '#dcc79c',
  wall: '#b9b2ea', wallLo: '#a69ee0', skirt: '#f6ebdf', skirtHi: '#fff8ec', skirtTop: '#fffdf6', skirtLo: '#cdbfd2', skirtDeep: '#b3a3c2' };
const LIT = { a: C.tileA, a2: C.tileA2, b: C.tileB, b2: C.tileB2, grout: C.grout, groutLo: C.groutLo, shA: 0.5, shB: 0.26 };
const DIM = { a: '#b2a4e2', a2: '#a596d8', b: '#4c8fd0', b2: '#4381c4', grout: '#8377b8', groutLo: '#6c60a2', shA: 0.17, shB: 0.12 };   // the same tiles under the table: cool and deep, still colour

// ---------------------------------------------------------------- the painters; g is in world units, b = [x, y, w, h] is the part wanted
function tiles(g, b, pal) {
  g.fillStyle = pal.grout; g.fillRect(b[0], b[1], b[2], b[3]);
  for (let j = Math.floor(b[1] / TH); j * TH < b[1] + b[3]; j++) for (let i = Math.floor(b[0] / TW); i * TW < b[0] + b[2]; i++) {
    const even = (((i + j) % 2) + 2) % 2 === 0, v = (((i % 2) + 2) % 2) * 2 + (((j % 2) + 2) % 2), t = [0.15, 0.8, 0.55, 0.3][v], sx = [20, 36, 28, 15][v], gap = 3, s = 100 - gap, x = gap / 2, y = gap / 2, rad = 2.4;
    g.save(); g.translate(i * TW, j * TH); g.scale(MX, MY);
    g.fillStyle = pal.groutLo; g.beginPath(); P.rr(g, x, y + 1, s, s, rad); g.fill();                                 // the joint's far side in shade: the tile stands a little above it
    g.fillStyle = P.mix(even ? pal.a : pal.b, even ? pal.a2 : pal.b2, t * 0.5); g.beginPath(); P.rr(g, x, y, s, s, rad); g.fill();
    g.beginPath(); P.rr(g, x, y, s, s, rad); g.clip(); g.fillStyle = `rgba(255,255,255,${even ? pal.shA : pal.shB})`;   // the glaze: two slanted bars of light, flat
    for (const [dx, w] of [[0, 9], [14, 3.5]]) { g.beginPath(); g.moveTo(x + sx + dx, y + s); g.lineTo(x + sx + dx + w, y + s); g.lineTo(x + sx + dx + w + 44, y); g.lineTo(x + sx + dx + 44, y); g.closePath(); g.fill(); }
    g.restore();
  }
}
const round = (g, [x, y, w, h], r) => { g.beginPath(); P.rr(g, x, y, w, h, r); };
function dusk(g, b) { g.save(); round(g, DUSK, DUSK_RAD); g.clip(); tiles(g, b, DIM); g.restore(); }
// the rug's top: the field of diamonds, three bands round it, the pile as rows of loops
function rugTop(g, b) {
  const { x: X, y: Y, w: rw, h: rh, bx, by } = RUG, cx = X + rw / 2, cy = Y + rh / 2;
  g.save(); g.beginPath(); g.rect(X, Y, rw, rh); g.clip(); g.fillStyle = C.red; g.fillRect(X, Y, rw, rh);
  const dia = (x, y, a, c, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - c); g.lineTo(x + a, y); g.lineTo(x, y + c); g.lineTo(x - a, y); g.closePath(); g.fill(); };
  for (let i = -3; i <= 3; i++) for (let j = -4; j <= 4; j++) for (const [dx, dy, col] of [[0, 0, C.cream], [270, 156, C.yellow]]) { const x = cx + i * 540 + dx, y = cy + j * 312 + dy; dia(x, y, 187, 107, C.redLo); dia(x, y, 72, 41, col); }
  const band = (ax, ay, zx, zy, col) => { g.fillStyle = col; g.beginPath(); g.rect(X + ax, Y + ay, rw - 2 * ax, rh - 2 * ay); g.rect(X + zx, Y + zy, rw - 2 * zx, rh - 2 * zy); g.fill('evenodd'); };
  band(0, 0, 44, 25, C.navy); band(44, 25, 202, 116, C.cream); band(202, 116, bx, by, C.yellow);
  g.fillStyle = C.navy;                                                                                              // the teeth: navy triangles on the cream band, their points to the field
  for (let x = X + bx; x < X + rw - bx - 1; x += 180) for (const [y0, y1] of [[Y + rh - 25, Y + rh - 116], [Y + 25, Y + 116]]) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 90, y1); g.lineTo(x + 180, y0); g.closePath(); g.fill(); }
  const ph = RUG.tooth; for (let y = Y + by; y < Y + rh - by - 1; y += ph) for (const [x0, x1] of [[X + 44, X + 202], [X + rw - 44, X + rw - 202]]) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y + ph / 2); g.lineTo(x0, y + ph); g.closePath(); g.fill(); }
  for (const ex of [0, 1]) for (const ey of [0, 1]) dia(ex ? X + rw - 123 : X + 123, ey ? Y + rh - 70.5 : Y + 70.5, 54, 31, C.navy);
  const lp = 360 / 28, lh = RUG.tooth / 14; g.lineCap = 'round';                                                           // the pile: each loop a light back over a dark gap
  const j0 = Math.max(0, Math.floor((b[1] - Y) / lh) - 1), j1 = Math.min(Math.round(rh / lh), Math.ceil((b[1] + b[3] - Y) / lh) + 1), i0 = Math.floor((b[0] - X) / lp) - 1, i1 = Math.ceil((b[0] + b[2] - X) / lp) + 1;
  for (let j = j0; j < j1; j++) for (let i = i0; i <= i1; i++) { const x = X + i * lp + (j % 2) * lp / 2, y = Y + (j + 0.5) * lh;
    g.strokeStyle = 'rgba(40,20,60,0.2)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y + lh * 0.3, lp * 0.36, lh * 0.34, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y + lh * 0.12, lp * 0.3, lh * 0.3, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  g.restore();
}
// a fringe: tassels of three strands lying on the floor, a knot at the head of each. Each stays in its own 36 units, so a
// strip of ten repeats; the last seven mirror the first seven, so the east corner is the west corner flipped.
function fringe(g, south) {
  const { x: X, y: Y, w: rw, h: rh, th, sp } = RUG, ye = south ? Y + rh + th : Y, d = south ? 1 : -1, n = rw / sp, wd = 6.6, L = RUG.fringe;
  const strand = (x0, bend, len, col, lw, ox = 0, oy = 0) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + ox, ye + d * wd * 0.3 + oy); g.quadraticCurveTo(x0 + bend * 0.2 + ox, ye + d * len * 0.55 + oy, x0 + bend + ox, ye + d * len + oy); g.stroke(); };
  for (let i = 0; i < n; i++) {
    const mir = i >= n - 7, key = i < 7 ? i : mir ? n - 1 - i : 7 + (i - 7) % 10, r = P.rng(131 + key * 17 + (south ? 0 : 977)), m = mir ? -1 : 1, x = X + sp / 2 + i * sp, tas = [];
    for (let k = 0; k < 3; k++) tas.push([x + m * (k - 1) * wd * 0.95, m * ((r() - 0.5) * sp * 0.42 + (k - 1) * wd * 0.5), L * (0.8 + r() * 0.3)]);
    for (const [sx, bd, len] of tas) strand(sx, bd, len, P.alpha(SH, 0.3), wd, wd * 0.35 * m, wd * 0.3);
    for (const [sx, bd, len] of tas) { strand(sx, bd, len, C.creamLo, wd); strand(sx - m * wd * 0.12, bd, len - wd * 0.2, C.cream, wd * 0.62);
      g.strokeStyle = C.creamLo; g.lineWidth = 0.95; for (let t = 0.14; t < 0.95; t += 1.1 * wd / len) { const px = sx + bd * t * t * 0.8 + bd * 0.2 * t, py = ye + d * len * t; g.beginPath(); g.moveTo(px - wd * 0.3, py - wd * 0.22); g.lineTo(px + wd * 0.26, py + wd * 0.22); g.stroke(); } }
    g.fillStyle = C.creamLo; g.beginPath(); g.ellipse(x, ye + d * wd * 0.5, wd * 1.5, wd * 0.8, 0, 0, 7); g.fill(); g.fillStyle = C.cream; g.beginPath(); g.ellipse(x - m * wd * 0.15, ye + d * wd * 0.5 - wd * 0.14, wd * 1.2, wd * 0.52, 0, 0, 7); g.fill();
  }
}
function rug(g, b) {
  const { x: X, y: Y, w: rw, h: rh, th } = RUG, n = rw / 15;
  fringe(g, false); rugTop(g, b);
  g.fillStyle = C.navyLo; g.fillRect(X, Y + rh, rw, th); g.fillStyle = 'rgba(20,10,40,0.35)'; g.fillRect(X, Y + rh + th - 2.2, rw, 2.2);                 // its side: the dark binding, sewn with slanted stitches
  g.strokeStyle = '#4a61a4'; g.lineWidth = 3.2; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const mir = i >= n - 17, x = X + 4.4 + i * 15; g.beginPath(); g.moveTo(x + (mir ? 6.3 : 0), Y + rh + th * 0.2); g.lineTo(x + (mir ? 0 : 6.3), Y + rh + th * 0.78); g.stroke(); }
  g.fillStyle = P.alpha(SH, 0.26); g.fillRect(X, Y + rh + th, rw, 5);                                                                                     // the shadow its edge lays on the tiles
  fringe(g, true);
}
// the walls: a white skirting board all round. North we see its face; west, east and south only its top.
function walls(g) {
  const [fx, fy, fw, fh] = FLOOR, x1 = fx + fw, y1 = fy + fh, sk = 54, skd = 31, face = 236;
  g.fillStyle = C.wall; g.fillRect(0, 0, fx, H); g.fillRect(x1, 0, W - x1, H); g.fillRect(0, y1, W, H - y1); g.fillRect(0, 0, W, fy);
  g.fillStyle = C.wallLo; g.fillRect(fx - sk - 6, 0, 6, H); g.fillRect(x1 + sk, 0, 6, H); g.fillStyle = C.skirtTop; g.fillRect(fx - sk, 0, sk, H); g.fillRect(x1, 0, sk, H); g.fillStyle = C.skirtLo; g.fillRect(fx - 6, 0, 6, H); g.fillRect(x1, 0, 6, H);
  g.fillStyle = C.skirtTop; g.fillRect(fx - sk, y1, fw + 2 * sk, skd); g.fillStyle = C.skirtLo; g.fillRect(fx, y1, fw, 4); g.fillStyle = C.wallLo; g.fillRect(fx - sk, y1 + skd, fw + 2 * sk, 4);
  const y0 = fy - face;                                                                                              // north: the wall's band of shade, the board's top, its face with a round bead, a groove and a foot
  g.fillStyle = C.wallLo; g.fillRect(fx, y0 - skd - 20, fw, 20); g.fillStyle = C.skirtTop; g.fillRect(fx, y0 - skd, fw, skd); g.fillStyle = C.skirt; g.fillRect(fx, y0, fw, face);
  g.fillStyle = C.skirtHi; g.fillRect(fx, y0, fw, 26); g.fillStyle = C.skirtLo; g.fillRect(fx, y0 + 26, fw, 7); g.fillStyle = C.skirtHi; g.fillRect(fx, y0 + 33, fw, 5);
  g.fillStyle = C.skirtLo; g.fillRect(fx, y0 + 70, fw, 6); g.fillStyle = C.skirtHi; g.fillRect(fx, y0 + 76, fw, 4); g.fillStyle = C.skirtLo; g.fillRect(fx, fy - 30, fw, 5); g.fillStyle = C.skirtDeep; g.fillRect(fx, fy - 8, fw, 8);
}
const base = (g, b) => { tiles(g, b, LIT); dusk(g, b); };
const truth = (g, b) => { base(g, b); rug(g, b); walls(g); };
const canvasOf = (b, px, paint) => { const cv = P.createCanvas(Math.round(b[2] * px), Math.round(b[3] * px)), g = cv.getContext('2d'); g.scale(px, px); g.translate(-b[0], -b[1]); paint(g, b); return cv; };

// ---------------------------------------------------------------- what stands on the floor. Sizes in centimetres: hw half its width,
// r what blocks the way (0: he walks over it), flat: it lies on the floor under everything that stands, box: a long thing's [length, depth]
const KIT = {
  coin: { hw: 1.15, flat: 1 }, dice: { hw: 1.0, r: 0.95 }, sugar: { hw: 0.9, r: 0.85 }, 'crumb-a': { hw: 0.6, r: 0.5 }, 'crumb-b': { hw: 0.38 }, 'crumb-c': { hw: 0.25 }, pea: { hw: 0.4, r: 0.36 }, loop: { hw: 0.62, flat: 1 },
  macaroni: { hw: 1.0, r: 0.6 }, cap: { hw: 1.5, r: 1.35 }, drop: { hw: 0.9, flat: 1 }, button: { hw: 0.75, flat: 1 }, marble: { hw: 0.8, r: 0.75 }, spool: { hw: 1.6, r: 1.5 }, needle: { hw: 2.3, flat: 1 }, 'safety-pin': { hw: 1.5, flat: 1 },
  yarn: { hw: 2.6, r: 2.4 }, 'bead-a': { hw: 0.45 }, 'bead-b': { hw: 0.45 }, puzzle: { hw: 1.5, flat: 1 }, crayon: { hw: 4.0, box: [7.6, 1.6] }, block: { hw: 2.0, r: 1.9 }, 'chair-leg': { hw: 1.75, r: 1.7 }, 'table-leg': { hw: 3.0, r: 2.9 },
  'pencil-a': { hw: 2.9, box: [5.8, 0.8] }, 'pencil-b': { hw: 2.9, box: [5.8, 0.8] }, 'pencil-c': { hw: 2.9, box: [5.8, 0.8] }, 'fork-a': { hw: 3.15, box: [6.3, 1.5] }, 'fork-b': { hw: 3.15, box: [6.3, 1.5] }, 'fork-c': { hw: 3.15, box: [6.3, 2.6] },
  raisin: { hw: 0.65, r: 0.55 }, dust: { hw: 1.6 }, cork: { hw: 2.2, box: [4.4, 2.2] }, wrapper: { hw: 2.4, flat: 1 }, popcorn: { hw: 0.8, r: 0.6 }, stain: { hw: 2.2, flat: 1 }, 'chest/closed': { hw: 2.2, box: [4.0, 5.2] }, 'chest/opening': { hw: 2.2, box: [4.0, 5.2] }, 'chest/open': { hw: 2.2, box: [4.0, 5.2] },
};
// a thing longer than the screen is wide is three pictures in a row along its own slant (tools/things.js cuts them)
const LONG = { pencil: { parts: ['pencil-a', 'pencil-b', 'pencil-c'], len: 17.5, turn: 8 }, fork: { parts: ['fork-a', 'fork-b', 'fork-c'], len: 19, turn: -6 } };
function layout() {
  const r = P.rng(20261120), things = [], solid = [], keep = [];
  const blocks = (x, y, rad) => solid.some(s => s.r ? Math.hypot(s.x - x, s.y - y) < s.r + rad : x > s.x - rad && x < s.x + s.w + rad && y > s.y - rad && y < s.y + s.h + rad) || keep.some(k => Math.hypot(k[0] - x, (k[1] - y) * 1.6) < k[2] + rad);
  const near = (x, y, d) => things.some(t => Math.hypot(t.x - x, (t.y - y) * 1.7) < d + KIT[t.name].hw * CM);
  const put = (name, x, y, flip) => { const k = KIT[name]; if (!k) throw new Error('no thing ' + name); x = Math.round(x); y = Math.round(y); things.push(Object.assign({ name, x, y }, flip ? { flip: true } : {}));
    if (k.r) solid.push({ x, y: Math.round(y - k.r * CMY * 0.5), r: Math.round(k.r * CM * 0.8) });                    // a round foot is wider than deep on the tilted floor: one circle, a little up from where it meets the floor
    if (k.box) solid.push({ x: Math.round(x - k.box[0] * CM / 2), y: Math.round(y - k.box[1] * CMY / 2), w: Math.round(k.box[0] * CM), h: Math.round(k.box[1] * CMY) }); };
  const long = (name, x, y) => { const L = LONG[name], n = L.parts.length, a = L.turn * Math.PI / 180; L.parts.forEach((part, i) => { const t = (i - (n - 1) / 2) * L.len / n; put(part, x + t * Math.cos(a) * CM, y - t * Math.sin(a) * CMY + 5); }); };
  const strew = (box, n, names, o = {}) => { let tries = 0; for (let i = 0; i < n && tries < n * 40; tries++) { const name = names[Math.floor(r() * names.length)], k = KIT[name], x = box[0] + r() * box[2], y = box[1] + r() * box[3], rad = k.hw * CM;
    if (blocks(x, y, rad + 16) || near(x, y, (o.gap || 60) + rad)) continue; if (o.not && o.not.some(q => x > q[0] - rad && x < q[0] + q[2] + rad && y > q[1] - rad && y < q[1] + q[3] + rad)) continue; put(name, x, y, r() < 0.5); i++; } };
  const clump = (cx, cy, n, spread, names, o = {}) => { let tries = 0; for (let i = 0; i < n && tries < n * 40; tries++) { const name = names[Math.floor(r() * names.length)], k = KIT[name], a = r() * 6.283, dd = Math.sqrt(r()) * spread, x = cx + Math.cos(a) * dd, y = cy + Math.sin(a) * dd * 0.6, rad = k.hw * CM;
    if (x < FLOOR[0] + rad + 20 || x > FLOOR[0] + FLOOR[2] - rad - 20 || y < FLOOR[1] + 30 || y > FLOOR[1] + FLOOR[3] - 20 || blocks(x, y, rad + 10) || near(x, y, (o.gap || 26) + rad)) continue; put(name, x, y, r() < 0.5); i++; } };
  // home: the doll's house, a stand-in until it is drawn. Nothing lies in front of it or where he wakes.
  const home = { box: [330, 4850, 1080, 621], door: [870, 5471], wake: [870, 5560], stall: [640, 5180], folk: [{ who: 'keeper', x: 640, y: 5150, facing: 's' }, { who: 'folk-a', x: 1120, y: 5230, facing: 'sw' }, { who: 'folk-b', x: 1010, y: 5590, facing: 'se' }] };
  solid.push({ x: 330, y: 4850, w: 1080, h: 60 }, { x: 330, y: 4850, w: 40, h: 621 }, { x: 1370, y: 4850, w: 40, h: 621 });          // its back wall and its two side walls
  keep.push([870, 5300, 520], [870, 5600, 260]);
  const chest = [3880, 2880]; keep.push([chest[0], chest[1] + 60, 150]);
  // the legs: the table's four, two chairs
  for (const [x, y] of TABLE_LEGS) put('table-leg', x, y); for (const c of CHAIRS) for (const [x, y] of c.legs) put('chair-leg', x, y);
  // the landmarks, placed by hand
  long('fork', 3790, 2716);                    // a fork across the east way: the chest lies below it
  put('chest/closed', chest[0], chest[1]);
  long('pencil', 2130, 1440);             // the pencil under the table
  put('cork', 2890, 1050, true); put('yarn', 1900, 3620); put('spool', 3180, 3400); put('spool', 1650, 4330, true); put('block', 2760, 4180); put('block', 2330, 3300, true); put('crayon', 2950, 3780); put('crayon', 1760, 3980, true);
  put('dice', 1990, 5210); put('dice', 520, 3460, true); put('cap', 2980, 5330); put('cap', 700, 2950, true); put('sugar', 1700, 4960); put('sugar', 1770, 5010, true); put('sugar', 1640, 5040); put('coin', 2420, 4960); put('coin', 3480, 5390, true); put('coin', 900, 4080); put('coin', 3900, 3640);
  put('marble', 560, 4420); put('marble', 2060, 3900); put('marble', 3320, 4200, true); put('marble', 2520, 420); put('coin', 2700, 1820); put('block', 3830, 5000, true);
  put('wrapper', 2620, 1880); put('wrapper', 1260, 2300, true); put('stain', 3050, 1150); put('stain', 1560, 780, true); put('wrapper', 3420, 5230); put('stain', 2240, 5400); put('button', 2440, 4250); put('button', 3050, 3620, true); put('puzzle', 1760, 3480); put('puzzle', 2900, 4330, true);
  // the small things, in clumps: nothing stamped, each with its own place and turned either way
  const food = ['crumb-a', 'crumb-b', 'crumb-b', 'crumb-c', 'crumb-c', 'crumb-c'];
  for (const [x, y, n, s] of [[1760, 5060, 7, 170], [2500, 5250, 6, 150], [3300, 4980, 6, 160], [2900, 4840, 4, 120], [3760, 5420, 5, 140], [1500, 5480, 5, 140], [2200, 5520, 4, 120], [600, 4500, 5, 150], [900, 3700, 6, 160], [480, 3100, 5, 140], [1000, 2760, 5, 140], [3860, 4300, 5, 130], [3900, 3300, 4, 120], [600, 2760, 4, 130], [2300, 2800, 5, 200], [3300, 2850, 4, 140]]) clump(x, y, n, s, food);
  clump(3080, 5180, 6, 110, ['loop']); clump(1320, 4760, 4, 100, ['loop']); clump(800, 4200, 4, 110, ['loop', 'pea']); clump(2620, 5560, 3, 90, ['pea']); clump(3600, 4820, 3, 100, ['macaroni', 'pea']); clump(520, 3800, 3, 100, ['macaroni']); clump(1560, 5300, 2, 80, ['drop']); clump(3440, 5560, 2, 90, ['drop', 'loop']);
  strew([1420, 3230, 2050, 1200], 8, ['button', 'needle', 'safety-pin', 'puzzle'], { gap: 150 }); strew([1420, 3230, 2050, 1200], 12, ['bead-a', 'bead-b'], { gap: 90 }); strew([1420, 3230, 2050, 1200], 8, ['crumb-b', 'crumb-c'], { gap: 80 });
  for (const [x, y, n, s] of [[1400, 1000, 7, 200], [2500, 900, 7, 220], [3200, 1500, 7, 200], [2100, 2100, 7, 220], [2900, 2350, 6, 180], [1200, 1650, 5, 160], [700, 800, 5, 160], [3550, 2250, 5, 160], [800, 2300, 5, 160]]) clump(x, y, n, s, [...food, 'raisin', 'popcorn', 'pea']);
  strew([470, 640, 3360, 1900], 8, ['dust'], { gap: 300 }); strew([470, 640, 3360, 1900], 4, ['macaroni', 'loop'], { gap: 200 });
  strew([220, 320, 3860, 200], 4, ['dust'], { gap: 300 }); strew([220, 320, 3860, 200], 3, ['button', 'safety-pin', 'bead-a'], { gap: 300 });
  things.sort((a, b) => a.y - b.y || a.x - b.x);
  const zones = [{ kind: 'ant', level: 1, box: [1500, 4720, 2600, 920] }, { kind: 'ant', level: 2, box: [220, 2700, 1040, 2050] }, { kind: 'ant', level: 2, box: [3640, 3100, 470, 1500] },
    { kind: 'ladybird', level: 3, box: [1340, 3110, 2216, 1420] }, { kind: 'cockroach', level: 5, box: [460, 610, 3380, 1970] }];
  return { things, solid, home, chest, zones };
}

// ---------------------------------------------------------------- the kit: the floors that repeat, the flat pieces, world.json
function kit() {
  const { x: X, y: Y, w: rw, h: rh, th, bx, by } = RUG, [dx, dy, dw, dh] = DUSK, dr = DUSK_RAD, pieces = [], flats = [], fr = RUG.fringe * 1.12 + 6, dir = path.join(OUT, 'pieces');
  fs.mkdirSync(dir, { recursive: true });
  P.save(canvasOf([0, 0, 2 * TW, 2 * TH], 1, (g, b) => tiles(g, b, LIT)), path.join(OUT, 'floor-tiles.png'));           // the two tile floors at ONE pixel a unit, as the island's ground was: flat and soft enough to take it
  P.save(canvasOf([0, 0, 2 * TW, 2 * TH], 1, (g, b) => tiles(g, b, DIM)), path.join(OUT, 'floor-dusk.png'));
  P.save(canvasOf([X + bx, Y + by, ...RUG.cell], S, rugTop), path.join(OUT, 'floor-rug.png'));
  const piece = (name, b, paint) => { P.save(canvasOf(b, S, paint), path.join(dir, name.replace('/', '_') + '.png')); pieces.push({ name, file: name.replace('/', '_') + '.png', data: { keep: true, soft: true } }); return b; };
  const lay = (name, x, y, flip) => flats.push(Object.assign({ name, x, y }, flip ? { flip: true } : {}));
  // the four round corners of the table's shadow: the lit tiles shown again where the dark fill is square
  for (const [n, x, y] of [['nw', dx, dy], ['ne', dx + dw - dr, dy], ['sw', dx, dy + dh - dr], ['se', dx + dw - dr, dy + dh - dr]]) { piece('dusk/' + n, [x, y, dr, dr], base); lay('dusk/' + n, x, y); }
  // the rug: two corners, three strips; the east side is the west side flipped
  const hN = fr + by, hS = by + th + 5 + fr, yN = Y - fr, yS = Y + rh - by;
  piece('rug/nw', [X, yN, bx, hN], rug); piece('rug/n', [X + bx, yN, 360, hN], rug); piece('rug/w', [X, Y + by, bx, RUG.tooth], rug); piece('rug/sw', [X, yS, bx, hS], rug); piece('rug/s', [X + bx, yS, 360, hS], rug);
  lay('rug/nw', X, yN); lay('rug/nw', X + rw - bx, yN, true); lay('rug/sw', X, yS); lay('rug/sw', X + rw - bx, yS, true);
  for (let x = X + bx; x < X + rw - bx - 1; x += 360) { lay('rug/n', x, yN); lay('rug/s', x, yS); }
  for (let y = Y + by; y < Y + rh - by - 1; y += RUG.tooth) { lay('rug/w', X, y); lay('rug/w', X + rw - bx, y, true); }
  // the walls: west (east is its flip), then north and south over their ends
  const [fx, fy, fw, fh] = FLOOR;
  piece('wall/w', [fx - 60, 0, 60, 138], walls); piece('wall/n', [fx, fy - 287, 90, 287], walls); piece('wall/s', [fx, fy + fh, 90, 35], walls);
  for (let y = 0; y < H; y += 138) { lay('wall/w', fx - 60, y); lay('wall/w', fx + fw, y, true); }
  for (let x = fx; x < fx + fw; x += 90) { lay('wall/n', x, fy - 287); lay('wall/s', x, fy + fh); }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ px: S, items: pieces }));
  const { things, solid, home, chest, zones } = layout();
  const J = { name: 'kitchen-corner', size: { w: W, h: H }, unit: { cm: CM, cmDeep: CMY, tile: [TW, TH], note: 'the floor is drawn tilted, as the models are seen: a centimetre is 36 units across and 20.7 in depth' },
    floor: FLOOR, outside: C.wall,
    art: { flats: 'floor.json', things: 'things.json', note: 'floor.json holds the flat pieces named in flats, things.json everything named in things; both are sets of single pictures with an items block' },
    floors: { tiles: { file: 'floor-tiles.png', px: 1, cell: [2 * TW, 2 * TH] }, dusk: { file: 'floor-dusk.png', px: 1, cell: [2 * TW, 2 * TH] }, rug: { file: 'floor-rug.png', px: S, cell: RUG.cell } },
    fills: [{ floor: 'tiles', box: FLOOR, from: [0, 0] }, { floor: 'dusk', box: DUSK, from: [0, 0] },{ floor: 'rug', box: [X + bx, Y + by, rw - 2 * bx, rh - 2 * by], from: [X + bx, Y + by] }],
    flats,
    biomes: [{ id: 'tiles', name: 'The tiles', level: [1, 2], light: 'sun', box: FLOOR, note: 'everywhere the other two are not' }, { id: 'rug', name: 'The rug', level: [3, 3], light: 'warm', box: [X, Y + th, rw, rh], note: 'its fringe lies 70 units out from its north and south ends: he walks through it' },
      { id: 'dusk', name: 'Under the table', level: [5, 5], light: 'shade', box: DUSK, tint: '#cfc6f2', note: 'tint is a colour to multiply the figures with while they stand in it, if the game wants: not tried' }],
    home, chest, zones, things, solid };
  fs.writeFileSync(path.join(OUT, 'world.json'), JSON.stringify(J));
  console.log('kit:', pieces.length, 'pieces,', flats.length, 'laid,', things.length, 'things,', solid.length, 'in the way');
}

// ---------------------------------------------------------------- the reference drawer: the world from its files, as the game should draw it
async function loadKit(dir) {
  const D = require('./dress.js'), J = JSON.parse(fs.readFileSync(path.join(dir, 'world.json'), 'utf8')), K = { J, floors: {}, D };
  for (const [k, f] of Object.entries(J.floors)) K.floors[k] = await P.loadImage(path.join(dir, f.file));
  K.flat = await D.atlas(dir, 'floor');
  for (const d of [dir, path.join(R, 'work/things/out')]) if (!K.things && fs.existsSync(path.join(d, 'things.json'))) K.things = await D.atlas(d, 'things');
  return K;
}
function drawFloor(g, K, b) {
  const J = K.J, hit = (x, y, w, h) => x < b[0] + b[2] && x + w > b[0] && y < b[1] + b[3] && y + h > b[1];
  g.fillStyle = J.outside; g.fillRect(b[0], b[1], b[2], b[3]);
  for (const f of J.fills) { const [x, y, w, h] = f.box; if (!hit(x, y, w, h)) continue;
    const [cw, ch] = J.floors[f.floor].cell, im = K.floors[f.floor]; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const x0 = Math.max(x, b[0]), y0 = Math.max(y, b[1]), x1 = Math.min(x + w, b[0] + b[2]), y1 = Math.min(y + h, b[1] + b[3]);
    for (let j = Math.floor((y0 - f.from[1]) / ch); f.from[1] + j * ch < y1; j++) for (let i = Math.floor((x0 - f.from[0]) / cw); f.from[0] + i * cw < x1; i++) g.drawImage(im, f.from[0] + i * cw, f.from[1] + j * ch, cw, ch);
    g.restore(); }
  for (const f of J.flats) { const fr = K.flat.j.frames[f.name].frame, w = fr.w / K.flat.j.meta.filePx, h = fr.h / K.flat.j.meta.filePx; if (!hit(f.x, f.y, w, h)) continue;
    g.save(); g.translate(f.x, f.y); if (f.flip) { g.translate(w, 0); g.scale(-1, 1); } g.drawImage(K.flat.im, fr.x, fr.y, fr.w, fr.h, 0, 0, w, h); g.restore(); }
}
// a thing from the atlas, or a plain shape with its name where it is not built yet
function drawThing(g, K, t) {
  const f = K.things && K.things.j.frames[t.name];
  if (f) { g.save(); g.translate(t.x, t.y); g.scale(t.flip ? -0.5 : 0.5, 0.5); K.D.pic(g, K.things, t.name); g.restore(); return; }
  const k = KIT[t.name], w = k.hw * CM; g.save(); g.fillStyle = k.flat ? 'rgba(255,60,200,0.35)' : 'rgba(255,60,200,0.7)'; g.beginPath(); g.ellipse(t.x, t.y - (k.flat ? 0 : w * 0.3), w, w * 0.6, 0, 0, 7); g.fill(); P.label(g, t.name, t.x, t.y - 4, 13, '#ffffff', { align: 'center', stroke: '#33203a', strokeW: 3 }); g.restore();
}
const isFlat = (K, t) => { const it = K.things && K.things.j.items[t.name]; return it ? !!it.flat : !!KIT[t.name].flat; };
function drawWorld(g, K, b, extra = []) {
  drawFloor(g, K, b); const near = t => t.x > b[0] - 420 && t.x < b[0] + b[2] + 420 && t.y > b[1] - 60 && t.y < b[1] + b[3] + 460;
  const list = K.J.things.filter(near); for (const t of list) if (isFlat(K, t)) drawThing(g, K, t);
  const up = list.filter(t => !isFlat(K, t)).map(t => ({ y: t.y, draw: () => drawThing(g, K, t) })).concat(extra); up.sort((a, c) => a.y - c.y); for (const t of up) t.draw();
}

async function check() {
  const K = await loadKit(OUT); let worst = 0;
  for (const [name, b] of [['tiles and the dusk corner', [800, 400, 500, 400]], ['the rug, north west', [1200, 2950, 700, 500]], ['the rug, south', [1700, 4300, 700, 420]], ['the wall, north west', [0, 0, 500, 500]], ['a chair shadow', [200, 1100, 900, 300]], ['the rug, west', [1250, 3500, 500, 700]]]) {
    const a = canvasOf(b, S, truth), c = canvasOf(b, S, (g, bb) => drawFloor(g, K, bb)), da = a.getContext('2d').getImageData(0, 0, a.width, a.height).data, dc = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let bad = 0;
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - dc[i]) + Math.abs(da[i + 1] - dc[i + 1]) + Math.abs(da[i + 2] - dc[i + 2]) > 110) bad++;   // the tiles are at one pixel a unit, so their edges are a little softer than the painting's
    const part = bad / (da.length / 4); worst = Math.max(worst, part); console.log(name.padEnd(28), (part * 100).toFixed(2) + '% of the pixels differ'); if (part > 0.004) { P.save(a, path.join(OUT, 'check', name.replace(/\W+/g, '-') + '-whole.png')); P.save(c, path.join(OUT, 'check', name.replace(/\W+/g, '-') + '-kit.png')); }
  }
  console.log(worst < 0.004 ? 'the kit draws the floor as painted' : '!! the kit and the painting differ: see work/world/check');
}

function deliver() {
  fs.mkdirSync(DELIVERED, { recursive: true });
  for (const f of ['world.json', 'floor-tiles.png', 'floor-dusk.png', 'floor-rug.png', 'floor.json', 'floor.png']) fs.copyFileSync(path.join(OUT, f), path.join(DELIVERED, f));
  for (const f of ['things.json', 'things.png']) fs.copyFileSync(path.join(R, 'work/things/out', f), path.join(DELIVERED, f));
  console.log('copied the kit and the things into', DELIVERED, '(then: python tools/shrink.py concepts/house/kitchen)');
}
// can he walk from where he wakes to the chest, the stall and the middle of every zone? A grid of 12 units, he is 14 wide to each side.
function walk() {
  const J = JSON.parse(fs.readFileSync(path.join(KITDIR(), 'world.json'), 'utf8')), c = 12, rad = 14, [fx, fy, fw, fh] = J.floor, nx = Math.ceil(fw / c), ny = Math.ceil(fh / c), free = new Uint8Array(nx * ny), seen = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = fx + (i + 0.5) * c, y = fy + (j + 0.5) * c; free[j * nx + i] = J.solid.some(s => s.r ? Math.hypot(s.x - x, s.y - y) < s.r + rad : x > s.x - rad && x < s.x + s.w + rad && y > s.y - rad && y < s.y + s.h + rad) ? 0 : 1; }
  const cell = (x, y) => Math.floor((y - fy) / c) * nx + Math.floor((x - fx) / c), q = [cell(...J.home.wake)]; seen[q[0]] = 1; if (!free[q[0]]) console.log('!! where he wakes is blocked');
  while (q.length) { const k = q.pop(), i = k % nx, j = (k - i) / nx; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue; const m = b * nx + a; if (free[m] && !seen[m]) { seen[m] = 1; q.push(m); } } }
  let bad = 0; const ask = (n, x, y) => { const ok = seen[cell(x, y)]; if (!ok) bad++; console.log((ok ? 'ok  ' : '!!  ') + n, x, y); };
  ask('the chest, from below', J.chest[0], J.chest[1] + 90); ask('the stall', J.home.stall[0], J.home.stall[1] + 60); ask('the door', ...J.home.door); J.zones.forEach(z => ask(`${z.kind} ${z.level}`, z.box[0] + z.box[2] / 2, z.box[1] + z.box[3] / 2));
  let cut = 0, all = 0; for (let k = 0; k < free.length; k++) if (free[k]) { all++; if (!seen[k]) cut++; } console.log(`${(cut / all * 100).toFixed(2)}% of the free floor cannot be reached`, bad ? '!! something is cut off' : '');
  for (const s of J.solid) { const [x0, y0, x1, y1] = s.r ? [s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r] : [s.x, s.y, s.x + s.w, s.y + s.h]; if (x1 < fx || x0 > fx + fw || y1 < fy || y0 > fy + fh) console.log('!! outside the floor:', JSON.stringify(s)); }
}

async function map(out) {
  const K = await loadKit(KITDIR()), k = 0.25, cv = P.createCanvas(W * k, H * k), g = cv.getContext('2d'); g.scale(k, k); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  drawWorld(g, K, [0, 0, W, H]);
  const J = K.J, tag = (t, x, y, s = 60, col = '#ffffff') => P.label(g, t, x, y, s, col, { align: 'center', stroke: '#33203a', strokeW: s / 5, font: 'Trebuchet MS' });
  g.lineWidth = 8; g.setLineDash([36, 24]); for (const z of J.zones) { g.strokeStyle = { ant: '#5a55a0', ladybird: '#f0443a', cockroach: '#ffb04a' }[z.kind]; g.strokeRect(...z.box); tag(`${z.kind}, level ${z.level}`, z.box[0] + z.box[2] / 2, z.box[1] + 70, 64); }
  g.setLineDash([]); g.strokeStyle = '#33203a'; g.lineWidth = 10; g.fillStyle = 'rgba(255,214,64,0.5)'; g.fillRect(...J.home.box); g.strokeRect(...J.home.box); tag('home', J.home.box[0] + J.home.box[2] / 2, J.home.box[1] + J.home.box[3] / 2, 90);
  for (const [n, p] of [['he wakes', J.home.wake], ['the chest', J.chest]]) { g.fillStyle = '#ffd640'; g.beginPath(); g.arc(p[0], p[1], 34, 0, 7); g.fill(); g.stroke(); tag(n, p[0], p[1] + 84, 64); }
  for (const bm of J.biomes) tag(bm.name, bm.id === 'tiles' ? 2700 : bm.box[0] + bm.box[2] / 2, bm.id === 'tiles' ? 5650 : bm.box[1] + bm.box[3] / 2, 120);
  g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(3300, 4700, 412, 915); tag('one screen', 3506, 5100, 56);
  P.save(cv, out || path.join(OUT, 'map.jpg')); console.log('wrote', out || path.join(OUT, 'map.jpg'));
}

// a screen of the game: 412 by 915, his feet at 206, 412, the glass on
async function screen(args) {
  const D = require('./dress.js'), G = require('./glass.js'), K = await loadKit(KITDIR()), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
  const hx = +args[0], hy = +args[1], out = args[2] && !args[2].startsWith('--') ? args[2] : path.join(OUT, `screen-${hx}-${hy}.png`), SW = 412, SHh = 915, HX = 206, HY = 412, b = [hx - HX, hy - HY, SW, SHh], FONT = 'Trebuchet MS';
  const cv = P.createCanvas(SW * S, SHh * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.translate(-b[0], -b[1]);
  const A = await D.load(), glass = await D.atlas(path.join(R, 'out/glass'), 'glass'), extra = [], bugs = [];
  const loadDir = async dir => { const o = {}; if (!fs.existsSync(path.join(dir, 'meta.json'))) return o; const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); for (const it of m.items) o[it.name] = { im: await P.loadImage(path.join(dir, it.file)), o: it.origin }; return o; };
  const BUG = await loadDir(path.join(R, 'work/house/bean')), GEAR = await loadDir(path.join(R, 'work/house/gear')), wear = (opt('gear') || 'pin,button').split(',');
  const shadow = (x, y, rx, ry) => { g.save(); g.globalAlpha = 0.24; g.fillStyle = SH; g.beginPath(); g.ellipse(x + rx * 0.12, y + 1, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
  for (const q of (opt('bugs') || '').split(';').filter(Boolean)) { const [name, x, y, flip] = q.split(','), m = BUG[name]; if (!m) throw new Error('no insect ' + name); bugs.push({ x: +x, y: +y, h: m.o[1] / 2 }); extra.push({ y: +y, draw: () => { shadow(+x, +y, m.im.width / 8, m.im.width / 20); g.save(); g.translate(+x, +y); g.scale(flip ? -0.5 : 0.5, 0.5); g.drawImage(m.im, -m.o[0], -m.o[1]); g.restore(); } }); }
  extra.push({ y: hy, draw: () => { const fc = 'se', F = D.frameOf(A.hero, 'stand', fc, 0), pts = F.points || {}, pc = (pt, it) => { if (!pt || !it) return; g.save(); g.translate(pt.x, pt.y); g.rotate(pt.r * Math.PI / 180); g.drawImage(it.im, -it.o[0], -it.o[1]); g.restore(); };
    const parts = [[pts.off, wear[1] && GEAR[`shield-${wear[1]}-${fc}`]], [pts.hand, wear[0] && GEAR['blade-' + wear[0]]], [pts.head, wear[2] && GEAR[`${wear[2]}-${fc}`]]];
    shadow(hx, hy, 15, 6); g.save(); g.translate(hx, hy); g.scale(0.5, 0.5); for (const [pt, it] of parts) if (pt && !pt.front) pc(pt, it); D.pic(g, A.hero, F.name); for (const [pt, it] of parts) if (pt && pt.front) pc(pt, it); g.restore(); } });
  drawWorld(g, K, b, extra);
  if (!args.includes('--no-glass')) {                                                                                 // the glass as the game has it today (tools/scene.js)
    g.translate(b[0], b[1]); const fr = key => glass.j.frames[key].frame, it = key => glass.j.items[key], piece = (key, x, y, kk = 1) => { g.save(); g.translate(x, y); g.scale(0.5 * kk, 0.5 * kk); D.pic(g, glass, key); g.restore(); };
    const pill = (key, x, y, w, kk = 1) => { const f = fr(key), [l, , rr] = it(key).slice, pw = Math.round(w / kk * 2); if (pw < l + rr) return; const t = P.createCanvas(pw, f.h), q = t.getContext('2d'); q.drawImage(glass.im, f.x, f.y, l, f.h, 0, 0, l, f.h); q.drawImage(glass.im, f.x + l, f.y, f.w - l - rr, f.h, l, 0, pw - l - rr, f.h); q.drawImage(glass.im, f.x + f.w - rr, f.y, rr, f.h, pw - rr, 0, rr, f.h); g.drawImage(t, x, y - f.h / 4 * kk, w, f.h / 2 * kk); };
    const txt = (t, x, y, s, c, o = {}) => P.label(g, t, x, y, s, c, { font: FONT, ...o }), white = (t, x, y, s, o = {}) => txt(t, x, y, s, '#ffffff', { stroke: G.INK, strokeW: s > 13 ? 4 : 3, ...o });
    const flat = (key, x, y, w, h) => { const f = fr(key); g.drawImage(glass.im, f.x + 1, f.y, f.w - 2, f.h, x, y, w, h); };
    const ownBar = (x, y, w, hp, rage) => { const rm = it('own/frame').rooms, x0 = x - w / 2, y0 = y - fr('own/frame').h / 4, full = w - 2 * rm.hp.x; pill('own/back', x0, y, w); flat('own/hp', x0 + rm.hp.x, y0 + rm.hp.y, full * hp, rm.hp.h); flat('own/rage', x0 + rm.rage.x, y0 + rm.rage.y, full * rage, rm.rage.h); pill('own/frame', x0, y, w); };
    const mobBar = (x, y, w, part) => { const key = 'mob/well', inset = it(key).inset, x0 = x - w / 2; pill(key, x0 - inset, y, w + inset * 2); pill('mob/hp', x0, y, Math.max(5, w * part)); };
    bugs.forEach((q, i) => { if (i === 0) mobBar(q.x - b[0], q.y - b[1] - q.h - 12, 44, 0.7); });
    const h0 = D.frameOf(A.hero, 'stand', 's', 0).origin, top = (h0.y !== undefined ? h0.y : h0[1]) / 2; ownBar(HX, Math.round(HY - top - 13 - (wear[2] ? 6 : 0)), it('own/frame').length, 0.9, 0.3);
    piece('button/menu', 30, 30); white('Lv 1', 62, 30, 16); piece('mark/coin', 122, 30); white('12', 134, 30, 16); piece('button/bag', 286, 30); piece('button/chart', 334, 30); piece('button/hero', 382, 30);
    const ROW_Y = SHh - 64, BAR_W = 200, BAR_X = (SW - BAR_W) / 2, bar = (kind, x, y, w, part, kk = 1) => { pill('bar/well', x, y, w, kk); const full = w - 6 * kk; if (part > 0) pill('fill/' + kind, x + 3 * kk, y - kk, Math.max(10 * kk, full * part), kk); }; bar('xp', BAR_X, SHh - 14, BAR_W, 0.38, 0.72);
    for (const [key, ddx, rr] of [['charge', -84, 36], ['cleave', 0, 36], ['potion', 78, 28]]) { const x = SW / 2 + ddx, y = ROW_Y + (36 - rr); piece('skill/' + key, x, y, rr * 2 / 76); if (key === 'potion') white('3', x + rr * 0.55, y + rr * 0.6, 13, { align: 'center' }); }
  }
  P.save(cv, out); console.log('wrote', out);
}

if (require.main === module) { const [cmd, ...a] = process.argv.slice(2); ({ kit: async () => kit(), deliver: async () => deliver(), check, walk: async () => walk(), map: () => map(a[0]), screen: () => screen(a) }[cmd || 'kit'])().catch(e => { console.error(e); process.exit(1); }); }
module.exports = { W, H, FLOOR, DUSK, RUG, KIT, LONG, C, TW, TH, CM, CMY, layout, loadKit, drawFloor, drawWorld };
