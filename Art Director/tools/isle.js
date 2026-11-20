// isle.js: a big island's ground as ONE painting at half a pixel a design unit, and where its props stand
// (Leonard, AD, 2026-11-20; the layout and the look are mine). Robin, 2026-11-20: "Both. Big islands with several biomes
// each, and the chart to sail between them." Victor, GD asked for Crab Cay grown to about 2800 by 4200 units with four
// grounds, and said the ground cannot be one painting at one pixel a unit (47 MB). At HALF a pixel a unit it is 11.8 MB,
// less than the small island's ground, and on a phone it looks the same (work/world/ground-test.js): the ground is flat
// colour with no line, so it has no small detail to lose. The game draws it at four times instead of two.
// The hand is tools/ground.js's: sea in three steps with a white edge of foam, wet sand, sand, grass, rock. New: a reef
// (wet sand flats with tide pools and coral), and several grounds on one island, each with its outline in place.json.
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

const ISLES = {
  // Crab Cay grown big. He lands in the south. The beach lies round the whole island; the grove fills its middle; the cove
  // is the rock in the north west, with its pool; the reef is the north east, over a sandbar, beyond a channel of the sea.
  'crab-cay': { w: 2800, h: 4200, px: 0.5, seed: 11,
    land: [[1400, 4000], [1800, 3975], [2150, 3880], [2420, 3690], [2560, 3420], [2590, 3120], [2500, 2860], [2540, 2600], [2620, 2330], [2600, 2050], [2470, 1860], [2400, 1690], [2470, 1500], [2600, 1280], [2640, 1000], [2560, 740], [2380, 560], [2140, 470], [1930, 520],
      [1830, 760], [1770, 1000], [1650, 1170], [1540, 1010], [1500, 780], [1430, 560], [1250, 400], [1000, 320], [740, 340], [520, 440], [350, 620], [250, 880], [210, 1180], [260, 1480], [200, 1780], [240, 2100], [180, 2420], [230, 2760], [190, 3080], [260, 3400], [420, 3680], [680, 3870], [1020, 3970]],
    grass: [[1400, 3270], [1900, 3210], [2240, 3050], [2380, 2760], [2330, 2440], [2420, 2140], [2300, 1900], [1980, 1780], [1620, 1820], [1300, 1740], [960, 1810], [640, 1770], [430, 1930], [380, 2240], [440, 2560], [390, 2880], [520, 3120], [860, 3230]],
    rock: [[900, 1700], [1250, 1640], [1470, 1470], [1540, 1240], [1440, 960], [1390, 700], [1200, 510], [940, 430], [680, 480], [470, 630], [350, 860], [320, 1160], [370, 1440], [540, 1630]],
    reef: [[2200, 1640], [2440, 1500], [2540, 1250], [2570, 990], [2480, 770], [2300, 630], [2090, 570], [1940, 650], [1900, 860], [1850, 1080], [1800, 1300], [1900, 1530]],
    inlet: [[860, 300], [1040, 330], [1130, 500], [1080, 690], [900, 770], [730, 700], [690, 480]],                       // the cove's pool, cut into the rock from the north
    paths: [[[1400, 3940], [1380, 3700], [1430, 3450], [1400, 3200], [1340, 2950], [1420, 2700], [1500, 2450], [1440, 2200], [1380, 1980], [1300, 1760], [1220, 1560], [1160, 1320], [1180, 1080]],
      [[1440, 2200], [1700, 2040], [1960, 1830], [2100, 1640], [2160, 1440]], [[1180, 1080], [980, 960], [760, 940], [580, 860], [480, 740]]],
    dock: [1400, 3972], arrive: [1400, 3900], chest: [470, 705],
    zones: { 'sand-crab': [[760, 3430, 1280, 400, 1], [300, 3180, 520, 520, 2], [1960, 3180, 560, 520, 2]], 'reef-gull': [[520, 2600, 1760, 580, 3], [480, 1900, 1840, 620, 4]], 'coconut-crab': [[400, 820, 1060, 800, 5]] },
    grounds: [{ id: 'beach', name: 'The beach', levels: '1 to 2', from: 'land' }, { id: 'grove', name: 'The grove', levels: '3 to 4', from: 'grass' }, { id: 'cove', name: 'The cove', levels: '5', from: 'rock' }, { id: 'reef', name: 'The reef', levels: '6 to 8', from: 'reef', later: true }] },
};

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
  if (L.reef) { const rf = curve(L.reef), sh = poly(rf), b = box(rf); fill(g, sh, C.reefLo); g.save(); sh(g); g.clip(); g.translate(0, -4); fill(g, sh, C.reef); g.translate(0, 4);      // the reef: flats of wet sand, tide pools, coral at their edges
    for (let i = 0; i < 26; i++) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3], rx = 36 + r() * 70, ry = 16 + r() * 26; if (edge(rf, x, y) < 60 || !inside(rf, x, y)) continue; const seedR = P.rng(1000 + i);
      fill(g, blob(x, y, rx + 5, ry + 4, 10, 0.3, P.rng(1000 + i)), C.foam); fill(g, blob(x, y, rx, ry, 10, 0.3, P.rng(1000 + i)), C.pool); fill(g, blob(x + 4, y + 3, rx * 0.6, ry * 0.55, 9, 0.3, seedR), C.poolIn);
      for (let k = 0; k < 5; k++) { const t = r() * 6.283, cx = x + Math.cos(t) * (rx + 12), cy = y + Math.sin(t) * (ry + 9); fill(g, blob(cx, cy, 7 + r() * 6, 5 + r() * 4, 7, 0.4, r), [C.coralA, C.coralB, C.coralC][k % 3]); } }
    g.restore(); }
  if (L.grass) { const gp = curve(L.grass), sh = poly(gp), b = box(gp); fill(g, sh, C.grassLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.grass); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 24000; i++) fill(g, blob(b[0] + r() * b[2], b[1] + r() * b[3], 28 + r() * 60, 12 + r() * 22, 9, 0.35, r), i % 2 ? C.grassHi : C.grassLo); g.restore(); }
  if (L.rock) { const rp = curve(L.rock, 0.55), sh = poly(rp), b = box(rp); fill(g, sh, C.rockLo); g.save(); sh(g); g.clip(); g.translate(0, -5); fill(g, sh, C.rock); g.translate(0, 5);
    for (let i = 0; i < b[2] * b[3] / 20000; i++) { const x = b[0] + r() * b[2], y = b[1] + r() * b[3], s = 28 + r() * 54, pts = []; for (let k = 0; k < 6; k++) { const t = k / 6 * 6.283 + r() * 0.4; pts.push([x + Math.cos(t) * s * (0.7 + r() * 0.5), y + Math.sin(t) * s * 0.6 * (0.7 + r() * 0.5)]); } fill(g, poly(pts), i % 2 ? C.rockHi : C.rockLo); } g.restore(); }
  if (L.inlet) { const ip = curve(L.inlet), il = poly(ip); ring(g, il, C.foam, 12); fill(g, il, C.shallow); g.save(); il(g); g.clip(); fill(g, poly(ip.map(([x, y]) => [x, y - 46])), C.sea); g.restore(); }
  for (const p of L.paths || []) { const q = curve(p.concat(p.slice(1, -1).reverse()), 0.5, 6).slice(0, (p.length - 1) * 6 + 1); g.beginPath(); q.forEach((v, k) => k ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1])); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = C.sandLo; g.lineWidth = 46; g.stroke(); g.strokeStyle = C.path; g.lineWidth = 38; g.stroke(); }
  g.restore();
  return cv;
}

