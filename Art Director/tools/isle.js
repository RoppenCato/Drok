// isle.js: a big island's ground as ONE painting at half a pixel a design unit, and where its props stand
// (Leonard, AD, 2026-11-20; the layout and the look are mine). Robin, 2026-11-20: "Both. Big islands with several biomes
// each, and the chart to sail between them." Victor, GD asked for Crab Cay grown to about 2800 by 4200 units with four
// grounds, and said the ground cannot be one painting at one pixel a unit (47 MB). At HALF a pixel a unit it is 11.8 MB,
// less than the small island's ground, and on a phone it looks the same (work/world/ground-test.js): the ground is flat
// colour with no line, so it has no small detail to lose. The game draws it at four times instead of two.
// The hand is tools/ground.js's: sea in three steps with a white edge of foam, wet sand, sand, grass, rock. New: tide
// flats (wet sand with pools and coral), several grounds on one island, each with its outline in place.json, and a town
// moved onto the island from its own place (townOf): its square, its grass, its houses and people, and `home` round it.
// Writes into work/<name>/: ground.png, place.json, look.jpg (the island with its props at a quarter size) and map.jpg
// (the same with the grounds, the zones and the ways drawn on it).
//   node tools/isle.js crab-cay
const P = require('./paint.js'); const fs = require('fs'); const path = require('path'); const { C: C0 } = require('./ground.js');
const C = Object.assign({}, C0, { reef: '#ecdcaa', reefLo: '#dcc98f', pool: '#52d6d8', poolIn: '#30b8d6', coralA: '#ff6a94', coralB: '#f6883a', coralC: '#ffd640' });
// the closed curve through the corner points (ground.js's curve, tension k), as many short straight pieces
const curve = (pts, k = 0.6, n = 8) => { const out = [], m = pts.length; for (let i = 0; i < m; i++) { const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m], a = [p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3], b = [p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3];
  for (let s = 0; s < n; s++) { const t = s / n, u = 1 - t; out.push([u * u * u * p1[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * p2[1]]); } } return out; };
const poly = pts => g => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
const inside = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const area = pts => { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]); return a / 2; };
const edge = (pts, x, y) => { let d = 1e9; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) d = Math.min(d, seg(pts[j], pts[i], x, y)); return d; };     // how far a point is from an outline
const seg = (a, b, x, y) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(a[0] + dx * t - x, a[1] + dy * t - y); };
const box = pts => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x = Math.min(...xs), y = Math.min(...ys); return [Math.round(x), Math.round(y), Math.round(Math.max(...xs) - x), Math.round(Math.max(...ys) - y)]; };
const fill = (g, shape, col) => { shape(g); g.fillStyle = col; g.fill(); };
const ring = (g, shape, col, w) => { shape(g); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };
const blob = (x, y, rx, ry, n, k, r) => { const pts = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, w = 1 + (r() - 0.5) * k; pts.push([x + Math.cos(t) * rx * w, y + Math.sin(t) * ry * w]); } return poly(curve(pts, 0.5, 4)); };

// a town written out whole: its pieces by name and place; what is in the way comes from each piece's foot (a box: width
// and depth in units, behind and beside its origin; or a circle)
const FOOT = { 'cabin-a': [146, 70], 'cabin-b': [130, 68], 'cabin-c': [180, 78], stall: [108, 44], rack: [70, 10], 'tower-thatch': 30, lamp: 5, sign: 6, barrel: 10, crate: 10, boat: 22, post: 6, 'palm-a': 12, 'palm-b': 12, 'palm-c': 10, 'bush-b': 16 };
function townLayout(o) { const props = o.props.map(([name, x, y]) => ({ name, x, y })), solid = []; for (const q of props) { const f = FOOT[q.name]; if (Array.isArray(f)) solid.push({ x: q.x - f[0] / 2, y: q.y - f[1] + 8, w: f[0], h: f[1] }); else if (f) solid.push({ x: q.x, y: q.y - 3, r: f }); if (q.name === 'bunting') solid.push({ x: q.x - 84, y: q.y - 2, r: 4 }, { x: q.x + 84, y: q.y - 2, r: 4 }); }
  return { dock: o.dock, stall: o.stall, deckCol: o.deckCol, decks: o.decks, paths: o.paths, props, solid, people: o.people.map(([who, x, y, facing, note]) => ({ who, x, y, facing, note })) }; }
