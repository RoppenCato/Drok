// chart-look.js: the sea chart as the game shows it (Leonard, AD, 2026-11-20): the delivered chart, a pin on each place (the
// one its place names), the ring on the place he is at, the dotted way, the names with their levels, the title plate, the
// close button and the Sail button, from out/chart and out/glass as delivered.
//   node tools/chart-look.js [here: crab-cay|mire-cay]        writes out/chart/look.jpg
const P = require('./paint.js'); const D = require('./dress.js'); const fs = require('fs'); const path = require('path');
(async () => {
  const R = P.ROOT, here = process.argv[2] || 'crab-cay', ch = await P.loadImage(path.join(R, 'out/chart/chart.png')), pins = await D.atlas(path.join(R, 'out/chart'), 'pins'), glass = await D.atlas(path.join(R, 'out/glass'), 'glass'), J = JSON.parse(fs.readFileSync(path.join(R, 'out/chart/chart-places.json'), 'utf8'));
  const LV = { 'crab-cay': '1-5', 'mire-cay': '6-8' }, cv = P.createCanvas(824, 1830), g = cv.getContext('2d'); g.drawImage(ch, 0, 0); g.scale(2, 2);
  const pic = (A, key, x, y) => { g.save(); g.translate(x, y); g.scale(0.5, 0.5); D.pic(g, A, key); g.restore(); };
  const words = (t, x, y, s = 13, col = '#ffffff') => P.label(g, t, x, y, s, col, { align: 'center', font: 'Trebuchet MS', stroke: '#33203a', strokeW: 4 });
  const cut = (key, x, y, w) => { const f = glass.j.frames[key].frame, [l, , r] = glass.j.items[key].slice, k = 0.5, h = f.h * k; g.drawImage(glass.im, f.x, f.y, l, f.h, x, y, l * k, h); g.drawImage(glass.im, f.x + l, f.y, f.w - l - r, f.h, x + l * k, y, w - (l + r) * k, h); g.drawImage(glass.im, f.x + f.w - r, f.y, r, f.h, x + w - r * k, y, r * k, h); return h; };
  for (const p of J.route.slice(1, -1)) pic(pins, 'mark/route', p[0], p[1]);
  for (const [id, p] of Object.entries(J.places)) { if (p.note) continue; if (id === here) { pic(pins, 'mark/here', p.x, p.y + 2); words('You are here', p.x, p.y - 68, 11, '#ffe9a8'); } pic(pins, p.pin, p.x, p.y - 8); words(`${p.name}  Lv ${LV[id] || ''}`, p.x, p.y + p.foot + 10); }
  const th = cut('panel/title', J.title.x - 100, J.title.y - 22, 200); P.label(g, 'Sea chart', J.title.x, J.title.y - 1, 18, '#3a2414', { align: 'center', font: 'Trebuchet MS' });
  pic(glass, 'button/close', 380, 35); const to = Object.keys(J.places).find(id => id !== here && !J.places[id].note);
  cut('button/context', J.sail.x - 118, J.sail.y - 22, 236); P.label(g, 'Sail to ' + J.places[to].name, J.sail.x, J.sail.y - 2, 17, '#3a2414', { align: 'center', font: 'Trebuchet MS' });
  P.save(cv, path.join(R, 'out/chart/look.jpg')); console.log('wrote out/chart/look.jpg');
})();
