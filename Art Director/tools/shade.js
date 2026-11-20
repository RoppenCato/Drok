// shade.js: a building's own shadow, in its own picture (Leonard, AD, 2026-11-20).
// Robin, 2026-11-20, of the first town on stilts: "Theres also no contrast to the floor so it all kinda melts together."
// One cure is on the floor (a paler deck), one is here: every building throws the outline of its foot on the floor, a
// little down and to the right. The foot is the building's own box, turned as the model is turned. The picture is
// written back into the render folder with `shade: true` in its data, so the game (and tools/scene.js) lays no round
// shadow under it, and tools/packset.js keeps its soft edge.
//   node tools/shade.js <render dir>
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const SE = 0.5736, U = 112, SH = '#3b2a5a';          // file pixels a model unit
// name: [width, depth, turn in degrees, how far the foot's middle lies before the origin (model units)]
const FOOT = { 'cabin-a': [2.62, 2.28, 24, -0.2], 'cabin-b': [2.32, 2.23, -24, -0.2], 'cabin-c': [3.22, 2.48, 20, -0.2], 'tower-thatch': [1.3, 1.3, 0, 0], stall: [1.2, 0.7, 0, 0], rack: [1.9, 0.4, 0, 0] };
(async () => {
  const dir = path.resolve(P.ROOT, process.argv[2] || 'work/crab-cay/render'), file = path.join(dir, 'meta.json'), meta = JSON.parse(fs.readFileSync(file, 'utf8')); let n = 0;
  for (const it of meta.items) { const f = FOOT[it.name]; if (!f || (it.data && it.data.shade)) continue; const im = await P.loadImage(path.join(dir, it.file)), cv = P.createCanvas(im.width, im.height), g = cv.getContext('2d'), hard = P.createCanvas(im.width, im.height); hard.getContext('2d').drawImage(im, 0, 0); P.harden(hard);
    const [w, dp, turn, back] = f, a = turn * Math.PI / 180, [ox, oy] = it.origin, pt = (x, y) => { const yy = y + back, rx = x * Math.cos(a) - yy * Math.sin(a), ry = x * Math.sin(a) + yy * Math.cos(a); return [ox + rx * U + 16, oy - ry * SE * U + 13]; };
    g.globalAlpha = 0.3; g.fillStyle = SH; g.beginPath(); [[-w / 2, -dp / 2], [w / 2, -dp / 2], [w / 2, dp / 2], [-w / 2, dp / 2]].forEach(([x, y], i) => { const [px, py] = pt(x * 1.04, y * 1.04); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); g.globalAlpha = 1; g.drawImage(hard, 0, 0);
    P.save(cv, path.join(dir, it.file)); it.data = Object.assign({}, it.data, { soft: true, shade: true }); n++; }
  fs.writeFileSync(file, JSON.stringify(meta, null, 1)); console.log('shaded', n, 'buildings in', dir);
})().catch(e => { console.error(e); process.exit(1); });