// where the props stand: clumps, each thing with its own place; nothing on a way, at the landing, by the chest or in water
function place(L) {
  const r = P.rng(L.seed + 100), props = [], solid = [], landP = curve(L.land), grassP = curve(L.grass), rockP = curve(L.rock, 0.55), reefP = curve(L.reef), inletP = curve(L.inlet);
  const way = (x, y) => Math.min(...L.paths.map(p => { let d = 1e9; for (let i = 1; i < p.length; i++) d = Math.min(d, seg(p[i - 1], p[i], x, y)); return d; }));
  const free = (x, y, d = 50) => inside(landP, x, y) && edge(landP, x, y) > 44 && !(inside(inletP, x, y) || edge(inletP, x, y) < 30) && way(x, y) > d && Math.hypot(L.arrive[0] - x, L.arrive[1] - y) > 150 && Math.hypot(L.chest[0] - x, L.chest[1] - y) > 80;
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
  // the reef: a few stones only; the wreck and what lives there come later
  for (const [x, y] of spots(reefP, 7, 220, (x, y) => onReef(x, y) && free(x, y, 90))) clump(x, y, 2, 50, () => [['rock-b', 9], ['rock-c', 13]][Math.floor(r() * 2)], onReef);
  // the landing: the dock runs south into the sea, three pieces end to end; barrels, crates and a boat beside it
  put('barrel', L.dock[0] - 60, L.dock[1] - 46, 10); put('crate', L.dock[0] - 88, L.dock[1] - 30, 10); put('barrel', L.dock[0] + 70, L.dock[1] - 36, 10); put('crate', L.dock[0] + 100, L.dock[1] - 60, 10); put('boat', L.dock[0] + 190, L.dock[1] - 40, 22);
  for (let i = 0; i < 3; i++) put('dock', L.dock[0], L.dock[1] + i * 56 + 56, 0);
  put('chest/closed', L.chest[0], L.chest[1], 12);
  props.sort((a, b) => a.y - b.y || a.x - b.x);
  return { props, solid };
}
// the outline of the dry sand: the shore drawn in by d, so nobody stands in the water's edge
const inset = (pts, d) => { const s = area(pts) > 0 ? 1 : -1, n = pts.length; return pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [Math.round(p[0] - dy / l * d * s), Math.round(p[1] + dx / l * d * s)]; }); };

