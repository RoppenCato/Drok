// ground.js: a place's ground as one painted picture, and where its props stand (Leonard, AD, 2026-11-20; the layouts are mine).
// The ground has no line and few tones: sea in three steps with a white edge of foam, wet sand, sand, grass, rock. It is
// painted at ONE pixel a design unit and the game draws it at double size: flat colour takes that well, and a place of
// 1400 by 2400 then costs 13 MB of memory instead of 54. Everything that stands on it (the models) is at two pixels a unit.
// Writes into work/<place>/: ground.png, place.json (the size, the grounds as outlines, the props with their places, what
// blocks the way, where things are), and preview.png (the ground with its props, small, for the studio's eye).
//   node tools/ground.js island      node tools/ground.js harbour
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const C = { deep: '#2196cc', sea: '#30b8d6', shallow: '#52d6d8', foam: '#ffffff', wet: '#e6cf98', sand: '#f8e7b6', sandHi: '#fdf3d2', sandLo: '#eed79e', grass: '#8ed35a', grassHi: '#a6e06c', grassLo: '#6fbf52', jungle: '#3fa85c',
  rock: '#c9cddb', rockHi: '#dde0ea', rockLo: '#aab0c6', path: '#f1dca6', quay: '#d9c7a4', quayLo: '#c4b08a', cobble: '#e3d6bd', cobbleLo: '#cfc0a2', plank: '#dba060', plankLo: '#c98646' };
const smooth = (pts, k = 0.5) => g => { const n = pts.length; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3, p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3, p2[0], p2[1]); } g.closePath(); };
const fill = (g, path, col) => { path(g); g.fillStyle = col; g.fill(); };
const ring = (g, path, col, w) => { path(g); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };
const blob = (x, y, rx, ry, n, k, r) => { const pts = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, w = 1 + (r() - 0.5) * k; pts.push([x + Math.cos(t) * rx * w, y + Math.sin(t) * ry * w]); } return smooth(pts); };
// is a point inside a closed outline (the outline's corner points; good enough for placing things)
const inside = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

const PLACES = {
  // the first island: a beach with a small dock at the south, grass and palms in the middle, a rocky cove at the north
  island: { w: 1400, h: 2400, seed: 7,
    land: [[700, 2225], [960, 2200], [1190, 2110], [1300, 1900], [1310, 1600], [1260, 1300], [1300, 1000], [1250, 760], [1150, 560], [1060, 330], [860, 190], [640, 150], [420, 200], [250, 330], [150, 560], [120, 850], [170, 1150], [110, 1450], [130, 1750], [210, 2010], [420, 2180]],
    grass: [[690, 1740], [930, 1700], [1100, 1560], [1150, 1320], [1110, 1100], [1150, 900], [1010, 800], [780, 760], [560, 790], [380, 870], [300, 1080], [330, 1300], [270, 1480], [330, 1640], [500, 1730]],
    rock: [[700, 720], [900, 690], [1080, 600], [1010, 400], [850, 260], [650, 215], [450, 265], [300, 390], [220, 580], [300, 690], [480, 730]],
    inlet: [[760, 150], [900, 190], [960, 330], [880, 440], [760, 470], [650, 400], [640, 260]],          // the cove's water, cut into the rock
    paths: [[[700, 2150], [690, 1960], [720, 1800], [700, 1640], [640, 1460], [690, 1280], [760, 1100], [730, 920], [700, 760], [720, 600]], [[690, 1280], [860, 1250], [1010, 1260]]],
    dock: [700, 2196], arrive: [700, 2120], chest: [1040, 1250],
    zones: { 'sand-crab': [[240, 1790, 920, 380]], 'reef-gull': [[330, 860, 760, 800]], 'coconut-crab': [[300, 260, 720, 440]] } },
  // the harbour town: a quay with a dock at the south, a few houses round a small square, a market stall
  harbour: { w: 900, h: 1100, seed: 19,
    land: [[450, 960], [700, 950], [840, 880], [870, 640], [850, 380], [800, 170], [620, 80], [420, 60], [220, 100], [80, 220], [40, 480], [60, 760], [140, 900], [280, 955]],
    grass: [[450, 330], [640, 300], [790, 230], [740, 140], [560, 110], [380, 100], [210, 140], [120, 250], [180, 330], [320, 350]],
    square: [[450, 780], [640, 760], [720, 660], [730, 500], [660, 390], [470, 360], [280, 380], [200, 480], [180, 640], [260, 760]],
    paths: [[[450, 930], [450, 800]], [[450, 380], [440, 250]]],
    dock: [450, 934], arrive: [450, 880], zones: {} }
};