const ISLES = {
  // Crab Cay grown big, the starter island (Robin, 2026-11-20: "Make the starter island a pirate town, and the other part
  // of the island beginner friendly with low level mobs"). He lands in the south, IN the town. The town is the one on
  // stilts (Robin, 2026-11-20, of three: "3, but the buildings need to look nicer and have some depth to them. Theres also
  // no contrast to the floor so it all kinda melts together"; of the changed still: "Yes"): a deck in a little bay cut
  // into the shore, three painted huts on their own platforms, a thatched lookout, a stall, a fish rack, two jetties to
  // the beach either side and a walk of planks north to the grove. The beach lies round the whole island, with tide
  // flats on its east side; the grove fills the middle; the cove is the rock across the north, with its pool in the west
  // and the chest at its far east end.
  'crab-cay': { w: 2800, h: 4200, px: 0.5, seed: 11,
    land: [[1400, 3770], [1830, 3890], [2150, 3880], [2420, 3690], [2560, 3420], [2600, 3120], [2550, 2800], [2620, 2480], [2640, 2150], [2560, 1850], [2440, 1640], [2500, 1400], [2560, 1150], [2500, 880], [2340, 650], [2080, 500], [1780, 420], [1480, 390], [1250, 400],
      [1000, 320], [740, 340], [520, 440], [350, 620], [250, 880], [210, 1180], [260, 1480], [200, 1780], [240, 2100], [180, 2420], [230, 2760], [190, 3080], [260, 3400], [420, 3680], [680, 3870], [970, 3890]],
    grass: [[1400, 3020], [1750, 2960], [1960, 2780], [2020, 2460], [1960, 2150], [2040, 1880], [1880, 1700], [1500, 1640], [1150, 1690], [800, 1660], [500, 1800], [400, 2120], [450, 2440], [400, 2740], [540, 2940], [900, 3040]],
    rock: [[700, 1540], [1100, 1500], [1500, 1470], [1880, 1520], [2220, 1470], [2420, 1300], [2470, 1040], [2380, 800], [2180, 630], [1880, 540], [1540, 500], [1220, 510], [940, 430], [680, 480], [470, 630], [350, 860], [320, 1160], [400, 1390]],
    flats: [[2260, 3080], [2470, 2900], [2520, 2560], [2550, 2220], [2480, 1940], [2300, 1800], [2140, 1900], [2100, 2200], [2120, 2560], [2080, 2860], [2120, 3040]],
    inlet: [[860, 300], [1040, 330], [1130, 500], [1080, 690], [900, 770], [730, 700], [690, 480]],                       // the cove's pool, cut into the rock from the north
    paths: [[[1390, 3288], [1380, 3120], [1420, 2900], [1360, 2650], [1440, 2400], [1380, 2150], [1320, 1900], [1280, 1660], [1220, 1420], [1180, 1180]],
      [[1440, 2400], [1750, 2460], [2050, 2520], [2250, 2500]], [[1180, 1180], [1500, 1060], [1850, 940], [2120, 880], [2240, 880]]],
    dock: [1400, 4030], dockN: 2, arrive: [1400, 3976], chest: [2275, 850],
    town: { home: [[1400, 4080], [1740, 4060], [1870, 3860], [1880, 3560], [1790, 3380], [1400, 3320], [1010, 3380], [920, 3560], [930, 3860], [1060, 4060]], wake: [1400, 3900],
      layout: townLayout({ dock: [1400, 4030], stall: 'stall', deckCol: ['#c9b08f', '#d4bd9d', '#9f8463', '#7a5a3e'],      // a pale, weathered deck: what stands on it must not melt into it
        decks: [{ sea: 1, pts: [[1110, 3700], [1690, 3700], [1706, 4032], [1094, 4032]] }, { pts: [[1358, 3440], [1442, 3440], [1442, 3700], [1358, 3700]] }, { sea: 1, pts: [[880, 3836], [1110, 3836], [1110, 3893], [880, 3893]] }, { sea: 1, pts: [[1690, 3836], [1920, 3836], [1920, 3893], [1690, 3893]] }],
        paths: [[[1400, 3440], [1392, 3300], [1390, 3120]]],
        props: [['palm-b', 1010, 3470], ['palm-a', 1790, 3480], ['bush-b', 1240, 3560], ['lamp', 1346, 3600], ['lamp', 1454, 3600], ['palm-c', 930, 3700], ['bush-b', 1830, 3720], ['bunting', 1400, 3712], ['sign', 1330, 3745], ['cabin-c', 1250, 3830], ['cabin-a', 1580, 3822], ['barrel', 1470, 3850], ['crate', 1140, 3906], ['barrel', 1160, 3926],
          ['post', 880, 3899], ['post', 1920, 3899], ['stall', 1280, 3945], ['cabin-b', 1612, 3982], ['rack', 1470, 4014], ['tower-thatch', 1146, 4016], ...[1100, 1220, 1340, 1460, 1580, 1700].map(x => ['post', x, 4040]), ['boat', 1010, 4010], ['boat', 1800, 4020]],
        people: [['shopkeeper', 1346, 3949, 's', 'beside his stall, where he can be seen: the shop'], ['master', 1470, 3900, 'sw', 'the harbour master: tasks'], ['fisher', 1452, 3976, 's', 'behind her fish rack: tasks'], ['sailor', 1400, 3775, 'se', 'at the way north: tasks']] }) },      // the stall 87 units from the deck's foot, so a thumb has room before it; nobody on the spot where he steps ashore
    // who lives where (Victor, GD, 2026-11-20, after Robin's "I think the birds are weird starting mobs" and "Build all of them"): the gull is gone
    zones: { 'sand-crab': [[290, 3150, 640, 620, 1], [1890, 3150, 620, 600, 1]], 'wharf-rat': [[2090, 1840, 470, 1240, 2]], 'bristle-piglet': [[480, 2420, 1500, 580, 3]], 'palm-monkey': [[470, 1700, 1540, 640, 4]], 'coconut-crab': [[380, 560, 2040, 920, 5]] },
    grounds: [{ id: 'beach', name: 'The beach', levels: '1 to 2', from: 'land' }, { id: 'grove', name: 'The grove', levels: '3 to 4', from: 'grass' }, { id: 'cove', name: 'The cove', levels: '5', from: 'rock' }] },
};
// a town moved onto an island: the layout of out/<from>/place.json, shifted so its dock lies on the island's dock
function townOf(L) {
  if (!L.town) return null; const H = L.town.layout || JSON.parse(fs.readFileSync(path.join(P.ROOT, 'out', L.town.from, 'place.json'), 'utf8')), dx = L.dock[0] - H.dock[0], dy = L.dock[1] - H.dock[1], mv = pts => pts.map(([x, y]) => [x + dx, y + dy]);
  return { square: H.square && mv(H.square), grass: H.grass && mv(H.grass), decks: (H.decks || []).map(d => ({ sea: d.sea, col: d.col || H.deckCol, pts: mv(d.pts) })), paths: H.paths.map(mv), props: H.props.filter(q => q.name !== 'dock').map(q => ({ name: q.name, x: q.x + dx, y: q.y + dy })), solid: H.solid.map(q => Object.assign({}, q, { x: q.x + dx, y: q.y + dy })),
    people: H.people.map(q => Object.assign({}, q, { x: q.x + dx, y: q.y + dy })), stall: (() => { const st = H.props.find(q => q.name === (H.stall || 'stall')); return [st.x + dx, st.y + dy]; })() };
}