function walkCheck(J) {
  const c = 14, rad = 12, nx = Math.ceil(J.size.w / c), ny = Math.ceil(J.size.h / c), free = new Uint8Array(nx * ny), seen = new Uint8Array(nx * ny), pool = curve(J.inlet);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = (i + 0.5) * c, y = (j + 0.5) * c; free[j * nx + i] = inside(J.walk, x, y) && !inside(pool, x, y) && edge(pool, x, y) > 16 && !J.solid.some(q => Math.hypot(q.x - x, q.y - y) < q.r + rad) ? 1 : 0; }
  const cell = (x, y) => Math.floor(y / c) * nx + Math.floor(x / c), q = [cell(...J.arrive)]; seen[q[0]] = 1; if (!free[q[0]]) console.log('!! where he lands is blocked');
  while (q.length) { const k = q.pop(), i = k % nx, j = (k - i) / nx; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue; const m = b * nx + a; if (free[m] && !seen[m]) { seen[m] = 1; q.push(m); } } }
  const ask = (n, x, y) => console.log((seen[cell(x, y)] ? 'ok  ' : '!!  ') + n, x, y); ask('below the chest', J.chest[0], J.chest[1] + 30);
  for (const [kind, list] of Object.entries(J.zones)) for (const z of list) { let got = 0, all = 0; for (let y = z[1]; y < z[1] + z[3]; y += c) for (let x = z[0]; x < z[0] + z[2]; x += c) { all++; if (seen[cell(x, y)]) got++; } console.log((got / all > 0.5 ? 'ok  ' : '!!  ') + `${kind} level ${z[4]}: he can stand on ${Math.round(got / all * 100)}% of its box`); }
  let cut = 0, all = 0; for (let k = 0; k < free.length; k++) if (free[k]) { all++; if (!seen[k]) cut++; } console.log(`${(cut / all * 100).toFixed(2)}% of the free ground cannot be reached; he can walk on ${(all * c * c / 1e6).toFixed(1)} million square units`);
}