function paint(name) {
  const L = PLACES[name], r = P.rng(L.seed), cv = P.createCanvas(L.w, L.h), g = cv.getContext('2d'), land = smooth(L.land, 0.6);
  // the sea: deep, then two lighter rings round the land, the foam's white edge, a band of wet sand
  g.fillStyle = C.deep; g.fillRect(0, 0, L.w, L.h);
  for (let i = 0; i < 90; i++) { const x = r() * L.w, y = r() * L.h, w = 14 + r() * 22; g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.ellipse(x, y, w, 1.6, 0, 0, 7); g.fill(); }
  ring(g, land, C.sea, 190); ring(g, land, C.shallow, 90); ring(g, land, C.foam, 14);
  for (let i = 0; i < L.land.length; i++) { const a = L.land[i], b = L.land[(i + 1) % L.land.length]; for (let k = 0; k < 4; k++) { const t = r(), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, cx = L.w / 2, cy = L.h / 2, d = Math.hypot(x - cx, y - cy) || 1, o = 26 + r() * 30; g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(x + (x - cx) / d * o, y + (y - cy) / d * o, 9 + r() * 12, 1.8, Math.atan2(y - cy, x - cx) + Math.PI / 2, 0, 7); g.fill(); } }
  fill(g, land, C.wet); g.save(); land(g); g.clip(); ring(g, land, C.wet, 26); g.lineWidth = 1; const inner = smooth(L.land.map(([x, y]) => [L.w / 2 + (x - L.w / 2) * 0.975, L.h / 2 + (y - L.h / 2) * 0.985]), 0.6); fill(g, inner, C.sand);
  // the sand's own tones, then the grass and the rock on it
  for (let i = 0; i < L.w * L.h / 26000; i++) fill(g, blob(r() * L.w, r() * L.h, 30 + r() * 60, 10 + r() * 18, 9, 0.35, r), i % 3 ? C.sandHi : C.sandLo);
  for (let i = 0; i < L.w * L.h / 5000; i++) { g.fillStyle = C.sandLo; g.beginPath(); g.arc(r() * L.w, r() * L.h, 0.8 + r() * 0.9, 0, 7); g.fill(); }
  if (L.grass) { const gr = smooth(L.grass, 0.6); fill(g, gr, C.grassLo); g.save(); gr(g); g.clip(); g.translate(0, -5); fill(g, gr, C.grass); g.translate(0, 5);
    for (let i = 0; i < 70; i++) fill(g, blob(r() * L.w, r() * L.h, 24 + r() * 50, 10 + r() * 20, 9, 0.35, r), i % 2 ? C.grassHi : C.grassLo);
    for (let i = 0; i < 900; i++) { const x = r() * L.w, y = r() * L.h; g.strokeStyle = i % 2 ? C.grassLo : C.grassHi; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 4 - r() * 3); g.stroke(); } g.restore(); }
  if (L.rock) { const rk = smooth(L.rock, 0.55); fill(g, rk, C.rockLo); g.save(); rk(g); g.clip(); g.translate(0, -5); fill(g, rk, C.rock); g.translate(0, 5);
    for (let i = 0; i < 46; i++) { const x = r() * L.w, y = r() * 900, s = 26 + r() * 50, pts = []; for (let k = 0; k < 6; k++) { const t = k / 6 * 6.283 + r() * 0.4; pts.push([x + Math.cos(t) * s * (0.7 + r() * 0.5), y + Math.sin(t) * s * 0.6 * (0.7 + r() * 0.5)]); } g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = i % 2 ? C.rockHi : C.rockLo; g.fill(); } g.restore(); }
  if (L.inlet) { const il = smooth(L.inlet, 0.6); ring(g, il, C.foam, 12); fill(g, il, C.shallow); g.save(); il(g); g.clip(); fill(g, smooth(L.inlet.map(([x, y]) => [x, y - 46]), 0.6), C.sea); g.restore(); }
  if (L.square) { const sq = smooth(L.square, 0.5); fill(g, sq, C.cobbleLo); g.save(); sq(g); g.clip(); g.translate(0, -4); fill(g, sq, C.cobble); g.translate(0, 4);
    for (let y = 340; y < 800; y += 22) for (let x = 170 + (Math.round(y / 22) % 2) * 17; x < 750; x += 34) { g.strokeStyle = C.cobbleLo; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x + (r() - 0.5) * 5, y + (r() - 0.5) * 4, 12 + r() * 3, 7 + r() * 2, 0, 0, 7); g.stroke(); } g.restore(); }
  for (const p of L.paths || []) { g.save(); g.beginPath(); p.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = C.sandLo; g.lineWidth = 46; g.stroke(); g.strokeStyle = C.path; g.lineWidth = 38; g.stroke(); g.restore(); }
  g.restore();
  return { cv, L };
}

