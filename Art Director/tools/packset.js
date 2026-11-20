// packset.js: a set of single pictures into one atlas (Leonard, AD, 2026-11-20): gear, props, a place's kit, loot, the glass.
// Every picture trimmed to its painted pixels (1 px of air), its edge hardened unless --soft, packed, and <name>.json beside
// it in Phaser's atlas form (frames by name, the pivot at each picture's origin) with an 'items' block: for each picture
// its size, its origin in its own pixels, and whatever data its builder gave (a nine-slice's corner, a prop's foot print).
// The render dir holds the pictures and a meta.json: { "px": 2, "items": [{ "name": "hat-bandana/s", "file": "hat-bandana_s.png", "origin": [x, y], "data": {...} }] }
//   node tools/packset.js <name> <render dir> <out dir> [--soft] [--only prefix] [--not prefix] [--keep] [--corner] [--extrude] [--tight] [--width 512]
// --only and --not pick the pictures by the start of their names (icon/ ...); --keep leaves each picture whole (no trim: tiles).
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const argv = process.argv.slice(2), flags = {}, pos = []; for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a === '--soft' || a === '--keep' || a === '--corner' || a === '--extrude' || a === '--tight') flags[a.slice(2)] = true; else if (a === '--only' || a === '--not' || a === '--width') flags[a.slice(2)] = argv[++i]; else pos.push(a); }
const [name, dir, out] = pos;
if (!name || !dir || !out) { console.log('usage: node tools/packset.js <name> <render dir> <out dir> [--soft] [--only prefix] [--not prefix] [--keep] [--width 512]'); process.exit(1); }
(async () => {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); let list = meta.items;
  if (flags.only) list = list.filter(it => flags.only.split(',').some(p => it.name.startsWith(p))); if (flags.not) list = list.filter(it => !flags.not.split(',').some(p => it.name.startsWith(p)));
  const pics = [];
  for (const it of list) {
    const im = await P.loadImage(path.join(dir, it.file)), cv = P.createCanvas(im.width, im.height); cv.getContext('2d').drawImage(im, 0, 0);
    const soft = flags.soft || (it.data && it.data.soft); if (!soft) P.harden(cv);
    const keep = flags.keep || (it.data && it.data.keep), t = keep ? { cv, x: 0, y: 0 } : P.trim(cv, 1), O = flags.corner ? [0, 0] : (!keep && it.origin) || [im.width / 2, im.height / 2];   // a picture kept whole (an icon, a tile) has its origin at its middle; with --corner at its top left corner (a piece of floor)
    pics.push({ key: it.name, cv: t.cv, origin: { x: Math.round(O[0] - t.x), y: Math.round(O[1] - t.y) }, data: it.data });
  }
  const PAD = 2, pot = v => 1 << Math.ceil(Math.log2(Math.max(1, v)));
  const order = [...pics].sort((a, b) => b.cv.height - a.cv.height);
  const shelf = (MAXW) => { const rows = [], places = []; let y = PAD;      // tallest first; each picture on the first shelf that has room for it
    for (const f of order) { let row = rows.find(q => q.x + f.cv.width + PAD <= MAXW); if (!row) { row = { x: PAD, y }; rows.push(row); y += f.cv.height + PAD; } places.push({ f, x: row.x, y: row.y }); row.x += f.cv.width + PAD; }
    return { places, H: y }; };
  let W = +flags.width || 0, places, H; const widest = Math.max(...pics.map(p => p.cv.width)) + PAD * 2;
  if (W) ({ places, H } = shelf(W)); else for (const w of [128, 256, 512, 1024, 2048]) { if (w < widest) continue; const s = shelf(w); W = w; places = s.places; H = s.H; if (s.H <= w) break; }
  H = flags.tight ? H + (H % 2) : pot(H); if (H > 2048) console.warn('!! the atlas runs past 2048 by 2048: fewer or smaller pictures, or a second atlas');
  const atlas = P.createCanvas(W, H), g = atlas.getContext('2d'), json = { frames: {}, meta: { image: name + '.png', size: { w: W, h: H }, scale: '1', format: 'RGBA8888', app: 'Art Director/tools/packset.js', filePx: meta.px || P.FILE_PX }, items: {} };
  for (const p of places) {
    g.drawImage(p.f.cv, p.x, p.y); const w = p.f.cv.width, h = p.f.cv.height;
    if (flags.extrude) { const c = p.f.cv; g.drawImage(c, 0, 0, w, 1, p.x, p.y - 1, w, 1); g.drawImage(c, 0, h - 1, w, 1, p.x, p.y + h, w, 1); g.drawImage(c, 0, 0, 1, h, p.x - 1, p.y, 1, h); g.drawImage(c, w - 1, 0, 1, h, p.x + w, p.y, 1, h); }   // a piece laid edge to edge with itself: its edge pixels once more round it, so no seam shows between two
    json.frames[p.f.key] = { frame: { x: p.x, y: p.y, w, h }, rotated: false, trimmed: true, spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h }, pivot: { x: +(p.f.origin.x / w).toFixed(4), y: +(p.f.origin.y / h).toFixed(4) } };
    json.items[p.f.key] = { w, h, origin: p.f.origin, ...(p.f.data || {}) };
  }
  fs.mkdirSync(out, { recursive: true }); P.save(atlas, path.join(out, name + '.png')); fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify(json));
  const kb = Math.round(fs.statSync(path.join(out, name + '.png')).size / 1024);
  console.log('packed', pics.length, 'pictures of', name, 'into', out, `(${W}x${H}, ${kb} KB, ${(W * H * 4 / 1048576).toFixed(1)} MB decoded)`);
})();
