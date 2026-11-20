// things.js: the rendered things of the house made ready for the game (Leonard, AD, 2026-11-20; the choices are mine).
// blender/house.py renders each thing alone. Here each gets what the look lays under a prop, baked into its own picture so the
// game draws nothing extra: a thing that lies flat throws its own outline a little down and to the right; a thing that stands
// throws the outline of what it covers on the floor. A leg of a chair or a table has its top cut and faded, so no seat and no
// table top hides the floor. A thing longer than the screen is wide (the pencil, the fork) is cut in three, each part with its
// own place, so a figure can stand before one end and behind the other.
//   node tools/things.js [render dir] [baked dir]     then: node tools/packset.js things <baked dir> <out dir> --soft
//   node tools/things.js --sheet out.png [atlas dir]  every thing on the tiles beside the hero, at the real size
const P = require('./paint.js'); const fs = require('fs'); const path = require('path'); const WJ = require('./world.js');
const SH = '#5b4a82', A = 0.24, S = 2, SE = 0.5736;
async function bake(dir, out) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')), items = []; fs.mkdirSync(out, { recursive: true });
  const unitData = name => { const k = WJ.KIT[name] || {}, d = {}; if (k.flat) d.flat = true; if (k.r) d.r = Math.round(k.r * WJ.CM * 0.8); if (k.box) d.box = [Math.round(k.box[0] * WJ.CM), Math.round(k.box[1] * WJ.CMY)]; return d; };
  for (const it of meta.items) {
    const im = await P.loadImage(path.join(dir, it.file)), w = im.width, h = im.height, cv = P.createCanvas(w, h), g = cv.getContext('2d'), d = it.data || {}, [ox, oy] = it.origin; g.drawImage(im, 0, 0); P.harden(cv);
    if (d.fade) { const steps = [0, 0.12, 0.28, 0.44, 0.6, 0.76, 0.9], band = 13 * S;      // a leg runs out of its picture at the top: that edge goes in flat steps, not a smooth fade, so the palette PNG keeps it
      g.globalCompositeOperation = 'destination-out'; steps.forEach((al, i) => { g.fillStyle = 'rgba(0,0,0,' + (1 - al) + ')'; g.fillRect(0, i * band, w, band); }); g.globalCompositeOperation = 'source-over'; }
    const sh = P.createCanvas(w, h), q = sh.getContext('2d');
    if (d.flat || d.low) { q.drawImage(cv, 6, 8); q.globalCompositeOperation = 'source-in'; q.fillStyle = SH; q.fillRect(0, 0, w, h); }
    else if (d.foot && d.foot.length > 2) { const cx = d.foot.reduce((a, p) => a + p[0], 0) / d.foot.length, cy = d.foot.reduce((a, p) => a + p[1], 0) / d.foot.length; q.fillStyle = SH; q.beginPath(); d.foot.forEach((p, i) => { const x = ox + (cx + (p[0] - cx) * 1.1) * S + 5, y = oy + (cy + (p[1] - cy) * 1.1) * S + 6; i ? q.lineTo(x, y) : q.moveTo(x, y); }); q.closePath(); q.fill(); }
    const fin = P.createCanvas(w, h), f = fin.getContext('2d'); f.globalAlpha = A; f.drawImage(sh, 0, 0); f.globalAlpha = 1; f.drawImage(cv, 0, 0);
    const L = WJ.LONG[it.name];
    if (!L) { const file = it.file; P.save(fin, path.join(out, file)); items.push({ name: it.name, file, origin: it.origin, data: unitData(it.name) }); continue; }
    const n = L.parts.length, third = L.len * Math.cos(L.turn * Math.PI / 180) * WJ.CM * S / n, slope = -Math.tan(L.turn * Math.PI / 180) * SE;      // cut along its length; each part's origin on its own stretch of the axis
    L.parts.forEach((name, i) => { const x0 = i === 0 ? 0 : Math.round(ox + (i - n / 2) * third), x1 = i === n - 1 ? w : Math.round(ox + (i + 1 - n / 2) * third), c = P.createCanvas(w, h); c.getContext('2d').drawImage(fin, x0, 0, x1 - x0, h, x0, 0, x1 - x0, h);
      const px = ox + (i - (n - 1) / 2) * third, file = name + '.png'; P.save(c, path.join(out, file)); items.push({ name, file, origin: [Math.round(px), Math.round(oy + (px - ox) * slope + 10)], data: unitData(name) }); });
  }
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ px: S, items }, null, 1)); console.log('baked', items.length, 'pictures into', out);
}
async function sheet(out, dir) {
  const D = require('./dress.js'), K = await D.atlas(dir, 'things'), A2 = await D.load(), names = Object.keys(K.j.frames), cols = 6, cw = 300, ch = 250, rows = Math.ceil((names.length + 1) / cols), cv = P.createCanvas(cols * cw * S, rows * ch * S), g = cv.getContext('2d'); g.scale(S, S);
  const tile = await P.loadImage(path.join(P.ROOT, 'work/world/floor-tiles.png')); for (let y = 0; y < rows * ch; y += 414) for (let x = 0; x < cols * cw; x += 720) g.drawImage(tile, x, y, 720, 414);
  const hero = (x, y) => { const F = D.frameOf(A2.hero, 'stand', 'se', 0); g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, A2.hero, F.name); g.restore(); };
  names.forEach((n, i) => { const x = (i % cols + 0.5) * cw, y = (Math.floor(i / cols) + 0.8) * ch; g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, K, n); g.restore(); hero(x + 92, y + 4); P.label(g, n, x, y + 30, 15, '#ffffff', { align: 'center', stroke: '#33203a', strokeW: 4, font: 'Trebuchet MS' }); });
  P.save(cv, out); console.log('wrote', out);
}
const a = process.argv.slice(2); (a[0] === '--sheet' ? sheet(a[1], a[2] || 'work/things/out') : bake(a[0] || 'work/things/render', a[1] || 'work/things/baked')).catch(e => { console.error(e); process.exit(1); });
