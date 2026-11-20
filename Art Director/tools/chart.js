// chart.js: the sea chart (Leonard, AD, 2026-11-20; the design is mine. A world map is big work and would get three concepts;
// Robin asked on 2026-11-20 not to be asked until chapter 1 is done, so this is one chart, made to be judged and changed).
// A sailor's chart in the game's hand: cream paper, compass lines, the dark line, islands as small bright shapes, and
// faint outlines with a question mark where more islands will come. No words are painted in: the game writes the names.
// Writes work/chart/render: chart.png (the whole screen, 412 by 915 at two pixels a unit), the pins, and a meta.json for
// tools/packset.js; and work/chart/chart-places.json (where each place is on the chart, in design units).
//   node tools/chart.js     then  node tools/packset.js chart work/chart/render out/chart --not sheet
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const INK = '#33203a', PAPER = '#f7e9c6', PAPER2 = '#f2e2ba', LINE = '#dcc79c', SEA = '#cdeae4', SEA2 = '#a9dcd8', SAND = '#f8e7b6', GRASS = '#8ed35a', ROCK = '#c9cddb', RED = '#e9423a', GOLD = '#f6c23a';
const S = 2, W = 412, H = 915, OUT = path.join(P.ROOT, 'work/chart/render'), items = [];
const smooth = (pts, k = 0.6) => g => { const n = pts.length; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3, p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3, p2[0], p2[1]); } g.closePath(); };
const blobPts = (x, y, rx, ry, n, k, r, rot = 0) => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, w = 1 + (r() - 0.5) * k, px = Math.cos(t) * rx * w, py = Math.sin(t) * ry * w; return [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]; });
const stroke = (g, path, col, lw, dash) => { path(g); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]); };
const fill = (g, path, col) => { path(g); g.fillStyle = col; g.fill(); };
// Two places since 2026-11-20: Crab Cay with its town (the old harbour is no place any more: its island is one of the unknown
// ones now), and Mire Cay, the swamp, painted where the first unknown island was. `foot` is how far below its point a place's
// painting ends, so the game can write its name under it.
const PLACES = { 'crab-cay': { x: 262, y: 500, name: 'Crab Cay', pin: 'pin/island', foot: 66 }, 'mire-cay': { x: 330, y: 286, name: 'Mire Cay', pin: 'pin/swamp', foot: 52 } };
const OLD = [330, 286, 30, 20, 0.4], HARBOUR = [118, 716, 34, 28, 0.3];
const UNKNOWN = [[96, 330, 34, 18, -0.5], [206, 168, 40, 22, 0.2], [342, 650, 22, 28, 0.3], [70, 520, 20, 26, 0.1], [214, 792, 30, 15, -0.2], HARBOUR];      // the fifth stood under the Sail button: moved up and left

function rose(g, x, y, r) {
  g.save(); g.translate(x, y);
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, len = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.72 : r * 0.46, w = i % 4 === 0 ? r * 0.16 : r * 0.1; g.beginPath(); g.moveTo(Math.cos(a) * len, Math.sin(a) * len); g.lineTo(Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w); g.lineTo(0, 0); g.closePath(); g.fillStyle = i % 4 === 0 ? RED : i % 2 === 0 ? GOLD : PAPER2; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.moveTo(Math.cos(a) * len, Math.sin(a) * len); g.lineTo(Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w); g.lineTo(0, 0); g.closePath(); g.fillStyle = PAPER; g.fill(); g.stroke(); }
  g.beginPath(); g.arc(0, 0, r * 0.14, 0, 7); g.fillStyle = GOLD; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); g.restore();
}
function ship(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); fill(g, gg => { gg.beginPath(); gg.moveTo(-14, 0); gg.quadraticCurveTo(-10, 9, 0, 9); gg.quadraticCurveTo(12, 9, 16, -1); gg.closePath(); }, '#c98646'); stroke(g, gg => { gg.beginPath(); gg.moveTo(-14, 0); gg.quadraticCurveTo(-10, 9, 0, 9); gg.quadraticCurveTo(12, 9, 16, -1); gg.closePath(); }, INK, 1.2);
  for (const [mx, h, w] of [[-4, 22, 13], [6, 17, 10]]) { stroke(g, gg => { gg.beginPath(); gg.moveTo(mx, 0); gg.lineTo(mx, -h); }, INK, 1.2); fill(g, gg => { gg.beginPath(); gg.moveTo(mx + 1, -h + 2); gg.quadraticCurveTo(mx + w, -h * 0.55, mx + 1, -3); gg.closePath(); }, '#fffaf0'); stroke(g, gg => { gg.beginPath(); gg.moveTo(mx + 1, -h + 2); gg.quadraticCurveTo(mx + w, -h * 0.55, mx + 1, -3); gg.closePath(); }, INK, 1); }
  fill(g, gg => { gg.beginPath(); gg.moveTo(-4, -22); gg.lineTo(-12, -19); gg.lineTo(-4, -16); gg.closePath(); }, RED); g.restore(); }