// a deck of planks: boards lying east to west, their ends staggered. Over the sea it has a side and throws a shadow on the water.
function deck(g, d) {
  const sh = poly(d.pts), b = box(d.pts), [top, top2, seam, side] = d.col || [C.plank, C.plank, C.plankLo, '#96592e'];
  if (d.sea) { g.save(); g.translate(8, 18); sh(g); g.fillStyle = 'rgba(24,52,110,0.3)'; g.fill(); g.restore(); g.save(); g.translate(0, 11); fill(g, sh, side); g.restore(); }
  else { g.save(); g.translate(0, 4); fill(g, sh, C.sandLo); g.restore(); }
  fill(g, sh, top); g.save(); sh(g); g.clip(); let row = 0; for (let y = b[1]; y < b[1] + b[3]; y += 15, row++) if (row % 3 === 1) { g.fillStyle = top2; g.fillRect(b[0], y, b[2], 15); }
  g.strokeStyle = seam; g.lineWidth = 2.6;
  for (let y = b[1] + 15; y < b[1] + b[3]; y += 15) { g.beginPath(); g.moveTo(b[0], y); g.lineTo(b[0] + b[2], y); g.stroke(); }
  let k = 0; for (let y = b[1]; y < b[1] + b[3]; y += 15, k++) for (let x = b[0] + ((k * 53) % 90); x < b[0] + b[2]; x += 90 + (k % 3) * 22) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 15); g.stroke(); }
  g.restore();
}
function paint(L) {
  const r = P.rng(L.seed), px = L.px, cv = P.createCanvas(Math.round(L.w * px), Math.round(L.h * px)), g = cv.getContext('2d'); g.scale(px, px);
  const landP = curve(L.land), land = poly(landP);
  // the sea: deep, two lighter rings round the land, the foam's white edge
  g.fillStyle = C.deep; g.fillRect(0, 0, L.w, L.h);
  for (let i = 0; i < L.w * L.h / 37000; i++) { const x = r() * L.w, y = r() * L.h, w = 16 + r() * 26; g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.ellipse(x, y, w, 2.4, 0, 0, 7); g.fill(); }
  ring(g, land, C.sea, 190); ring(g, land, C.shallow, 90); ring(g, land, C.foam, 14);
  for (let i = 0; i < landP.length; i += 2) { if (r() < 0.25) continue; const a = landP[i], b = landP[(i + 1) % landP.length], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, o = 26 + r() * 32;       // dashes of foam off the shore, lying along it
    let fx = a[0] + dy / d * o, fy = a[1] - dx / d * o; if (inside(landP, fx, fy)) { fx = a[0] - dy / d * o; fy = a[1] + dx / d * o; }
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(fx, fy, 11 + r() * 14, 3.2, Math.atan2(dy, dx), 0, 7); g.fill(); }
  // the land: sand, a band of wet sand inside its edge, its own tones
  fill(g, land, C.sand); g.save(); land(g); g.clip(); ring(g, land, C.wet, 52);
  for (let i = 0; i < L.w * L.h / 30000; i++) fill(g, blob(r() * L.w, r() * L.h, 34 + r() * 70, 12 + r() * 20, 9, 0.35, r), i % 3 ? C.sandHi : C.sandLo);
  ring(g, land, C.wet, 40);                                                                                       // the tones stop short of the water's edge
  const T = townOf(L);
  if (L.flats) { const rf = curve(L.flats), sh = poly(rf), b = box(rf); fill(g, sh, C.reefLo); g.save(); sh(g); g.clip(); g.translate(0, -4); fill(g, sh, C.reef); g.translate(0, 4);      // the reef: flats of wet sand, tide pools, coral at their edges
    for (let i = 0; i < 34; i++) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3], rx = 34 + r() * 60, ry = 15 + r() * 24; if (edge(rf, x, y) < 60 || !inside(rf, x, y) || L.paths.some(p => p.some(q => Math.hypot(q[0] - x, q[1] - y) < 130))) continue; const seedR = P.rng(1000 + i);
      fill(g, blob(x, y, rx + 5, ry + 4, 10, 0.3, P.rng(1000 + i)), C.foam); fill(g, blob(x, y, rx, ry, 10, 0.3, P.rng(1000 + i)), C.pool); fill(g, blob(x + 4, y + 3, rx * 0.6, ry * 0.55, 9, 0.3, seedR), C.poolIn);
      for (let k = 0; k < 5; k++) { const t = r() * 6.283, cx = x + Math.cos(t) * (rx + 12), cy = y + Math.sin(t) * (ry + 9); fill(g, blob(cx, cy, 7 + r() * 6, 5 + r() * 4, 7, 0.4, r), [C.coralA, C.coralB, C.coralC][k % 3]); } }
    g.restore(); }
  if (L.grass) { const gp = curve(L.grass), sh = poly(gp), b = box(gp); fill(g, sh, C.grassLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.grass); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 24000; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 28 + r() * 60, 12 + r() * 22, 9, 0.35, r), i % 2 ? C.grassHi : C.grassLo); g.restore(); }
  if (T && T.grass) { const gp = curve(T.grass), sh = poly(gp), b = box(gp); fill(g, sh, C.grassLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.grass); g.translate(0, 5); for (let i = 0; i < 12; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 26 + r() * 50, 11 + r() * 18, 9, 0.35, r), i % 2 ? C.grassHi : C.grassLo); g.restore(); }
  if (L.rock) { const rp = curve(L.rock, 0.55), sh = poly(rp), b = box(rp); fill(g, sh, C.rockLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.rock); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 20000; i++) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3], s = 28 + r() * 54, pts = []; for (let k = 0; k < 6; k++) { const t = k / 6 * 6.283 + r() * 0.4; pts.push([x + Math.cos(t) * s * (0.7 + r() * 0.5), y + Math.sin(t) * s * 0.6 * (0.7 + r() * 0.5)]); } fill(g, poly(pts), i % 2 ? C.rockHi : C.rockLo); } g.restore(); }
  if (L.inlet) { const ip = curve(L.inlet), il = poly(ip); ring(g, il, C.foam, 12); fill(g, il, C.shallow); g.save(); il(g); g.clip(); fill(g, poly(ip.map(([x, y]) => [x, y - 46])), C.sea); g.restore(); }
  if (T) { if (T.square) { const sp = curve(T.square, 0.5), sq = poly(sp), b = box(sp); fill(g, sq, C.cobbleLo); g.save(); sq(g); g.clip(); g.translate(0, -4); fill(g, sq, C.cobble); g.translate(0, 4);      // the town's square: cobbles, drawn a little heavier than at one pixel a unit so they hold
    g.strokeStyle = C.cobbleLo; g.lineWidth = 2.6; for (let y = b[1] - 20; y < b[1] + b[3] + 20; y += 22) for (let x = b[0] - 20 + (Math.round(y / 22) % 2) * 17; x < b[0] + b[2] + 20; x += 34) { g.beginPath(); g.ellipse(x + (r() - 0.5) * 5, y + (r() - 0.5) * 4, 12 + r() * 3, 7 + r() * 2, 0, 0, 7); g.stroke(); } g.restore(); }
  }
  // the ways: trodden earth, never a drawn road (Robin, 2026-11-20, of the swamp: "Looks good except the roads. They clip over each
  // other and doesnt look natural"; of doing the same here, 2026-11-21: "Yeah"). As tools/mire.js lays them: close dabs that wander
  // a little, wider on the main way, paler down the middle, a ragged rim with no line, the ground creeping in from the side, a worn
  // patch where ways meet or end. The town's way and the island's are laid together in the same passes, so none lies on another.
  { const wr = P.rng(L.seed + 7), gp = L.grass ? curve(L.grass) : null, rp = L.rock ? curve(L.rock, 0.55) : null, on = (x, y) => rp && inside(rp, x, y) ? 'rock' : gp && inside(gp, x, y) ? 'grass' : 'sand';
    const RIM = { sand: '#d9bf86', grass: '#5fae4c', rock: C.rockLo }, CREEP = { sand: [C.sand, C.sandHi], grass: [C.grass, C.grassLo], rock: [C.rock, C.rockHi] };
    const all = (T ? T.paths.map(p => [p, 20, 0]) : []).concat((L.paths || []).map((p, n) => [p, n === 0 ? 21 : 16, 1]));
    const starts = (L.paths || []).map(p => p[0]), townPts = T ? T.paths.flat() : [];
    const ways = all.map(([p, wide, bend]) => { const q = p.length < 3 ? [...Array(41)].map((_, k) => [p[0][0] + (p[1][0] - p[0][0]) * k / 40, p[0][1] + (p[1][1] - p[0][1]) * k / 40]) : curve(p.concat(p.slice(1, -1).reverse()), 0.5, 40).slice(0, (p.length - 1) * 40 + 1), ph = wr() * 6.283, out = [];
      if (!bend) { const k = q.findIndex(v => starts.some(e => Math.hypot(e[0] - v[0], e[1] - v[1]) < 24)); if (k > 0) q.length = k + 1; }      // the town's way stops where the island's takes over: one track, not two
      for (let k = 0; k < q.length; k++) { const t = k / (q.length - 1), a = q[Math.max(0, k - 1)], b = q[Math.min(q.length - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, end = Math.min(1, Math.min(t, 1 - t) * 6), off = bend * (Math.sin(t * 9 + ph) * 9 + Math.sin(t * 23 + ph * 2) * 4) * end;      // it wanders, but not where it meets the deck or another way
        out.push([q[k][0] - dy / d * off, q[k][1] + dx / d * off, wide * (1 + 0.16 * Math.sin(t * 13 + ph * 3))]); }
      return out; });
    const aprons = []; for (const p of L.paths || []) for (const e of [p[0], p[p.length - 1]]) if (!aprons.some(a => Math.hypot(a[0] - e[0], a[1] - e[1]) < 40) && !townPts.some(a => Math.hypot(a[0] - e[0], a[1] - e[1]) < 60)) aprons.push([e[0], e[1], 30 + wr() * 8]);
    const dab = (x, y, rx, ry, col, al = 1) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.globalAlpha = 1; };
    for (const w of ways) for (const [x, y, r0] of w) { const c = RIM[on(x, y)]; dab(x + (wr() - 0.5) * 5, y + 3 + (wr() - 0.5) * 4, r0 + 5 + wr() * 4, (r0 + 5) * 0.8, c, 0.5); if (wr() < 0.07) dab(x + (wr() - 0.5) * (r0 * 2.6), y + (wr() - 0.5) * (r0 * 2), 5 + wr() * 6, 3 + wr() * 3, c, 0.45); }      // the rim: darker, ragged, with stray patches
    for (const [x, y, r0] of aprons) { g.globalAlpha = 0.5; fill(g, blob(x, y + 3, r0 + 6, (r0 + 6) * 0.72, 10, 0.3, wr), RIM[on(x, y)]); g.globalAlpha = 1; }
    for (const w of ways) for (const [x, y, r0] of w) dab(x + (wr() - 0.5) * 4, y + (wr() - 0.5) * 3, r0, r0 * 0.8, C.path);      // the earth
    for (const [x, y, r0] of aprons) fill(g, blob(x, y, r0, r0 * 0.72, 10, 0.3, wr), C.path);
    for (const w of ways) for (let k = 0; k < w.length; k += 2) { const [x, y, r0] = w[k]; dab(x + (wr() - 0.5) * 5, y - 1 + (wr() - 0.5) * 3, r0 * 0.5, r0 * 0.32, '#fbeccb', 0.35); }      // paler down the middle, where the feet fall
    for (const w of ways) for (const [x, y, r0] of w) { const cc = CREEP[on(x, y)]; if (wr() < 0.045) fill(g, blob(x + (wr() < 0.5 ? -1 : 1) * r0 * (0.7 + wr() * 0.4), y + (wr() - 0.5) * 8, 6 + wr() * 7, 3 + wr() * 3, 7, 0.4, wr), cc[wr() < 0.5 ? 0 : 1]); if (wr() < 0.03) dab(x + (wr() - 0.5) * r0 * 1.4, y + (wr() - 0.5) * r0, 1.8, 1.3, '#c9ad74', 0.8); } }      // the ground creeping in from the side, a pebble
  if (T) for (const d of T.decks) if (!d.sea) deck(g, d);
  g.restore();
  if (T) for (const d of T.decks) if (d.sea) deck(g, d);      // a deck over the water is painted last: it lies on the sea and on the shore alike
  return cv;
}

