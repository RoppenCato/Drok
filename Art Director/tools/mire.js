// mire.js: the second island, a swamp: its ground as ONE painting at half a pixel a design unit, and where its props
// stand (Leonard, AD, 2026-11-20; the layout and the look are mine). Robin, 2026-11-20: "have the GD make a second island
// to go to with some of the new mobs. That island needs to look different and have its own theme. A swamp maybe."
// The idea: a drowned island. Mud and moss between pools of dark green water, crossed on plank bridges, under mangroves
// hung with moss; old mossy stones in the north. Where Crab Cay is yellow sand, bright grass and blue sea, this is mud,
// deep moss and teal water, with pink lotus, red and glowing toadstools and lantern light for its bright points.
// Three grounds, south to north: the reed banks (mud and reeds), the mangrove wood (moss), the old stones (a ruin's floor).
// The form is Crab Cay's (tools/isle.js), with one new thing: `pools`, the water inside the land, where he cannot stand.
// The camp at the landing is its safe part, `home`, with the trader's boat as its stall and the trader in `people`.
// Writes into work/mire-cay/: ground.png, place.json, look.jpg and map.jpg.
//   node tools/mire.js
const P = require('./paint.js'); const fs = require('fs'); const path = require('path'); const I = require('./isle.js');
const { curve, inside, box, poly, edge, seg, fill, ring, blob, inset, walkCheck } = I;
const C = { deep: '#1c7d86', sea: '#2a9a98', shallow: '#56b9a6', foam: '#d6f2e2', mud: '#a48a5e', mudHi: '#b39a6c', mudLo: '#8f774f', wet: '#7d6844', moss: '#5fa35c', mossHi: '#72b465', mossLo: '#4a8a52',
  stone: '#9097aa', stoneHi: '#a4abbc', stoneLo: '#767c92', bog: '#3a8d86', bogIn: '#2c7876', bogRim: '#6b5639', pad: '#84c95c', padLo: '#5fa84e', lotus: '#ff8ab0', path: '#c6ac7c', pathLo: '#8f774f', plank: ['#b08a62', '#bd976e', '#7a5a40', '#5f4634'] };
