// bake.js: a shadow under each building of the town concepts, in its own picture (Leonard, AD, 2026-11-20).
// Robin, 2026-11-20, of the first stilt town: "Theres also no contrast to the floor so it all kinda melts together."
// One cure is on the floor (a paler deck), one is here: every building throws the outline of its foot on the floor, a
// little down and to the right, as the house's things did (tools/things.js). The foot is the building's own box, turned
// as the model is turned.
//   node concepts/town/bake.js      work/town/render -> work/town/baked
const P = require('../../tools/paint.js'); const fs = require('fs'); const path = require('path');
const SE = 0.5736, U = 112, SH = '#3b2a5a';          // file pixels a model unit
// name: [width, depth, turn in degrees, how far the foot's middle lies behind the origin]
const FOOT = { 'cabin-a': [2.62, 2.28, 24, -0.2], 'cabin-b': [2.32, 2.23, -24, -0.2], 'cabin-c': [3.22, 2.48, 20, -0.2], 'hut-a': [1.9, 1.3, 0, 0], 'hut-b': [1.5, 1.2, 0, 0], 'hut-c': [2.5, 1.5, 0, 0], 'tower-thatch': [1.3, 1.3, 0, 0], tower: [1.3, 1.3, 0, 0], stall: [1.2, 0.7, 0, 0], rack: [1.9, 0.4, 0, 0] };
(async () => {
  const dir = path.join(P.ROOT, 'work/town/render'), out = path.join(P.ROOT, 'work/town/baked'), meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')), extra = JSON.parse(fs.readFileSync(path.join(P.ROOT, 'work/crab-cay/render/meta.json'), 'utf8')); fs.mkdirSync(out, { recursive: true });
  const items = [];
  for (const [m, d] of [[meta, dir], [extra, path.join(P.ROOT, 'work/crab-cay/render')]]) for (const it of m.items) { if (items.some(q => q.name === it.name)) continue; const f = FOOT[it.name], im = await P.loadImage(path.join(d, it.file)), cv = P.createCanvas(im.width, im.height), g = cv.getContext('2d');
    if (!f) { if (d === dir) { g.drawImage(im, 0, 0); P.save(cv, path.join(out, it.file)); items.push(it); } continue; }
    const hard = P.createCanvas(im.width, im.height); hard.getContext('2d').drawImage(im, 0, 0); P.harden(hard);
    const [w, dp, turn, back] = f, a = turn * Math.PI / 180, [ox, oy] = it.origin, pt = (x, y) => { const yy = y + back, rx = x * Math.cos(a) - yy * Math.sin(a), ry = x * Math.sin(a) + yy * Math.cos(a); return [ox + rx * U + 16, oy - ry * SE * U + 13]; };
    g.globalAlpha = 0.3; g.fillStyle = SH; g.beginPath(); [[-w / 2, -dp / 2], [w / 2, -dp / 2], [w / 2, dp / 2], [-w / 2, dp / 2]].forEach(([x, y], i) => { const [px, py] = pt(x * 1.04, y * 1.04); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); g.globalAlpha = 1; g.drawImage(hard, 0, 0);
    P.save(cv, path.join(out, it.file)); items.push(Object.assign({}, it, { data: { soft: true } })); }
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ px: meta.px, unit: meta.unit, items }, null, 1)); console.log('baked', items.length, 'pictures;', Object.keys(FOOT).length, 'with a shadow');
})().catch(e => { console.error(e); process.exit(1); });