// where the props stand: clumps, each thing with its own place; nothing on a way, at the landing, by the chest or in water
function place(L) {
  const r = P.rng(L.seed + 100), props = [], solid = [], landP = curve(L.land), grassP = curve(L.grass), rockP = curve(L.rock, 0.55), reefP = curve(L.flats), inletP = curve(L.inlet), T = townOf(L), homeP = T ? curve(L.town.home) : null;
  const way = (x, y) => Math.min(...L.paths.map(p => { let d = 1e9; for (let i = 1; i < p.length; i++) d = Math.min(d, seg(p[i - 1], p[i], x, y)); return d; }));
  const free = (x, y, d = 50) => inside(landP, x, y) && edge(landP, x, y) > 44 && !(inside(inletP, x, y) || edge(inletP, x, y) < 30) && way(x, y) > d && Math.hypot(L.arrive[0] - x, L.arrive[1] - y) > 150 && Math.hypot(L.chest[0] - x, L.chest[1] - y) > 80 && !(homeP && (inside(homeP, x, y) || edge(homeP, x, y) < 50));
  const put = (n, x, y, block) => { props.push({ name: n, x: Math.round(x), y: Math.round(y) }); if (block) solid.push({ x: Math.round(x), y: Math.round(y - block * 0.3), r: block }); };
  const near = (x, y, d) => props.some(p => Math.hypot(p.x - x, (p.y - y) * 1.5) < d);
  const clump = (cx, cy, n, spread, pick, ok = () => true) => { let tries = 0; for (let i = 0; i < n && tries < n * 12; tries++) { const a = r() * 6.283, d = Math.sqrt(r()) * spread, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7; if (!free(x, y) || !ok(x, y) || near(x, y, 30)) continue; const [nm, bl] = pick(); put(nm, x, y, bl); i++; } };
  const spots = (pts, n, gap, ok = () => true) => { const b = box(pts), out = []; let tries = 0; while (out.length < n && tries++ < n * 60) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3]; if (!inside(pts, x, y) || !ok(x, y) || out.some(q => Math.hypot(q[0] - x, q[1] - y) < gap)) continue; out.push([x, y]); } return out; };
  const green = () => [['palm-a', 12], ['palm-b', 12], ['palm-c', 10], ['bush-a', 14], ['bush-b', 16], ['bush-c', 10], ['bush-d', 26], ['bigleaf-a', 0], ['bigleaf-b', 0], ['tuft-a', 0], ['tuft-b', 0], ['tuft-a', 0]][Math.floor(r() * 12)];
  const stones = () => [['rock-a', 20], ['rock-b', 9], ['rock-c', 13], ['rock-d', 30], ['rock-b', 9], ['rock-c', 13]][Math.floor(r() * 6)];
  const strand = () => r() < 0.4 ? green() : [r() < 0.5 ? 'tuft-a' : 'tuft-b', 0];
  const onGrass = (x, y) => inside(grassP, x, y) && !inside(rockP, x, y), onRock = (x, y) => inside(rockP, x, y), onReef = (x, y) => inside(reefP, x, y), onSand = (x, y) => !inside(grassP, x, y) && !inside(rockP, x, y) && !inside(reefP, x, y);
  // the grove: thick clumps with clearings between them for the gulls; thicker still along its edges
  for (const [x, y] of spots(grassP, 30, 260, (x, y) => onGrass(x, y) && way(x, y) > 110)) clump(x, y, 5 + Math.floor(r() * 4), 110 + r() * 40, green, onGrass);
  for (const [x, y] of spots(grassP, 20, 170, (x, y) => onGrass(x, y) && edge(grassP, x, y) < 90 && way(x, y) > 90)) clump(x, y, 3, 70, green);
  // the cove: stones in clumps, five great rocks
  for (const [x, y] of spots(rockP, 24, 190, (x, y) => onRock(x, y) && way(x, y) > 90)) clump(x, y, 3 + Math.floor(r() * 3), 80, stones, onRock);
  for (const [x, y] of spots(rockP, 5, 330, (x, y) => onRock(x, y) && free(x, y, 120) && edge(rockP, x, y) > 110)) put('rock-e', x, y, 46);
  // the beach all round: a few tufts and palms up by the grass, stones down by the water
  for (const [x, y] of spots(landP, 34, 260, (x, y) => onSand(x, y) && free(x, y, 90))) clump(x, y, 2 + Math.floor(r() * 3), 60, edge(landP, x, y) < 130 ? stones : strand, onSand);
  // the tide flats: a few stones by the pools
  for (const [x, y] of spots(reefP, 9, 200, (x, y) => onReef(x, y) && free(x, y, 90))) clump(x, y, 2, 50, () => [['rock-b', 9], ['rock-c', 13], ['tuft-a', 0]][Math.floor(r() * 3)], onReef);
  // the landing: the dock runs south into the sea, three pieces end to end; barrels, crates and a boat beside it
  if (T) { for (const q of T.props) props.push(q); for (const q of T.solid) solid.push(q); }                      // the town as it stood in the harbour: houses, stall, well, lamps, sign, barrels, crates, a boat, palms
  else { put('barrel', L.dock[0] - 60, L.dock[1] - 46, 10); put('crate', L.dock[0] - 88, L.dock[1] - 30, 10); put('barrel', L.dock[0] + 70, L.dock[1] - 36, 10); put('crate', L.dock[0] + 100, L.dock[1] - 60, 10); put('boat', L.dock[0] + 190, L.dock[1] - 40, 22); }
  for (let i = 0; i < (L.dockN === undefined ? 3 : L.dockN); i++) put('dock', L.dock[0], L.dock[1] + i * 56 + 56, 0);
  put('chest/closed', L.chest[0], L.chest[1], 12);
  props.sort((a, b) => a.y - b.y || a.x - b.x);
  return { props, solid, town: T };
}
// the outline of the dry sand: the shore drawn in by d, so nobody stands in the water's edge
const inset = (pts, d) => { const s = area(pts) > 0 ? 1 : -1, n = pts.length; return pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [Math.round(p[0] - dy / l * d * s), Math.round(p[1] + dx / l * d * s)]; }); };