function serpent(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); for (const [dx, r] of [[0, 9], [20, 7], [37, 5]]) { fill(g, gg => { gg.beginPath(); gg.arc(dx, 0, r, Math.PI, 0); gg.closePath(); }, '#6fbfb0'); stroke(g, gg => { gg.beginPath(); gg.arc(dx, 0, r, Math.PI, 0); }, INK, 1.2); stroke(g, gg => { gg.beginPath(); gg.moveTo(dx - r - 4, 1.5); gg.lineTo(dx + r + 4, 1.5); }, '#7fb9c4', 1.2); }
  fill(g, gg => { gg.beginPath(); gg.ellipse(-16, -8, 7, 5, -0.5, 0, 7); }, '#6fbfb0'); stroke(g, gg => { gg.beginPath(); gg.ellipse(-16, -8, 7, 5, -0.5, 0, 7); }, INK, 1.2); stroke(g, gg => { gg.beginPath(); gg.moveTo(-12, -4); gg.quadraticCurveTo(-9, 2, -9, 1); }, INK, 1.2); g.fillStyle = INK; g.beginPath(); g.arc(-18, -9.5, 1.1, 0, 7); g.fill(); g.restore(); }
function waves(g, x, y) { for (let i = 0; i < 3; i++) stroke(g, gg => { gg.beginPath(); gg.moveTo(x + i * 5 - 8, y + i * 5); gg.quadraticCurveTo(x + i * 5 - 4, y + i * 5 - 3.5, x + i * 5, y + i * 5); gg.quadraticCurveTo(x + i * 5 + 4, y + i * 5 + 3.5, x + i * 5 + 8, y + i * 5); }, '#7fb9c4', 1.2); }