// ---------------------------------------------------------------- where the props stand: clusters, each thing its own size and place
function place(name) {
  const L = PLACES[name], r = P.rng(L.seed + 100), props = [], solid = [], far = (x, y, d) => (L.paths || []).every(p => p.every(q => Math.hypot(q[0] - x, q[1] - y) > d)) && Math.hypot(L.arrive[0] - x, L.arrive[1] - y) > d * 1.5 && (!L.chest || Math.hypot(L.chest[0] - x, L.chest[1] - y) > d);
  const put = (n, x, y, block) => { props.push({ name: n, x: Math.round(x), y: Math.round(y) }); if (block) solid.push({ x: Math.round(x), y: Math.round(y - block * 0.3), r: block }); };
  const cluster = (cx, cy, n, spread, pick) => { for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * spread, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7; if (!inside(L.land, x, y) || !far(x, y, 46) || (L.inlet && inside(L.inlet, x, y))) continue; const [nm, bl] = pick(); put(nm, x, y, bl); } };
  if (name === 'island') {
    const green = () => [['palm-a', 12], ['palm-b', 12], ['palm-c', 10], ['bush-a', 14], ['bush-b', 16], ['bush-c', 10], ['bush-d', 26], ['bigleaf-a', 0], ['bigleaf-b', 0], ['tuft-a', 0], ['tuft-b', 0], ['tuft-a', 0]][Math.floor(r() * 12)];
    const stones = () => [['rock-a', 20], ['rock-b', 9], ['rock-c', 13], ['rock-d', 30], ['rock-b', 9], ['rock-c', 13]][Math.floor(r() * 6)];
    for (const [x, y, n, s] of [[420, 1000, 9, 120], [960, 960, 8, 110], [1010, 1480, 9, 120], [420, 1500, 9, 130], [560, 1180, 5, 70], [880, 1300, 4, 60], [330, 1250, 6, 80], [1080, 1160, 5, 70], [820, 840, 5, 80], [520, 880, 5, 80]]) cluster(x, y, n, s, green);
    for (const [x, y, n, s] of [[260, 1900, 3, 60], [1180, 1880, 4, 70], [230, 2000, 2, 40], [1100, 2040, 3, 50], [540, 1820, 2, 40]]) cluster(x, y, n, s, () => r() < 0.5 ? green() : [r() < 0.5 ? 'tuft-a' : 'tuft-b', 0]);
    for (const [x, y, n, s] of [[380, 420, 5, 90], [980, 520, 5, 90], [540, 300, 4, 80], [300, 620, 3, 60], [860, 600, 3, 70], [1080, 760, 3, 60], [200, 1620, 2, 40], [1240, 1500, 2, 40]]) cluster(x, y, n, s, stones);
    put('rock-e', 470, 560, 46); put('rock-e', 1010, 300, 46); put('rock-d', 1120, 2020, 30); put('rock-a', 300, 2080, 20);
    put('barrel', 640, 2150, 10); put('crate', 612, 2166, 10); put('barrel', 770, 2160, 10); put('boat', 880, 2150, 22);
  } else {
    put('house-a', 250, 430, 0); put('house-b', 450, 372, 0); put('house-c', 660, 440, 0); put('stall', 300, 640, 0); put('well', 470, 560, 18); put('sign', 400, 800, 6); put('lamp', 560, 790, 5); put('lamp', 250, 760, 5);
    put('barrel', 390, 905, 10); put('crate', 362, 916, 10); put('crate', 520, 912, 10); put('boat', 620, 925, 22); put('palm-b', 150, 300, 12); put('palm-b', 760, 300, 12); put('bush-b', 120, 560, 16); put('bush-b', 790, 600, 16); put('bush-b', 600, 300, 16);
    for (const [x, y, w, h] of [[160, 360, 180, 80], [372, 300, 156, 76], [552, 366, 216, 84], [246, 606, 108, 44]]) solid.push({ x, y, w, h });     // the houses and the stall: boxes to walk round
  }
  for (let i = 0; i < 3; i++) put('dock', L.dock[0], L.dock[1] + i * 56 + 56, 0);                // the dock runs south into the sea, three pieces end to end
  if (L.chest) put('chest/closed', L.chest[0], L.chest[1], 12);
  props.sort((a, b) => a.y - b.y);
  return { props, solid };
}