function walkCheck(J) {
  const c = 14, rad = 12, nx = Math.ceil(J.size.w / c), ny = Math.ceil(J.size.h / c), free = new Uint8Array(nx * ny), seen = new Uint8Array(nx * ny), pools = (J.inlet ? [curve(J.inlet)] : []).concat(J.pools || []), wet = (x, y) => pools.some(q => inside(q, x, y) || edge(q, x, y) <= 16);
  const onDeck = (x, y) => (J.decks || []).some(d => inside(d.pts, x, y));
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = (i + 0.5) * c, y = (j + 0.5) * c; free[j * nx + i] = ((inside(J.walk, x, y) && !wet(x, y)) || onDeck(x, y)) && !J.solid.some(q => q.r ? Math.hypot(q.x - x, q.y - y) < q.r + rad : x > q.x - rad && x < q.x + q.w + rad && y > q.y - rad && y < q.y + q.h + rad) ? 1 : 0; }
  const cell = (x, y) => Math.floor(y / c) * nx + Math.floor(x / c), q = [cell(...J.arrive)]; seen[q[0]] = 1; if (!free[q[0]]) console.log('!! where he lands is blocked');
  while (q.length) { const k = q.pop(), i = k % nx, j = (k - i) / nx; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue; const m = b * nx + a; if (free[m] && !seen[m]) { seen[m] = 1; q.push(m); } } }
  const ask = (n, x, y) => console.log((seen[cell(x, y)] ? 'ok  ' : '!!  ') + n, x, y); ask('below the chest', J.chest[0], J.chest[1] + 30); if (J.home) { ask('where he wakes', ...J.home.wake); if (J.home.stall) ask('before the stall', J.home.stall[0], J.home.stall[1] + 40); }
  for (const [kind, list] of Object.entries(J.zones)) for (const z of list) { let got = 0, all = 0; for (let y = z[1]; y < z[1] + z[3]; y += c) for (let x = z[0]; x < z[0] + z[2]; x += c) { all++; if (seen[cell(x, y)]) got++; } console.log((got / all > 0.5 ? 'ok  ' : '!!  ') + `${kind} level ${z[4]}: he can stand on ${Math.round(got / all * 100)}% of its box`); }
  let cut = 0, all = 0; for (let k = 0; k < free.length; k++) if (free[k]) { all++; if (!seen[k]) cut++; } console.log(`${(cut / all * 100).toFixed(2)}% of the free ground cannot be reached; he can walk on ${(all * c * c / 1e6).toFixed(1)} million square units`);
}