const NAME = 'mire-cay';
const L = { w: 2400, h: 3200, px: 0.5, seed: 23,
  land: [[1200, 2960], [1560, 2930], [1880, 2800], [2100, 2560], [2200, 2260], [2160, 1960], [2230, 1660], [2180, 1360], [2240, 1060], [2140, 780], [1940, 540], [1680, 380], [1380, 300], [1080, 330], [800, 290], [560, 400], [360, 600], [250, 880],
    [280, 1180], [200, 1480], [260, 1780], [190, 2080], [270, 2380], [420, 2640], [640, 2840], [900, 2940]],
  wood: [[330, 2120], [700, 2160], [1100, 2130], [1500, 2170], [1900, 2130], [2110, 2060], [2150, 1700], [2120, 1380], [1900, 1300], [1500, 1330], [1150, 1290], [800, 1330], [450, 1300], [300, 1400], [270, 1750]],
  stones: [[420, 1150], [800, 1120], [1150, 1160], [1500, 1130], [1900, 1150], [2100, 1050], [2080, 800], [1900, 580], [1650, 440], [1380, 370], [1080, 400], [800, 360], [580, 460], [410, 640], [330, 900]],
  pools: [[[520, 2300], [760, 2240], [900, 2380], [860, 2560], [640, 2620], [470, 2500]], [[1540, 2360], [1800, 2300], [1940, 2440], [1860, 2620], [1620, 2640], [1500, 2520]],
    [[330, 1900], [620, 1840], [900, 1900], [1040, 2000], [900, 2090], [600, 2060], [360, 2040]], [[1380, 1960], [1640, 1880], [1940, 1900], [2120, 1990], [1960, 2080], [1660, 2070], [1420, 2060]],
    [[700, 1480], [940, 1400], [1100, 1500], [1060, 1680], [840, 1720], [680, 1620]], [[1500, 1420], [1760, 1380], [1900, 1520], [1820, 1680], [1600, 1700], [1470, 1580]],
    [[420, 1180], [760, 1140], [1000, 1200], [960, 1300], [700, 1320], [440, 1290]], [[1400, 1200], [1700, 1150], [2000, 1190], [2060, 1280], [1760, 1320], [1440, 1300]],
    [[1060, 700], [1260, 660], [1380, 760], [1320, 880], [1120, 900], [1020, 800]]],
  // plank bridges over the water: each an outline he can stand on
  decks: [{ sea: 1, pts: [[606, 1800], [690, 1800], [690, 2100], [606, 2100]] }, { sea: 1, pts: [[1690, 1850], [1774, 1850], [1774, 2100], [1690, 2100]] }, { sea: 1, pts: [[690, 1110], [774, 1110], [774, 1350], [690, 1350]] }, { sea: 1, pts: [[1670, 1120], [1754, 1120], [1754, 1350], [1670, 1350]] }],
  // mud tracks: the way north from the landing, and the ways to the bridges
  paths: [[[1200, 2900], [1190, 2650], [1215, 2380], [1200, 2100], [1215, 1800], [1200, 1500], [1185, 1240], [1190, 1010]], [[1200, 2170], [920, 2180], [648, 2130]], [[648, 1790], [840, 1770], [1205, 1760]], [[1210, 2190], [1480, 2200], [1732, 2130]], [[1732, 1840], [1500, 1790], [1215, 1790]],
    [[1195, 1360], [960, 1380], [732, 1370]], [[732, 1100], [900, 1040], [1188, 1020]], [[1200, 1370], [1480, 1390], [1712, 1370]], [[1712, 1110], [1500, 1050], [1195, 1030]], [[1190, 1010], [1500, 760], [1840, 640]]],
  dock: [1200, 2990], dockN: 2, arrive: [1200, 2930], chest: [1900, 610], camp: [1200, 2790, 230],
  // the camp at the landing, the island's safe part (Victor, GD, 2026-11-20: "the camp at the landing has a stall (a trader in a boat or a hut,
  // yours), and it is the safe part, as the town is"): the trader's boat under its awning is the stall, a reed hut on stilts, a fire
  stall: [1076, 2806], campProps: [['stall', 1076, 2806, [130, 44]], ['hut', 1345, 2776, 36], ['fire', 1282, 2868, 11], ['lantern', 1150, 2760, 5]], people: [['trader', 1152, 2818, 'se', 'beside his boat: the shop']],
  zones: { 'hop-toad': [[330, 2180, 780, 580, 6], [1400, 2180, 700, 560, 6]], 'plum-viper': [[300, 1340, 820, 470, 7], [1300, 1340, 820, 500, 7]], 'frill-lizard': [[350, 420, 700, 660, 8], [1400, 420, 700, 680, 8]] },
};
const plank = (g, d) => {      // a bridge of planks over water: boards lying east to west, a side, a shadow on the water
  const sh = poly(d.pts), b = box(d.pts), [top, top2, seam, side] = C.plank;
  g.save(); g.translate(8, 18); sh(g); g.fillStyle = 'rgba(10,50,60,0.3)'; g.fill(); g.restore(); g.save(); g.translate(0, 11); fill(g, sh, side); g.restore();
  fill(g, sh, top); g.save(); sh(g); g.clip(); let row = 0; for (let y = b[1]; y < b[1] + b[3]; y += 15, row++) if (row % 3 === 1) { g.fillStyle = top2; g.fillRect(b[0], y, b[2], 15); }
  g.strokeStyle = seam; g.lineWidth = 2.6; for (let y = b[1] + 15; y < b[1] + b[3]; y += 15) { g.beginPath(); g.moveTo(b[0], y); g.lineTo(b[0] + b[2], y); g.stroke(); } g.restore();
};
function paint() {
  const r = P.rng(L.seed), px = L.px, cv = P.createCanvas(Math.round(L.w * px), Math.round(L.h * px)), g = cv.getContext('2d'); g.scale(px, px);
  const landP = curve(L.land), land = poly(landP), woodP = curve(L.wood), stonesP = curve(L.stones, 0.55), pools = L.pools.map(q => curve(q));
  // the sea: murky and green, two lighter rings round the land, a thin pale edge
  g.fillStyle = C.deep; g.fillRect(0, 0, L.w, L.h);
  for (let i = 0; i < L.w * L.h / 46000; i++) { g.fillStyle = 'rgba(214,242,226,0.14)'; g.beginPath(); g.ellipse(r() * L.w, r() * L.h, 16 + r() * 26, 2.4, 0, 0, 7); g.fill(); }
  ring(g, land, C.sea, 190); ring(g, land, C.shallow, 84); ring(g, land, C.foam, 9);
  // the land: mud, darker and wet at the water's edge, its own tones; patches of moss on the banks in the south
  fill(g, land, C.mud); g.save(); land(g); g.clip(); ring(g, land, C.wet, 56);
  for (let i = 0; i < L.w * L.h / 30000; i++) fill(g, blob(r() * L.w, r() * L.h, 34 + r() * 70, 12 + r() * 20, 9, 0.35, r), i % 3 ? C.mudHi : C.mudLo);
  ring(g, land, C.wet, 40);
  for (let i = 0; i < 70; i++) { const x = 200 + r() * 2000, y = 2130 + r() * 800, rx = 50 + r() * 90, ry = 24 + r() * 40; if (!inside(landP, x, y) || edge(landP, x, y) < 70) continue; fill(g, blob(x, y + 4, rx, ry, 10, 0.35, P.rng(i + 5)), C.mossLo); fill(g, blob(x, y, rx, ry, 10, 0.35, P.rng(i + 5)), C.moss); if (i % 2) fill(g, blob(x - rx * 0.2, y - ry * 0.2, rx * 0.5, ry * 0.45, 8, 0.3, r), C.mossHi); }
  // the mangrove wood: deep moss, with its own lights and darks and a little bare mud
  { const sh = poly(woodP), b = box(woodP); fill(g, sh, C.mossLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.moss); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 22000; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 28 + r() * 60, 12 + r() * 22, 9, 0.35, r), i % 2 ? C.mossHi : C.mossLo);
    for (let i = 0; i < 22; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 26 + r() * 40, 10 + r() * 14, 8, 0.35, r), C.mudLo); g.restore(); }
  // the old stones: a ruin's floor of big uneven slabs, moss in the joints and creeping in from the edge
  { const sh = poly(stonesP), b = box(stonesP); fill(g, sh, C.stoneLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.stone); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 15000; i++) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3], s = 34 + r() * 50, pts = []; for (let k = 0; k < 5; k++) { const t = k / 5 * 6.283 + r() * 0.5; pts.push([x + Math.cos(t) * s * (0.75 + r() * 0.4), y + Math.sin(t) * s * 0.58 * (0.75 + r() * 0.4)]); } fill(g, poly(pts), i % 2 ? C.stoneHi : C.stoneLo); }
    for (let i = 0; i < b[2] * b[3] / 26000; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 18 + r() * 36, 8 + r() * 14, 8, 0.4, r), i % 3 ? C.moss : C.mossHi);
    ring(g, sh, C.moss, 34); g.restore(); }
  // the ways: trodden earth, never a drawn road (Robin, 2026-11-20: "Looks good except the roads. They clip over each other and
  // doesnt look natural. I think you can get a lot of inapiration from my survival game project"). From the Survival game's
  // village ways (its village.js): a way is dabs of bare earth that wander a little, wider where more feet go, paler down the
  // middle, with a ragged rim and no line round it; ways join and share one ground, and where several meet the ground is a worn
  // apron. So every way is laid in the same three passes, all the rims first, then all the earth, then all the pale middles: no
  // way lies on another.
  { const wr = P.rng(L.seed + 7), ways = L.paths.map((p, n) => { const q = curve(p.concat(p.slice(1, -1).reverse()), 0.5, 40).slice(0, (p.length - 1) * 40 + 1), ph = wr() * 6.283, out = [];
      for (let k = 0; k < q.length; k++) { const t = k / (q.length - 1), a = q[Math.max(0, k - 1)], b = q[Math.min(q.length - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, end = Math.min(1, Math.min(t, 1 - t) * 6), off = (Math.sin(t * 9 + ph) * 9 + Math.sin(t * 23 + ph * 2) * 4) * end;      // it wanders, but not where it meets a bridge or another way
        out.push([q[k][0] - dy / d * off, q[k][1] + dx / d * off, (n === 0 ? 21 : 16) * (1 + 0.16 * Math.sin(t * 13 + ph * 3))]); }
      return out; });
    const aprons = []; for (const w of ways) for (const e of [w[0], w[w.length - 1]]) aprons.push([e[0], e[1], 30 + wr() * 8]);
    const dab = (x, y, rx, ry, col, al = 1) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.globalAlpha = 1; };
    for (const w of ways) for (const [x, y, r0] of w) { dab(x + (wr() - 0.5) * 5, y + 3 + (wr() - 0.5) * 4, r0 + 5 + wr() * 4, (r0 + 5) * 0.8, C.pathLo, 0.5); if (wr() < 0.07) dab(x + (wr() - 0.5) * (r0 * 2.6), y + (wr() - 0.5) * (r0 * 2), 5 + wr() * 6, 3 + wr() * 3, C.pathLo, 0.45); }      // the rim: darker, ragged, with stray patches
    for (const [x, y, r0] of aprons) fill(g, blob(x, y + 3, r0 + 6, (r0 + 6) * 0.72, 10, 0.3, wr), 'rgba(143,119,79,0.5)');
    for (const w of ways) for (const [x, y, r0] of w) dab(x + (wr() - 0.5) * 4, y + (wr() - 0.5) * 3, r0, r0 * 0.8, C.path);      // the earth
    for (const [x, y, r0] of aprons) fill(g, blob(x, y, r0, r0 * 0.72, 10, 0.3, wr), C.path);
    for (const w of ways) for (let k = 0; k < w.length; k += 2) { const [x, y, r0] = w[k]; dab(x + (wr() - 0.5) * 5, y - 1 + (wr() - 0.5) * 3, r0 * 0.5, r0 * 0.32, '#d6c090', 0.35); }      // paler down the middle, where the feet fall
    for (const w of ways) for (const [x, y, r0] of w) { if (wr() < 0.04) fill(g, blob(x + (wr() < 0.5 ? -1 : 1) * r0 * (0.7 + wr() * 0.4), y + (wr() - 0.5) * 8, 6 + wr() * 7, 3 + wr() * 3, 7, 0.4, wr), wr() < 0.5 ? C.moss : C.mossLo); if (wr() < 0.03) dab(x + (wr() - 0.5) * r0 * 1.4, y + (wr() - 0.5) * r0, 1.8, 1.3, C.wet, 0.8); } }      // moss creeping in from the side, a pebble
  // the pools: a dark rim of wet mud, green water, deeper toward the far bank; lily pads lying flat, some with a lotus
  pools.forEach((ip, n) => { const il = poly(ip), b = box(ip), rr = P.rng(300 + n); ring(g, il, C.bogRim, 20); fill(g, il, C.bog); g.save(); il(g); g.clip(); fill(g, poly(ip.map(([x, y]) => [x, y - 34])), C.bogIn);
    for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(190,236,220,0.5)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(b[0] + rr() * b[2], b[1] + rr() * b[3], 12 + rr() * 16, 3 + rr() * 2, 0, 0.3, 2.8); g.stroke(); }
    const pads = []; let tries = 0;
    while (pads.length < Math.round(b[2] * b[3] / 5200) && tries++ < 600) { const x = b[0] + rr() * b[2], y = b[1] + rr() * b[3], s = 9 + rr() * 7; if (!inside(ip, x, y) || edge(ip, x, y) < s + 8 || pads.some(q => Math.hypot(q[0] - x, (q[1] - y) * 1.5) < q[2] + s + 3) || L.decks.some(d => { const k = box(d.pts); return x > k[0] - 24 && x < k[0] + k[2] + 30 && y > k[1] - 10 && y < k[1] + k[3] + 30; })) continue; pads.push([x, y, s]); }
    pads.forEach(([x, y, s], i) => { const a = rr() * 6.283; g.fillStyle = C.padLo; g.beginPath(); g.ellipse(x, y + 2, s, s * 0.62, 0, 0, 7); g.fill(); g.fillStyle = C.pad; g.beginPath(); g.moveTo(x, y); g.ellipse(x, y, s, s * 0.62, 0, a + 0.35, a + 6.283 - 0.35); g.closePath(); g.fill();
      if (i % 3 === 0) { for (let k = 0; k < 5; k++) { const t = k / 5 * 6.283; g.fillStyle = C.lotus; g.beginPath(); g.ellipse(x + Math.cos(t) * 4.2, y - 3 + Math.sin(t) * 3, 3.6, 2.8, 0, 0, 7); g.fill(); } g.fillStyle = '#fff3c8'; g.beginPath(); g.arc(x, y - 3, 2.4, 0, 7); g.fill(); } });
    g.restore(); });
  g.restore();
  for (const d of L.decks) plank(g, d);
  return cv;
}
// where the props stand: clumps, each thing with its own place; nothing on a way, a bridge, in the water, at the landing or by the chest
function place() {
  const r = P.rng(L.seed + 100), props = [], solid = [], landP = curve(L.land), woodP = curve(L.wood), stonesP = curve(L.stones, 0.55), pools = L.pools.map(q => curve(q));
  const way = (x, y) => Math.min(...L.paths.map(p => { let d = 1e9; for (let i = 1; i < p.length; i++) d = Math.min(d, seg(p[i - 1], p[i], x, y)); return d; }));
  const wet = (x, y, d = 30) => pools.some(q => inside(q, x, y) || edge(q, x, y) < d), onDeck = (x, y, d = 40) => L.decks.some(k => { const b = box(k.pts); return x > b[0] - d && x < b[0] + b[2] + d && y > b[1] - d && y < b[1] + b[3] + d; });
  const free = (x, y, d = 50) => inside(landP, x, y) && edge(landP, x, y) > 44 && !wet(x, y) && !onDeck(x, y) && way(x, y) > d && Math.hypot(L.camp[0] - x, L.camp[1] - y) > L.camp[2] && Math.hypot(L.chest[0] - x, L.chest[1] - y) > 90;
  const put = (n, x, y, block) => { props.push({ name: n, x: Math.round(x), y: Math.round(y) }); if (block) solid.push({ x: Math.round(x), y: Math.round(y - block * 0.3), r: block }); };
  const near = (x, y, d) => props.some(p => Math.hypot(p.x - x, (p.y - y) * 1.5) < d);
  const clump = (cx, cy, n, spread, pick, ok = () => true) => { let tries = 0; for (let i = 0; i < n && tries < n * 12; tries++) { const a = r() * 6.283, d = Math.sqrt(r()) * spread, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7; if (!free(x, y) || !ok(x, y) || near(x, y, 34)) continue; const [nm, bl] = pick(); put(nm, x, y, bl); i++; } };
  const spots = (pts, n, gap, ok = () => true) => { const b = box(pts), out = []; let tries = 0; while (out.length < n && tries++ < n * 60) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3]; if (!inside(pts, x, y) || !ok(x, y) || out.some(q => Math.hypot(q[0] - x, q[1] - y) < gap)) continue; out.push([x, y]); } return out; };
  const of = list => () => list[Math.floor(r() * list.length)];
  const trees = of([['mangrove-a', 20], ['mangrove-b', 18], ['mangrove-c', 15], ['mangrove-a', 20], ['mangrove-b', 18], ['fern-a', 0], ['fern-b', 0], ['shroom-red', 0], ['log', 16], ['stump', 14], ['mossrock-b', 9], ['reeds-c', 0]]);
  const bank = of([['reeds-a', 0], ['reeds-b', 0], ['reeds-c', 0], ['reeds-a', 0], ['reeds-b', 0], ['mangrove-c', 15], ['mossrock-a', 14], ['log', 16], ['deadtree', 10], ['shroom-red', 0], ['fern-a', 0]]);
  const ruin = of([['mossrock-a', 14], ['mossrock-b', 9], ['mossrock-c', 24], ['deadtree', 10], ['fern-b', 0], ['shroom-glow', 0], ['shroom-glow', 0], ['reeds-c', 0], ['mossrock-b', 9]]);
  const inWood = (x, y) => inside(woodP, x, y), inStones = (x, y) => inside(stonesP, x, y), onBank = (x, y) => !inWood(x, y) && !inStones(x, y);
  // the wood: thick clumps of mangroves with clearings between them; thicker along its edges
  for (const [x, y] of spots(woodP, 30, 210, (x, y) => inWood(x, y) && way(x, y) > 100)) clump(x, y, 4 + Math.floor(r() * 4), 110 + r() * 30, trees, inWood);
  for (const [x, y] of spots(woodP, 16, 170, (x, y) => inWood(x, y) && edge(woodP, x, y) < 90 && way(x, y) > 90)) clump(x, y, 3, 70, trees);
  // the banks: reeds in clumps, a small mangrove, a log, a dead tree
  for (const [x, y] of spots(landP, 40, 200, (x, y) => onBank(x, y) && free(x, y, 80))) clump(x, y, 3 + Math.floor(r() * 3), 70, bank, onBank);
  // the old stones: mossy stones, dead trees, toadstools that glow
  for (const [x, y] of spots(stonesP, 26, 200, (x, y) => inStones(x, y) && way(x, y) > 90)) clump(x, y, 3 + Math.floor(r() * 3), 80, ruin, inStones);
  // reeds round every pool, in runs with gaps, never before a bridge
  pools.forEach(ip => { const c = box(ip), cx = c[0] + c[2] / 2, cy = c[1] + c[3] / 2; for (let i = 0; i < ip.length; i += 2) { if (r() < 0.42) continue; const [x, y] = ip[i], d = Math.hypot(x - cx, y - cy) || 1, o = 14 + r() * 12, px = x + (x - cx) / d * o, py = y + (y - cy) / d * o; if (!inside(landP, px, py) || onDeck(px, py, 26) || way(px, py) < 34 || near(px, py, 22) || pools.some(q => inside(q, px, py))) continue; put(['reeds-a', 'reeds-b', 'reeds-c', 'reeds-b'][Math.floor(r() * 4)], px, py, 0); } });
  // lanterns along the way north, on one side then the other
  { const p = L.paths[0]; let k = 0; for (let i = 1; i < p.length; i++) for (const t of [0.25, 0.75]) { const x = p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t + (k++ % 2 ? 40 : -40), y = p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t; if (!wet(x, y, 20) && !onDeck(x, y, 20) && !L.people.some(q => Math.hypot(q[1] - x, q[2] - y) < 70)) put('lantern', x, y, 5); } }      // never one before a person
  // the landing: the dock into the sea, a boat, crates and barrels; lanterns at the bridges' ends
  put('barrel', L.dock[0] - 62, L.dock[1] - 70, 10); put('crate', L.dock[0] - 92, L.dock[1] - 54, 10); put('crate', L.dock[0] + 78, L.dock[1] - 66, 10); put('boat', L.dock[0] + 200, L.dock[1] - 30, 22);
  for (const d of L.decks) { const b = box(d.pts); put('lantern', b[0] - 14, b[1] + b[3] + 6, 5); put('lantern', b[0] + b[2] + 14, b[1] - 4, 5); }
  for (const [n, x, y, f] of L.campProps) { props.push({ name: n, x, y }); if (Array.isArray(f)) solid.push({ x: x - f[0] / 2, y: y - f[1] + 8, w: f[0], h: f[1] }); else solid.push({ x, y: y - 3, r: f }); }
  for (let i = 0; i < L.dockN; i++) put('dock', L.dock[0], L.dock[1] + i * 56 + 56, 0);
  put('chest/closed', L.chest[0], L.chest[1], 12);
  props.sort((a, b) => a.y - b.y || a.x - b.x);
  return { props, solid };
}
async function make() {
  const out = path.join(P.ROOT, 'work', NAME), cv = paint(), { props, solid } = place(), D = require('./dress.js'); P.save(cv, path.join(out, 'ground.png'));
  const south = [[200, 2120], [2230, 2120], [2230, 3000], [200, 3000]], gr = [['banks', 'The reed banks', [6, 6], south], ['wood', 'The mangrove wood', [7, 7], L.wood], ['stones', 'The old stones', [8, 8], L.stones]];
  const grounds = gr.map(([id, name, levels, o]) => ({ id, name, levels, box: box(id === 'banks' ? o : curve(o)), outline: o }));
  const J = { name: NAME, size: { w: L.w, h: L.h }, ground: { file: 'ground.png', px: L.px, note: 'HALF a pixel a design unit: draw it at four times its size' }, land: L.land, walk: inset(curve(L.land, 0.6, 4), 24),
    pools: L.pools.map(q => curve(q, 0.6, 4).map(([x, y]) => [Math.round(x), Math.round(y)])), paths: L.paths, dock: L.dock, arrive: L.arrive, chest: L.chest, zones: L.zones, grounds, props, solid, decks: L.decks.map(d => ({ pts: d.pts, sea: true })),
    home: { box: [L.camp[0] - L.camp[2], L.camp[1] - L.camp[2], L.camp[2] * 2, L.camp[2] * 2], outline: Array.from({ length: 10 }, (_, i) => [Math.round(L.camp[0] + Math.cos(i / 10 * 6.283) * L.camp[2]), Math.round(L.camp[1] + Math.sin(i / 10 * 6.283) * L.camp[2] * 0.8)]), wake: [L.camp[0], L.camp[1] + 40], stall: L.stall, note: 'the camp at the landing: no monster comes in; he wakes at wake; the stall (the trader\'s boat) stands at stall' },
    people: L.people.map(([who, x, y, facing, note]) => ({ who, x, y, facing, note })) };
  fs.writeFileSync(path.join(out, 'place.json'), JSON.stringify(J)); walkCheck(J);
  // the studio's looks: the island with its props at a quarter size; the same with the names drawn on it
  const adir = [out, path.join(P.ROOT, 'out', NAME)].find(d => fs.existsSync(path.join(d, 'island.json')));
  if (!adir) { console.log('painted', NAME, 'but there is no props atlas yet for the looks'); return; }
  const isl = await D.atlas(adir, 'island'), k = 0.25, pv = P.createCanvas(L.w * k, L.h * k), g = pv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.scale(k, k); g.drawImage(cv, 0, 0, L.w, L.h);
  for (const p of props) { const f = isl.j.frames[p.name]; if (!f) { console.log('!! no picture for', p.name); continue; } if (!(isl.j.items[p.name] || {}).shade) { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(p.x + 5, p.y + 1, f.frame.w * 0.16, f.frame.w * 0.055, 0, 0, 7); g.fill(); g.restore(); } g.save(); g.translate(p.x, p.y); g.scale(0.5, 0.5); D.pic(g, isl, p.name); g.restore(); }
  if (fs.existsSync(path.join(adir, 'folk.json'))) { const folk = await D.atlas(adir, 'folk'); for (const q of J.people) { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(q.x + 3, q.y + 1, 13, 5, 0, 0, 7); g.fill(); g.restore(); D.figure(g, folk, { action: q.who, facing: q.facing, i: 0 }, q.x, q.y, 0.5); } }
  P.save(pv, path.join(out, 'look.jpg'));
  const tag = (t, x, y, s = 64, col = '#ffffff') => P.label(g, t, x, y, s, col, { align: 'center', stroke: '#33203a', strokeW: s / 5, font: 'Trebuchet MS' });
  g.lineWidth = 8; g.setLineDash([36, 24]); for (const [kind, list] of Object.entries(L.zones)) for (const z of list) { g.strokeStyle = { 'hop-toad': '#ffd640', 'plum-viper': '#b98cff', 'frill-lizard': '#ff9a3a' }[kind]; g.strokeRect(z[0], z[1], z[2], z[3]); tag(`${kind}, level ${z[4]}`, z[0] + z[2] / 2, z[1] + 60, 52); }
  g.setLineDash([]); g.strokeStyle = '#33203a'; g.lineWidth = 8; g.fillStyle = '#ffd640'; g.beginPath(); g.arc(L.chest[0], L.chest[1], 30, 0, 7); g.fill(); g.stroke(); tag('the chest', L.chest[0], L.chest[1] + 80, 56);
  for (const q of grounds) tag(q.name, q.box[0] + q.box[2] / 2, q.id === 'banks' ? 2760 : q.box[1] + q.box[3] / 2, 96);
  g.strokeStyle = '#ffd640'; g.lineWidth = 10; g.setLineDash([30, 18]); poly(J.home.outline)(g); g.stroke(); g.setLineDash([]); tag('the landing', L.camp[0], L.camp[1] - 150, 60, '#ffd640');
  g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(260, 2250, 412, 915); tag('one screen', 466, 3210 - 80, 48);
  P.save(pv, path.join(out, 'map.jpg'));
  console.log('painted', NAME, `${L.w}x${L.h} units as ${cv.width}x${cv.height} px (${(cv.width * cv.height * 4 / 1048576).toFixed(1)} MB decoded),`, props.length, 'props,', solid.length, 'in the way');
}
if (require.main === module) make().catch(e => { console.error(e); process.exit(1); });
module.exports = { L, C, paint, place, make };