async function main() {
  const name = process.argv[2] || 'island', out = path.join(P.ROOT, 'work', name), { cv, L } = paint(name), { props, solid } = place(name);
  P.save(cv, path.join(out, 'ground.png'));
  const J = { name, size: { w: L.w, h: L.h }, ground: { file: 'ground.png', px: 1, note: 'one pixel a design unit: draw it at double size' }, land: L.land, grass: L.grass, rock: L.rock, inlet: L.inlet, square: L.square, paths: L.paths, dock: L.dock, arrive: L.arrive, chest: L.chest, zones: L.zones, props, solid };
  fs.writeFileSync(path.join(out, 'place.json'), JSON.stringify(J));
  // the studio's small look: the ground with the props on it at half size
  const metaF = path.join(out, 'render', 'meta.json');
  if (fs.existsSync(metaF)) {
    const meta = JSON.parse(fs.readFileSync(metaF, 'utf8')), ims = {}; for (const it of meta.items) ims[it.name] = { im: await P.loadImage(path.join(out, 'render', it.file)), o: it.origin };
    const pv = P.createCanvas(L.w, L.h), g = pv.getContext('2d'); g.drawImage(cv, 0, 0);
    for (const p of props) { const m = ims[p.name]; if (!m) continue; g.save(); g.globalAlpha = 0.25; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(p.x + 5, p.y + 1, m.im.width * 0.07, m.im.width * 0.025, 0, 0, 7); g.fill(); g.restore(); g.drawImage(m.im, p.x - m.o[0] / 2, p.y - m.o[1] / 2, m.im.width / 2, m.im.height / 2); }
    const half = P.createCanvas(L.w / 2, L.h / 2); half.getContext('2d').drawImage(pv, 0, 0, L.w / 2, L.h / 2); P.save(half, path.join(out, 'preview.jpg')); P.save(pv, path.join(out, 'preview-full.png'));
  }
  console.log('painted', name, L.w + 'x' + L.h, props.length, 'props', solid.length, 'solid');
}
if (require.main === module) main();
module.exports = { PLACES, paint, place, C };