async function make(name) {
  const L = ISLES[name], out = path.join(P.ROOT, 'work', name), cv = paint(L), { props, solid, town } = place(L), D = require('./dress.js');
  P.save(cv, path.join(out, 'ground.png'));
  const shapes = { land: curve(L.land), grass: curve(L.grass), rock: curve(L.rock, 0.55) };
  const grounds = L.grounds.map(q => Object.assign({ id: q.id, name: q.name, levels: q.levels }, q.later ? { later: true } : {}, { box: box(shapes[q.from]), outline: L[q.from] }));
  const J = { name, size: { w: L.w, h: L.h }, ground: { file: 'ground.png', px: L.px, note: 'HALF a pixel a design unit: draw it at four times its size' }, land: L.land, walk: inset(curve(L.land, 0.6, 4), 24), grass: L.grass, rock: L.rock, flats: L.flats, inlet: L.inlet, paths: L.paths.concat(town ? town.paths : []),
    dock: L.dock, arrive: L.arrive, chest: L.chest, zones: L.zones, grounds, props, solid };
  if (town) { if (town.decks.length) J.decks = town.decks.map(d => Object.assign({ pts: d.pts }, d.sea ? { sea: true } : {})); J.home = { box: box(curve(L.town.home)), outline: L.town.home, wake: L.town.wake, stall: town.stall, note: 'the town: no monster comes in; he wakes at wake; the stall stands at stall' }; if (town.square) J.square = town.square; J.people = town.people; }
  fs.writeFileSync(path.join(out, 'place.json'), JSON.stringify(J)); walkCheck(J);
  // the studio's looks: the island with its props at a quarter size; the same with the names drawn on it
  const adir = [path.join(P.ROOT, 'work', name), path.join(P.ROOT, 'out', name), path.join(P.ROOT, 'out/island')].find(d => fs.existsSync(path.join(d, 'island.json'))), isl = await D.atlas(adir, 'island'), k = 0.25;
  const pv = P.createCanvas(L.w * k, L.h * k), g = pv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.scale(k, k); g.drawImage(cv, 0, 0, L.w, L.h);
  for (const p of props) { const f = isl.j.frames[p.name]; if (!f) continue; if (!(isl.j.items[p.name] || {}).shade) { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(p.x + 5, p.y + 1, f.frame.w * 0.16, f.frame.w * 0.055, 0, 0, 7); g.fill(); g.restore(); } g.save(); g.translate(p.x, p.y); g.scale(0.5, 0.5); D.pic(g, isl, p.name); g.restore(); }
  const folkDir = [path.join(P.ROOT, 'out', name), path.join(P.ROOT, 'out/harbour')].find(d => fs.existsSync(path.join(d, 'folk.json')));
  if (town && folkDir) { const folk = await D.atlas(folkDir, 'folk'); for (const q of town.people) { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(q.x + 3, q.y + 1, 13, 5, 0, 0, 7); g.fill(); g.restore(); D.figure(g, folk, { action: q.who, facing: q.facing, i: 0 }, q.x, q.y, 0.5); } }
  P.save(pv, path.join(out, 'look.jpg'));
  const tag = (t, x, y, s = 64, col = '#ffffff') => P.label(g, t, x, y, s, col, { align: 'center', stroke: '#33203a', strokeW: s / 5, font: 'Trebuchet MS' });
  g.lineWidth = 8; g.setLineDash([36, 24]); for (const [kind, list] of Object.entries(L.zones)) for (const z of list) { g.strokeStyle = { 'sand-crab': '#f4603c', 'wharf-rat': '#8e9aa8', 'bristle-piglet': '#ff9a9a', 'palm-monkey': '#a8683a', 'coconut-crab': '#8a5a34' }[kind] || '#ffffff'; g.strokeRect(z[0], z[1], z[2], z[3]); tag(`${kind}, level ${z[4]}`, z[0] + z[2] / 2, z[1] + 60, 56); }
  g.setLineDash([]); g.strokeStyle = '#33203a'; g.lineWidth = 8; for (const [n, p] of [['the chest', L.chest]]) { g.fillStyle = '#ffd640'; g.beginPath(); g.arc(p[0], p[1], 30, 0, 7); g.fill(); g.stroke(); tag(n, p[0], p[1] + 80, 60); }
  for (const q of grounds) tag(q.name, q.id === 'beach' ? 560 : q.box[0] + q.box[2] / 2, q.id === 'beach' ? 3560 : q.box[1] + q.box[3] / 2, 110);
  if (J.home) { g.strokeStyle = '#ffd640'; g.lineWidth = 10; g.setLineDash([30, 18]); poly(curve(J.home.outline))(g); g.stroke(); g.setLineDash([]); tag('The town (home)', J.home.box[0] + J.home.box[2] / 2, J.home.box[1] + 90, 84, '#ffd640'); g.strokeStyle = '#33203a'; g.lineWidth = 8; g.fillStyle = '#ffd640'; g.beginPath(); g.arc(J.home.wake[0], J.home.wake[1], 26, 0, 7); g.fill(); g.stroke(); tag('he wakes', J.home.wake[0] + 150, J.home.wake[1] - 40, 52); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(300, 2240, 412, 915); tag('one screen', 506, 2700, 52);
  P.save(pv, path.join(out, 'map.jpg'));
  console.log('painted', name, `${L.w}x${L.h} units as ${cv.width}x${cv.height} px (${(cv.width * cv.height * 4 / 1048576).toFixed(1)} MB decoded),`, props.length, 'props,', solid.length, 'in the way');
}
if (require.main === module) make(process.argv[2] || 'crab-cay').catch(e => { console.error(e); process.exit(1); });
module.exports = { ISLES, make, paint, place, curve, inside, box, C, poly, edge, seg, fill, ring, blob, inset, area, walkCheck };