async function main() {
  const name = process.argv[2] || 'crab-cay', L = ISLES[name], out = path.join(P.ROOT, 'work', name), cv = paint(L), { props, solid } = place(L), D = require('./dress.js');
  P.save(cv, path.join(out, 'ground.png'));
  const shapes = { land: curve(L.land), grass: curve(L.grass), rock: curve(L.rock, 0.55), reef: curve(L.reef) };
  const grounds = L.grounds.map(q => Object.assign({ id: q.id, name: q.name, levels: q.levels }, q.later ? { later: true } : {}, { box: box(shapes[q.from]), outline: L[q.from] }));
  const J = { name, size: { w: L.w, h: L.h }, ground: { file: 'ground.png', px: L.px, note: 'HALF a pixel a design unit: draw it at four times its size' }, land: L.land, walk: inset(curve(L.land, 0.6, 4), 24), grass: L.grass, rock: L.rock, reef: L.reef, inlet: L.inlet, paths: L.paths,
    dock: L.dock, arrive: L.arrive, chest: L.chest, zones: L.zones, grounds, props, solid };
  fs.writeFileSync(path.join(out, 'place.json'), JSON.stringify(J)); walkCheck(J);
  // the studio's looks: the island with its props at a quarter size; the same with the names drawn on it
  const adir = fs.existsSync(path.join(P.ROOT, 'out', name, 'island.json')) ? path.join(P.ROOT, 'out', name) : path.join(P.ROOT, 'out/island'), isl = await D.atlas(adir, 'island'), k = 0.25;
  const pv = P.createCanvas(L.w * k, L.h * k), g = pv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.scale(k, k); g.drawImage(cv, 0, 0, L.w, L.h);
  for (const p of props) { const f = isl.j.frames[p.name]; if (!f) continue; g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(p.x + 5, p.y + 1, f.frame.w * 0.16, f.frame.w * 0.055, 0, 0, 7); g.fill(); g.restore(); g.save(); g.translate(p.x, p.y); g.scale(0.5, 0.5); D.pic(g, isl, p.name); g.restore(); }
  P.save(pv, path.join(out, 'look.jpg'));
  const tag = (t, x, y, s = 64, col = '#ffffff') => P.label(g, t, x, y, s, col, { align: 'center', stroke: '#33203a', strokeW: s / 5, font: 'Trebuchet MS' });
  g.lineWidth = 8; g.setLineDash([36, 24]); for (const [kind, list] of Object.entries(L.zones)) for (const z of list) { g.strokeStyle = { 'sand-crab': '#f4603c', 'reef-gull': '#ffffff', 'coconut-crab': '#8a5a34' }[kind]; g.strokeRect(z[0], z[1], z[2], z[3]); tag(`${kind}, level ${z[4]}`, z[0] + z[2] / 2, z[1] + 60, 56); }
  g.setLineDash([]); g.strokeStyle = '#33203a'; g.lineWidth = 8; for (const [n, p] of [['he lands', L.arrive], ['the chest', L.chest]]) { g.fillStyle = '#ffd640'; g.beginPath(); g.arc(p[0], p[1], 30, 0, 7); g.fill(); g.stroke(); tag(n, p[0], p[1] + 80, 60); }
  for (const q of grounds) tag(q.name + (q.later ? ' (later)' : ''), q.id === 'beach' ? 1400 : q.box[0] + q.box[2] / 2, q.id === 'beach' ? 3640 : q.box[1] + q.box[3] / 2, 110);
  g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(2260, 3200, 412, 915); tag('one screen', 2466, 3660, 52);
  P.save(pv, path.join(out, 'map.jpg'));
  console.log('painted', name, `${L.w}x${L.h} units as ${cv.width}x${cv.height} px (${(cv.width * cv.height * 4 / 1048576).toFixed(1)} MB decoded),`, props.length, 'props,', solid.length, 'in the way');
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { ISLES, paint, place, curve, inside, C };