function chart() {
  const cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'), r = P.rng(41); g.scale(S, S);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) fill(g, smooth(blobPts(r() * W, r() * H, 40 + r() * 60, 20 + r() * 34, 9, 0.4, r, r() * 3)), i % 2 ? PAPER2 : '#faefd2');
  // the compass lines from two roses, as on a sailor's chart
  for (const [cx, cy] of [[306, 742], [96, 196]]) for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; stroke(g, gg => { gg.beginPath(); gg.moveTo(cx, cy); gg.lineTo(cx + Math.cos(a) * 1100, cy + Math.sin(a) * 1100); }, LINE, i % 2 ? 0.6 : 0.9); }
  // shallows round every island, then the islands
  const isles = [];
  // drawn in the order they always were, so every island keeps the shape it had: the old harbour's island first (unknown now), Crab Cay, then the rest
  isles.push({ pts: blobPts(118, 716, 34, 28, 10, 0.3, r, 0.3) }); isles.push({ id: 'crab-cay', pts: blobPts(262, 500, 34, 54, 12, 0.28, r, 0.1) });
  blobPts(...OLD.slice(0, 4), 10, 0.4, r, OLD[4]); isles.push({ id: 'mire-cay', pts: blobPts(330, 288, 30, 40, 12, 0.26, P.rng(77), -0.15) });
  for (const [x, y, rx, ry, rot] of UNKNOWN.slice(0, 5)) isles.push({ pts: blobPts(x, y, rx, ry, 10, 0.4, r, rot) });
  for (const I of isles) { stroke(g, smooth(I.pts), SEA, I.id ? 34 : 22); fill(g, smooth(I.pts), SEA); }
  for (const I of isles.filter(I => I.id)) stroke(g, smooth(I.pts), SEA2, 14);
  for (const I of isles) {
    if (!I.id) { fill(g, smooth(I.pts), '#f3e3bb'); stroke(g, smooth(I.pts), '#a99a86', 1.2, [5, 4]); const cx = I.pts.reduce((n, p) => n + p[0], 0) / I.pts.length, cy = I.pts.reduce((n, p) => n + p[1], 0) / I.pts.length; P.label(g, '?', cx, cy + 1, 16, '#a99a86', { align: 'center', font: 'Georgia' }); continue; }
    fill(g, smooth(I.pts), I.id === 'mire-cay' ? '#b39a6c' : SAND); const c = PLACES[I.id], inner = k => smooth(I.pts.map(([x, y]) => [c.x + (x - c.x) * k, c.y + (y - c.y) * k]));
    const dot = (dx, dy, rad, col, lw = 0.8) => { fill(g, gg => { gg.beginPath(); gg.arc(c.x + dx, c.y + dy, rad, 0, 7); }, col); stroke(g, gg => { gg.beginPath(); gg.arc(c.x + dx, c.y + dy, rad, 0, 7); }, INK, lw); };
    const hut = (dx, dy, col) => { g.fillStyle = '#f7ead0'; g.fillRect(c.x + dx - 4, c.y + dy - 2, 8, 6); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(c.x + dx - 4, c.y + dy - 2, 8, 6); const roof = gg => { gg.beginPath(); gg.moveTo(c.x + dx - 5.5, c.y + dy - 2); gg.lineTo(c.x + dx, c.y + dy - 7.5); gg.lineTo(c.x + dx + 5.5, c.y + dy - 2); gg.closePath(); }; fill(g, roof, col); stroke(g, roof, INK, 0.8); };
    if (I.id === 'mire-cay') {      // the swamp: mud, moss, grey stones in the north, pools, a few mangroves, a jetty in the south
      fill(g, inner(0.74), '#5fa35c'); g.save(); smooth(I.pts)(g); g.clip(); fill(g, smooth(blobPts(c.x - 1, c.y - 27, 20, 11, 9, 0.3, P.rng(5))), '#a4abbc'); g.restore();
      for (const [dx, dy, rx, ry] of [[-9, 2, 6, 3.6], [8, -5, 5.5, 3.2], [-4, 15, 6, 3.4], [9, 19, 5, 3]]) { const pool = gg => { gg.beginPath(); gg.ellipse(c.x + dx, c.y + dy, rx, ry, 0, 0, 7); }; fill(g, pool, '#3a8d86'); stroke(g, pool, INK, 0.8); }
      for (const [dx, dy] of [[-15, -8], [2, 6], [16, 6], [-13, 24], [3, 28]]) dot(dx, dy, 3.4, '#2f8f6e');
      stroke(g, gg => { gg.beginPath(); gg.moveTo(c.x - 1, c.y + 36); gg.lineTo(c.x - 1, c.y + 48); }, '#c98646', 3.4); }
    else if (I.id === 'crab-cay') { fill(g, inner(0.66), GRASS); g.save(); smooth(I.pts)(g); g.clip(); fill(g, smooth(blobPts(c.x - 2, c.y - 40, 26, 17, 9, 0.3, r)), ROCK); g.restore(); for (const [dx, dy] of [[-8, 4], [9, -2], [-2, 18], [8, 22], [-10, -10]]) dot(dx, dy, 4, '#3fb95e');
      hut(-11, 41, '#e2c060'); hut(1, 45, '#e2c060'); hut(12, 39, '#e2c060'); stroke(g, gg => { gg.beginPath(); gg.moveTo(c.x - 1, c.y + 51); gg.lineTo(c.x - 1, c.y + 64); }, '#c98646', 3.4); }      // the town on stilts at its south end, and its dock
    stroke(g, smooth(I.pts), INK, 1.6);
  }
  // what a chart is dressed with: two roses, a ship, a serpent, small waves
  rose(g, 306, 742, 44); rose(g, 96, 196, 24); ship(g, 196, 392, 1.1); serpent(g, 318, 394, 1); serpent(g, 64, 430, 0.8);
  for (const [x, y] of [[200, 330], [60, 620], [352, 560], [150, 820], [250, 250], [372, 180], [40, 110], [220, 880], [120, 560], [330, 90]]) waves(g, x, y);
  // the border: a double line with a band of marks between, like the scale round an old chart
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(9, 9, W - 18, H - 18); g.lineWidth = 1; g.strokeRect(15, 15, W - 30, H - 30);
  for (let x = 15; x < W - 15; x += 12) for (const y of [9, H - 15]) { if (Math.round(x / 12) % 2) { g.fillStyle = INK; g.fillRect(x, y, Math.min(12, W - 15 - x), 6); } }
  for (let y = 15; y < H - 15; y += 12) for (const x of [9, W - 15]) { if (Math.round(y / 12) % 2) { g.fillStyle = INK; g.fillRect(x, y, 6, Math.min(12, H - 15 - y)); } }
  return cv;
}
function pin(name, w, h, draw, data) { const cv = P.createCanvas(w * S, h * S), g = cv.getContext('2d'); g.scale(S, S); g.lineJoin = 'round'; g.lineCap = 'round'; const o = draw(g, w, h) || [w / 2, h / 2]; const file = name.replace(/\//g, '_') + '.png'; P.save(cv, path.join(OUT, file)); items.push({ name, file, origin: [o[0] * S, o[1] * S], data }); }
function drop(g, x, y, r, col) { g.save(); g.translate(0, 2); g.beginPath(); g.moveTo(x, y + r * 2.1); g.quadraticCurveTo(x - r * 1.25, y + r * 0.6, x - r, y); g.arc(x, y, r, Math.PI, 0); g.quadraticCurveTo(x + r * 1.25, y + r * 0.6, x, y + r * 2.1); g.closePath(); g.fillStyle = 'rgba(51,32,58,0.3)'; g.fill(); g.restore(); g.beginPath(); g.moveTo(x, y + r * 2.1); g.quadraticCurveTo(x - r * 1.25, y + r * 0.6, x - r, y); g.arc(x, y, r, Math.PI, 0); g.quadraticCurveTo(x + r * 1.25, y + r * 0.6, x, y + r * 2.1); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke(); g.beginPath(); g.arc(x, y, r * 0.62, 0, 7); g.fillStyle = '#fffaec'; g.fill(); g.lineWidth = 1; g.stroke(); }
function build() {
  fs.mkdirSync(OUT, { recursive: true }); P.save(chart(), path.join(OUT, 'chart.png')); items.push({ name: 'chart', file: 'chart.png', origin: [0, 0], data: { keep: true, note: 'the whole screen, 412 by 915; its origin is its top left' } });
  // the pins: their point is their origin
  pin('pin/harbour', 40, 52, (g) => { drop(g, 20, 18, 15, RED); g.fillStyle = INK; g.fillRect(14, 16, 12, 8); g.beginPath(); g.moveTo(12, 16.5); g.lineTo(20, 9); g.lineTo(28, 16.5); g.closePath(); g.fill(); return [20, 51]; });
  pin('pin/island', 40, 52, (g) => { drop(g, 20, 18, 15, '#4cbf68'); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 26); g.quadraticCurveTo(19, 19, 21, 14); g.stroke(); for (const a of [-2.6, -1.9, -1.2, -0.5]) { g.beginPath(); g.moveTo(21, 14); g.quadraticCurveTo(21 + Math.cos(a) * 5, 14 + Math.sin(a) * 6, 21 + Math.cos(a) * 9, 14 + Math.sin(a) * 4 + 3); g.stroke(); } return [20, 51]; });
  pin('pin/swamp', 40, 52, (g) => { drop(g, 20, 18, 15, '#3a9d8c'); g.strokeStyle = INK; g.lineWidth = 1.6; for (const [x, top] of [[16, 11], [21, 8], [25.5, 13]]) { g.beginPath(); g.moveTo(x, 27); g.lineTo(x, top + 5); g.stroke(); g.beginPath(); g.ellipse(x, top + 3, 2.1, 4.2, 0, 0, 7); g.fillStyle = '#7a4a2a'; g.fill(); g.lineWidth = 1; g.stroke(); g.lineWidth = 1.6; } return [20, 51]; }, { note: 'for the swamp island: three cattails' });
  pin('pin/boss', 40, 52, (g) => { drop(g, 20, 18, 15, '#b666f2'); g.fillStyle = INK; g.beginPath(); g.arc(20, 17, 6, 0, 7); g.fill(); g.fillRect(16.5, 21, 7, 4); g.fillStyle = '#fffaec'; g.beginPath(); g.arc(17.6, 16.5, 1.7, 0, 7); g.arc(22.4, 16.5, 1.7, 0, 7); g.fill(); return [20, 51]; }, { note: 'for a place with a boss up; not used in chapter 1' });
  pin('pin/locked', 40, 52, (g) => { drop(g, 20, 18, 15, '#a99a86'); P.label(g, '?', 20, 18.5, 16, INK, { align: 'center', font: 'Georgia' }); return [20, 51]; });
  pin('mark/here', 44, 30, (g) => { g.beginPath(); g.ellipse(22, 15, 19, 11, 0, 0, 7); g.strokeStyle = RED; g.lineWidth = 2.6; g.stroke(); g.beginPath(); g.ellipse(22, 15, 13, 7, 0, 0, 7); g.strokeStyle = '#fffaec'; g.lineWidth = 1.4; g.stroke(); }, { soft: true, note: 'round the place he is at; let it breathe' });
  pin('mark/route', 10, 10, (g) => { g.beginPath(); g.arc(5, 5, 3, 0, 7); g.fillStyle = RED; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }, { note: 'a dot of the dotted line between two places' });
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ px: S, items }, null, 1));
  // the way between the two places: from Crab Cay's dock round its west side and up to Mire Cay's jetty, as dots
  const way = [[261, 566], [222, 560], [204, 500], [214, 430], [262, 376], [318, 346], [329, 336]], route = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12 * (way.length - 1), k = Math.min(way.length - 2, Math.floor(t)), f = t - k; route.push([Math.round(way[k][0] + (way[k + 1][0] - way[k][0]) * f), Math.round(way[k][1] + (way[k + 1][1] - way[k][1]) * f)]); }
  fs.writeFileSync(path.join(P.ROOT, 'work/chart/chart-places.json'), JSON.stringify({ size: { w: W, h: H }, places: Object.assign({}, PLACES, { 'island-1': Object.assign({ note: 'the old name of crab-cay: the same place' }, PLACES['crab-cay']) }), unknown: UNKNOWN.map(u => ({ x: u[0], y: u[1] })), route, title: { x: W / 2, y: 46 }, sail: { x: W / 2, y: H - 64 } }, null, 1));
  console.log('drew the chart and', items.length - 1, 'pins');
}
if (require.main === module) build();
module.exports = { PLACES };
