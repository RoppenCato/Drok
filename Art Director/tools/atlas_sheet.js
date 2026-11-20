// atlas_sheet.js: every picture of a packed atlas on one sheet with its name (Leonard, AD, 2026-11-20), for a delivery's look picture.
//   node tools/atlas_sheet.js out/<name>/<atlas>.json <out.png> [columns] [cell] [prefix]
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
(async () => {
  const [jf, out, colsA, cellA, prefix] = process.argv.slice(2), j = JSON.parse(fs.readFileSync(jf, 'utf8')), im = await P.loadImage(path.join(path.dirname(jf), j.meta.image)), keys = Object.keys(j.frames).filter(k => !prefix || k.startsWith(prefix)), cols = +colsA || 8, cell = +cellA || 120;
  const cv = P.createCanvas(cols * cell, Math.ceil(keys.length / cols) * cell), g = cv.getContext('2d'); g.fillStyle = '#f8e7b6'; g.fillRect(0, 0, cv.width, cv.height);
  keys.forEach((k, i) => { const f = j.frames[k].frame, x = (i % cols) * cell, y = Math.floor(i / cols) * cell, s = Math.min(1, (cell - 22) / Math.max(f.w, f.h)); g.drawImage(im, f.x, f.y, f.w, f.h, x + (cell - f.w * s) / 2, y + (cell - 14 - f.h * s) / 2, f.w * s, f.h * s); P.label(g, k, x + 3, y + cell - 7, 9, '#33203a'); });
  P.save(cv, out); console.log('wrote', out, keys.length, 'pictures');
})();
